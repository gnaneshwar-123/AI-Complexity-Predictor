import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  RotateCcw,
  Sparkles,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Cpu,
  Layers,
  ArrowRight,
  ShieldAlert,
  Flame,
  Info,
} from 'lucide-react';
import {
  ComplexityAnalysisResult,
  ExampleAlgorithm,
  ConfidenceCategory,
} from '../types';
import { analyzeCode, ApiError } from '../services/api';
import { GrowthChart } from './GrowthChart';
import { detectCodeLanguage } from '../utils/languageDetector';

const EXTRA_MULTI_LANG_PRESETS: ExampleAlgorithm[] = [
  {
    id: 'cpp_binary_search',
    name: '[C++] Binary Search',
    category: 'O(log n)',
    expected_time: 'O(log n)',
    expected_space: 'O(1)',
    description: 'C++ vector binary search halving search window repeatedly.',
    code: `#include <iostream>
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
}`,
  },
  {
    id: 'java_fibonacci',
    name: '[Java] Recursive Fibonacci',
    category: 'O(2^n)',
    expected_time: 'O(2^n)',
    expected_space: 'O(n)',
    description: 'Java class with exponential branching tree recursion.',
    code: `public class Solution {
    public int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}`,
  },
  {
    id: 'c_bubble_sort',
    name: '[C] Bubble Sort',
    category: 'O(n^2)',
    expected_time: 'O(n^2)',
    expected_space: 'O(1)',
    description: 'C nested for-loops performing pairwise in-place swaps.',
    code: `#include <stdio.h>

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
}`,
  },
  {
    id: 'js_linear_search',
    name: '[JavaScript] Find Maximum',
    category: 'O(n)',
    expected_time: 'O(n)',
    expected_space: 'O(1)',
    description: 'JavaScript linear iteration over array elements.',
    code: `function findMax(nums) {
    let maxVal = nums[0];
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] > maxVal) {
            maxVal = nums[i];
        }
    }
    console.log(maxVal);
    return maxVal;
}`,
  },
];

interface AnalyzeViewProps {
  currentCode: string;
  setCurrentCode: (code: string) => void;
  examples: ExampleAlgorithm[];
  onAnalysisSuccess: (code: string, result: ComplexityAnalysisResult) => void;
}

export const AnalyzeView: React.FC<AnalyzeViewProps> = ({
  currentCode,
  setCurrentCode,
  examples,
  onAnalysisSuccess,
}) => {
  const [targetFunction, setTargetFunction] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComplexityAnalysisResult | null>(null);
  const [selectedExampleId, setSelectedExampleId] = useState<string>('');
  const [selectedLanguageMode, setSelectedLanguageMode] = useState<string>('auto');

  // Merge backend presets with multi-language examples
  const allPresets = React.useMemo(() => {
    return [...examples, ...EXTRA_MULTI_LANG_PRESETS];
  }, [examples]);

  // Real-time automatic language detection as code is typed/pasted
  const detectedLangInfo = React.useMemo(() => {
    return detectCodeLanguage(currentCode);
  }, [currentCode]);

  const effectiveMonacoLang = selectedLanguageMode === 'auto'
    ? detectedLangInfo.monacoLang
    : (selectedLanguageMode as 'python' | 'c' | 'cpp' | 'java' | 'javascript');

  const effectiveFileExt = selectedLanguageMode === 'auto'
    ? detectedLangInfo.fileExt
    : selectedLanguageMode === 'cpp'
    ? 'cpp'
    : selectedLanguageMode === 'java'
    ? 'java'
    : selectedLanguageMode === 'javascript'
    ? 'js'
    : selectedLanguageMode === 'c'
    ? 'c'
    : 'py';

  const handleSelectExample = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const exId = e.target.value;
    setSelectedExampleId(exId);
    const found = allPresets.find((ex) => ex.id === exId);
    if (found) {
      setCurrentCode(found.code);
      setError(null);
      setLoading(true);
      try {
        const langInfo = detectCodeLanguage(found.code);
        const res = await analyzeCode(found.code, undefined, langInfo.language);
        setResult(res);
        onAnalysisSuccess(found.code, res);
      } catch (err: any) {
        if (err instanceof ApiError) setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!currentCode.trim()) {
      setError('Please provide source code to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const activeLang = selectedLanguageMode === 'auto' ? detectedLangInfo.language : selectedLanguageMode;
      const res = await analyzeCode(currentCode, targetFunction.trim() || undefined, activeLang);
      setResult(res);
      onAnalysisSuccess(currentCode, res);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to analyze code. Please verify the Python backend is running on http://localhost:8000.');
      }
    } finally {
      setLoading(false);
    }
  };

  const lastAnalyzedCodeRef = React.useRef<string>('');

  // Auto-run analysis when code changes (initial load, preset load, dashboard or history selection)
  React.useEffect(() => {
    if (currentCode.trim() && currentCode !== lastAnalyzedCodeRef.current) {
      lastAnalyzedCodeRef.current = currentCode;
      handleAnalyze();
    }
  }, [currentCode]);

  const handleReset = () => {
    setCurrentCode('');
    setResult(null);
    setError(null);
    setSelectedExampleId('');
    setTargetFunction('');
  };

  const exportAsJSON = () => {
    if (!result) return;
    const report = {
      code: currentCode,
      analysis: result,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complexity_analysis_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsMarkdown = () => {
    if (!result) return;
    const md = `# Algorithmic Complexity Analysis Report
**Generated by AI-Based Complexity Prediction Tool**
**Timestamp:** ${result.analysis_timestamp}

## Summary
- **Time Complexity:** \`${result.time_complexity}\`
- **Auxiliary Space Complexity:** \`${result.space_complexity}\`
- **Confidence:** ${result.confidence} (${result.confidence_reason})
- **Dominant Term:** ${result.dominant_term}

## Source Code
\`\`\`python
${currentCode}
\`\`\`

## Step-by-Step Pedagogical Reasoning
${result.step_by_step_reasoning.map((step) => `- ${step}`).join('\n')}

## Detected Loops (${result.detected_loops.length})
${
  result.detected_loops.length === 0
    ? '_No loops detected_'
    : result.detected_loops
        .map(
          (l) =>
            `- **Loop at Line ${l.line_number}** (${l.loop_type.toUpperCase()}, Depth ${l.nesting_level}): Bound: \`${l.bound_type}\` (${l.bound_expr || 'condition'}), Complexity contribution: \`${l.complexity_contribution}\``
        )
        .join('\n')
}

## Detected Recursion (${result.detected_recursion.length})
${
  result.detected_recursion.length === 0
    ? '_No recursion detected_'
    : result.detected_recursion
        .map(
          (r) =>
            `- **Function \`${r.function_name}\` (Line ${r.line_number})**: ${r.reduction_pattern}. Recurrence: \`${r.recurrence_relation || 'T(n)'}\` => Time: \`${r.estimated_time_complexity}\`, Stack: \`${r.estimated_space_complexity}\``
        )
        .join('\n')
}

## Auxiliary Space Allocations
${
  result.space_allocations.length === 0
    ? '_No dynamic memory allocations detected (O(1) in-place)_'
    : result.space_allocations
        .map((a) => `- Line ${a.line_number}: **${a.allocation_type}** (${a.estimated_space}) - ${a.description}`)
        .join('\n')
}

## Assumptions
${result.assumptions.map((a) => `- ${a}`).join('\n')}

## Static Analysis Limitations
${result.limitations.map((l) => `- ${l}`).join('\n')}

## Optimization Suggestions
${result.optimization_suggestions.map((s) => `- ${s}`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complexity_report_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getConfidenceBadgeColor = (category: ConfidenceCategory) => {
    switch (category) {
      case 'High':
        return 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300';
      case 'Medium':
        return 'bg-blue-950/60 border-blue-700/60 text-blue-300';
      case 'Low':
        return 'bg-amber-950/60 border-amber-700/60 text-amber-300';
      default:
        return 'bg-rose-950/60 border-rose-700/60 text-rose-300';
    }
  };

  const getTimeBadgeColor = (tc: string) => {
    switch (tc) {
      case 'O(1)':
        return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/50 text-emerald-300';
      case 'O(log n)':
        return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-300';
      case 'O(n)':
        return 'from-blue-500/20 to-indigo-500/20 border-blue-500/50 text-blue-300';
      case 'O(n log n)':
        return 'from-indigo-500/20 to-purple-500/20 border-indigo-500/50 text-indigo-300';
      case 'O(n^2)':
        return 'from-amber-500/20 to-orange-500/20 border-amber-500/50 text-amber-300';
      case 'O(n^3)':
        return 'from-orange-500/20 to-rose-500/20 border-orange-500/50 text-orange-300';
      case 'O(2^n)':
        return 'from-rose-500/20 to-red-600/20 border-rose-500/50 text-rose-300';
      default:
        return 'from-slate-700/20 to-slate-800/20 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Controls Toolbar */}
      <div className="bg-dark-850 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-400">Load Preset:</label>
            <select
              value={selectedExampleId}
              onChange={handleSelectExample}
              className="bg-dark-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-violet"
            >
              <option value="">-- Choose Algorithm Example --</option>
              {allPresets.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.expected_time})
                </option>
              ))}
            </select>
          </div>

          {/* Automatic Language Detection Controls */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-400">Language:</label>
            <select
              value={selectedLanguageMode}
              onChange={(e) => setSelectedLanguageMode(e.target.value)}
              className="bg-dark-900 border border-slate-800 text-brand-cyan text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-violet"
            >
              <option value="auto">⚡ Auto-Detect ({detectedLangInfo.language})</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-dark-900 border border-slate-800 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 text-[11px]">Detected:</span>
            <span className="font-bold text-white text-[11px]">{detectedLangInfo.language}</span>
            <span className="text-[10px] text-slate-500">
              ({Math.round(detectedLangInfo.confidence * 100)}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-400">Target Function (optional):</label>
            <input
              type="text"
              placeholder="e.g. binary_search"
              value={targetFunction}
              onChange={(e) => setTargetFunction(e.target.value)}
              className="bg-dark-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-violet w-36"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-dark-900 border border-slate-800 hover:bg-dark-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-brand-blue to-brand-violet hover:from-blue-600 hover:to-violet-700 shadow-md shadow-brand-blue/20 disabled:opacity-50 transition-all hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing {selectedLanguageMode === 'auto' ? detectedLangInfo.language : selectedLanguageMode}...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Analyze Complexity</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Split: Editor & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Monaco Code Editor (5 or 6 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-dark-850 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="h-10 bg-dark-900/90 border-b border-slate-800 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-200 ml-2 px-2 py-0.5 rounded bg-dark-950 border border-slate-800">
                  source.{effectiveFileExt}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-blue/15 text-brand-cyan border border-brand-blue/30 font-mono">
                  {effectiveMonacoLang}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                {currentCode.split('\n').length} lines • {currentCode.length} chars
              </div>
            </div>

            <div className="h-[480px]">
              <Editor
                height="100%"
                language={effectiveMonacoLang}
                theme="vs-dark"
                value={currentCode}
                onChange={(val) => setCurrentCode(val || '')}
                options={{
                  fontSize: 13,
                  fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </div>
          </div>

          {/* Validation or API Error Alert */}
          {error && (
            <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-4 flex items-start gap-3 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Analysis Notice:</span>
                <p className="mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Syntax Error In Result Alert */}
          {result && !result.is_valid_syntax && (
            <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4 flex items-start gap-3 text-amber-300 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Python Syntax Parsing Failed:</span>
                <p className="mt-0.5 font-mono text-[11px] leading-relaxed">
                  {result.syntax_error_message || 'Invalid Python syntax.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Analysis Results Dashboard (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="bg-dark-850 border border-slate-800 rounded-xl p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-dark-800 border border-slate-700 flex items-center justify-center mx-auto text-brand-violet">
                <Cpu className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-semibold text-white">
                  No Analysis Computed Yet
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Write or paste Python code into the editor, or choose a canonical algorithm preset
                  above, then click <strong className="text-slate-200">Analyze Complexity</strong> to inspect AST structural breakdowns.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-dark-850 border border-slate-800 rounded-xl p-12 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-300">
                Parsing Python AST & Solving Recurrences...
              </p>
            </div>
          )}

          {result && result.is_valid_syntax && (
            <>
              {/* Language and Diagnostic Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-dark-850 border border-slate-800 px-4 py-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-slate-400 font-medium">Analyzed Language:</span>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-brand-blue/20 text-brand-cyan border border-brand-blue/40">
                    {result.detected_language || detectedLangInfo.language}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    (Auto-Detected with {Math.round((result.language_confidence || detectedLangInfo.confidence) * 100)}% certainty)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {result.lines_of_code} LOC • {result.ast_node_count} AST Tokens • Nesting L{result.max_nesting_depth || 0}
                </div>
              </div>

              {/* Verdict Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Time Complexity Card */}
                <div
                  className={`bg-gradient-to-br ${getTimeBadgeColor(
                    result.time_complexity
                  )} border rounded-xl p-4 shadow-lg`}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Time Complexity
                  </span>
                  <div className="text-2xl font-mono font-extrabold tracking-tight">
                    {result.time_complexity}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block truncate">
                    Dominant: {result.dominant_term}
                  </span>
                </div>

                {/* Space Complexity Card */}
                <div className="bg-dark-850 border border-slate-800 rounded-xl p-4 shadow-lg">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Auxiliary Space
                  </span>
                  <div className="text-2xl font-mono font-extrabold text-brand-cyan tracking-tight">
                    {result.space_complexity}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {result.space_complexity === 'O(1)' ? 'In-place operation' : 'Allocates heap/stack memory'}
                  </span>
                </div>

                {/* Confidence Card */}
                <div className="bg-dark-850 border border-slate-800 rounded-xl p-4 shadow-lg">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Confidence Rating
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold font-mono px-2.5 py-0.5 rounded-full border ${getConfidenceBadgeColor(
                        result.confidence
                      )}`}
                    >
                      {result.confidence}
                    </span>
                  </div>
                  <span
                    className="text-[11px] text-slate-400 mt-1.5 block line-clamp-2"
                    title={result.confidence_reason}
                  >
                    {result.confidence_reason}
                  </span>
                </div>

                {/* Extracted AST Features Card */}
                <div className="bg-dark-850 border border-slate-800 rounded-xl p-4 shadow-lg">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Extracted AST Features
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-mono mt-1">
                    <div>
                      <span className="text-slate-500 text-[10px] block">LOC:</span>
                      <span className="text-slate-200 font-bold">{result.lines_of_code}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">AST Nodes:</span>
                      <span className="text-slate-200 font-bold">{result.ast_node_count}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Nesting:</span>
                      <span className="text-brand-violet font-bold">L{result.max_nesting_depth || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Cyclomatic:</span>
                      <span className="text-brand-cyan font-bold">{result.cyclomatic_complexity || 1}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theoretical Asymptotic Growth Curve */}
              <GrowthChart highlightComplexity={result.time_complexity} height={260} />

              {/* Loop & Recursion Inspection Accordion / Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Loops Panel */}
                <div className="bg-dark-850 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-brand-blue" />
                      Detected Loops ({result.detected_loops.length})
                    </h4>
                  </div>

                  {result.detected_loops.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">
                      No iterative loops detected in this snippet.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {result.detected_loops.map((loop) => (
                        <div
                          key={loop.id}
                          className="bg-dark-900 border border-slate-800/80 rounded-lg p-2.5 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-mono">
                            <span className="font-semibold text-slate-200">
                              Line {loop.line_number} • {loop.loop_type.toUpperCase()}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-brand-blue/15 text-brand-cyan text-[10px] font-bold">
                              {loop.complexity_contribution}
                            </span>
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            Nesting: Level {loop.nesting_level} | Bound: {loop.bound_type}
                          </div>
                          <div className="text-slate-500 text-[11px] truncate">
                            {loop.step_description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recursion Panel */}
                <div className="bg-dark-850 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-brand-violet" />
                      Recursion Patterns ({result.detected_recursion.length})
                    </h4>
                  </div>

                  {result.detected_recursion.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">
                      No recursive function invocations detected.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {result.detected_recursion.map((rec, idx) => (
                        <div
                          key={idx}
                          className="bg-dark-900 border border-slate-800/80 rounded-lg p-2.5 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-mono">
                            <span className="font-semibold text-purple-300">
                              def {rec.function_name}()
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-brand-violet/20 text-brand-violet text-[10px] font-bold">
                              {rec.estimated_time_complexity}
                            </span>
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            Recurrence: <code className="text-slate-200">{rec.recurrence_relation || 'T(n)'}</code>
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            Call Stack: {rec.estimated_space_complexity} depth ({rec.recursive_calls_count} branch calls)
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Step-by-Step Pedagogical Reasoning */}
              <div className="bg-dark-850 border border-slate-800 rounded-xl p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Step-by-Step Pedagogical Breakdown
                </h4>
                <div className="space-y-2.5">
                  {result.step_by_step_reasoning.map((step, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-300 leading-relaxed pl-3 border-l-2 border-brand-blue/50"
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimization Suggestions */}
              {result.optimization_suggestions.length > 0 && (
                <div className="bg-dark-850 border border-slate-800 rounded-xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Algorithmic Optimization Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {result.optimization_suggestions.map((opt, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{opt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Assumptions & Static Analysis Limitations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-dark-850 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    Theoretical Assumptions
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {result.assumptions.map((ass, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-slate-600">•</span>
                        <span>{ass}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-dark-850 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Static Analysis Limitations
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {result.limitations.map((lim, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-slate-600">•</span>
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Exports Bar */}
              <div className="bg-dark-850 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  Analysis completed at <span className="font-mono text-slate-300">{result.analysis_timestamp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportAsJSON}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-dark-900 border border-slate-800 hover:bg-dark-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={exportAsMarkdown}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-dark-900 border border-slate-800 hover:bg-dark-800 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Export Markdown Report</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
