"""
Space complexity analysis module using Python AST.
Distinguishes auxiliary space from input space. Analyzes dynamic data structures,
comprehensions, matrix allocations, slices, and recursion stack frames.
"""

import ast
from typing import List, Dict, Tuple, Optional
from .schemas import SpaceAllocationInfo, RecursionPattern, LoopInfo


def _is_constant(node: ast.AST) -> bool:
    if isinstance(node, ast.Constant):
        return True
    return False


class SpaceVisitor(ast.NodeVisitor):
    def __init__(self, recursion_patterns: List[RecursionPattern], loops: List[LoopInfo]):
        self.allocations: List[SpaceAllocationInfo] = []
        self.recursion_patterns = recursion_patterns
        self.loops = loops
        self._in_loop = False

    def visit_ListComp(self, node: ast.ListComp):
        # Check for multiple generators or nested ListComp/array multiplication in element
        generators = len(node.generators)
        has_nested_comp = isinstance(node.elt, (ast.ListComp, ast.SetComp, ast.DictComp))
        has_nested_alloc = False
        if isinstance(node.elt, ast.BinOp) and isinstance(node.elt.op, ast.Mult):
            if isinstance(node.elt.left, ast.List) or isinstance(node.elt.right, ast.List):
                has_nested_alloc = True

        if generators >= 2 or has_nested_comp or has_nested_alloc:
            self.allocations.append(
                SpaceAllocationInfo(
                    line_number=node.lineno,
                    allocation_type="2D/Multi-generator List Comprehension",
                    estimated_space="O(n^2)",
                    description="Multi-generator or nested list comprehension allocates 2D matrix structure of size O(n^2).",
                )
            )
        else:
            self.allocations.append(
                SpaceAllocationInfo(
                    line_number=node.lineno,
                    allocation_type="List Comprehension",
                    estimated_space="O(n)",
                    description="List comprehension creates a new dynamic list with capacity proportional to input size O(n).",
                )
            )
        self.generic_visit(node)

    def visit_SetComp(self, node: ast.SetComp):
        self.allocations.append(
            SpaceAllocationInfo(
                line_number=node.lineno,
                allocation_type="Set Comprehension",
                estimated_space="O(n)",
                description="Set comprehension allocates a hash set of elements proportional to input size O(n).",
            )
        )
        self.generic_visit(node)

    def visit_DictComp(self, node: ast.DictComp):
        self.allocations.append(
            SpaceAllocationInfo(
                line_number=node.lineno,
                allocation_type="Dict Comprehension",
                estimated_space="O(n)",
                description="Dict comprehension creates a new hash map of key-value pairs proportional to input size O(n).",
            )
        )
        self.generic_visit(node)

    def visit_BinOp(self, node: ast.BinOp):
        # [0] * n or [''] * len(s) or [[0]*n] * n
        if isinstance(node.op, ast.Mult):
            # Check left or right is a list
            is_list_multiplier = isinstance(node.left, ast.List) or isinstance(node.right, ast.List)
            if is_list_multiplier:
                multiplier = node.right if isinstance(node.left, ast.List) else node.left
                if not _is_constant(multiplier):
                    self.allocations.append(
                        SpaceAllocationInfo(
                            line_number=node.lineno,
                            allocation_type="Repeated Array Allocation",
                            estimated_space="O(n)",
                            description=f"Array multiplication dynamically allocates contiguous buffer of size O(n).",
                        )
                    )
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        # list(), set(), dict() calls
        if isinstance(node.func, ast.Name):
            func_name = node.func.id
            if func_name in ("list", "set", "dict", "tuple"):
                if node.args and not _is_constant(node.args[0]):
                    self.allocations.append(
                        SpaceAllocationInfo(
                            line_number=node.lineno,
                            allocation_type=f"{func_name.capitalize()} Construction",
                            estimated_space="O(n)",
                            description=f"Constructor `{func_name}()` allocates auxiliary memory for elements from iterable.",
                        )
                    )
        self.generic_visit(node)

    def visit_Subscript(self, node: ast.Subscript):
        # Python slicing creates a copy: arr[1:], arr[:mid], arr[a:b]
        if isinstance(node.slice, ast.Slice):
            # If start or stop is present
            self.allocations.append(
                SpaceAllocationInfo(
                    line_number=node.lineno,
                    allocation_type="Array Slice Copy",
                    estimated_space="O(n)",
                    description="Python list slicing copies elements into a newly allocated sub-array of size up to O(n).",
                )
            )
        self.generic_visit(node)


def analyze_space_complexity(
    tree: ast.AST, recursion_patterns: List[RecursionPattern], loops: List[LoopInfo]
) -> Tuple[str, List[SpaceAllocationInfo], str]:
    """
    Synthesize auxiliary space from allocations and recursion stack depth.
    Returns (space_complexity, allocations, explanation).
    """
    visitor = SpaceVisitor(recursion_patterns, loops)
    visitor.visit(tree)
    allocations = visitor.allocations

    # Factor in recursion stack space
    for r in recursion_patterns:
        allocations.append(
            SpaceAllocationInfo(
                line_number=r.line_number,
                allocation_type="Recursion Call Stack",
                estimated_space=r.estimated_space_complexity,
                description=f"Call stack frames for recursive function '{r.function_name}' reach depth {r.estimated_space_complexity}.",
            )
        )

    # Rank space complexities: O(1) < O(log n) < O(n) < O(n^2) < O(n^3)
    rank_map = {
        "O(1)": 0,
        "O(log n)": 1,
        "O(n)": 2,
        "O(n log n)": 3,
        "O(n^2)": 4,
        "O(n^3)": 5,
        "O(2^n)": 6,
    }

    max_rank = 0
    dominant_space = "O(1)"
    dominant_reason = "Operates in-place with O(1) auxiliary variables."

    for alloc in allocations:
        rank = rank_map.get(alloc.estimated_space, 2)
        if rank > max_rank:
            max_rank = rank
            dominant_space = alloc.estimated_space
            dominant_reason = alloc.description

    return dominant_space, allocations, dominant_reason
