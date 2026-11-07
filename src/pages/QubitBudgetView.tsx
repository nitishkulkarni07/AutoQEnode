import React from 'react';
import {
  Cpu,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Info,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ViewMode } from '../types';

interface QubitBudgetViewProps {
  availableQubits: number;
  onChangeQubits: (qubits: number) => void;
  selectedFeaturesCount: number;
  onNavigate: (view: ViewMode) => void;
}

export const QubitBudgetView: React.FC<QubitBudgetViewProps> = ({
  availableQubits,
  onChangeQubits,
  selectedFeaturesCount,
  onNavigate,
}) => {
  const nFeats = Math.max(1, selectedFeaturesCount);

  // Basis requirement
  const basisReq = nFeats;
  const isBasisFeasible = basisReq <= availableQubits;

  // Angle requirement
  const angleReq = nFeats;
  const isAngleFeasible = angleReq <= availableQubits;

  // Amplitude requirement: ceil(log2(N))
  const ampReq = Math.max(1, Math.ceil(Math.log2(nFeats)));
  const isAmpFeasible = ampReq <= availableQubits;

  // Hybrid requirement: adaptive
  const hybridReq = Math.min(availableQubits, Math.max(2, Math.ceil(nFeats / 2)));
  const isHybridFeasible = true;

  const getBadge = (req: number) => {
    if (req <= availableQubits) {
      return (
        <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-600/40">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Feasible</span>
        </span>
      );
    }
    if (req <= availableQubits + 2) {
      return (
        <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-950/80 text-amber-400 border border-amber-600/40">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Expensive (+{req - availableQubits})</span>
        </span>
      );
    }
    return (
      <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-950/80 text-rose-400 border border-rose-600/40">
        <XCircle className="w-3.5 h-3.5" />
        <span>Infeasible ({req} Qubits)</span>
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <span>Qubit Budget Manager & Resource Feasibility Audit</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Determine whether classical dataset dimensions can be physically mapped to available NISQ quantum hardware registers.
          </p>
        </div>

        <button
          onClick={() => onNavigate('encoding_lab')}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-colors cursor-pointer"
        >
          <span>Next: Encoding Lab</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Slider Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Target Quantum Hardware Qubit Allocation</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust available logical/physical qubits from 2 to 32 to evaluate encoding feasibility.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 font-mono">Available Registers:</span>
            <span className="px-3.5 py-1 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-black text-xl">
              {availableQubits} Qubits
            </span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="2"
            max="32"
            value={availableQubits}
            onChange={e => onChangeQubits(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>2 Qubits (Minimal Subspace)</span>
            <span>4 Qubits (Default NISQ)</span>
            <span>8 Qubits (Falcon Chip)</span>
            <span>16 Qubits (Mid-scale)</span>
            <span>32 Qubits (Simulation Ceiling)</span>
          </div>
        </div>

        {/* Selected Features Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Selected Features</span>
            <span className="font-bold text-white text-base">{nFeats} Features</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Linear Threshold</span>
            <span className="font-bold text-cyan-300 text-base">{nFeats} Qubits required</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Logarithmic Compression</span>
            <span className="font-bold text-pink-300 text-base">{ampReq} Qubits required</span>
          </div>
        </div>
      </div>

      {/* Feasibility Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Basis Encoding Feasibility */}
        <div className={`p-5 rounded-2xl border space-y-4 transition-all ${
          isBasisFeasible ? 'border-slate-800 bg-slate-900/40' : 'border-rose-900/40 bg-rose-950/10'
        }`}>
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white">Basis Encoding</h4>
            {getBadge(basisReq)}
          </div>
          <div>
            <span className="text-2xl font-black text-slate-100 font-mono">{basisReq}</span>
            <span className="text-xs text-slate-400 font-mono ml-1.5">Qubits Required</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Requires 1 computational basis qubit per classical feature ($O(N)$ scaling).
          </p>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 font-mono">
            {isBasisFeasible
              ? `✓ Fits into ${availableQubits}-qubit hardware with ${availableQubits - basisReq} reserve wires.`
              : `✕ Exceeds available budget by ${basisReq - availableQubits} qubits. Requires feature selection.`}
          </div>
        </div>

        {/* Angle Encoding Feasibility */}
        <div className={`p-5 rounded-2xl border space-y-4 transition-all ${
          isAngleFeasible ? 'border-indigo-500/40 bg-slate-900/40 shadow-lg shadow-indigo-950/20' : 'border-rose-900/40 bg-rose-950/10'
        }`}>
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white">Angle Encoding</h4>
            {getBadge(angleReq)}
          </div>
          <div>
            <span className="text-2xl font-black text-cyan-300 font-mono">{angleReq}</span>
            <span className="text-xs text-slate-400 font-mono ml-1.5">Qubits Required</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Requires 1 qubit per rotation angle ($O(N)$ scaling). Parallel depth remains $O(1)$.
          </p>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 font-mono">
            {isAngleFeasible
              ? `✓ Optimal balance: ${angleReq} rotation wires fit into budget.`
              : `✕ Exceeds budget. Consider compressing correlated numerical pairs.`}
          </div>
        </div>

        {/* Amplitude Encoding Feasibility */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white">Amplitude Encoding</h4>
            {getBadge(ampReq)}
          </div>
          <div>
            <span className="text-2xl font-black text-pink-300 font-mono">{ampReq}</span>
            <span className="text-xs text-slate-400 font-mono ml-1.5">Qubits Required</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Requires only $\lceil \log_2(N) \rceil$ qubits ($O(\log_2 N)$ scaling). Minimal qubit footprint.
          </p>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 font-mono">
            ✓ Highly compact ({ampReq} qubits), but incurs high state-preparation CNOT depth ($O(2^n)$).
          </div>
        </div>

        {/* Adaptive Hybrid Encoding Feasibility */}
        <div className="p-5 rounded-2xl border border-violet-500/40 bg-violet-950/20 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white">Adaptive Hybrid</h4>
            {getBadge(hybridReq)}
          </div>
          <div>
            <span className="text-2xl font-black text-violet-300 font-mono">{hybridReq}</span>
            <span className="text-xs text-slate-400 font-mono ml-1.5">Qubits Required</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Patent controller dynamically groups features to strictly respect any budget $\ge 2$.
          </p>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 font-mono">
            ✓ Guaranteed to satisfy constraints via progressive register reconfiguration.
          </div>
        </div>
      </div>
    </div>
  );
};
