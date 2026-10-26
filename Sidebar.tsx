import React from 'react';
import {
  LayoutDashboard,
  Code2,
  GitCompare,
  BookOpen,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Terminal,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
}) => {
  const menuItems = [
    {
      id: 'analyze',
      label: 'Complexity Predictor',
      icon: Code2,
      description: 'Static AST Code Workspace',
    },
    {
      id: 'compare',
      label: 'Compare Algorithms',
      icon: GitCompare,
      description: 'Side-by-side Scalability',
    },
    {
      id: 'guide',
      label: 'Complexity Guide',
      icon: BookOpen,
      description: 'Big-O & Asymptotics Reference',
    },
    {
      id: 'history',
      label: 'Analysis History',
      icon: History,
      description: 'Persisted Local Snapshots',
    },
    {
      id: 'dashboard',
      label: 'Metrics & Presets',
      icon: LayoutDashboard,
      description: 'Session Stats & Quick Launch',
    },
    {
      id: 'settings',
      label: 'About / Diagnostics',
      icon: Settings,
      description: 'B.Tech Methodology',
    },
  ];

  return (
    <aside
      className={`h-[calc(100vh-4rem)] border-r border-slate-800 bg-dark-900 transition-all duration-300 flex flex-col justify-between select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-3">
        {/* Toggle Collapse Button */}
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-blue/20 to-brand-violet/20 text-white border border-brand-violet/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-dark-800'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gradient-to-tr from-brand-blue to-brand-violet text-white'
                      : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-dark-750'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!collapsed && (
                  <div className="overflow-hidden">
                    <span className="text-sm font-medium block truncate">{item.label}</span>
                    <span className="text-[11px] text-slate-500 block truncate font-normal">
                      {item.description}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info box */}
      {!collapsed && (
        <div className="p-4 m-3 rounded-xl bg-dark-850 border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
            <Terminal className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Local Python AST</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Zero external cloud API calls. Code is parsed locally without execution.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span>FastAPI 1.0.0</span>
            <span>React 18</span>
          </div>
        </div>
      )}
    </aside>
  );
};
