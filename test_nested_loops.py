"""
Tests for nested loops, quadratic and cubic time complexity patterns.
"""

from backend.analyzer.complexity_classifier import classify_complexity


def test_standard_nested_loops_quadratic():
    code = """
def nested_pairs(n):
    count = 0
    for i in range(n):
        for j in range(n):
            count += 1
    return count
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(n^2)"
    assert len(result.detected_loops) == 2
    assert max(l.nesting_level for l in result.detected_loops) == 2


def test_triangular_nested_loop():
    # Dependent inner loop: for j in range(i) -> O(n^2)
    code = """
def triangular(n):
    count = 0
    for i in range(n):
        for j in range(i):
            count += 1
    return count
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(n^2)"


def test_nested_loop_with_constant_inner_bound():
    # Outer loop is O(n), inner loop is fixed constant 4 -> Total is O(n), NOT O(n^2)
    code = """
def constant_inner(n):
    count = 0
    for i in range(n):
        for j in range(4):
            count += 1
    return count
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(n)"


def test_triple_nested_loops_cubic():
    code = """
def cubic_multiplication(n):
    count = 0
    for i in range(n):
        for j in range(n):
            for k in range(n):
                count += 1
    return count
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(n^3)"
    assert max(l.nesting_level for l in result.detected_loops) == 3


def test_outer_linear_inner_logarithmic():
    # Outer loop is O(n), inner while loop is halving -> O(n log n)
    code = """
def n_log_n_loop(n):
    total = 0
    for i in range(n):
        k = n
        while k > 1:
            k //= 2
            total += 1
    return total
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(n log n)"


def test_builtin_timsort_linearithmic():
    code = """
def sort_items(arr):
    return sorted(arr)
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(n log n)"
