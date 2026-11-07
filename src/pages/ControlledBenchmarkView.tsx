import React, { useState } from 'react';
import {
  GitCompare,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Award,
} from 'lucide-react';
import { ViewMode, BenchmarkMetrics, PreprocessedData, RecommendationOutput } from '../types';
import { AccuracyDepthChart, CircuitDepthBarChart } from '../components/charts/QuantumCharts';

interface ControlledBenchmarkViewProps {
  preprocessedData: PreprocessedData | null;
  availableQubits: number;
  benchmarkResults: BenchmarkMetrics[] | null;
  isRunning: boolean;
  onRunBenchmark: (options: {
    ansatzLayers: number;
    epochs: number;
    learningRate: number;
    noiseLevel: string;
    entanglement: 'linear' | 'ring' | 'all_to_all';
  }) => Promise<void>;
  onNavigate: (view: ViewMode) => void;
  recommendation: RecommendationOutput | null;
}

export const ControlledBenchmarkView: React.FC<ControlledBenchmarkViewProps> = ({
  preprocessedData,
  availableQubits,
  benchmarkResults,
  isRunning,
  onRunBenchmark,
  onNavigate,
  recommendation,
}) => {
  const [ansatzLayers, setAnsatzLayers] = useState(1);
  const [epochs, setEpochs] = useState(8);
  const [learningRate, setLearningRate] = useState(0.15);
  const [noiseLevel, setNoiseLevel] = useState<'none' | 'low' | 'medium' | 'high'>('low');
  const [entanglement, setEntanglement] = useState<'linear' | 'ring' | 'all_to_all'>('linear');

  const handleRun = () => {
    onRunBenchmark({
      ansatzLayers,
      epochs,
      learningRate,
      noiseLevel,
      entanglement,
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <GitCompare className="w-6 h-6 text-indigo-400" />
            <span>Controlled Quantum Benchmark Execution</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Controlled browser statevector comparison of five encodings with shared split and variational model; data re-uploading intentionally adds feature embedding layers. Infeasible candidates are not trained.
          </p>
        </div>

        <button
          onClick={handleRun}
          disabled={isRunning || !preprocessedData}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer ${
            isRunning
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-indigo-600/30'
          }`}
        >
          {isRunning ? <Activity className="w-4 h-4 animate-spin text-cyan-300" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'Benchmarking Encodings...' : 'Run Controlled Benchmark'}</span>
        </button>
      </div>

      {/* Fair Benchmark Protocol Badge */}
      <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <div className="text-slate-300">
            <span className="font-bold text-white">Academic Fairness Protocol Enforced: </span>
            Shared train/test split, features, trainable ansatz and gradient method. Embedding gates and depth differ by design; results use a capped browser simulator and approximate noise.
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded font-mono text-[10px] bg-indigo-900/60 text-indigo-300 border border-indigo-700">
          Controlled Variable: Encoding Layer Only
        </span>
      </div>

      {/* Hyperparameter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs font-mono">
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1.5">
          <label className="text-slate-400 text-[10px] uppercase block">Ansatz Layers</label>
          <select
            value={ansatzLayers}
            onChange={e => setAnsatzLayers(parseInt(e.target.value, 10))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200"
          >
            <option value={1}>1 Layer (Ry-Rz + CNOT)</option>
            <option value={2}>2 Layers (Deeper entanglement)</option>
            <option value={3}>3 Layers (High capacity)</option>
          </select>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1.5">
          <label className="text-slate-400 text-[10px] uppercase block">Entanglement Topology</label>
          <select
            value={entanglement}
            onChange={e => setEntanglement(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200"
          >
            <option value="linear">Linear Nearest-Neighbor</option>
            <option value="ring">Circular Ring Topology</option>
            <option value="all_to_all">All-to-All Full Mesh</option>
          </select>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1.5">
          <label className="text-slate-400 text-[10px] uppercase block">Training Epochs</label>
          <select
            value={epochs}
            onChange={e => setEpochs(parseInt(e.target.value, 10))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200"
          >
            <option value={5}>5 Epochs (Quick Fast)</option>
            <option value={8}>8 Epochs (Balanced Demo)</option>
            <option value={12}>12 Epochs (Convergence)</option>
            <option value={16}>16 Epochs (Research Grade)</option>
          </select>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1.5">
          <label className="text-slate-400 text-[10px] uppercase block">Noise Channel</label>
          <select
            value={noiseLevel}
            onChange={e => setNoiseLevel(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200"
          >
            <option value="none">Zero Noise (Ideal Simulation)</option>
            <option value="low">Low (1.5% Depol + 2% Readout)</option>
            <option value="medium">Medium (4.5% Depol + 5% Readout)</option>
            <option value="high">High (9% Depol + 9% Readout)</option>
          </select>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1.5">
          <label className="text-slate-400 text-[10px] uppercase block">Learning Rate</label>
          <input
            type="number"
            step="0.05"
            value={learningRate}
            onChange={e => setLearningRate(parseFloat(e.target.value) || 0.15)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200"
          />
        </div>
      </div>

      {/* Execution Progress Bar if running */}
      {isRunning && (
        <div className="p-5 rounded-2xl border border-cyan-500/40 bg-slate-950/90 space-y-3 shadow-xl animate-pulse">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-cyan-300 flex items-center space-x-2">
              <Activity className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Simulating Quantum Statevectors & Training VQC Circuits...</span>
            </span>
            <span className="font-mono text-slate-400">Parameter-Shift Analytic Gradients</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 animate-indeterminate w-3/4 rounded-full" />
          </div>
        </div>
      )}

      {/* Benchmark Results Table */}
      {benchmarkResults && benchmarkResults.length > 0 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-xl">
            <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/50">
              <h3 className="font-bold text-sm text-slate-200">
                Empirical Performance Benchmark Matrix (Controlled Experiment)
              </h3>
              <button
                onClick={() => onNavigate('recommendation')}
                className="flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer"
              >
                <span>Inspect Recommendation Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Encoding</th>
                    <th className="p-3">Ideal Accuracy</th>
                    <th className="p-3">Precision</th>
                    <th className="p-3">Recall</th>
                    <th className="p-3">F1 Score</th>
                    <th className="p-3">Noisy Accuracy</th>
                    <th className="p-3">Noise Robustness</th>
                    <th className="p-3">Qubits</th>
                    <th className="p-3">Depth</th>
                    <th className="p-3">2Q CNOTs</th>
                    <th className="p-3">Train Time</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {benchmarkResults.map(r => {
                    const isWinner = recommendation?.recommendedEncoding === r.encoding;
                    return (
                      <tr
                        key={r.encoding}
                        className={`hover:bg-slate-900/40 transition-colors ${
                          isWinner ? 'bg-indigo-950/20 font-semibold' : ''
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white uppercase">{r.encoding}</span>
                            {isWinner && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700">
                                WINNER
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-bold text-emerald-400">{(r.accuracy * 100).toFixed(1)}%</td>
                        <td className="p-3 text-slate-300">{(r.precision * 100).toFixed(1)}%</td>
                        <td className="p-3 text-slate-300">{(r.recall * 100).toFixed(1)}%</td>
                        <td className="p-3 text-cyan-300 font-bold">{r.f1Score.toFixed(3)}</td>
                        <td className="p-3 text-amber-300">{(r.noiseAccuracy * 100).toFixed(1)}%</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            r.noiseRobustness >= 90 ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                          }`}>
                            {r.noiseRobustness.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-3 text-slate-200">{r.qubits} Qubits</td>
                        <td className="p-3 text-cyan-300">{r.depth}</td>
                        <td className="p-3 text-pink-300">{r.twoQubitGates}</td>
                        <td className="p-3 text-slate-400">{r.trainingTimeMs} ms</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Evaluated
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side-by-side charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
              <h4 className="font-bold text-sm text-white">Ideal vs Noisy Performance Retention</h4>
              <AccuracyDepthChart results={benchmarkResults} />
            </div>
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
              <h4 className="font-bold text-sm text-white">Quantum Resource Consumption (Depth vs Entangling Gates)</h4>
              <CircuitDepthBarChart results={benchmarkResults} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
