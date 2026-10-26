import React from 'react';
import { Cpu, Activity, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface NavbarProps {
  backendOnline: boolean | null;
  onRefreshHealth: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  backendOnline,
  onRefreshHealth,
  activeTab,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-dark-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue via-brand-indigo to-brand-violet flex items-center justify-center shadow-lg shadow-brand-blue/20">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white">
              AI Complexity Predictor
            </h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-violet/15 text-brand-violet border border-brand-violet/30">
              B.Tech CSE (AI/ML)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Local Static AST Algorithmic Time & Auxiliary Space Analyzer
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Workspace info */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-dark-850 px-3 py-1.5 rounded-lg border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Active View:</span>
          <span className="text-slate-200 font-medium capitalize">
            {activeTab.replace('_', ' ')}
          </span>
        </div>

        {/* Backend health status pill */}
        <div
          onClick={onRefreshHealth}
          title="Click to re-verify backend connectivity"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
            backendOnline === true
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-950/60'
              : backendOnline === false
              ? 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-950/60'
              : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
          }`}
        >
          {backendOnline === true ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>FastAPI Backend (8000)</span>
              <ShieldCheck className="w-3.5 h-3.5 ml-0.5 text-emerald-400" />
            </>
          ) : backendOnline === false ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Backend Offline (Port 8000)</span>
              <RefreshCw className="w-3 h-3 ml-1 animate-spin" />
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Checking API...</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
