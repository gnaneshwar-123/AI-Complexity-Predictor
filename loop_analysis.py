"""
Loop analysis module using Python AST.
Identifies loop structures, nesting hierarchies, bounds, step modifications,
and estimates asymptotic complexity contributions for each loop.
"""

import ast
from typing import List, Dict, Optional, Tuple, Any
from .schemas import LoopInfo, LoopType, LoopBoundType


def _expr_to_str(node: Optional[ast.AST]) -> str:
    """Helper to convert AST expression to human-readable string."""
    if node is None:
        return ""
    try:
        return ast.unparse(node)
    except Exception:
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Constant):
            return str(node.value)
        elif isinstance(node, ast.Call):
            func_name = _expr_to_str(node.func)
            args = ", ".join(_expr_to_str(a) for a in node.args)
            return f"{func_name}({args})"
        return "expr"


def _is_constant_node(node: ast.AST) -> bool:
    """Check if node evaluates to a compile-time constant integer or number."""
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return True
    if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.UAdd, ast.USub)):
        return _is_constant_node(node.operand)
    return False


def _analyze_range_call(call_node: ast.Call, outer_vars: List[str]) -> Tuple[LoopBoundType, str, str]:
    """
    Analyze range(...) arguments to determine bound type and complexity contribution.
    """
    args = call_node.args
    if not args:
        return LoopBoundType.UNKNOWN, "O(1)", "range() with no arguments"

    # Single argument: range(stop)
    if len(args) == 1:
        stop = args[0]
        if _is_constant_node(stop):
            val = getattr(stop, "value", "c")
            return LoopBoundType.CONSTANT, "O(1)", f"Fixed range up to constant {val}"
        
        # Check if stop is a variable dependent on an outer loop variable
        if isinstance(stop, ast.Name) and stop.id in outer_vars:
            return LoopBoundType.TRIANGULAR, "O(n)", f"Dependent on outer loop variable '{stop.id}' (triangular iteration)"

        return LoopBoundType.INPUT_DEPENDENT, "O(n)", f"Iterates up to input variable/expression '{_expr_to_str(stop)}'"

    # Two arguments: range(start, stop)
    if len(args) == 2:
        start, stop = args[0], args[1]
        if _is_constant_node(start) and _is_constant_node(stop):
            return LoopBoundType.CONSTANT, "O(1)", f"Fixed range from {_expr_to_str(start)} to {_expr_to_str(stop)}"
        
        if isinstance(stop, ast.Name) and stop.id in outer_vars:
            return LoopBoundType.TRIANGULAR, "O(n)", f"Dependent on outer loop variable '{stop.id}'"

        return LoopBoundType.INPUT_DEPENDENT, "O(n)", f"Range bound dependent on {_expr_to_str(stop)}"

    # Three arguments: range(start, stop, step)
    if len(args) == 3:
        start, stop, step = args[0], args[1], args[2]
        if _is_constant_node(start) and _is_constant_node(stop) and _is_constant_node(step):
            return LoopBoundType.CONSTANT, "O(1)", "Fixed constant range with fixed step"
        
        # Check for logarithmic step like step *= 2 inside range or division
        return LoopBoundType.INPUT_DEPENDENT, "O(n)", f"Range from {_expr_to_str(start)} to {_expr_to_str(stop)} with step {_expr_to_str(step)}"

    return LoopBoundType.UNKNOWN, "O(n)", "range() iteration"


def _check_while_step(while_node: ast.While) -> Tuple[LoopBoundType, str, str]:
    """
    Inspect while loop body and condition to detect linear, logarithmic, or constant bounds.
    E.g. i //= 2, i *= 2, low = mid + 1, mid = (low + high)//2
    """
    condition_str = _expr_to_str(while_node.test)
    
    # Check for constant condition like while True / while False / while 1
    if _is_constant_node(while_node.test):
        if getattr(while_node.test, "value", None) in (False, 0):
            return LoopBoundType.CONSTANT, "O(1)", "Loop condition is statically False"
    
    # Traverse statements in body to find variable modifications
    has_halving = False
    has_doubling = False
    has_binary_search_pattern = False
    has_linear_step = False

    for stmt in ast.walk(while_node):
        # AugAssign: i //= 2, i /= 2, i >>= 1
        if isinstance(stmt, ast.AugAssign):
            if isinstance(stmt.op, (ast.FloorDiv, ast.Div, ast.RShift)):
                if _is_constant_node(stmt.value) and getattr(stmt.value, "value", None) == 2:
                    has_halving = True
            elif isinstance(stmt.op, (ast.Mult, ast.LShift)):
                if _is_constant_node(stmt.value) and getattr(stmt.value, "value", None) == 2:
                    has_doubling = True
            elif isinstance(stmt.op, (ast.Add, ast.Sub)):
                has_linear_step = True

        # Assign: i = i // 2, i = i * 2, low = mid + 1, high = mid - 1
        elif isinstance(stmt, ast.Assign):
            if isinstance(stmt.value, ast.BinOp):
                if isinstance(stmt.value.op, (ast.FloorDiv, ast.Div, ast.RShift)):
                    if _is_constant_node(stmt.value.right):
                        has_halving = True
                elif isinstance(stmt.value.op, (ast.Mult, ast.LShift)):
                    if _is_constant_node(stmt.value.right):
                        has_doubling = True
                elif isinstance(stmt.value.op, (ast.Add, ast.Sub)):
                    # Check for binary search pointer updates (e.g. low = mid + 1 or high = mid - 1)
                    target_names = [t.id for t in stmt.targets if isinstance(t, ast.Name)]
                    if any(name in ("low", "high", "left", "right", "start", "end") for name in target_names):
                        has_binary_search_pattern = True
                    else:
                        has_linear_step = True

    if has_halving:
        return LoopBoundType.LOGARITHMIC, "O(log n)", f"Repeated division/halving step detected in '{condition_str}'"
    if has_doubling:
        return LoopBoundType.LOGARITHMIC, "O(log n)", f"Repeated doubling step detected in '{condition_str}'"
    if has_binary_search_pattern:
        return LoopBoundType.LOGARITHMIC, "O(log n)", f"Binary search midpoint window contraction detected ('{condition_str}')"
    if has_linear_step:
        return LoopBoundType.INPUT_DEPENDENT, "O(n)", f"Linear increment/decrement step in '{condition_str}'"

    # Default while loop if no clear logarithmic pattern is found
    return LoopBoundType.DYNAMIC, "O(n)", f"Condition-controlled while loop '{condition_str}'"


class LoopVisitor(ast.NodeVisitor):
    def __init__(self):
        self.loops: List[LoopInfo] = []
        self._loop_stack: List[str] = []
        self._outer_vars: List[str] = []
        self._counter: int = 0

    def visit_For(self, node: ast.For):
        self._counter += 1
        loop_id = f"loop_{self._counter}"
        nesting_level = len(self._loop_stack) + 1
        parent_id = self._loop_stack[-1] if self._loop_stack else None
        target_var = _expr_to_str(node.target)
        bound_expr = _expr_to_str(node.iter)

        bound_type = LoopBoundType.INPUT_DEPENDENT
        contribution = "O(n)"
        step_desc = f"Iterates over {bound_expr}"

        # Check if iter is range(...)
        if isinstance(node.iter, ast.Call) and isinstance(node.iter.func, ast.Name) and node.iter.func.id == "range":
            bound_type, contribution, step_desc = _analyze_range_call(node.iter, self._outer_vars)
        elif _is_constant_node(node.iter):
            bound_type = LoopBoundType.CONSTANT
            contribution = "O(1)"
            step_desc = "Constant collection iteration"
        elif isinstance(node.iter, (ast.List, ast.Tuple, ast.Set)):
            if all(_is_constant_node(elt) for elt in node.iter.elts):
                bound_type = LoopBoundType.CONSTANT
                contribution = "O(1)"
                step_desc = f"Fixed literal collection of length {len(node.iter.elts)}"

        loop_info = LoopInfo(
            id=loop_id,
            line_number=node.lineno,
            loop_type=LoopType.FOR,
            nesting_level=nesting_level,
            parent_loop_id=parent_id,
            bound_type=bound_type,
            complexity_contribution=contribution,
            target_var=target_var,
            bound_expr=bound_expr,
            step_description=step_desc,
            is_nested=nesting_level > 1,
        )
        self.loops.append(loop_info)

        # Push to stack and visit body
        self._loop_stack.append(loop_id)
        if target_var:
            self._outer_vars.append(target_var)

        for stmt in node.body:
            self.visit(stmt)
        for stmt in node.orelse:
            self.visit(stmt)

        if target_var and target_var in self._outer_vars:
            self._outer_vars.remove(target_var)
        self._loop_stack.pop()

    def visit_While(self, node: ast.While):
        self._counter += 1
        loop_id = f"loop_{self._counter}"
        nesting_level = len(self._loop_stack) + 1
        parent_id = self._loop_stack[-1] if self._loop_stack else None
        bound_expr = _expr_to_str(node.test)

        bound_type, contribution, step_desc = _check_while_step(node)

        loop_info = LoopInfo(
            id=loop_id,
            line_number=node.lineno,
            loop_type=LoopType.WHILE,
            nesting_level=nesting_level,
            parent_loop_id=parent_id,
            bound_type=bound_type,
            complexity_contribution=contribution,
            target_var=None,
            bound_expr=bound_expr,
            step_description=step_desc,
            is_nested=nesting_level > 1,
        )
        self.loops.append(loop_info)

        self._loop_stack.append(loop_id)
        for stmt in node.body:
            self.visit(stmt)
        for stmt in node.orelse:
            self.visit(stmt)
        self._loop_stack.pop()


def analyze_loops(tree: ast.AST) -> List[LoopInfo]:
    """
    Extract all loops in the AST with their nesting hierarchy and complexity contributions.
    """
    visitor = LoopVisitor()
    visitor.visit(tree)
    return visitor.loops


def compute_loop_nesting_complexity(loops: List[LoopInfo]) -> Tuple[str, int, str]:
    """
    Computes overall loop-based asymptotic time complexity from detected loops.
    Returns (complexity_class, max_nesting_depth, reasoning).
    """
    if not loops:
        return "O(1)", 0, "No loops detected in source code."

    # Build loop tree
    loop_map = {l.id: l for l in loops}
    max_nesting = max(l.nesting_level for l in loops)

    # Find all root-to-leaf paths to calculate combined complexity of each chain
    def get_path_cost(loop: LoopInfo) -> List[str]:
        path = [loop.complexity_contribution]
        curr = loop
        while curr.parent_loop_id and curr.parent_loop_id in loop_map:
            curr = loop_map[curr.parent_loop_id]
            path.append(curr.complexity_contribution)
        return path

    path_complexities = []
    for l in loops:
        # Check if this loop is a leaf (no other loop has it as parent)
        is_leaf = not any(other.parent_loop_id == l.id for other in loops)
        if is_leaf:
            path_contributions = get_path_cost(l)
            path_complexities.append(path_contributions)

    # Multiply contributions along each branch
    max_order = 0
    worst_path_str = ""
    order_labels = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n^2)", "O(n^3)", "O(n^4)"]

    for path in path_complexities:
        # Count O(n) and O(log n)
        n_count = path.count("O(n)")
        log_count = path.count("O(log n)")
        const_count = path.count("O(1)")

        if n_count == 0 and log_count == 0:
            c = "O(1)"
        elif n_count == 0 and log_count == 1:
            c = "O(log n)"
        elif n_count == 1 and log_count == 0:
            c = "O(n)"
        elif n_count == 1 and log_count >= 1:
            c = "O(n log n)"
        elif n_count == 2 and log_count == 0:
            c = "O(n^2)"
        elif n_count == 2 and log_count >= 1:
            c = "O(n^2 log n)"
        elif n_count == 3:
            c = "O(n^3)"
        elif n_count > 3:
            c = f"O(n^{n_count})"
        else:
            c = "O(n)"

        # Determine asymptotic rank
        rank = (
            0 if c == "O(1)" else
            1 if c == "O(log n)" else
            2 if c == "O(n)" else
            3 if c == "O(n log n)" else
            4 if c == "O(n^2)" else
            5 if c == "O(n^2 log n)" else
            6 if c == "O(n^3)" else 7
        )

        if rank >= max_order:
            max_order = rank
            worst_path_str = c

    explanation = f"Detected {len(loops)} loop(s) with max nesting depth of {max_nesting}. Dominant branch produces {worst_path_str}."
    return worst_path_str, max_nesting, explanation
