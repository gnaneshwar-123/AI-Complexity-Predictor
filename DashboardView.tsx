import React from 'react';
import {
  Code2,
  GitCompare,
  TrendingUp,
  History,
  CheckCircle2,
  Zap,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ExampleAlgorithm, AnalysisHistoryRecord } from '../types';

interface DashboardViewProps {
  examples: ExampleAlgorithm[];
  history: AnalysisHistoryRecord[];
  onSelectExample: (example: ExampleAlgorithm) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  examples,
  history,
  onSelectExample,
  onNavigateTab,
}) => {
  // Compute real statistics from actual analysis history
  const totalAnalyzed = history.length;
  const complexityCounts: Record<string, number> = {};
  let highConfidenceCount = 0;

  history.forEach((rec) => {
    const tc = rec.result.time_complexity;
    complexityCounts[tc] = (complexityCounts[tc] || 0) + 1;
    if (rec.result.confidence === 'High') {
      highConfidenceCount++;
    }
  });

  let topComplexity = 'None';
  let maxCount = 0;
  Object.entries(complexityCounts).forEach(([k, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topComplexity = k;
    }
  });

  const highConfidencePct = totalAnalyzed > 0
    ? Math.round((highConfidenceCount / totalAnalyzed) * 100)
    : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-r from-dark-850 via-dark-800 to-dark-850 border border-slate-800 p-8 shadow-2xl overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-brand-violet/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-60 -top-10 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-brand-cyan text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Static AST Algorithmic Complexity Estimator</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Predict Time & Auxiliary Space Complexity Statically
          </h2>

          <p className="mt-3 text-base text-slate-300 leading-relaxed">
            Perform in-depth algorithmic complexity analysis on Python code using Abstract Syntax Tree
            (AST) traversal. Detect single, nested, and dependent loops, solve recursive recurrences,
            track auxiliary heap and stack allocations, and get step-by-step explanations.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => onNavigateTab('analyze')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-violet text-white text-sm font-semibold shadow-lg shadow-brand-blue/25 hover:from-blue-600 hover:to-violet-700 transition-all hover:scale-[1.02]"
            >
              <Code2 className="w-4 h-4" />
              <span>Analyze Code Now</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('compare')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dark-750 text-slate-200 border border-slate-700 hover:bg-dark-700 text-sm font-semibold transition-all hover:scale-[1.02]"
            >
              <GitCompare className="w-4 h-4" />
              <span>Compare Algorithms</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real Computed Statistics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-cyan" />
            Computed Session Statistics
          </h3>
          <span className="text-xs text-slate-400">
            Computed from local browser storage
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-dark-850 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Total Analyzed Snippets</span>
              <History className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{totalAnalyzed}</div>
            <p className="text-xs text-slate-500 mt-1">
              {totalAnalyzed === 0 ? 'No analyses saved yet' : 'Persisted in local history'}
            </p>
          </div>

          <div className="bg-dark-850 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Top Complexity Class</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">{topComplexity}</div>
            <p className="text-xs text-slate-500 mt-1">
              {maxCount > 0 ? `${maxCount} snippets classified as ${topComplexity}` : 'Awaiting analyses'}
            </p>
          </div>

          <div className="bg-dark-850 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>High Confidence Ratio</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {totalAnalyzed > 0 ? `${highConfidencePct}%` : 'N/A'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {totalAnalyzed > 0
                ? `${highConfidenceCount} of ${totalAnalyzed} analyses`
                : 'Deterministic pattern matches'}
            </p>
          </div>

          <div className="bg-dark-850 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>AST Pattern Engine</span>
              <Layers className="w-4 h-4 text-brand-violet" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">AST V1</div>
            <p className="text-xs text-slate-500 mt-1">
              Static parsing without code execution
            </p>
          </div>
        </div>
      </div>

      {/* Featured Preset Algorithms */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-brand-violet" />
              Canonical Algorithm Presets
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any pre-configured algorithm to inspect AST complexity predictions and explanations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('guide')}
            className="text-xs text-brand-cyan hover:underline flex items-center gap-1 font-medium"
          >
            <span>View Asymptotic Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {examples.slice(0, 8).map((ex) => (
            <div
              key={ex.id}
              onClick={() => onSelectExample(ex)}
              className="group bg-dark-850 border border-slate-800 hover:border-brand-violet/50 rounded-xl p-5 cursor-pointer transition-all hover:bg-dark-800/80 hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-dark-900 border border-slate-700 text-brand-cyan">
                    {ex.expected_time}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Space: {ex.expected_space}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {ex.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {ex.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-brand-violet font-medium">
                <span>Load in Editor</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
