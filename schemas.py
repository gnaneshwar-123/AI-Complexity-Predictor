"""
Pydantic schemas for the AI-Based Complexity Prediction Tool.
"""

from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ComplexityClass(str, Enum):
    O_1 = "O(1)"
    O_LOG_N = "O(log n)"
    O_N = "O(n)"
    O_N_LOG_N = "O(n log n)"
    O_N_2 = "O(n^2)"
    O_N_3 = "O(n^3)"
    O_2_N = "O(2^n)"
    O_N_FACT = "O(n!)"
    INCONCLUSIVE = "Inconclusive"


ASYMPTOTIC_ORDER = [
    "O(1)",
    "O(log n)",
    "O(n)",
    "O(n log n)",
    "O(n^2)",
    "O(n^2 log n)",
    "O(n^3)",
    "O(2^n)",
    "O(n!)",
    "Inconclusive",
]

RANK_MAP = {cls: idx for idx, cls in enumerate(ASYMPTOTIC_ORDER)}


class ConfidenceCategory(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"
    INCONCLUSIVE = "Inconclusive"


class LoopType(str, Enum):
    FOR = "for"
    WHILE = "while"


class LoopBoundType(str, Enum):
    CONSTANT = "constant"
    INPUT_DEPENDENT = "input_dependent"
    LOGARITHMIC = "logarithmic"
    TRIANGULAR = "triangular"
    DYNAMIC = "dynamic"
    UNKNOWN = "unknown"


class LoopInfo(BaseModel):
    id: str = Field(description="Unique identifier for the loop")
    line_number: int = Field(description="Line number in the source code where loop begins")
    loop_type: LoopType = Field(description="Type of loop: for or while")
    nesting_level: int = Field(description="Nesting depth, starting at 1 for top-level loops")
    parent_loop_id: Optional[str] = Field(default=None, description="ID of the parent enclosing loop if nested")
    bound_type: LoopBoundType = Field(description="Type of bound detected")
    complexity_contribution: str = Field(description="Individual contribution e.g. O(1), O(n), O(log n)")
    target_var: Optional[str] = Field(default=None, description="Iterator or counter variable name")
    bound_expr: Optional[str] = Field(default=None, description="Human-readable expression of bound or condition")
    step_description: Optional[str] = Field(default=None, description="Description of update or progression step")
    is_nested: bool = Field(default=False, description="Whether this loop is nested inside another loop")


class RecursionPattern(BaseModel):
    function_name: str = Field(description="Name of the recursive function")
    line_number: int = Field(description="Line number of the function definition")
    recursive_calls_count: int = Field(description="Number of recursive call expressions in function body")
    reduction_pattern: str = Field(description="Detected argument reduction: subtraction, division, multiple branches, etc.")
    recurrence_relation: Optional[str] = Field(default=None, description="Theoretical recurrence e.g. T(n) = 2T(n/2) + O(n)")
    estimated_time_complexity: str = Field(description="Asymptotic time complexity estimate for this recursive structure")
    estimated_space_complexity: str = Field(description="Auxiliary space complexity (call stack depth)")
    call_sites: List[int] = Field(default_factory=list, description="Line numbers where recursive calls take place")
    explanation: str = Field(description="Explanation of the recurrence analysis")


class SpaceAllocationInfo(BaseModel):
    line_number: int = Field(description="Line number where allocation or structure is defined")
    allocation_type: str = Field(description="Category: list comprehension, slice copy, dict/set allocation, call stack, etc.")
    estimated_space: str = Field(description="Estimated auxiliary space contribution: O(1), O(n), O(n^2), etc.")
    description: str = Field(description="Explanation of what memory is allocated")


class ComplexityAnalysisResult(BaseModel):
    time_complexity: str = Field(description="Estimated overall asymptotic time complexity")
    space_complexity: str = Field(description="Estimated overall auxiliary space complexity")
    confidence: ConfidenceCategory = Field(description="Qualitative confidence label")
    confidence_reason: str = Field(description="Documented rationale for the assigned confidence category")
    dominant_term: str = Field(description="The primary code structure dominating the runtime")
    detected_loops: List[LoopInfo] = Field(default_factory=list, description="Detected loops and their bounds")
    detected_recursion: List[RecursionPattern] = Field(default_factory=list, description="Detected recursive functions")
    space_allocations: List[SpaceAllocationInfo] = Field(default_factory=list, description="Identified auxiliary space allocations")
    step_by_step_reasoning: List[str] = Field(default_factory=list, description="Detailed pedagogical breakdown of the analysis")
    assumptions: List[str] = Field(default_factory=list, description="Assumptions made by the static analysis model")
    limitations: List[str] = Field(default_factory=list, description="Known limitations of static AST analysis for this snippet")
    optimization_suggestions: List[str] = Field(default_factory=list, description="Potential algorithmic optimization suggestions")
    ast_node_count: int = Field(default=0, description="Total AST nodes parsed in code")
    lines_of_code: int = Field(default=0, description="Non-empty lines of code")
    cyclomatic_complexity: int = Field(default=1, description="Cyclomatic complexity metric derived from decision points")
    max_nesting_depth: int = Field(default=0, description="Maximum loop nesting level observed")
    functions_analyzed: List[str] = Field(default_factory=list, description="Names of detected user functions")
    detected_language: str = Field(default="Python", description="Programming language detected or analyzed")
    language_confidence: Optional[float] = Field(default=1.0, description="Confidence of automatic language detector")
    is_valid_syntax: bool = Field(default=True, description="Whether Python syntax was valid")
    syntax_error_message: Optional[str] = Field(default=None, description="Syntax error details if invalid")
    analysis_timestamp: str = Field(description="ISO timestamp of analysis")


class CodeAnalysisRequest(BaseModel):
    code: str = Field(description="Python or multi-language source code to analyze", min_length=1, max_length=50000)
    function_name: Optional[str] = Field(default=None, description="Optional target function name to analyze specifically")
    language: Optional[str] = Field(default="auto", description="Programming language: auto, python, c, cpp, java, javascript")


class AlgorithmSnippet(BaseModel):
    id: str = Field(description="Unique identifier for the snippet")
    name: str = Field(description="Human-readable title or algorithm name")
    code: str = Field(description="Source code")


class CompareRequest(BaseModel):
    algorithms: List[AlgorithmSnippet] = Field(
        description="List of algorithms to analyze and compare (2 to 5)",
        min_length=2,
        max_length=5
    )


class ComparisonItem(BaseModel):
    id: str
    name: str
    time_complexity: str
    space_complexity: str
    confidence: ConfidenceCategory
    dominant_term: str
    loop_count: int
    recursion_detected: bool
    summary: str
    result: ComplexityAnalysisResult


class CompareResponse(BaseModel):
    items: List[ComparisonItem] = Field(description="Analysis results for each algorithm")
    comparative_summary: str = Field(description="Comparative breakdown of relative efficiencies")
    time_ranking: List[str] = Field(description="Algorithm IDs sorted from most efficient to least efficient (time)")
    space_ranking: List[str] = Field(description="Algorithm IDs sorted from most efficient to least efficient (space)")
    timestamp: str = Field(description="ISO timestamp of comparison")


class ExampleAlgorithm(BaseModel):
    id: str
    name: str
    category: str
    expected_time: str
    expected_space: str
    description: str
    code: str
