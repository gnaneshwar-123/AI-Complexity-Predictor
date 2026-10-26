"""
Recursion analysis module using Python AST.
Identifies recursive function definitions, recursive call sites, parameter reduction
patterns (subtraction, halving, multiple branches), and solves recurrence relations.
"""

import ast
from typing import List, Dict, Optional, Tuple, Any
from .schemas import RecursionPattern


def _is_call_to_func(node: ast.AST, func_name: str) -> bool:
    """Check if an AST node is a direct call to the specified function name."""
    if isinstance(node, ast.Call):
        if isinstance(node.func, ast.Name) and node.func.id == func_name:
            return True
        if isinstance(node.func, ast.Attribute) and node.func.attr == func_name:
            return True
    return False


def _find_call_sites(func_def: ast.FunctionDef) -> List[ast.Call]:
    """Find all recursive call nodes inside the function body."""
    func_name = func_def.name
    call_sites = []
    for node in ast.walk(func_def):
        if node is not func_def and _is_call_to_func(node, func_name):
            call_sites.append(node)
    return call_sites


def _analyze_arg_reduction(call: ast.Call) -> str:
    """
    Examine the arguments of a recursive call to determine reduction pattern:
    - subtraction (n - 1, n - 2)
    - division (n // 2, n / 2)
    - slicing (arr[1:], arr[:mid])
    - unknown
    """
    if not call.args:
        return "unknown"

    for arg in call.args:
        # Check for BinOp: n - 1 or n // 2
        if isinstance(arg, ast.BinOp):
            if isinstance(arg.op, ast.Sub):
                return "subtraction"
            elif isinstance(arg.op, (ast.FloorDiv, ast.Div, ast.RShift)):
                return "division"
        # Check for Subscript slicing: arr[1:], arr[:-1], arr[:mid]
        elif isinstance(arg, ast.Subscript):
            if isinstance(arg.slice, ast.Slice):
                return "slicing"
        # Check for function call like len(arr) - 1
        elif isinstance(arg, ast.Call):
            pass

    return "general"


def _has_linear_work_in_body(func_def: ast.FunctionDef) -> bool:
    """
    Check if the function body contains a loop or linear operation (like merge, list comprehension).
    """
    for node in ast.walk(func_def):
        if isinstance(node, (ast.For, ast.While, ast.ListComp, ast.SetComp, ast.DictComp)):
            return True
        if isinstance(node, ast.Call):
            # Calls to sorted(), min(), max(), sum()
            if isinstance(node.func, ast.Name) and node.func.id in ("sorted", "min", "max", "sum"):
                return True
    return False


def analyze_recursion(tree: ast.AST) -> List[RecursionPattern]:
    """
    Analyze all function definitions in the AST for recursive calls and recurrence patterns.
    """
    results: List[RecursionPattern] = []

    for node in ast.walk(tree):
        if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            continue

        func_name = node.name
        call_sites = _find_call_sites(node)

        if not call_sites:
            continue

        call_lines = [c.lineno for c in call_sites if hasattr(c, "lineno")]
        call_count = len(call_sites)

        reductions = [_analyze_arg_reduction(c) for c in call_sites]
        has_subtraction = any(r == "subtraction" for r in reductions)
        has_division = any(r in ("division", "slicing") for r in reductions)
        has_linear_work = _has_linear_work_in_body(node)

        # 1. Single call with subtraction: Linear recursion (e.g. Factorial, countdown)
        if call_count == 1 and (has_subtraction or not has_division):
            results.append(
                RecursionPattern(
                    function_name=func_name,
                    line_number=node.lineno,
                    recursive_calls_count=1,
                    reduction_pattern="Single branch decrement: n -> n - 1",
                    recurrence_relation="T(n) = T(n - 1) + O(1)",
                    estimated_time_complexity="O(n)",
                    estimated_space_complexity="O(n)",
                    call_sites=call_lines,
                    explanation=(
                        f"Function '{func_name}' makes 1 recursive call per frame with linear decrement. "
                        "Recursion tree has depth n, performing O(1) work per call, resulting in O(n) time "
                        "and O(n) auxiliary call stack space."
                    ),
                )
            )

        # 2. Single call with division / halving: Binary Search / Halving recursion
        elif call_count == 1 and has_division:
            results.append(
                RecursionPattern(
                    function_name=func_name,
                    line_number=node.lineno,
                    recursive_calls_count=1,
                    reduction_pattern="Single branch division: n -> n // 2",
                    recurrence_relation="T(n) = T(n / 2) + O(1)",
                    estimated_time_complexity="O(log n)",
                    estimated_space_complexity="O(log n)",
                    call_sites=call_lines,
                    explanation=(
                        f"Function '{func_name}' invokes 1 recursive call with problem size halved (n/2). "
                        "By the Master Theorem (Case 2 with a=1, b=2, d=0), time complexity is O(log n) "
                        "and auxiliary recursion stack depth is O(log n)."
                    ),
                )
            )

        # 3. Two calls with halving: Divide and Conquer (MergeSort / Tree division)
        elif call_count == 2 and has_division:
            if has_linear_work:
                results.append(
                    RecursionPattern(
                        function_name=func_name,
                        line_number=node.lineno,
                        recursive_calls_count=2,
                        reduction_pattern="Divide-and-conquer with linear merge: 2 * T(n // 2) + O(n)",
                        recurrence_relation="T(n) = 2T(n / 2) + O(n)",
                        estimated_time_complexity="O(n log n)",
                        estimated_space_complexity="O(n)",
                        call_sites=call_lines,
                        explanation=(
                            f"Function '{func_name}' splits into 2 subproblems of size n/2 combined with an O(n) "
                            "merge or partition loop. By the Master Theorem (Case 2: a=2, b=2, d=1), "
                            "the total time complexity is O(n log n). Auxiliary space is O(n) due to temporary arrays/slices."
                        ),
                    )
                )
            else:
                results.append(
                    RecursionPattern(
                        function_name=func_name,
                        line_number=node.lineno,
                        recursive_calls_count=2,
                        reduction_pattern="Binary subproblem division without linear pass: 2 * T(n // 2) + O(1)",
                        recurrence_relation="T(n) = 2T(n / 2) + O(1)",
                        estimated_time_complexity="O(n)",
                        estimated_space_complexity="O(log n)",
                        call_sites=call_lines,
                        explanation=(
                            f"Function '{func_name}' performs 2 recursive calls of half size with O(1) combine step. "
                            "By Master Theorem (Case 1: a=2, b=2, d=0 -> log_b(a)=1 > 0), time complexity is O(n) "
                            "and call stack auxiliary space is O(log n)."
                        ),
                    )
                )

        # 4. Multiple calls with subtraction: Branching / Tree recursion (Fibonacci, exponential trees)
        elif call_count >= 2 and (has_subtraction or not has_division):
            results.append(
                RecursionPattern(
                    function_name=func_name,
                    line_number=node.lineno,
                    recursive_calls_count=call_count,
                    reduction_pattern=f"Multi-branch subtraction: {call_count} recursive calls per activation",
                    recurrence_relation=f"T(n) = {call_count}T(n - 1) + O(1)",
                    estimated_time_complexity="O(2^n)",
                    estimated_space_complexity="O(n)",
                    call_sites=call_lines,
                    explanation=(
                        f"Function '{func_name}' branches into {call_count} recursive subcalls with decremented inputs. "
                        f"This creates an exponential recursion tree of height n with ~{call_count}^n leaf nodes. "
                        "Time complexity is O(2^n) (exponential). The maximum active call stack depth is O(n)."
                    ),
                )
            )

        # 5. General or higher-order recursion
        else:
            results.append(
                RecursionPattern(
                    function_name=func_name,
                    line_number=node.lineno,
                    recursive_calls_count=call_count,
                    reduction_pattern=f"General recursion: {call_count} call(s)",
                    recurrence_relation="T(n) recurrence",
                    estimated_time_complexity="Inconclusive",
                    estimated_space_complexity="O(n)",
                    call_sites=call_lines,
                    explanation=(
                        f"Function '{func_name}' contains {call_count} recursive call(s) with dynamic or multi-variable arguments. "
                        "Static AST analysis cannot conclusively solve the recurrence without dynamic parameter constraints."
                    ),
                )
            )

    return results
