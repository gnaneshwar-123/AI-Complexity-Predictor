"""
Tests for automatic language detection and multi-language complexity analysis
(C, C++, Java, JavaScript, Python).
"""

from backend.analyzer.language_detector import detect_language
from backend.analyzer.complexity_classifier import classify_complexity


def test_language_detection_signatures():
    py_code = "def binary_search(arr, target):\n    for x in arr:\n        pass"
    c_code = "#include <stdio.h>\nint main() {\n    printf(\"hello\");\n    return 0;\n}"
    cpp_code = "#include <iostream>\n#include <vector>\nusing namespace std;\nint main() { cout << 1; }"
    java_code = "public class Solution {\n    public static void main(String[] args) {\n        System.out.println(1);\n    }\n}"
    js_code = "function search(arr, target) {\n    const len = arr.length;\n    console.log(len);\n}"

    assert detect_language(py_code)[0] == "Python"
    assert detect_language(c_code)[0] == "C"
    assert detect_language(cpp_code)[0] == "C++"
    assert detect_language(java_code)[0] == "Java"
    assert detect_language(js_code)[0] == "JavaScript"


def test_c_nested_loops_quadratic():
    code = """
#include <stdio.h>
void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}
"""
    result = classify_complexity(code)
    assert result.detected_language == "C"
    assert result.time_complexity == "O(n^2)"
    assert result.space_complexity == "O(1)"
    assert len(result.detected_loops) >= 2


def test_cpp_binary_search_logarithmic():
    code = """
#include <iostream>
#include <vector>
using namespace std;

int binarySearch(const vector<int>& arr, int target) {
    int low = 0;
    int high = arr.size() - 1;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}
"""
    result = classify_complexity(code)
    assert result.detected_language == "C++"
    assert result.time_complexity == "O(log n)"


def test_java_recursive_fibonacci_exponential():
    code = """
public class Solution {
    public int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}
"""
    result = classify_complexity(code)
    assert result.detected_language == "Java"
    assert result.time_complexity == "O(2^n)"
    assert result.space_complexity == "O(n)"


def test_javascript_linear_search():
    code = """
function findMax(nums) {
    let maxVal = nums[0];
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] > maxVal) {
            maxVal = nums[i];
        }
    }
    console.log(maxVal);
    return maxVal;
}
"""
    result = classify_complexity(code)
    assert result.detected_language == "JavaScript"
    assert result.time_complexity == "O(n)"
