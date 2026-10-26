"""
Tests for logarithmic time complexity patterns O(log n).
"""

from backend.analyzer.complexity_classifier import classify_complexity


def test_binary_search_iterative():
    code = """
def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(log n)"
    assert result.space_complexity == "O(1)"


def test_while_halving_update():
    code = """
def halving_loop(n):
    steps = 0
    while n > 1:
        n //= 2
        steps += 1
    return steps
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(log n)"


def test_while_doubling_update():
    code = """
def doubling_loop(n):
    i = 1
    while i < n:
        i *= 2
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(log n)"
