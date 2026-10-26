import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AnalyzeView } from './components/AnalyzeView';
import { CompareView } from './components/CompareView';
import { ComplexityGuideView } from './components/ComplexityGuideView';
import { HistoryView } from './components/HistoryView';
import { SettingsAboutView } from './components/SettingsAboutView';

import {
  ExampleAlgorithm,
  ComplexityAnalysisResult,
  AnalysisHistoryRecord,
} from './types';
import { checkHealth, getExamples } from './services/api';

const DEFAULT_CODE = `def find_duplicates(arr):
    # Detects duplicates by comparing pairwise elements
    n = len(arr)
    for i in range(n):
        for j in range(i + 1, n):
            if arr[i] == arr[j]:
                return True
    return False
`;

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('analyze');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [examples, setExamples] = useState<ExampleAlgorithm[]>([]);
  const [currentCode, setCurrentCode] = useState<string>(DEFAULT_CODE);

  // Load history from localStorage
  const [history, setHistory] = useState<AnalysisHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('complexity_analyzer_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Verify backend health
  const refreshHealth = useCallback(async () => {
    try {
      await checkHealth();
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  }, []);

  // Fetch presets and check health on initial load
  useEffect(() => {
    refreshHealth();
    const interval = setInterval(refreshHealth, 15000);

    const loadPresets = async () => {
      try {
        const data = await getExamples();
        setExamples(data);
      } catch (e) {
        console.warn('Could not load presets from backend API:', e);
      }
    };
    loadPresets();

    return () => clearInterval(interval);
  }, [refreshHealth]);

  // Persist history updates to localStorage
  const handleSaveAnalysis = (code: string, result: ComplexityAnalysisResult) => {
    const newRecord: AnalysisHistoryRecord = {
      id: `record_${Date.now()}`,
      timestamp: new Date().toISOString(),
      code,
      result,
    };
    setHistory((prev) => {
      const updated = [newRecord, ...prev.slice(0, 49)]; // keep latest 50
      try {
        localStorage.setItem('complexity_analyzer_history', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your local analysis history?')) {
      setHistory([]);
      try {
        localStorage.removeItem('complexity_analyzer_history');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSelectExampleFromDashboard = (example: ExampleAlgorithm) => {
    setCurrentCode(example.code);
    setActiveTab('analyze');
  };

  const handleSelectRecordFromHistory = (record: AnalysisHistoryRecord) => {
    setCurrentCode(record.code);
    setActiveTab('analyze');
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        backendOnline={backendOnline}
        onRefreshHealth={refreshHealth}
        activeTab={activeTab}
      />

      {/* Main Layout Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Content View Pane */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              examples={examples}
              history={history}
              onSelectExample={handleSelectExampleFromDashboard}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'analyze' && (
            <AnalyzeView
              currentCode={currentCode}
              setCurrentCode={setCurrentCode}
              examples={examples}
              onAnalysisSuccess={handleSaveAnalysis}
            />
          )}

          {activeTab === 'compare' && <CompareView examples={examples} />}

          {activeTab === 'guide' && <ComplexityGuideView />}

          {activeTab === 'history' && (
            <HistoryView
              history={history}
              onSelectRecord={handleSelectRecordFromHistory}
              onClearHistory={handleClearHistory}
            />
          )}

          {activeTab === 'settings' && <SettingsAboutView />}
        </main>
      </div>
    </div>
  );
};

export default App;
