import React from 'react';
import {
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Layers,
} from 'lucide-react';
import { PreprocessingConfig, PreprocessedData, ViewMode } from '../types';

interface PreprocessingViewProps {
  config: PreprocessingConfig;
  onChangeConfig: (newConfig: Partial<PreprocessingConfig>) => void;
  preprocessedData: PreprocessedData | null;
  onExecutePreprocessing: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const PreprocessingView: React.FC<PreprocessingViewProps> = ({
  config,
  onChangeConfig,
  preprocessedData,
  onExecutePreprocessing,
  onNavigate,
}) => {
  const steps = [
    { title: 'Raw Dataset', status: 'Completed', detail: 'CSV format validated' },
    { title: 'Missing Value Handling', status: 'Configured', detail: config.imputation },
    { title: 'Categorical Encoding', status: 'Configured', detail: config.categoricalEncoding },
    { title: 'Feature Scaling', status: 'Configured', detail: config.scaling === 'minmax_pi' ? '[0, π] Rotation Domain' : config.scaling },
    { title: 'Anti-Leakage Split', status: 'Configured', detail: `${Math.round(config.trainRatio * 100)}% Train / ${Math.round((1 - config.trainRatio) * 100)}% Test` },
    { title: 'Quantum Mapping', status: preprocessedData ? 'Ready' : 'Pending Execution', detail: 'Registers ready' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <SlidersHorizontal className="w-6 h-6 text-indigo-400" />
            <span>Quantum-Ready Preprocessing Pipeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Fit mathematical transformations strictly on training partitions to guarantee zero test leakage prior to unitary mapping.
          </p>
        </div>

        <button
          onClick={onExecutePreprocessing}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4 text-cyan-300" />
          <span>Execute Preprocessing Pipeline</span>
        </button>
      </div>

      {/* Visual Pipeline Flowchart */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((st, i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-1 relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-500">STEP {i + 1}</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            </div>
            <h4 className="text-xs font-bold text-white">{st.title}</h4>
            <p className="text-[10px] text-indigo-300 font-mono capitalize truncate">{st.detail}</p>
          </div>
        ))}
      </div>

      {/* Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scaling Configuration */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Quantum Feature Scaling</h3>
            <span className="text-[10px] font-mono text-cyan-400">Unitary Rotations</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Quantum angle encoding gates ($R_y, R_z$) operate on angles $[0, \pi]$ or $[-\pi, \pi]$.
          </p>

          <div className="space-y-2 text-xs font-mono">
            {[
              { id: 'minmax_pi', name: 'MinMaxScaler to [0, π]', desc: 'Directly aligns features with single-qubit Ry rotation domain.' },
              { id: 'minmax_unit', name: 'MinMaxScaler to [0, 1]', desc: 'Normalized amplitude statevector input domain.' },
              { id: 'standard', name: 'StandardScaler (Z-Score)', desc: 'Mean=0, Std=1, clamped to [-π, π].' },
              { id: 'none', name: 'No Scaling (Raw)', desc: 'Warning: May cause periodic phase wrap-around.' },
            ].map(sc => (
              <label
                key={sc.id}
                className={`flex items-start space-x-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                  config.scaling === sc.id
                    ? 'border-indigo-500/50 bg-indigo-950/40 text-cyan-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="scaling"
                  checked={config.scaling === sc.id}
                  onChange={() => onChangeConfig({ scaling: sc.id as any })}
                  className="mt-0.5 accent-indigo-500"
                />
                <div>
                  <span className="font-bold block text-white text-xs">{sc.name}</span>
                  <span className="text-[10px] text-slate-400 font-sans block">{sc.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Missing Value Strategy */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Missing Value Strategy</h3>
            <span className="text-[10px] font-mono text-indigo-400">Imputation</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Handle missing values deterministically on the training partition to avoid NaN statevectors.
          </p>

          <div className="space-y-2 text-xs font-mono">
            {[
              { id: 'mean', name: 'Mean Imputation', desc: 'Fills continuous missing values with feature mean.' },
              { id: 'median', name: 'Median Imputation', desc: 'Robust against extreme outliers in physiological data.' },
              { id: 'most_frequent', name: 'Mode / Most Frequent', desc: 'Ideal for binary and low-cardinality discrete registers.' },
              { id: 'drop', name: 'Drop Rows with Missing', desc: 'Discards corrupted samples entirely.' },
            ].map(imp => (
              <label
                key={imp.id}
                className={`flex items-start space-x-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                  config.imputation === imp.id
                    ? 'border-indigo-500/50 bg-indigo-950/40 text-cyan-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="imputation"
                  checked={config.imputation === imp.id}
                  onChange={() => onChangeConfig({ imputation: imp.id as any })}
                  className="mt-0.5 accent-indigo-500"
                />
                <div>
                  <span className="font-bold block text-white text-xs">{imp.name}</span>
                  <span className="text-[10px] text-slate-400 font-sans block">{imp.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Categorical & Partitions */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Categorical & Split Protocol</h3>
            <span className="text-[10px] font-mono text-violet-400">Anti-Leakage</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Configure categorical integer mapping and reproducible random seed for train/test splits.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 block font-mono mb-1">Categorical Encoding</label>
              <select
                value={config.categoricalEncoding}
                onChange={e => onChangeConfig({ categoricalEncoding: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-slate-200"
              >
                <option value="ordinal">Ordinal Integer Indices (Compact registers)</option>
                <option value="one_hot">One-Hot Binarization (Direct basis states)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block font-mono mb-1">Train/Test Partition Ratio</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0.5"
                  max="0.85"
                  step="0.05"
                  value={config.trainRatio}
                  onChange={e => onChangeConfig({ trainRatio: parseFloat(e.target.value) })}
                  className="flex-1 accent-indigo-500"
                />
                <span className="font-mono text-cyan-300 font-bold">{Math.round(config.trainRatio * 100)}%</span>
              </div>
            </div>

            <div>
              <label className="text-slate-300 block font-mono mb-1">Deterministic Random Seed</label>
              <input
                type="number"
                value={config.seed}
                onChange={e => onChangeConfig({ seed: parseInt(e.target.value, 10) || 42 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Information Loss Audit Record */}
      {preprocessedData && (
        <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/15 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Information-Loss & Anti-Leakage Audit Record</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700">
              AUDITED PASSED
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Training Samples</span>
              <span className="font-bold text-white text-base">{preprocessedData.trainX.length}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Testing Samples</span>
              <span className="font-bold text-cyan-300 text-base">{preprocessedData.testX.length}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Variance Retained</span>
              <span className="font-bold text-emerald-400 text-base">{preprocessedData.informationLoss.varianceRetainedPercent}%</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Imputed Values</span>
              <span className="font-bold text-slate-200 text-base">{preprocessedData.informationLoss.imputedValuesCount}</span>
            </div>
          </div>

          <div className="space-y-1 text-xs text-slate-300">
            {preprocessedData.informationLoss.notes.map((n, i) => (
              <p key={i} className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{n}</span>
              </p>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onNavigate('budget')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              <span>Proceed to Qubit Budget Manager</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
