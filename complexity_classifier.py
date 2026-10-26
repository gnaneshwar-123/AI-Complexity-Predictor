"""
Overall complexity classification and synthesis engine.
Combines AST loop analysis, recursion recurrence solvers, builtin operation costs,
and space tracking to classify algorithmic time and auxiliary space complexity.
"""

import ast
from datetime import datetime
from typing import List, Dict, Optional, Tuple, Any

from .schemas import (
    ComplexityAnalysisResult,
    ComplexityClass,
    ConfidenceCategory,
    LoopInfo,
    RecursionPattern,
    SpaceAllocationInfo,
    LoopBoundType,
    RANK_MAP,
    ASYMPTOTIC_ORDER,
)
from .parser import parse_python_code, ParseResult
from .loop_analysis import analyze_loops, compute_loop_nesting_complexity
from .recursion_analysis import analyze_recursion
from .space_analysis import analyze_space_complexity
from .explanations import (
    generate_step_by_step_reasoning,
    generate_assumptions,
    generate_limitations,
    generate_optimization_suggestions,
)
from .language_detector import detect_language
from .multilang_analyzer import analyze_multilang_code


def _check_builtin_operations(tree: ast.AST) -> List[Tuple[str, str, int]]:
    """
    Detect calls to builtins with non-trivial complexities.
    Returns list of (operation_name, complexity, line_number).
    """
    costs = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            # Function calls
            if isinstance(node.func, ast.Name):
                fname = node.func.id
                if fname in ("sorted",):
                    costs.append((f"Builtin `{fname}()`", "O(n log n)", node.lineno))
                elif fname in ("min", "max", "sum", "all", "any"):
                    costs.append((f"Builtin `{fname}()`", "O(n)", node.lineno))
            # Method calls
            elif isinstance(node.func, ast.Attribute):
                attr = node.func.attr
                if attr in ("sort",):
                    costs.append((f"Method `.{attr}()` (Timsort)", "O(n log n)", node.lineno))
                elif attr in ("count", "index", "remove"):
                    costs.append((f"Method `.{attr}()` linear scan", "O(n)", node.lineno))
    return costs


def _determine_confidence(
    time_complexity: str,
    loops: List[LoopInfo],
    recursions: List[RecursionPattern],
    has_while: bool,
    has_unknown_bounds: bool,
) -> Tuple[ConfidenceCategory, str]:
    """
    Qualitatively assign confidence based on pattern coverage and structural clarity.
    """
    if time_complexity == "Inconclusive":
        return (
            ConfidenceCategory.INCONCLUSIVE,
            "Structural pattern does not match supported deterministic asymptotic rules.",
        )

    if recursions and any(r.estimated_time_complexity == "Inconclusive" for r in recursions):
        return (
            ConfidenceCategory.LOW,
            "Recursion parameter reduction could not be mapped to standard Master Theorem or linear recurrence forms.",
        )

    if has_unknown_bounds:
        return (
            ConfidenceCategory.LOW,
            "One or more loop bounds or step increments depend on complex dynamic runtime conditions.",
        )

    if has_while:
        # While loops require condition tracking
        return (
            ConfidenceCategory.MEDIUM,
            "While-loop termination updates were mapped via heuristic step inspection; loop invariant holds under standard positive inputs.",
        )

    # Standard for loops or standard linear recursion
    return (
        ConfidenceCategory.HIGH,
        "AST patterns match canonical syntactic loops and standard algorithmic complexity bounds with high certainty.",
    )


def classify_complexity(
    code_str: str,
    target_function: Optional[str] = None,
    language: Optional[str] = "auto",
) -> ComplexityAnalysisResult:
    """
    Analyze code string in Python, C, C++, Java, or JavaScript and produce
    complete explainable complexity analysis with automatic language detection.
    """
    now_str = datetime.utcnow().isoformat() + "Z"

    # 0. Automatic Language Detection
    detected_lang, lang_conf = detect_language(code_str)
    if language and language.lower() not in ("auto", "detect"):
        lang_mapping = {
            "python": "Python", "py": "Python",
            "c": "C",
            "cpp": "C++", "c++": "C++",
            "java": "Java",
            "javascript": "JavaScript", "js": "JavaScript",
        }
        resolved_lang = lang_mapping.get(language.lower(), detected_lang)
    else:
        resolved_lang = detected_lang

    # If code is C, C++, Java, or JavaScript, route to multi-language structural analyzer
    if resolved_lang in ("C", "C++", "Java", "JavaScript"):
        return analyze_multilang_code(code_str, resolved_lang, lang_conf)

    parse_result: ParseResult = parse_python_code(code_str)

    if not parse_result.is_valid:
        return ComplexityAnalysisResult(
            time_complexity="Inconclusive",
            space_complexity="Inconclusive",
            confidence=ConfidenceCategory.INCONCLUSIVE,
            confidence_reason="Source code failed parsing or exceeded size limitations.",
            dominant_term="None (Syntax / Parsing failure)",
            detected_loops=[],
            detected_recursion=[],
            space_allocations=[],
            step_by_step_reasoning=["Code parsing failed before static AST extraction."],
            assumptions=[],
            limitations=[],
            optimization_suggestions=[],
            ast_node_count=0,
            lines_of_code=parse_result.lines_of_code,
            functions_analyzed=[],
            is_valid_syntax=False,
            syntax_error_message=parse_result.error_message,
            analysis_timestamp=now_str,
        )

    tree = parse_result.tree
    functions_found = [f.name for f in parse_result.function_defs]

    # If target function specified, restrict tree to that function
    if target_function:
        target_node = next((f for f in parse_result.function_defs if f.name == target_function), None)
        if target_node:
            tree = target_node

    # 1. Analyze loops
    loops = analyze_loops(tree)
    loop_time, max_nesting, loop_reason = compute_loop_nesting_complexity(loops)

    # 2. Analyze recursion
    recursions = analyze_recursion(tree)
    rec_time = "O(1)"
    rec_dominant = None
    if recursions:
        for r in recursions:
            r_rank = RANK_MAP.get(r.estimated_time_complexity, 0)
            if r_rank > RANK_MAP.get(rec_time, 0):
                rec_time = r.estimated_time_complexity
                rec_dominant = r

    # 3. Builtin operations
    builtin_ops = _check_builtin_operations(tree)
    builtin_time = "O(1)"
    builtin_desc = ""
    for op_name, op_cost, line in builtin_ops:
        if RANK_MAP.get(op_cost, 0) > RANK_MAP.get(builtin_time, 0):
            builtin_time = op_cost
            builtin_desc = f"{op_name} at line {line}"

    # 4. Synthesize overall time complexity
    candidates = [
        (loop_time, f"Loop hierarchy (max depth {max_nesting})"),
        (rec_time, f"Recurrence in '{rec_dominant.function_name if rec_dominant else 'recursion'}'"),
        (builtin_time, builtin_desc or "Builtin function call"),
    ]
    # Filter inconclusive if other valid candidates exist
    valid_candidates = [c for c in candidates if c[0] != "Inconclusive"]
    if not valid_candidates:
        overall_time = "Inconclusive"
        dominant_term = "Inconclusive recursion / dynamic construct"
    else:
        # Pick maximum asymptotic rank
        sorted_candidates = sorted(
            valid_candidates,
            key=lambda item: RANK_MAP.get(item[0], 0),
            reverse=True,
        )
        overall_time, dominant_term = sorted_candidates[0]

    # Special check: If code has a loop calling a builtin or recursion
    if loop_time == "O(n)" and builtin_time == "O(n)":
        # Loop of n calling linear search inside -> O(n^2)
        overall_time = "O(n^2)"
        dominant_term = "Linear builtin operation executed inside an O(n) loop"

    # 5. Space complexity analysis
    space_comp, allocations, space_reason = analyze_space_complexity(tree, recursions, loops)

    # 6. Confidence evaluation
    has_while = any(l.loop_type.value == "while" for l in loops)
    has_unknown = any(l.bound_type == LoopBoundType.UNKNOWN for l in loops)
    confidence, confidence_reason = _determine_confidence(
        overall_time, loops, recursions, has_while, has_unknown
    )

    # 7. Pedagogical explanations
    reasoning_steps = generate_step_by_step_reasoning(
        overall_time, space_comp, loops, recursions, allocations, dominant_term
    )
    assumptions = generate_assumptions(overall_time, loops, recursions)
    limitations = generate_limitations(parse_result.lines_of_code, loops, recursions)
    optimization_suggestions = generate_optimization_suggestions(
        overall_time, space_comp, loops, recursions
    )

    # Compute cyclomatic complexity
    decision_nodes = (ast.If, ast.For, ast.While, ast.ExceptHandler, ast.With, ast.Assert)
    decision_points = sum(1 for node in ast.walk(tree) if isinstance(node, decision_nodes))
    for node in ast.walk(tree):
        if isinstance(node, ast.BoolOp):
            decision_points += max(0, len(node.values) - 1)
    cyclomatic = decision_points + 1

    return ComplexityAnalysisResult(
        time_complexity=overall_time,
        space_complexity=space_comp,
        confidence=confidence,
        confidence_reason=confidence_reason,
        dominant_term=dominant_term,
        detected_loops=loops,
        detected_recursion=recursions,
        space_allocations=allocations,
        step_by_step_reasoning=reasoning_steps,
        assumptions=assumptions,
        limitations=limitations,
        optimization_suggestions=optimization_suggestions,
        ast_node_count=parse_result.node_count,
        lines_of_code=parse_result.lines_of_code,
        cyclomatic_complexity=cyclomatic,
        max_nesting_depth=max_nesting,
        functions_analyzed=functions_found,
        is_valid_syntax=True,
        syntax_error_message=None,
        analysis_timestamp=now_str,
        detected_language="Python",
        language_confidence=lang_conf,
    )
