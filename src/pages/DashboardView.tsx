import React from 'react';
import {
  Activity,
  Cpu,
  Layers,
  Award,
  Zap,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ViewMode, ExperimentRecord, BenchmarkMetrics } from '../types';
import { AccuracyDepthChart, CircuitDepthBarChart, EncodingRadarProfile } from '../components/charts/QuantumCharts';

interface DashboardViewProps {
  latestExperiment: ExperimentRecord | null;
  onNavigate: (view: ViewMode) => void;
  onLaunchDemo: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  latestExperiment,
  onNavigate,
  onLaunchDemo,
}) => {
  const results: BenchmarkMetrics[] = latestExperiment?.results || [
    {
      encoding: 'basis',
      accuracy: 0.80,
      precision: 0.80,
      recall: 0.80,
      f1Score: 0.80,
      trainingTimeMs: 120,
      qubits: 4,
      depth: 7,
      totalGates: 15,
      twoQubitGates: 4,
      noiseAccuracy: 0.75,
      noiseRobustness: 93.8,
      estimatedError: 0.045,
      feasible: true,
    },
    {
      encoding: 'angle',
      accuracy: 0.95,
      precision: 0.94,
      recall: 0.96,
      f1Score: 0.95,
      trainingTimeMs: 145,
      qubits: 4,
      depth: 8,
      totalGates: 16,
      twoQubitGates: 4,
      noiseAccuracy: 0.90,
      noiseRobustness: 94.7,
      estimatedError: 0.048,
      feasible: true,
    },
    {
      encoding: 'amplitude',
      accuracy: 0.90,
      precision: 0.89,
      recall: 0.91,
      f1Score: 0.90,
      trainingTimeMs: 160,
      qubits: 2,
      depth: 14,
      totalGates: 22,
      twoQubitGates: 8,
      noiseAccuracy: 0.80,
      noiseRobustness: 88.9,
      estimatedError: 0.082,
      feasible: true,
    },
  ];

  const bestAccuracy = Math.max(...results.map(r => r.accuracy));
  const avgDepth = Math.round(results.reduce((a, b) => a + b.depth, 0) / results.length);
  const avgQubits = Math.round((results.reduce((a, b) => a + b.qubits, 0) / results.length) * 10) / 10;
  const avgRobustness = Math.round(results.reduce((a, b) => a + b.noiseRobustness, 0) / results.length);
  const winner = latestExperiment?.recommendation?.recommendedEncoding || 'angle';

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Executive Research Dashboard</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quantum Encoding Intelligence & Controlled NISQ Benchmarking Environment
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('benchmark')}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Run Benchmark</span>
          </button>
          <button
            onClick={() => onNavigate('adaptive_lab')}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-violet-500/40 bg-violet-950/40 hover:bg-violet-900/40 text-violet-300 font-medium text-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Adaptive Hybrid Lab</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-400">Total Experiments</span>
          <p className="text-2xl font-bold text-white">14</p>
          <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>Active Session</span>
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-400">Top Accuracy</span>
          <p className="text-2xl font-bold text-emerald-400">{(bestAccuracy * 100).toFixed(1)}%</p>
          <span className="text-[10px] text-slate-400">Ideal Statevector</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-400">Avg Circuit Depth</span>
          <p className="text-2xl font-bold text-cyan-300">{avgDepth}</p>
          <span className="text-[10px] text-slate-400">Gate Time Slots</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-400">Avg Qubit Footprint</span>
          <p className="text-2xl font-bold text-indigo-300">{avgQubits}</p>
          <span className="text-[10px] text-slate-400">Physical Registers</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-400">Noise Robustness</span>
          <p className="text-2xl font-bold text-amber-300">{avgRobustness}%</p>
          <span className="text-[10px] text-slate-400">Aer Depol. Model</span>
        </div>

        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-1">
          <span className="text-[10px] uppercase font-mono text-indigo-400 font-bold">Recommended</span>
          <p className="text-xl font-bold text-white uppercase truncate">{winner}</p>
          <span className="text-[10px] text-indigo-300 font-mono">Pareto Non-Dominated</span>
        </div>
      </div>

      {/* Large Latest Experiment Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {latestExperiment?.title || 'Controlled Botanical Subspace Benchmark (Demo)'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                ID: {latestExperiment?.id || 'EXP-QENC-INITIAL-01'} • Created: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('recommendation')}
            className="flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-mono cursor-pointer"
          >
            <span>View Full Pareto Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Experiment Properties Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px] font-mono uppercase">Dataset</span>
            <span className="font-bold text-slate-200 truncate block">
              {latestExperiment?.datasetName || 'iris_quantum.csv'}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px] font-mono uppercase">Target</span>
            <span className="font-bold text-slate-200 truncate block">
              {latestExperiment?.targetColumn || 'target'}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px] font-mono uppercase">Qubit Budget</span>
            <span className="font-bold text-cyan-300 block">
              {latestExperiment?.qubitBudget || 4} Qubits
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px] font-mono uppercase">Noise Level</span>
            <span className="font-bold text-amber-300 uppercase block">
              {latestExperiment?.noiseLevel || 'low'}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500 block text-[10px] font-mono uppercase">Selected Mode</span>
            <span className="font-bold text-violet-300 block capitalize">
              {latestExperiment?.mode?.replace('_', ' ') || 'Controlled Benchmark'}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-emerald-500/30 bg-emerald-950/20">
            <span className="text-emerald-400 block text-[10px] font-mono uppercase font-semibold">Recommended</span>
            <span className="font-bold text-white uppercase block">
              {winner}
            </span>
          </div>
        </div>

        {/* Traceable Rationale Excerpt */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <strong className="text-indigo-400 font-semibold">AutoQEncode Recommendation Rationale: </strong>
          {latestExperiment?.recommendation?.explanation?.primaryRationale ||
            'ANGLE encoding was designated optimal because it attained a composite utility score of 92.4/100 under current priorities, preserving 94.7% accuracy under realistic depolarizing noise at depth 8.'}
        </div>
      </div>

      {/* Multi-Metric Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Accuracy Comparison */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-200">Accuracy & Noise Degradation</h4>
            <span className="text-[10px] font-mono text-slate-400">Ideal vs Noisy (%)</span>
          </div>
          <AccuracyDepthChart results={results} />
        </div>

        {/* Chart 2: Circuit Depth & 2Q Gates */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-200">Circuit Depth & Entangling Gates</h4>
            <span className="text-[10px] font-mono text-slate-400">Gate Counts</span>
          </div>
          <CircuitDepthBarChart results={results} />
        </div>

        {/* Chart 3: Encoding Radar Profile */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-200">Multi-Objective Profile</h4>
            <span className="text-[10px] font-mono text-slate-400">Normalized [0-100]</span>
          </div>
          <EncodingRadarProfile results={results} />
        </div>
      </div>
    </div>
  );
};
