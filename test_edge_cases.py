"""
Tests for edge cases, error conditions, invalid syntax, and robustness.
"""

from backend.analyzer.complexity_classifier import classify_complexity
from backend.analyzer.parser import parse_python_code


def test_empty_string():
    result = classify_complexity("")
    assert result.is_valid_syntax is False
    assert result.time_complexity == "Inconclusive"


def test_whitespace_and_comments_only():
    code = """
    # Just a comment
    # Another line
    """
    result = classify_complexity(code)
    assert result.time_complexity == "O(1)"
    assert result.space_complexity == "O(1)"


def test_syntax_error():
    code = """
def broken_syntax(
    for i in range(10)
        print(i
"""
    result = classify_complexity(code)
    assert result.is_valid_syntax is False
    assert result.syntax_error_message is not None
    assert "SyntaxError" in result.syntax_error_message


def test_unsupported_dynamic_eval():
    code = """
def dynamic_execution(user_str):
    eval(user_str)
"""
    result = classify_complexity(code)
    # The tool parses syntax safely without running eval
    assert result.is_valid_syntax is True


def test_oversized_code_guard():
    # Generate massive code string > 50,000 chars
    huge_code = "x = 1\n" * 10000
    res = parse_python_code(huge_code)
    assert res.is_valid is False
    assert "exceeds maximum allowed length" in res.error_message
