"""
Tests for recursive algorithms and recurrence solvers.
"""

from backend.analyzer.complexity_classifier import classify_complexity


def test_linear_recursion_factorial():
    code = """
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(n)"
    assert result.space_complexity == "O(n)"
    assert len(result.detected_recursion) == 1
    assert result.detected_recursion[0].recursive_calls_count == 1


def test_divide_and_conquer_mergesort():
    code = """
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    # Merge step
    res = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            res.append(left[i])
            i += 1
        else:
            res.append(right[j])
            j += 1
    res.extend(left[i:])
    res.extend(right[j:])
    return res
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(n log n)"
    assert result.space_complexity == "O(n)"
    assert len(result.detected_recursion) == 1
    assert result.detected_recursion[0].recursive_calls_count == 2


def test_branching_recursion_fibonacci():
    code = """
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(2^n)"
    assert result.space_complexity == "O(n)"
    assert len(result.detected_recursion) == 1
    assert result.detected_recursion[0].recursive_calls_count == 2
