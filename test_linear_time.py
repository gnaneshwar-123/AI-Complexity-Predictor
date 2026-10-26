"""
Tests for O(n) linear time complexity patterns.
"""

from backend.analyzer.complexity_classifier import classify_complexity


def test_single_for_range_n():
    code = """
def linear_count(n):
    total = 0
    for i in range(n):
        total += i
    return total
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(n)"
    assert result.space_complexity == "O(1)"
    assert len(result.detected_loops) == 1
    assert result.detected_loops[0].complexity_contribution == "O(n)"


def test_iterate_over_collection():
    code = """
def sum_array(arr):
    s = 0
    for x in arr:
        s += x
    return s
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(n)"
    assert result.space_complexity == "O(1)"


def test_sequential_loops_sum():
    # Two sequential loops should result in O(n) + O(n) = O(n), NOT O(n^2)
    code = """
def two_sequential_loops(n):
    for i in range(n):
        pass
    for j in range(n):
        pass
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(n)"
    assert len(result.detected_loops) == 2
    assert all(l.nesting_level == 1 for l in result.detected_loops)


def test_linear_while_loop():
    code = """
def countdown(n):
    while n > 0:
        n -= 1
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(n)"
    assert len(result.detected_loops) == 1
