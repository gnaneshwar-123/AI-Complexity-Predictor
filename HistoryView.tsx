import React from 'react';
import {
  History,
  Trash2,
  Code2,
  ArrowRight,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { AnalysisHistoryRecord } from '../types';

interface HistoryViewProps {
  history: AnalysisHistoryRecord[];
  onSelectRecord: (record: AnalysisHistoryRecord) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectRecord,
  onClearHistory,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-dark-850 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-brand-blue" />
            Analysis History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Locally stored snapshots of code complexity analyses performed in this browser.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-950/30 border border-rose-800/60 hover:bg-rose-950/60 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-dark-850 border border-slate-800 rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-dark-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-500">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No Analysis History Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Analyses you perform in the Code Analyzer will be automatically saved locally so you can
            revisit and compare them later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectRecord(item)}
              className="group bg-dark-850 border border-slate-800 hover:border-brand-violet/60 rounded-xl p-5 cursor-pointer transition-all hover:bg-dark-800/70 hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-blue/15 text-brand-cyan border border-brand-blue/30">
                      {item.result.detected_language || 'Python'}
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-dark-900 border border-slate-800 text-slate-300">
                      {item.result.confidence}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2 font-mono">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-dark-900 border border-slate-700 text-brand-cyan">
                    Time: {item.result.time_complexity}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-dark-900 border border-slate-700 text-brand-violet">
                    Space: {item.result.space_complexity}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                  <strong className="text-slate-400">Dominant: </strong>
                  {item.result.dominant_term}
                </p>

                <div className="mt-3 bg-dark-900/90 border border-slate-800/80 rounded-lg p-2 font-mono text-[11px] text-slate-400 overflow-hidden max-h-20">
                  <pre className="line-clamp-3">{item.code}</pre>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 group-hover:text-brand-violet font-medium">
                <span className="flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Re-open in Editor</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
