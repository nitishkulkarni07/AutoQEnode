import React, { useState, useEffect } from 'react';
import {
  Binary,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Code2,
  RefreshCw,
} from 'lucide-react';
import { ViewMode, CircuitDefinition } from '../types';
import { CircuitCanvas } from '../components/circuit/CircuitCanvas';
import { api } from '../services/api';

interface EncodingLabViewProps {
  numFeatures: number;
  availableQubits: number;
  onNavigate: (view: ViewMode) => void;
  onSelectCircuitForStudio: (circuit: CircuitDefinition) => void;
}

export const EncodingLabView: React.FC<EncodingLabViewProps> = ({
  numFeatures,
  availableQubits,
  onNavigate,
  onSelectCircuitForStudio,
}) => {
  const [selectedEncoding, setSelectedEncoding] = useState<'basis' | 'angle' | 'amplitude' | 'dense_angle' | 'data_reuploading' | 'hybrid'>('angle');
  const [circuit, setCircuit] = useState<CircuitDefinition | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCircuit = async (enc: 'basis' | 'angle' | 'amplitude' | 'dense_angle' | 'data_reuploading' | 'hybrid') => {
    setLoading(true);
    try {
      const q = enc === 'amplitude'
        ? Math.max(1, Math.ceil(Math.log2(numFeatures)))
        : enc === 'dense_angle' ? Math.min(availableQubits, Math.ceil(numFeatures / 2)) : Math.min(availableQubits, numFeatures);

      const generated = await api.generateCircuit(enc, numFeatures, q, true, 1);
      setCircuit(generated);
      setSelectedEncoding(enc);
    } catch (err) {
      console.error('Failed to generate circuit:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCircuit(selectedEncoding);
  }, [numFeatures, availableQubits]);

  const cards = [
    {
      id: 'basis' as const,
      title: 'Basis Encoding',
      formula: '|x⟩ = |x_1 x_2 ... x_N⟩',
      icon: Binary,
      color: 'purple',
      qubitScaling: 'O(N) Qubits',
      depthScaling: 'O(1) Depth',
      gateComplexity: 'X Pauli Gates',
      suitableData: 'Discrete binary flags, categorical indices, quantized integers.',
      desc: 'Encodes classical bitstrings directly into computational basis states. Zero rotational drift, but requires 1 qubit per bit.',
    },
    {
      id: 'angle' as const,
      title: 'Angle Encoding',
      formula: '|ψ⟩ = ⨂ (cos x_i|0⟩ + sin x_i|1⟩)',
      icon: Cpu,
      color: 'cyan',
      qubitScaling: 'O(N) Qubits',
      depthScaling: 'O(1) Parallel Depth',
      gateComplexity: 'Ry / Rz Rotations',
      suitableData: 'Bounded continuous numerical features with periodic or non-linear structures.',
      desc: 'Encodes continuous features into rotation angles. Highly effective for NISQ variational classifiers.',
    },
    {
      id: 'amplitude' as const,
      title: 'Amplitude Encoding',
      formula: '|ψ⟩ = ∑ x_i |i⟩',
      icon: Layers,
      color: 'pink',
      qubitScaling: 'O(log2 N) Qubits',
      depthScaling: 'O(2^n) CNOT Depth',
      gateComplexity: 'Tree Controlled-Ry',
      suitableData: 'Dense, highly correlated numerical arrays, vector embeddings.',
      desc: 'Normalizes vector into 2^n state amplitudes. Extreme qubit compression at the expense of circuit depth.',
    },
    {
      id: 'dense_angle' as const,
      title: 'Dense Angle Encoding',
      formula: '|ψ⟩ = ⊗ Rz(πx₂ᵢ₊₁) Ry(πx₂ᵢ)|0⟩',
      icon: Cpu,
      color: 'cyan',
      qubitScaling: 'O(ceil(N/2)) Qubits',
      depthScaling: '2 Rotation Layers',
      gateComplexity: 'Ry + Rz / Qubit',
      suitableData: 'Pairs of continuous features with tight qubit budgets.',
      desc: 'Loads two real features on each qubit: first a Y rotation, then a Z rotation. Useful when angle encoding needs too many qubits.',
    },
    {
      id: 'data_reuploading' as const,
      title: 'Data Re-uploading',
      formula: 'U(x,w) = ∏[V(wₗ) E(x)]',
      icon: RefreshCw,
      color: 'purple',
      qubitScaling: 'O(N) Qubits',
      depthScaling: 'Grows with Layers',
      gateComplexity: 'Repeated Ry + VQC',
      suitableData: 'Nonlinear decision boundaries with repeated feature exposure.',
      desc: 'Alternates the same feature rotation gates with trainable variational layers; increases expressivity but circuit depth and noise exposure also rise.',
    },
    {
      id: 'hybrid' as const,
      title: 'Hybrid Encoding',
      formula: '|ψ_basis⟩ ⨂ |ψ_angle⟩ ⨂ |ψ_amp⟩',
      icon: Sparkles,
      color: 'violet',
      qubitScaling: 'Adaptive Budget',
      depthScaling: 'Controlled O(D)',
      gateComplexity: 'Partitioned Gates',
      suitableData: 'Heterogeneous real-world tabular data containing mixed categorical and continuous features.',
      desc: 'Dynamically allocates separate quantum registers for discrete, continuous, and correlated subsets.',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <span>Quantum Data Encoding Laboratory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compare mathematical formulations, gate overheads, asymptotic scaling, and synthesize concrete quantum circuits.
          </p>
        </div>

        <button
          onClick={() => onNavigate('benchmark')}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-all cursor-pointer"
        >
          <span>Proceed to Controlled Benchmark</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Encoding comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(card => {
          const Icon = card.icon;
          const isSelected = selectedEncoding === card.id;

          return (
            <div
              key={card.id}
              onClick={() => fetchCircuit(card.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-4 flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500/60 bg-slate-900/70 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500/40'
                  : 'border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                    {card.qubitScaling}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-white">{card.title}</h3>
                  <p className="text-[11px] font-mono text-cyan-300 mt-0.5">{card.formula}</p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {card.desc}
                </p>

                <div className="space-y-1 text-[11px] font-mono border-t border-slate-800 pt-2 text-slate-400">
                  <div className="flex justify-between">
                    <span>Depth:</span>
                    <span className="text-slate-200">{card.depthScaling}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gate Set:</span>
                    <span className="text-slate-200">{card.gateComplexity}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchCircuit(card.id);
                }}
                className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${loading && isSelected ? 'animate-spin' : ''}`} />
                <span>{isSelected ? 'Circuit Active' : 'Generate Circuit'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Circuit Canvas Render Area */}
      {circuit && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
              <span>Interactive Quantum Circuit Canvas</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-700">
                {circuit.encodingType.toUpperCase()}
              </span>
            </h3>
            <button
              onClick={() => {
                onSelectCircuitForStudio(circuit);
                onNavigate('circuit_studio');
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1 cursor-pointer"
            >
              <span>Open in Full Circuit Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <CircuitCanvas circuit={circuit} />
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-white">How to read this circuit</h4>
            <p>Each horizontal wire is a qubit (q₀, q₁, …). Read gates from left to right. X flips a computational bit; Ry/Rz rotate a qubit by a data-dependent angle; connected CX gates entangle two qubits. The final meters measure each wire.</p>
            <p><strong className="text-cyan-300">{cards.find(c => c.id === circuit.encodingType)?.title}:</strong> {cards.find(c => c.id === circuit.encodingType)?.desc}</p>
            <p><strong className="text-cyan-300">Justification:</strong> {circuit.complexity.suitableData} Trade-off: {circuit.complexity.qubitScaling}; {circuit.complexity.depthScaling}. Compare both validation F1 and transpiled physical resources before making a selection.</p>
            <p className="text-amber-300">Circuit angles are symbolic illustration labels. Exported QASM uses explicit π/4 placeholder angles and is not a trained, dataset-specific circuit. The browser benchmark is an ideal statevector prototype with approximate noise and hardware costs, not quantum hardware measurements.</p>
          </div>
        </div>
      )}
    </div>
  );
};
