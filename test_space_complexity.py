"""
Tests for auxiliary space complexity classification.
"""

from backend.analyzer.complexity_classifier import classify_complexity


def test_in_place_two_pointers_constant_space():
    code = """
def reverse_in_place(arr):
    left = 0
    right = len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
    return arr
"""
    result = classify_complexity(code)
    assert result.time_complexity == "O(n)"
    assert result.space_complexity == "O(1)"


def test_list_comprehension_linear_space():
    code = """
def double_elements(nums):
    return [x * 2 for x in nums]
"""
    result = classify_complexity(code)
    assert result.space_complexity == "O(n)"


def test_2d_grid_allocation_quadratic_space():
    code = """
def create_grid(n):
    return [[0 for _ in range(n)] for _ in range(n)]
"""
    result = classify_complexity(code)
    assert result.space_complexity == "O(n^2)"


def test_slice_auxiliary_space():
    code = """
def copy_slice(arr):
    sub = arr[1:len(arr)-1]
    return sub
"""
    result = classify_complexity(code)
    assert result.space_complexity == "O(n)"
