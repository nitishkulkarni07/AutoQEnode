import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  SlidersHorizontal,
  Cpu,
  Binary,
  GitCompare,
  CircuitBoard,
  Server,
  Sparkles,
  Award,
  History,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ViewMode } from '../../types';

interface SidebarItem {
  id: ViewMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface SidebarSection {
  group: string;
  items: SidebarItem[];
}

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  collapsed,
  onToggleCollapse,
}) => {
  const sections: SidebarSection[] = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'landing' as ViewMode, label: 'Platform Intro', icon: Sparkles },
        { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analyzer' as ViewMode, label: 'Dataset Analyzer', icon: FileSpreadsheet },
        { id: 'preprocessing' as ViewMode, label: 'Preprocessing', icon: SlidersHorizontal },
      ],
    },
    {
      group: 'QUANTUM WORKSPACE',
      items: [
        { id: 'budget' as ViewMode, label: 'Qubit Budget', icon: Cpu },
        { id: 'encoding_lab' as ViewMode, label: 'Encoding Lab', icon: Binary },
        { id: 'circuit_studio' as ViewMode, label: 'Circuit Studio', icon: CircuitBoard },
        { id: 'backend_profiler' as ViewMode, label: 'Backend Profiler', icon: Server },
      ],
    },
    {
      group: 'BENCHMARK & ADAPTIVE',
      items: [
        { id: 'benchmark' as ViewMode, label: 'Controlled Benchmark', icon: GitCompare, badge: 'Fair QNN' },
        { id: 'adaptive_lab' as ViewMode, label: 'Adaptive Lab', icon: Sparkles, badge: 'Patent' },
      ],
    },
    {
      group: 'SYNTHESIS & RECORDS',
      items: [
        { id: 'recommendation' as ViewMode, label: 'Recommendation', icon: Award },
        { id: 'history_reports' as ViewMode, label: 'History & Reports', icon: History },
      ],
    },
  ];

  return (
    <aside
      className={`relative border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-xl flex flex-col transition-all duration-300 z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 z-40 transition-colors cursor-pointer shadow-md"
        title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {sec.group}
              </p>
            )}
            {sec.items.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center rounded-lg px-2.5 py-2 text-xs font-medium transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-cyan-500/10 border border-indigo-500/40 text-cyan-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {!collapsed && (
                    <div className="ml-3 flex-1 flex items-center justify-between text-left">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase ${
                            item.badge === 'Patent'
                              ? 'bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 text-fuchsia-300 border border-fuchsia-500/30'
                              : 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/50'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
          <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/40 text-[11px] text-slate-400">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-300">AutoQEncode Engine</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Academic & Patent Prototype. Local Simulator Active.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
