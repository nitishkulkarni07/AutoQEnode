import React, { useState, useEffect } from 'react';
import {
  CircuitBoard,
  Cpu,
  Layers,
  ArrowRight,
  Server,
  Share2,
  Download,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { CircuitDefinition, BackendProfile, TranspilationResult, ViewMode } from '../types';
import { CircuitCanvas } from '../components/circuit/CircuitCanvas';
import { api } from '../services/api';

interface CircuitStudioViewProps {
  currentCircuit: CircuitDefinition | null;
  onNavigate: (view: ViewMode) => void;
}

export const CircuitStudioView: React.FC<CircuitStudioViewProps> = ({
  currentCircuit,
  onNavigate,
}) => {
  const [circuitType, setCircuitType] = useState<'logical' | 'transpiled'>('logical');
  const [selectedBackend, setSelectedBackend] = useState<string>('noisy_sim');
  const [backends, setBackends] = useState<BackendProfile[]>([]);
  const [transpilation, setTranspilation] = useState<TranspilationResult | null>(null);
  const [activeCircuit, setActiveCircuit] = useState<CircuitDefinition | null>(currentCircuit);

  useEffect(() => {
    api.getBackends().then(list => setBackends(list));
    if (!activeCircuit) {
      api.generateCircuit('angle', 4, 4, true, 1).then(c => setActiveCircuit(c));
    }
  }, []);

  useEffect(() => {
    if (activeCircuit) {
      api.transpileCircuit(activeCircuit, selectedBackend)
        .then(res => setTranspilation(res.transpilation))
        .catch(err => console.error('Transpile error:', err));
    }
  }, [activeCircuit, selectedBackend]);

  const handleEncodingSwitch = async (enc: 'basis' | 'angle' | 'amplitude' | 'dense_angle' | 'data_reuploading' | 'hybrid') => {
    const numQ = enc === 'amplitude' || enc === 'dense_angle' ? 2 : 4;
    const c = await api.generateCircuit(enc, 4, numQ, true, 1);
    setActiveCircuit(c);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <CircuitBoard className="w-6 h-6 text-cyan-400" />
            <span>Quantum Circuit Studio & Hardware Transpilation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Deep-dive logical quantum circuit inspection, coupling-map constraint verification, and native gate routing synthesis.
          </p>
        </div>

        {/* Encoding Quick Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {(['basis', 'angle', 'amplitude', 'dense_angle', 'data_reuploading', 'hybrid'] as const).map(enc => (
            <button
              key={enc}
              onClick={() => handleEncodingSwitch(enc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                activeCircuit?.encodingType === enc
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {enc}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas & Metrics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Circuit Visualizer (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Logical vs Transpiled Toggle */}
            <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-xs font-mono">
              <button
                onClick={() => setCircuitType('logical')}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  circuitType === 'logical' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Logical Circuit
              </button>
              <button
                onClick={() => setCircuitType('transpiled')}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  circuitType === 'transpiled' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Transpiled Hardware View
              </button>
            </div>

            {/* Backend Selector */}
            <div className="flex items-center space-x-2 text-xs">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-mono">Target Backend:</span>
              <select
                value={selectedBackend}
                onChange={e => setSelectedBackend(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-mono"
              >
                {backends.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.usableQubits}Q)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeCircuit && (
            <CircuitCanvas
              circuit={activeCircuit}
              title={
                circuitType === 'transpiled'
                  ? `Hardware-Transpiled ${activeCircuit.encodingType.toUpperCase()} Circuit (${selectedBackend})`
                  : undefined
              }
              isTranspiled={circuitType === 'transpiled'}
            />
          )}
        </div>

        {/* Right: Detailed Hardware & Transpilation Metrics (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white flex items-center justify-between">
              <span>Hardware Transpilation Audit</span>
              <span className="text-[10px] font-mono text-cyan-400">Qiskit-Style Pass</span>
            </h3>

            {transpilation ? (
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Logical Depth:</span>
                  <span className="font-bold text-white">{transpilation.originalDepth}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Transpiled Depth:</span>
                  <span className="font-bold text-cyan-300">{transpilation.transpiledDepth}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Single-Qubit Gates:</span>
                  <span className="font-bold text-slate-200">
                    {transpilation.transpiledGates - transpilation.transpiled2QGates}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Two-Qubit Gates (CX):</span>
                  <span className="font-bold text-pink-300">{transpilation.transpiled2QGates}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">SWAP Routing Gates:</span>
                  <span className="font-bold text-amber-300">{transpilation.swapCount} SWAPs</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Routing Overhead:</span>
                  <span className="font-bold text-indigo-300">+{transpilation.routingOverheadPercent}%</span>
                </div>

                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex justify-between items-center">
                  <span className="text-emerald-300">Est. Circuit Fidelity:</span>
                  <span className="font-bold text-emerald-400">
                    {(transpilation.estimatedFidelity * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                Computing physical routing...
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1 font-sans">
              <p>• SWAPs insert 3 CNOT gates each to bridge non-adjacent hardware couplers.</p>
              <p>• Native basis gates: CX, SX, X, RZ mapped to physical pulse calibrations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
