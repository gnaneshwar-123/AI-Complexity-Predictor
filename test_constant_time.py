"""
Tests for O(1) constant time complexity patterns.
"""

from backend.analyzer.complexity_classifier import classify_complexity


def test_basic_arithmetic_constant_time():
    code = """
def add(a, b):
    c = a + b
    d = c * 2
    return d
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(1)"
    assert result.space_complexity == "O(1)"
    assert result.is_valid_syntax is True


def test_array_indexing_constant_time():
    code = """
def get_head(arr):
    if len(arr) == 0:
        return None
    return arr[0]
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(1)"
    assert result.space_complexity == "O(1)"


def test_fixed_constant_loop():
    code = """
def fixed_iterations():
    total = 0
    for i in range(10):
        total += i
    return total
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(1)"
    assert result.space_complexity == "O(1)"
    assert len(result.detected_loops) == 1
    assert result.detected_loops[0].bound_type.value == "constant"
