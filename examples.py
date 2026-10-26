"""
Built-in preset algorithms showcasing various complexity classes.
"""

from typing import List
from backend.analyzer.schemas import ExampleAlgorithm

PRESET_EXAMPLES: List[ExampleAlgorithm] = [
    ExampleAlgorithm(
        id="constant_time",
        name="Constant Time Access",
        category="O(1)",
        expected_time="O(1)",
        expected_space="O(1)",
        description="Direct array indexing and basic arithmetic operations executing in constant time.",
        code="""def get_first_and_middle(arr):
    # O(1) time and O(1) auxiliary space
    if not arr:
        return None, None
    first = arr[0]
    mid_idx = len(arr) // 2
    middle = arr[mid_idx]
    return first, middle
""",
    ),
    ExampleAlgorithm(
        id="binary_search",
        name="Binary Search",
        category="O(log n)",
        expected_time="O(log n)",
        expected_space="O(1)",
        description="Logarithmic search in a sorted array by halving search boundaries in each step.",
        code="""def binary_search(arr, target):
    # O(log n) time and O(1) auxiliary space
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
""",
    ),
    ExampleAlgorithm(
        id="linear_search",
        name="Linear Search & Max Finding",
        category="O(n)",
        expected_time="O(n)",
        expected_space="O(1)",
        description="Single sequential iteration over an input collection with constant space.",
        code="""def find_maximum(nums):
    # O(n) time and O(1) auxiliary space
    if not nums:
        return None
    max_val = nums[0]
    for num in nums:
        if num > max_val:
            max_val = num
    return max_val
""",
    ),
    ExampleAlgorithm(
        id="merge_sort",
        name="Merge Sort (Divide & Conquer)",
        category="O(n log n)",
        expected_time="O(n log n)",
        expected_space="O(n)",
        description="Divide-and-conquer recurrence: 2 * T(n/2) with O(n) combine/merge step.",
        code="""def merge_sort(arr):
    # O(n log n) time and O(n) auxiliary space
    if len(arr) <= 1:
        return arr
        
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    # Merge sorted halves
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
            
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged
""",
    ),
    ExampleAlgorithm(
        id="bubble_sort",
        name="Bubble Sort (Nested Loops)",
        category="O(n^2)",
        expected_time="O(n^2)",
        expected_space="O(1)",
        description="Two nested loops iterating over an array performing pairwise swaps in-place.",
        code="""def bubble_sort(arr):
    # O(n^2) time and O(1) auxiliary space
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
""",
    ),
    ExampleAlgorithm(
        id="matrix_multiplication",
        name="Matrix Multiplication (Triple Nested)",
        category="O(n^3)",
        expected_time="O(n^3)",
        expected_space="O(n^2)",
        description="Triple nested loops multiplying two n x n matrices and allocating a result grid.",
        code="""def multiply_matrices(A, B):
    # O(n^3) time and O(n^2) auxiliary space
    n = len(A)
    # Allocate result matrix
    result = [[0 for _ in range(n)] for _ in range(n)]
    
    for i in range(n):
        for j in range(n):
            total = 0
            for k in range(n):
                total += A[i][k] * B[k][j]
            result[i][j] = total
            
    return result
""",
    ),
    ExampleAlgorithm(
        id="fibonacci_recursive",
        name="Fibonacci (Naive Recursive)",
        category="O(2^n)",
        expected_time="O(2^n)",
        expected_space="O(n)",
        description="Exponential branching recursion where each call spawns two recursive sub-calls.",
        code="""def fibonacci(n):
    # O(2^n) time and O(n) call stack space
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
""",
    ),
    ExampleAlgorithm(
        id="two_sum_hashmap",
        name="Two Sum (Hash Map Lookup)",
        category="O(n)",
        expected_time="O(n)",
        expected_space="O(n)",
        description="Linear scan storing visited elements in a dictionary for O(1) complement lookup.",
        code="""def two_sum(nums, target):
    # O(n) time and O(n) auxiliary space
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
""",
    ),
]
