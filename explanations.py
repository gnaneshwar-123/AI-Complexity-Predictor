"""
Pedagogical explanations, reasoning steps, assumptions, limitations,
and optimization suggestions generator for static complexity analysis.
"""

from typing import List, Dict, Any, Optional
from .schemas import (
    LoopInfo,
    RecursionPattern,
    SpaceAllocationInfo,
    ConfidenceCategory,
    LoopBoundType,
)


def generate_step_by_step_reasoning(
    time_complexity: str,
    space_complexity: str,
    loops: List[LoopInfo],
    recursions: List[RecursionPattern],
    allocations: List[SpaceAllocationInfo],
    dominant_term: str,
) -> List[str]:
    """
    Generate clear, numbered, pedagogical reasoning steps detailing how
    the complexity was derived from AST structures.
    """
    steps: List[str] = []

    # Step 1: Overall overview
    if not loops and not recursions:
        steps.append(
            "1. Code Structure: The analyzed snippet contains straight-line sequential statements without any iterative loops or recursive invocations."
        )
        steps.append(
            f"2. Elementary Operations: All operations (assignments, basic arithmetic, property access) execute in constant time O(1)."
        )
    else:
        loop_count = len(loops)
        rec_count = len(recursions)
        steps.append(
            f"1. Structural Inventory: Found {loop_count} loop construct(s) and {rec_count} recursive function pattern(s)."
        )

    # Step 2: Loop details
    if loops:
        max_nesting = max(l.nesting_level for l in loops)
        if max_nesting == 1:
            steps.append(
                f"2. Loop Evaluation: All detected loops run sequentially at nesting level 1. Under asymptotic rules, O(n) + O(n) = O(n), so sequential loops do not multiply."
            )
        else:
            steps.append(
                f"2. Loop Nesting: Detected nested loop hierarchy with a maximum nesting depth of {max_nesting}. Dependent inner loops multiply their iteration counts with enclosing loops."
            )

        for i, l in enumerate(loops, 1):
            steps.append(
                f"   • Loop {l.id} (Line {l.line_number}, Depth {l.nesting_level}): {l.bound_type.value} bound ({l.bound_expr or 'condition'}), contributing {l.complexity_contribution} ({l.step_description})."
            )

    # Step 3: Recursion details
    if recursions:
        for r in recursions:
            steps.append(
                f"3. Recurrence Analysis: Function '{r.function_name}' (Line {r.line_number}) defines recurrence relation '{r.recurrence_relation or 'T(n)'}'. {r.explanation}"
            )

    # Step 4: Dominant term identification
    steps.append(
        f"4. Asymptotic Dominance: Among all computational blocks, the dominant term is '{dominant_term}', which asymptotically bounds the execution time to {time_complexity}."
    )

    # Step 5: Auxiliary space evaluation
    if space_complexity == "O(1)":
        steps.append(
            "5. Auxiliary Space Assessment: No significant dynamic memory structures or unbounded recursive call stacks were allocated. Auxiliary space complexity is strictly O(1) (in-place)."
        )
    else:
        steps.append(
            f"5. Auxiliary Space Assessment: Auxiliary space is bounded by {space_complexity}. Memory allocations include: "
            + "; ".join(f"{a.allocation_type} ({a.estimated_space})" for a in allocations[:3])
            + "."
        )

    return steps


def generate_assumptions(
    time_complexity: str,
    loops: List[LoopInfo],
    recursions: List[RecursionPattern],
) -> List[str]:
    """
    List standard theoretical assumptions applied during static analysis.
    """
    assumptions = [
        "Variable 'n' represents the primary input dimension (length of collection, magnitude of integer, or matrix row count).",
        "Primitive operations (arithmetic, scalar assignments, variable lookups, array index access) take uniform O(1) time.",
        "Hash table operations (dict lookups, set membership tests) operate with average-case O(1) time.",
    ]

    if any(l.bound_type == LoopBoundType.INPUT_DEPENDENT for l in loops):
        assumptions.append("Iterated inputs or ranges are assumed to scale linearly with input size n.")

    if recursions:
        assumptions.append("Base case termination condition is reached cleanly after finite reductions without infinite recursion.")

    if time_complexity in ("O(n^2)", "O(n^3)"):
        assumptions.append("Inner loop bounds are assumed to iterate in worst-case full capacity without early termination guarantees.")

    return assumptions


def generate_limitations(
    code_length: int,
    loops: List[LoopInfo],
    recursions: List[RecursionPattern],
) -> List[str]:
    """
    List honest limitations of static AST analysis for the user.
    """
    limitations = [
        "Static AST analysis examines structural syntax trees without runtime values; data-dependent early exits (e.g. break statements on early hits) are not dynamically measured.",
        "Worst-case asymptotic upper bounds (Big-O) are reported, which may differ from average or best-case execution performance on specialized inputs.",
        "Amortized operations (such as dynamic array over-allocation resizing in list.append) are modeled conservatively.",
    ]

    has_while = any(l.loop_type.value == "while" for l in loops)
    if has_while:
        limitations.append(
            "While-loop termination conditions with complex mathematical invariants cannot be formally proven via static parsing alone."
        )

    return limitations


def generate_optimization_suggestions(
    time_complexity: str,
    space_complexity: str,
    loops: List[LoopInfo],
    recursions: List[RecursionPattern],
) -> List[str]:
    """
    Generate actionable suggestions for algorithmic efficiency improvements.
    """
    suggestions: List[str] = []

    # Optimization for quadratic or cubic time
    if time_complexity in ("O(n^2)", "O(n^3)"):
        suggestions.append(
            "Replace Nested Scanning: If the inner loop searches for complementary elements or duplicates, store elements in a `set` or `dict` for O(1) average lookup to bring total time down to O(n)."
        )
        suggestions.append(
            "Two-Pointer Technique: If the input can be pre-sorted (or is already sorted), use two pointers from left and right to reduce pairwise comparisons from O(n^2) to O(n)."
        )

    # Optimization for exponential recursion
    if time_complexity == "O(2^n)":
        suggestions.append(
            "Dynamic Programming / Memoization: The overlapping subproblems in this tree recursion cause repeated re-computations. Wrap the function with `@functools.lru_cache` or use bottom-up tabulation to achieve linear O(n) runtime."
        )

    # Optimization for linear search
    if time_complexity == "O(n)" and not recursions:
        suggestions.append(
            "Binary Search: If queries are performed repeatedly on structured or sorted collections, consider Binary Search `bisect` for O(log n) lookup efficiency."
        )

    # Space optimization
    if space_complexity not in ("O(1)", "O(log n)"):
        suggestions.append(
            "In-Place Operations: Where possible, modify input data structures in-place or use generator expressions (`(...)` instead of `[...]`) to avoid allocating full auxiliary copies in memory."
        )

    if any(r.estimated_space_complexity == "O(n)" for r in recursions):
        suggestions.append(
            "Recursion to Iteration: Convert linear recursion to an iterative loop with accumulators to avoid Python's recursion limit and reduce stack space from O(n) to O(1)."
        )

    if not suggestions:
        suggestions.append(
            "Optimal Asymptotic Complexity: The algorithm already demonstrates optimal asymptotic upper bounds for its class."
        )

    return suggestions
