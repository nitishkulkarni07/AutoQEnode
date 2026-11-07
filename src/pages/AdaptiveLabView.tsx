import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Cpu,
  Layers,
  Activity,
  Code2,
  Atom,
} from 'lucide-react';
import {
  ViewMode,
  AdaptiveOptimizationResult,
  PreprocessedData,
  DatasetAnalysis,
} from '../types';
import { CircuitCanvas } from '../components/circuit/CircuitCanvas';
import { api } from '../services/api';

interface AdaptiveLabViewProps {
  analysis: DatasetAnalysis | null;
  preprocessedData: PreprocessedData | null;
  onNavigate: (view: ViewMode) => void;
}

export const AdaptiveLabView: React.FC<AdaptiveLabViewProps> = ({
  analysis,
  preprocessedData,
  onNavigate,
}) => {
  const [qubitBudget, setQubitBudget] = useState(4);
  const [maxDepth, setMaxDepth] = useState(25);
  const [max2QGates, setMax2QGates] = useState(12);
  const [maxError, setMaxError] = useState(0.08);
  const [minAccuracy, setMinAccuracy] = useState(0.75);
  const [maxIterations, setMaxIterations] = useState(5);
  const [backendId, setBackendId] = useState('noisy_sim');

  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AdaptiveOptimizationResult | null>(null);

  const handleRunAdaptive = async () => {
    if (!preprocessedData || !analysis) return;
    setIsRunning(true);
    try {
      const featureTypes: Record<string, string> = {};
      analysis.features.forEach(f => {
        featureTypes[f.name] = f.type;
      });

      const res = await api.runAdaptiveOptimization({
        featureNames: preprocessedData.featureNames,
        featureTypes,
        trainX: preprocessedData.trainX,
        trainY: preprocessedData.trainY,
        testX: preprocessedData.testX,
        testY: preprocessedData.testY,
        constraints: {
          qubitBudget,
          maxDepth,
          max2QGates,
          maxError,
          minAccuracy,
          maxIterations,
          backendId,
        },
        noiseLevel: 'low',
      });
      setResult(res.adaptiveResult);
    } catch (err) {
      console.error('Adaptive error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border border-fuchsia-500/40 bg-fuchsia-950/40 text-fuchsia-300 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>PATENT-ORIENTED RECONFIGURABLE CIRCUIT ARCHITECTURE</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Adaptive Hybrid Quantum Encoding Laboratory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Iterative heuristic search: dynamically re-allocates quantum registers, partitions features by variance and type, and eliminates non-viable configurations early.
          </p>
        </div>

        <button
          onClick={handleRunAdaptive}
          disabled={isRunning || !preprocessedData}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer ${
            isRunning || !preprocessedData
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/30'
          }`}
        >
          {isRunning ? <Activity className="w-4 h-4 animate-spin text-fuchsia-300" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'Optimizing Architecture...' : 'Run Adaptive Search Loop'}</span>
        </button>
      </div>

      {/* Progressive Multi-Stage Evaluation Pipeline Banner */}
      <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-950/15 space-y-2 text-xs">
        <span className="font-bold text-violet-300 uppercase font-mono tracking-wider">
          Progressive Candidate Evaluation Stages:
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px] text-slate-300">
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 block">STAGE 1</span>
            <span className="text-cyan-400 font-bold">Static Resource Estimation</span>
          </div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 block">STAGE 2</span>
            <span className="text-indigo-400 font-bold">Ideal Statevector Simulation</span>
          </div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 block">STAGE 3</span>
            <span className="text-amber-400 font-bold">Aer Noisy Density Matrix</span>
          </div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-slate-500 block">STAGE 4</span>
            <span className="text-emerald-400 font-bold">Topology Constraint Check</span>
          </div>
        </div>
      </div>

      {/* Hardware Constraint Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs font-mono">
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1.5">
          <label className="text-slate-400 text-[10px] uppercase block">Qubit Budget</label>
          <input
            type="number"
            value={qubitBudget}
            onChange={e => setQubitBudget(parseInt(e.target.value, 10) || 4)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-cyan-300 font-bold"
          />
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1.5">
          <label className="text-slate-400 text-[10px] uppercase block">Max Depth Limit</label>
          <input
            type="number"
            value={maxDepth}
            onChange={e => setMaxDepth(parseInt(e.target.value, 10) || 25)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200"
          />
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1.5">
          <label className="text-slate-400 text-[10px] uppercase block">Max 2Q CNOTs</label>
          <input
            type="number"
            value={max2QGates}
            onChange={e => setMax2QGates(parseInt(e.target.value, 10) || 12)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200"
          />
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1.5">
          <label className="text-slate-400 text-[10px] uppercase block">Max Coherent Error</label>
          <input
            type="number"
            step="0.02"
            value={maxError}
            onChange={e => setMaxError(parseFloat(e.target.value) || 0.08)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200"
          />
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1.5">
          <label className="text-slate-400 text-[10px] uppercase block">Min Target Acc</label>
          <input
            type="number"
            step="0.05"
            value={minAccuracy}
            onChange={e => setMinAccuracy(parseFloat(e.target.value) || 0.75)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200"
          />
        </div>

        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1.5">
          <label className="text-slate-400 text-[10px] uppercase block">Max Iterations</label>
          <input
            type="number"
            value={maxIterations}
            onChange={e => setMaxIterations(parseInt(e.target.value, 10) || 5)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-slate-200"
          />
        </div>
      </div>

      {/* Execution Results / Iteration Trajectory */}
      {result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
              <span>Adaptive Search Iteration Trajectory</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-950 text-violet-300 border border-violet-700">
                {result.totalIterations} Iterations Evaluated
              </span>
            </h3>
            <span className="font-mono text-xs text-emerald-400">
              Fingerprint: {result.reproducibilityFingerprint}
            </span>
          </div>

          {/* Iteration Cards Timeline */}
          <div className="space-y-3">
            {result.iterations.map(it => {
              const isAccepted = it.status === 'pareto_optimal';
              const isRejected = it.status === 'rejected';

              return (
                <div
                  key={it.iteration}
                  className={`p-4 rounded-xl border transition-all space-y-2 text-xs font-mono ${
                    isAccepted
                      ? 'border-emerald-500/50 bg-emerald-950/20'
                      : isRejected
                      ? 'border-rose-900/50 bg-rose-950/15'
                      : 'border-slate-800 bg-slate-900/40'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-white font-bold">
                        ITERATION {it.iteration}
                      </span>
                      <span className="text-slate-300 font-sans">
                        Basis: <strong className="text-purple-300">{it.featureGrouping.basisFeatures.length}</strong> •
                        Angle: <strong className="text-cyan-300">{it.featureGrouping.angleFeatures.length}</strong> •
                        Amplitude: <strong className="text-pink-300">{it.featureGrouping.amplitudeFeatures.length}</strong>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isAccepted && (
                        <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-600 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>PARETO OPTIMAL & DEPLOYABLE</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-700 font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>REJECTED (CONSTRAINT VIOLATED)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Iteration Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[11px] pt-1">
                    <div>Qubits: <strong className="text-slate-200">{it.qubitsRequired}</strong></div>
                    <div>Depth: <strong className="text-cyan-300">{it.transpiledDepth}</strong></div>
                    <div>2Q CNOTs: <strong className="text-pink-300">{it.twoQubitGates}</strong></div>
                    <div>Ideal Acc: <strong className="text-emerald-400">{(it.idealAccuracy * 100).toFixed(1)}%</strong></div>
                    <div>Noisy Acc: <strong className="text-amber-300">{(it.noisyAccuracy * 100).toFixed(1)}%</strong></div>
                    <div>Robustness: <strong className="text-indigo-300">{it.noiseRobustness}%</strong></div>
                  </div>

                  {/* Rationale & Adaptation Action */}
                  <div className="pt-2 border-t border-slate-800/80 font-sans text-xs space-y-1">
                    <p className="text-slate-300 leading-relaxed">
                      <strong className="text-slate-400 font-mono">Auditor Decision: </strong>
                      {it.decisionRationale}
                    </p>
                    <p className="text-fuchsia-300 leading-relaxed">
                      <strong className="text-fuchsia-400 font-mono">Adaptation Action: </strong>
                      {it.adaptationAction}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Final Deployable Hybrid Circuit */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <h4 className="font-bold text-sm text-white flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Final Deployable Hybrid Quantum Circuit Architecture</span>
            </h4>
            <CircuitCanvas
              circuit={result.finalCircuit}
              title="Optimized Adaptive Hybrid Circuit (Non-Dominated)"
            />
          </div>
        </div>
      )}
    </div>
  );
};
