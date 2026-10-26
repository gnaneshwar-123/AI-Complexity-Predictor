import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  GitCompare,
  Plus,
  Trash2,
  Play,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ExampleAlgorithm, CompareResponse, AlgorithmSnippet } from '../types';
import { compareAlgorithms, ApiError } from '../services/api';
import { GrowthChart } from './GrowthChart';
import { detectCodeLanguage } from '../utils/languageDetector';

const MULTI_LANG_COMPARE_PRESETS: ExampleAlgorithm[] = [
  {
    id: 'cpp_binary_search',
    name: '[C++] Binary Search',
    category: 'O(log n)',
    expected_time: 'O(log n)',
    expected_space: 'O(1)',
    description: 'C++ binary search.',
    code: `#include <iostream>\n#include <vector>\nusing namespace std;\nint binarySearch(const vector<int>& arr, int target) {\n    int low = 0, high = arr.size() - 1;\n    while (low <= high) {\n        int mid = (low + high) / 2;\n        if (arr[mid] == target) return mid;\n        else if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}`,
  },
  {
    id: 'java_fibonacci',
    name: '[Java] Recursive Fibonacci',
    category: 'O(2^n)',
    expected_time: 'O(2^n)',
    expected_space: 'O(n)',
    description: 'Java tree recursion.',
    code: `public class Solution {\n    public int fibonacci(int n) {\n        if (n <= 1) return n;\n        return fibonacci(n - 1) + fibonacci(n - 2);\n    }\n}`,
  },
];

interface CompareViewProps {
  examples: ExampleAlgorithm[];
}

export const CompareView: React.FC<CompareViewProps> = ({ examples }) => {
  const [snippets, setSnippets] = useState<AlgorithmSnippet[]>([
    {
      id: 'snippet_1',
      name: 'Bubble Sort',
      code: examples.find((e) => e.id === 'bubble_sort')?.code || 'def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr',
    },
    {
      id: 'snippet_2',
      name: 'Merge Sort',
      code: examples.find((e) => e.id === 'merge_sort')?.code || 'def merge_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    mid = len(arr) // 2\n    left = merge_sort(arr[:mid])\n    right = merge_sort(arr[mid:])\n    # merge logic\n    return left + right',
    },
  ]);

  const [activeSnippetIdx, setActiveSnippetIdx] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<CompareResponse | null>(null);

  const allComparePresets = React.useMemo(() => {
    return [...examples, ...MULTI_LANG_COMPARE_PRESETS];
  }, [examples]);

  const activeSnippetLang = React.useMemo(() => {
    return detectCodeLanguage(snippets[activeSnippetIdx]?.code || '');
  }, [snippets, activeSnippetIdx]);

  const handleAddSnippet = () => {
    if (snippets.length >= 5) return;
    const newId = `snippet_${Date.now()}`;
    const nextSnippet: AlgorithmSnippet = {
      id: newId,
      name: `Algorithm ${snippets.length + 1}`,
      code: 'def algorithm(n):\n    for i in range(n):\n        pass',
    };
    setSnippets([...snippets, nextSnippet]);
    setActiveSnippetIdx(snippets.length);
  };

  const handleRemoveSnippet = (idx: number) => {
    if (snippets.length <= 2) {
      setError('At least 2 algorithms are required for comparison.');
      return;
    }
    const updated = snippets.filter((_, i) => i !== idx);
    setSnippets(updated);
    setActiveSnippetIdx(Math.max(0, idx - 1));
  };

  const handleRunComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await compareAlgorithms(snippets);
      setComparisonResult(res);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Comparison request failed. Make sure backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!comparisonResult && snippets.length >= 2) {
      handleRunComparison();
    }
  }, []);

  // Distinct colors for each compared algorithm
  const palette = ['#38bdf8', '#a855f7', '#f59e0b', '#10b981', '#f43f5e'];

  const comparedCurves = comparisonResult
    ? comparisonResult.items.map((item, idx) => ({
        id: item.id,
        name: item.name,
        complexity: item.time_complexity,
        color: palette[idx % palette.length],
      }))
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Toolbar */}
      <div className="bg-dark-850 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-brand-violet" />
            Asymptotic Algorithm Comparison
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compare 2 to 5 algorithm implementations side-by-side to visualize asymptotic scalability tradeoffs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddSnippet}
            disabled={snippets.length >= 5}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-dark-900 border border-slate-800 hover:bg-dark-800 disabled:opacity-40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Algorithm ({snippets.length}/5)</span>
          </button>

          <button
            type="button"
            onClick={handleRunComparison}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-brand-blue to-brand-violet hover:from-blue-600 hover:to-violet-700 shadow-md shadow-brand-blue/20 disabled:opacity-50 transition-all hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Comparing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Comparison</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Snippet Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {snippets.map((snip, idx) => (
          <div
            key={snip.id}
            onClick={() => setActiveSnippetIdx(idx)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
              activeSnippetIdx === idx
                ? 'bg-dark-800 border-brand-violet text-white shadow-sm'
                : 'bg-dark-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <input
              type="text"
              value={snip.name}
              onChange={(e) => {
                const updated = [...snippets];
                updated[idx].name = e.target.value;
                setSnippets(updated);
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent border-none text-xs font-semibold focus:outline-none w-28 text-slate-200"
            />
            {snippets.length > 2 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveSnippet(idx);
                }}
                className="text-slate-500 hover:text-rose-400 p-0.5 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Code Editor for Active Snippet */}
      <div className="bg-dark-850 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="h-10 bg-dark-900 px-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-300">
              Editing {snippets[activeSnippetIdx]?.name}
            </span>
            <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-brand-blue/15 text-brand-cyan border border-brand-blue/30">
              {activeSnippetLang.language}
            </span>
          </div>
          <select
            onChange={(e) => {
              const ex = allComparePresets.find((item) => item.id === e.target.value);
              if (ex) {
                const updated = [...snippets];
                updated[activeSnippetIdx] = {
                  ...updated[activeSnippetIdx],
                  name: ex.name,
                  code: ex.code,
                };
                setSnippets(updated);
              }
            }}
            className="bg-dark-800 border border-slate-700 text-slate-300 text-xs rounded px-2.5 py-1"
          >
            <option value="">Load Preset Into This Slot...</option>
            {allComparePresets.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.expected_time})
              </option>
            ))}
          </select>
        </div>

        <div className="h-72">
          <Editor
            height="100%"
            language={activeSnippetLang.monacoLang}
            theme="vs-dark"
            value={snippets[activeSnippetIdx]?.code || ''}
            onChange={(val) => {
              const updated = [...snippets];
              updated[activeSnippetIdx].code = val || '';
              setSnippets(updated);
            }}
            options={{
              fontSize: 13,
              fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
              minimap: { enabled: false },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>

      {/* Comparison Results */}
      {comparisonResult && (
        <div className="space-y-6">
          {/* Comparative Summary Alert */}
          <div className="bg-gradient-to-r from-dark-850 to-dark-800 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-cyan" />
              Comparative Efficiency Analysis
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {comparisonResult.comparative_summary}
            </p>
          </div>

          {/* Side-by-side Table */}
          <div className="bg-dark-850 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="px-5 py-3 border-b border-slate-800 bg-dark-900 font-semibold text-xs text-slate-300">
              Direct Matrix Comparison
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-3 pl-5">Algorithm</th>
                    <th className="p-3">Time Complexity</th>
                    <th className="p-3">Auxiliary Space</th>
                    <th className="p-3">Loops</th>
                    <th className="p-3">Recursion</th>
                    <th className="p-3">Dominant Factor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {comparisonResult.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-dark-800/40 transition-colors">
                      <td className="p-3 pl-5 font-bold text-slate-100 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: palette[idx % palette.length] }}
                        />
                        <span>{item.name}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-bold bg-dark-900 border border-slate-700 text-brand-cyan">
                          {item.time_complexity}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{item.space_complexity}</td>
                      <td className="p-3 text-slate-400">{item.loop_count} loop(s)</td>
                      <td className="p-3 text-slate-400">
                        {item.recursion_detected ? 'Yes (Detected)' : 'No'}
                      </td>
                      <td className="p-3 font-sans text-slate-400 text-[11px] truncate max-w-xs">
                        {item.dominant_term}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Multi-series Asymptotic Growth Curve */}
          <GrowthChart comparedAlgorithms={comparedCurves} height={340} />
        </div>
      )}
    </div>
  );
};
