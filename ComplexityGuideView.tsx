import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  Code2,
  Terminal,
} from 'lucide-react';
import { GrowthChart } from './GrowthChart';

export const ComplexityGuideView: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('O(n log n)');

  const complexityClasses = [
    {
      name: 'O(1)',
      label: 'Constant Time',
      badge: 'Excellent',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      description:
        'Execution time does not depend on the input size n. Operation finishes in bounded, invariant machine cycles.',
      examples: 'Direct hash map access, array index lookup (arr[0]), math equations, stack push/pop.',
      sampleCode: `def get_first_element(arr):\n    # O(1) time, O(1) space\n    return arr[0] if arr else None`,
    },
    {
      name: 'O(log n)',
      label: 'Logarithmic Time',
      badge: 'Very Good',
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      description:
        'Execution time increases logarithmically as input size grows. Usually found in divide-and-conquer algorithms that halve the remaining search space in each step.',
      examples: 'Binary search, balanced binary search tree lookups, repeatedly dividing by 2.',
      sampleCode: `def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: low = mid + 1\n        else: high = mid - 1\n    return -1`,
    },
    {
      name: 'O(n)',
      label: 'Linear Time',
      badge: 'Good',
      color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
      description:
        'Execution time grows in direct proportion to input size n. Traverses through the elements of the dataset once.',
      examples: 'Linear search, finding minimum/maximum element, single non-nested loop over an array.',
      sampleCode: `def linear_search(arr, target):\n    for idx, val in enumerate(arr):\n        if val == target: return idx\n    return -1`,
    },
    {
      name: 'O(n log n)',
      label: 'Linearithmic Time',
      badge: 'Moderate',
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
      description:
        'Slightly worse than linear time, but far superior to quadratic time. Typically results from dividing the problem into subproblems of size n/2 and performing linear work to combine them.',
      examples: 'Merge Sort, Quick Sort (average case), Timsort (Python standard sorted()), Heap Sort.',
      sampleCode: `def mergesort(arr):\n    if len(arr) <= 1: return arr\n    mid = len(arr) // 2\n    left = mergesort(arr[:mid])\n    right = mergesort(arr[mid:])\n    return merge(left, right) # linear merge`,
    },
    {
      name: 'O(n^2)',
      label: 'Quadratic Time',
      badge: 'Poor (Avoid for large n)',
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      description:
        'Execution time grows proportional to the square of input size n. Commonly arises from two nested loops inspecting pairwise combinations.',
      examples: 'Bubble Sort, Selection Sort, Insertion Sort (worst case), comparing every pair of elements.',
      sampleCode: `def pairwise_comparison(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(i + 1, n):\n            if arr[i] == arr[j]: return True\n    return False`,
    },
    {
      name: 'O(n^3)',
      label: 'Cubic Time',
      badge: 'Bad',
      color: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
      description:
        'Execution time grows proportional to n cubed. Characteristic of three nested loops, such as naive matrix multiplication.',
      examples: 'Triple nested loops, naive n x n matrix multiplication, inspecting all triplets in a list.',
      sampleCode: `def matrix_multiplication(A, B, n):\n    C = [[0]*n for _ in range(n)]\n    for i in range(n):\n        for j in range(n):\n            for k in range(n):\n                C[i][j] += A[i][k] * B[k][j]\n    return C`,
    },
    {
      name: 'O(2^n)',
      label: 'Exponential Time',
      badge: 'Intractable',
      color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
      description:
        'Execution time doubles with every single addition to input size n. Quickly becomes computationally infeasible even for small n (n > 35).',
      examples: 'Naive recursive Fibonacci, generating all power sets/subsets, traveling salesperson brute-force.',
      sampleCode: `def fibonacci(n):\n    if n <= 1: return n\n    return fibonacci(n - 1) + fibonacci(n - 2)`,
    },
    {
      name: 'O(n!)',
      label: 'Factorial Time',
      badge: 'Extremely Intractable',
      color: 'text-red-500 border-red-500/30 bg-red-500/10',
      description:
        'Grows faster than exponential time. Generates all possible permutations of a set of n elements.',
      examples: 'Permutation generation (itertools.permutations), solving Traveling Salesperson by brute permutation.',
      sampleCode: `def generate_permutations(arr):\n    # n! distinct orderings\n    import itertools\n    return list(itertools.permutations(arr))`,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-dark-850 border border-slate-800 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-brand-cyan" />
          Algorithmic Complexity & Asymptotics Guide
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Asymptotic notation provides a mathematical framework for analyzing the resource consumption
          (time and auxiliary memory) of algorithms as input size \(n\) tends toward infinity.
        </p>
      </div>

      {/* Interactive Growth Chart */}
      <div>
        <h3 className="text-base font-bold text-white mb-3">
          Interactive Asymptotic Growth Visualizer
        </h3>
        <GrowthChart highlightComplexity={selectedClass} height={300} />
      </div>

      {/* Asymptotic Notations: Big-O, Big-Omega, Big-Theta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-850 border border-slate-800 rounded-xl p-5">
          <div className="text-brand-violet font-mono font-bold text-lg mb-1">
            Big-O ( O )
          </div>
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Asymptotic Upper Bound
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Represents the maximum time taken in the worst-case scenario. Guarantees that the algorithm
            will never grow faster than c &middot; g(n) for sufficiently large n.
          </p>
        </div>

        <div className="bg-dark-850 border border-slate-800 rounded-xl p-5">
          <div className="text-brand-blue font-mono font-bold text-lg mb-1">
            Big-Omega ( &Omega; )
          </div>
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Asymptotic Lower Bound
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Represents the best-case execution time. Demonstrates the absolute minimum number of
            operations required by the algorithm under ideal conditions.
          </p>
        </div>

        <div className="bg-dark-850 border border-slate-800 rounded-xl p-5">
          <div className="text-brand-cyan font-mono font-bold text-lg mb-1">
            Big-Theta ( &Theta; )
          </div>
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Asymptotically Tight Bound
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Occurs when the upper bound and lower bound coincide (f(n) is in O(g(n)) and &Omega;(g(n))).
            Indicates that the algorithm scales at this precise rate.
          </p>
        </div>
      </div>

      {/* Best-Case vs Average-Case vs Worst-Case */}
      <div className="bg-dark-850 border border-slate-800 rounded-xl p-6">
        <h3 className="text-base font-bold text-white mb-3">
          Analysis Cases: Worst, Average, and Best
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-dark-900 border border-slate-800/80">
            <span className="font-bold text-rose-400 block mb-1">Worst-Case Analysis</span>
            <p className="text-slate-400 leading-relaxed">
              Considers the maximum operations executed across all inputs of size \(n\). This is the
              standard metric used in our static analyzer to ensure safe performance guarantees.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-dark-900 border border-slate-800/80">
            <span className="font-bold text-blue-400 block mb-1">Average-Case Analysis</span>
            <p className="text-slate-400 leading-relaxed">
              Considers the expected runtime assuming uniform distribution of inputs. For example,
              hash map lookups take \(O(1)\) on average, though pathological hash collisions take \(O(n)\).
            </p>
          </div>
          <div className="p-4 rounded-lg bg-dark-900 border border-slate-800/80">
            <span className="font-bold text-emerald-400 block mb-1">Best-Case Analysis</span>
            <p className="text-slate-400 leading-relaxed">
              The fastest execution possible. For example, Linear Search achieves \(O(1)\) when the
              target happens to reside at the very first index.
            </p>
          </div>
        </div>
      </div>

      {/* Complexity Classes Directory */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">
          Complexity Class Hierarchy & Code Patterns
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complexityClasses.map((item) => (
            <div
              key={item.name}
              onClick={() => setSelectedClass(item.name)}
              className={`p-5 rounded-xl border bg-dark-850 transition-all cursor-pointer ${
                selectedClass === item.name
                  ? 'border-brand-violet ring-1 ring-brand-violet shadow-lg'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono font-extrabold text-white">
                    {item.name}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">
                    {item.label}
                  </span>
                </div>
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${item.color}`}>
                  {item.badge}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                {item.description}
              </p>

              <div className="mt-3 text-xs text-slate-400">
                <strong className="text-slate-300">Common Examples: </strong>
                {item.examples}
              </div>

              <div className="mt-3 bg-dark-900 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-slate-300 overflow-x-auto">
                <pre>{item.sampleCode}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
