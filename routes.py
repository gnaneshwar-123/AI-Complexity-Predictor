"""
FastAPI route definitions for the Complexity Prediction API.
"""

from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status

from backend.analyzer.schemas import (
    CodeAnalysisRequest,
    ComplexityAnalysisResult,
    CompareRequest,
    CompareResponse,
    ComparisonItem,
    ExampleAlgorithm,
)
from backend.analyzer.complexity_classifier import classify_complexity, RANK_MAP
from backend.api.examples import PRESET_EXAMPLES

router = APIRouter(prefix="/api", tags=["Complexity Prediction"])


@router.get("/health", response_model=Dict[str, Any])
async def health_check():
    """System health check and status report."""
    return {
        "status": "healthy",
        "service": "AI-Based Complexity Prediction Tool",
        "engine": "Static Python AST Analysis Engine",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@router.get("/examples", response_model=List[ExampleAlgorithm])
async def list_examples():
    """Retrieve preloaded canonical algorithm examples across various complexity classes."""
    return PRESET_EXAMPLES


@router.post("/analyze", response_model=ComplexityAnalysisResult)
async def analyze_code(request: CodeAnalysisRequest):
    """
    Analyze user-submitted Python code using static AST traversal.
    Returns estimated time and auxiliary space complexity with structured reasoning.
    """
    if not request.code or not request.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source code cannot be empty.",
        )

    if len(request.code) > 50000:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Code snippet exceeds maximum permitted length (50,000 characters).",
        )

    try:
        result = classify_complexity(
            request.code,
            target_function=request.function_name,
            language=request.language or "auto",
        )
        return result
    except Exception as e:
        # Avoid exposing raw internal stack traces to client
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while analyzing the code structure: {str(e)}",
        )


@router.post("/compare", response_model=CompareResponse)
async def compare_algorithms(request: CompareRequest):
    """
    Analyze multiple algorithm snippets and return side-by-side comparative rankings and summaries.
    """
    if len(request.algorithms) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 algorithms are required for comparison.",
        )

    if len(request.algorithms) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 5 algorithms can be compared at one time.",
        )

    items: List[ComparisonItem] = []
    
    for algo in request.algorithms:
        res = classify_complexity(algo.code)
        loop_count = len(res.detected_loops)
        recursion_detected = len(res.detected_recursion) > 0
        summary = f"{res.time_complexity} time, {res.space_complexity} space. Dominant factor: {res.dominant_term}."
        
        items.append(
            ComparisonItem(
                id=algo.id,
                name=algo.name,
                time_complexity=res.time_complexity,
                space_complexity=res.space_complexity,
                confidence=res.confidence,
                dominant_term=res.dominant_term,
                loop_count=loop_count,
                recursion_detected=recursion_detected,
                summary=summary,
                result=res,
            )
        )

    # Rank by time complexity (lower rank = more efficient)
    time_sorted = sorted(items, key=lambda x: RANK_MAP.get(x.time_complexity, 99))
    time_ranking = [item.id for item in time_sorted]

    # Rank by space complexity
    space_rank_map = {
        "O(1)": 0,
        "O(log n)": 1,
        "O(n)": 2,
        "O(n log n)": 3,
        "O(n^2)": 4,
        "O(n^3)": 5,
        "O(2^n)": 6,
        "Inconclusive": 99,
    }
    space_sorted = sorted(items, key=lambda x: space_rank_map.get(x.space_complexity, 99))
    space_ranking = [item.id for item in space_sorted]

    # Generate comparative narrative
    fastest = time_sorted[0]
    slowest = time_sorted[-1]
    
    if fastest.time_complexity == slowest.time_complexity:
        comparative_summary = (
            f"All {len(items)} compared algorithms share equivalent asymptotic time bounds ({fastest.time_complexity}). "
            f"Differences lie in auxiliary space ({', '.join(f'{i.name}: {i.space_complexity}' for i in items)}) and constant factor overheads."
        )
    else:
        comparative_summary = (
            f"'{fastest.name}' asymptotically dominates in execution speed at {fastest.time_complexity}, "
            f"whereas '{slowest.name}' has the steepest growth curve at {slowest.time_complexity} ({slowest.dominant_term}). "
            f"For large problem instances (n > 100), '{fastest.name}' will scale significantly better."
        )

    return CompareResponse(
        items=items,
        comparative_summary=comparative_summary,
        time_ranking=time_ranking,
        space_ranking=space_ranking,
        timestamp=datetime.utcnow().isoformat() + "Z",
    )
