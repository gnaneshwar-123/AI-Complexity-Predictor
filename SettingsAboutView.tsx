import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Cpu,
  Database,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { checkHealth } from '../services/api';

export const SettingsAboutView: React.FC = () => {
  const [healthInfo, setHealthInfo] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(false);

  useEffect(() => {
    const fetchHealth = async () => {
      setLoadingHealth(true);
      try {
        const data = await checkHealth();
        setHealthInfo(data);
      } catch (e: any) {
        setHealthInfo({ status: 'offline', error: e.message });
      } finally {
        setLoadingHealth(false);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-dark-850 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-blue/15 text-brand-blue border border-brand-blue/30">
            B.Tech CSE (AI/ML) Capstone Project
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-violet/15 text-brand-violet border border-brand-violet/30">
            Localhost Web Application
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          AI-Based Complexity Prediction Tool
        </h2>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          An intelligent developer platform designed to estimate algorithmic time complexity and
          auxiliary space complexity without running untrusted user code.
        </p>
      </div>

      {/* Backend Diagnostics */}
      <div className="bg-dark-850 border border-slate-800 rounded-xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-cyan" />
          System & Backend Service Diagnostics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-dark-900 border border-slate-800/80">
            <span className="text-xs text-slate-400 block mb-1">Backend API Status</span>
            <div className="flex items-center gap-2 font-mono font-bold text-sm">
              {healthInfo?.status === 'healthy' ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Healthy (Port 8000)
                </span>
              ) : (
                <span className="text-rose-400">Offline / Connecting...</span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-dark-900 border border-slate-800/80">
            <span className="text-xs text-slate-400 block mb-1">AST Analysis Engine</span>
            <div className="font-mono font-bold text-sm text-slate-200">
              Python 3 AST Walkers
            </div>
          </div>

          <div className="p-4 rounded-lg bg-dark-900 border border-slate-800/80">
            <span className="text-xs text-slate-400 block mb-1">Vite Proxy Base</span>
            <div className="font-mono font-bold text-sm text-slate-200">
              /api &rarr; :8000
            </div>
          </div>
        </div>
      </div>

      {/* Architecture & Methodology */}
      <div className="bg-dark-850 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-brand-violet" />
          Technical Methodology: Static AST vs Dynamic Profiling vs ML
        </h3>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong className="text-white">Why Static AST Analysis?</strong> Conventional execution-based profiling requires
            running user code with various inputs and measuring clock time. However, this is dangerous (potential arbitrary code
            execution) and produces input-dependent or hardware-biased measurements. In contrast, Static AST parsing inspects the
            structural representation of code without execution, accurately computing mathematical bounds like loop nesting,
            step divisions, and recurrence relations.
          </p>

          <p>
            <strong className="text-white">Machine Learning Classification Note:</strong> In accordance with rigorous scientific
            standards for B.Tech AI/ML engineering, heuristic AST analysis is used because arbitrary black-box ML models
            often hallucinate complexity classes on unseen code without verifiable mathematical proof. The architecture includes
            clean decoupled interfaces so that if a labeled, licensed code dataset is introduced in the future, a scikit-learn
            or transformer-based classifier can be integrated alongside the AST rule engine.
          </p>

          <p>
            <strong className="text-white">Auxiliary Space vs Input Memory:</strong> Auxiliary space represents temporary or extra
            space used by the algorithm, excluding the input data itself. For instance, in-place sorting algorithms like
            quicksort or heapsort take \(O(1)\) auxiliary memory, whereas algorithms allocating temporary arrays take \(O(n)\).
          </p>
        </div>
      </div>

      {/* Features Checklist */}
      <div className="bg-dark-850 border border-slate-800 rounded-xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Project Technical Specifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>FastAPI backend with Pydantic request/response validation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Python AST parsing without code execution (Sandbox safe)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Nested and dependent loop bound detection (O(1), O(n), O(log n), O(n²))</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Recurrence relation analyzer for divide-and-conquer and branching trees</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>React + TypeScript + Vite frontend with Tailwind CSS</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Monaco code editor with Python syntax highlighting</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Theoretical asymptotic growth curves powered by Recharts</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Export analysis report as JSON or Markdown document</span>
          </div>
        </div>
      </div>
    </div>
  );
};
