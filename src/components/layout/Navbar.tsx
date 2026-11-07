import React from 'react';
import {
  Activity,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  BookOpen,
  FlaskConical,
} from 'lucide-react';
import { ViewMode } from '../../types';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  isQuickDemo: boolean;
  onToggleQuickDemo: () => void;
  datasetName: string | null;
  isRunningBenchmark: boolean;
  onLoadDemo: (id?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isQuickDemo,
  onToggleQuickDemo,
  datasetName,
  isRunningBenchmark,
  onLoadDemo,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('landing')}>
        
      <img
        src="/autoqencode-logo.png"
        alt="AutoQEncode Logo"
        className="w-12 h-12 object-contain rounded-lg"
        />

        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold tracking-wider bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent text-base">
              AUTOQENCODE
            </span>
            <span className="text-[10px] font-semibold tracking-widest px-1.5 py-0.5 rounded border border-indigo-500/40 bg-indigo-950/60 text-indigo-300">
              v2.4 RESEARCH
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono tracking-tight">
            Quantum Encoding Intelligence & Benchmarking
          </p>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="hidden md:flex items-center space-x-3">
        {datasetName ? (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full border border-slate-800 bg-slate-900/60 text-xs">
            <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Dataset:</span>
            <span className="font-mono text-cyan-300 font-medium">{datasetName}</span>
          </div>
        ) : (
          <button
            onClick={() => onLoadDemo('small_medical_demo')}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full border border-indigo-500/40 bg-indigo-950/30 hover:bg-indigo-900/40 text-indigo-300 text-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Load Medical Demo Dataset</span>
          </button>
        )}

        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full border border-slate-800 bg-slate-900/60 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span className="text-slate-400">Simulator:</span>
          <span className="font-mono text-emerald-300 font-medium">Statevector + Aer</span>
        </div>

        {isRunningBenchmark && (
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full border border-amber-500/50 bg-amber-950/40 text-amber-300 text-xs animate-pulse">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span className="font-semibold">Executing QNN Benchmark...</span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2.5">
        {/* Quick Demo vs Research Mode Toggle */}
        <button
          onClick={onToggleQuickDemo}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
            isQuickDemo
              ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/20'
              : 'bg-violet-950/60 border-violet-500/50 text-violet-300 shadow-sm shadow-violet-500/20'
          }`}
          title="Toggle execution profile: Quick Demo uses fewer epochs for instant results; Research Mode trains thorough parameter-shift gradients."
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{isQuickDemo ? 'Quick Demo Mode' : 'Research Mode'}</span>
        </button>

        {/* View Switcher button to Landing / Dashboard */}
        {currentView === 'landing' ? (
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Launch Platform</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 text-xs transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Project Overview</span>
          </button>
        )}
      </div>
    </header>
  );
};
