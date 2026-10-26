"""
AST parsing and code validation module.
Parses Python source code safely without executing any user-supplied code.
"""

import ast
from typing import Tuple, Optional, List, Dict, Any


class ParseResult:
    def __init__(
        self,
        tree: Optional[ast.AST],
        is_valid: bool,
        error_message: Optional[str] = None,
        node_count: int = 0,
        lines_of_code: int = 0,
        function_defs: Optional[List[ast.FunctionDef]] = None,
    ):
        self.tree = tree
        self.is_valid = is_valid
        self.error_message = error_message
        self.node_count = node_count
        self.lines_of_code = lines_of_code
        self.function_defs = function_defs or []


def parse_python_code(code_str: str) -> ParseResult:
    """
    Safely parse Python code into an AST without execution.
    Handles size limits, empty input, and syntax errors.
    """
    if not code_str or not code_str.strip():
        return ParseResult(
            tree=None,
            is_valid=False,
            error_message="Input code is empty.",
            lines_of_code=0,
            node_count=0,
        )

    # Input length safety guard (e.g. max 50,000 characters)
    if len(code_str) > 50000:
        return ParseResult(
            tree=None,
            is_valid=False,
            error_message="Input code exceeds maximum allowed length of 50,000 characters.",
            lines_of_code=len(code_str.splitlines()),
            node_count=0,
        )

    # Compute non-empty, non-comment lines of code
    lines = code_str.splitlines()
    loc = sum(1 for line in lines if line.strip() and not line.strip().startswith("#"))

    try:
        tree = ast.parse(code_str)
    except SyntaxError as e:
        msg = f"SyntaxError at line {e.lineno}, offset {e.offset}: {e.msg}"
        return ParseResult(
            tree=None,
            is_valid=False,
            error_message=msg,
            lines_of_code=loc,
            node_count=0,
        )
    except Exception as e:
        return ParseResult(
            tree=None,
            is_valid=False,
            error_message=f"Failed to parse source code: {str(e)}",
            lines_of_code=loc,
            node_count=0,
        )

    node_count = sum(1 for _ in ast.walk(tree))
    function_defs = [node for node in ast.walk(tree) if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))]

    return ParseResult(
        tree=tree,
        is_valid=True,
        error_message=None,
        node_count=node_count,
        lines_of_code=loc,
        function_defs=function_defs,
    )
