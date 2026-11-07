import React, { useState, useEffect } from 'react';
import {
  Server,
  Cpu,
  Layers,
  CheckCircle,
  AlertTriangle,
  Zap,
  Info,
  Sliders,
} from 'lucide-react';
import { BackendProfile, ViewMode } from '../types';
import { api } from '../services/api';

interface BackendProfilerViewProps {
  onNavigate: (view: ViewMode) => void;
}

export const BackendProfilerView: React.FC<BackendProfilerViewProps> = ({ onNavigate }) => {
  const [backends, setBackends] = useState<BackendProfile[]>([]);
  const [selectedBackendId, setSelectedBackendId] = useState<string>('noisy_sim');

  useEffect(() => {
    api.getBackends().then(list => setBackends(list));
  }, []);

  const activeBackend = backends.find(b => b.id === selectedBackendId) || backends[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Server className="w-6 h-6 text-indigo-400" />
            <span>Quantum Hardware & Simulator Profiler</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Calibrated noise parameters, coupling topology graphs, native gate sets, and decoherence limits.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-xs font-mono">
          Local Qiskit Simulators Active (Zero API Billing)
        </span>
      </div>

      {/* Backend Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {backends.map(b => {
          const isSelected = selectedBackendId === b.id;
          return (
            <div
              key={b.id}
              onClick={() => setSelectedBackendId(b.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'border-indigo-500/60 bg-slate-900/80 shadow-xl shadow-indigo-950/30 ring-1 ring-indigo-500/50'
                  : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                  {b.category}
                </span>
                <span className="text-xs font-mono font-bold text-white">{b.usableQubits} Qubits</span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-white">{b.name}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{b.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>CX Gate Error:</span>
                  <span className="text-slate-200">{(b.twoQubitError * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Readout Error:</span>
                  <span className="text-slate-200">{(b.readoutError * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Coherence T1:</span>
                  <span className="text-slate-200">{b.coherenceT1Us} µs</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Backend Deep Dive Card */}
      {activeBackend && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>{activeBackend.name}</span>
                <span className="text-xs font-mono text-cyan-400 font-normal">({activeBackend.category})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{activeBackend.description}</p>
            </div>
            <button
              onClick={() => onNavigate('circuit_studio')}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              Transpile Circuit on this Backend
            </button>
          </div>

          {/* Hardware Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Usable Qubits</span>
              <span className="font-bold text-white text-base">{activeBackend.usableQubits} Q</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">1Q Gate Error</span>
              <span className="font-bold text-cyan-300 text-base">{(activeBackend.singleQubitError * 100).toFixed(3)}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">2Q CNOT Error</span>
              <span className="font-bold text-pink-300 text-base">{(activeBackend.twoQubitError * 100).toFixed(2)}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Readout Error</span>
              <span className="font-bold text-amber-300 text-base">{(activeBackend.readoutError * 100).toFixed(2)}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Coherence T1 / T2</span>
              <span className="font-bold text-slate-200 text-base">{activeBackend.coherenceT1Us} / {activeBackend.coherenceT2Us} µs</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Max Coherent Depth</span>
              <span className="font-bold text-emerald-400 text-base">{activeBackend.maxCircuitDepth} Gates</span>
            </div>
          </div>

          {/* Coupling Topology Map & Native Basis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-xs text-slate-300 font-mono">COUPLING GRAPH TOPOLOGY (ADJACENCY LIST)</h4>
              <p className="text-xs text-slate-400">
                Direct physical 2-qubit entangling edges. Gates outside these pairs require SWAP routing.
              </p>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-xs text-cyan-300 overflow-x-auto max-h-32">
                {activeBackend.couplingMap.length === 0 ? (
                  <span>[All-to-All Connectivity: Infinite Coupling Mesh (Ideal Simulator)]</span>
                ) : (
                  <span>
                    {activeBackend.couplingMap.map(([a, b]) => `(${a} ↔ ${b})`).join(', ')}
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-xs text-slate-300 font-mono">NATIVE HARDWARE BASIS GATES</h4>
              <p className="text-xs text-slate-400">
                Physical gate set synthesized via microwave pulses.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {activeBackend.nativeGates.map(g => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-900 text-indigo-300 font-mono font-bold text-xs"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
