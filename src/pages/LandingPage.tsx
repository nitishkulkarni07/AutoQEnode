import React from 'react';
import {
  Cpu,
  Layers,
  Sparkles,
  GitCompare,
  ArrowRight,
  ShieldAlert,
  Zap,
  Activity,
  Award,
  Binary,
  CheckCircle2,
  Atom,
} from 'lucide-react';
import { ViewMode } from '../types';

interface LandingPageProps {
  onNavigate: (view: ViewMode) => void;
  onLaunchDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onLaunchDemo }) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/60 via-slate-950/80 to-slate-950 p-6 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>Quantum Machine Learning Research Engine</span>
            </div>

            <img src="/autoqencode-logo.png" alt="AutoQEncode quantum atom logo" className="w-56 sm:w-72 max-w-full rounded-xl drop-shadow-[0_0_20px_rgba(65,119,255,0.18)]" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                AUTOQENCODE
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent text-2xl sm:text-3xl md:text-4xl">
                Automated Quantum Data Encoding Intelligence
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              Benchmark, compare and adapt quantum data encoding strategies under real-world resource and noise constraints. Discover whether Basis, Angle, Amplitude, Dense Angle, Data Re-uploading, or Adaptive Hybrid circuits maximize classification accuracy within NISQ coherence limits.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <span>Start Experiment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onLaunchDemo}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-medium text-sm transition-all cursor-pointer shadow-md"
              >
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Explore Live Demo</span>
              </button>
            </div>

            {/* Micro Specs */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 max-w-md">
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-mono">Qubit Scalability</p>
                <p className="text-lg font-bold text-white">Up to 8 simulated qubits</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-mono">Ansatz Strategy</p>
                <p className="text-lg font-bold text-cyan-300">Variational QNN</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-mono">Noise Modeling</p>
                <p className="text-lg font-bold text-violet-300">Depolarizing + Readout</p>
              </div>
            </div>
          </div>

          {/* Hero Visual: Interactive Quantum Circuit Matrix */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl border border-indigo-500/30 bg-slate-950/90 p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <Atom className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span className="font-mono font-bold text-slate-200">HYBRID_STATE_PREP.qasm</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  OPTIMAL
                </span>
              </div>

              {/* Graphical Circuit Wire Simulation */}
              <div className="py-4 space-y-4 font-mono text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 w-12">q[0] |0⟩</span>
                  <div className="h-0.5 flex-1 bg-slate-800 relative flex items-center justify-around">
                    <span className="px-2 py-1 rounded bg-fuchsia-600/80 text-white font-bold text-[10px] shadow">X</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="px-2 py-1 rounded bg-indigo-600 text-white text-[10px]">Ry(θ)</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 w-12">q[1] |0⟩</span>
                  <div className="h-0.5 flex-1 bg-slate-800 relative flex items-center justify-around">
                    <span className="px-2 py-1 rounded bg-cyan-600 text-white font-bold text-[10px]">H</span>
                    <span className="w-4 h-4 rounded-full border-2 border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-[10px]">+</span>
                    <span className="px-2 py-1 rounded bg-indigo-600 text-white text-[10px]">Rz(ϕ)</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 w-12">q[2] |0⟩</span>
                  <div className="h-0.5 flex-1 bg-slate-800 relative flex items-center justify-around">
                    <span className="px-2 py-1 rounded bg-blue-600 text-white text-[10px]">Ry(α)</span>
                    <span className="px-2 py-1 rounded bg-pink-600 text-white text-[10px]">CX</span>
                    <span className="px-2 py-1 rounded bg-slate-700 text-slate-300 text-[10px]">M</span>
                  </div>
                </div>
              </div>

              {/* Floating Metric Badges */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Test Accuracy</span>
                  <span className="font-bold text-emerald-400 text-base">95.0%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Circuit Depth</span>
                  <span className="font-bold text-cyan-300 text-base">8 gates</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Noise Robustness</span>
                  <span className="font-bold text-indigo-300 text-base">94.7%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Allocated Qubits</span>
                  <span className="font-bold text-violet-300 text-base">4 Qubits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Encoding Matters Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Why Quantum Encoding Matters</h2>
          <p className="text-sm text-slate-400">
            The encoding strategy directly dictates qubit consumption, circuit depth, noise sensitivity, and trainability in NISQ algorithms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Basis Encoding */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Binary className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                O(N) Qubits
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Basis Encoding</h3>
              <p className="text-xs font-mono text-purple-300">|x⟩ = |x_1 x_2 ... x_N⟩</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maps discrete computational binary inputs directly into qubits using Pauli-X gates. Depth is strictly O(1), but loses continuous precision for numerical data.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1 text-slate-400">
              <p>✓ Zero trigonometric rotation drift</p>
              <p>✓ Trivial O(1) state preparation</p>
              <p>✕ High qubit demand for high-cardinality data</p>
            </div>
          </div>

          {/* Card 2: Angle Encoding */}
          <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/40 p-6 space-y-4 hover:border-indigo-500/50 transition-all shadow-lg shadow-indigo-950/20">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                O(N) Qubits
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Angle Encoding</h3>
              <p className="text-xs font-mono text-cyan-300">|ψ⟩ = ⨂ (cos x_i|0⟩ + sin x_i|1⟩)</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Encodes continuous features into rotation angles (Ry/Rz). Maintains shallow parallel depth while preserving continuous non-linear representations.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1 text-slate-400">
              <p>✓ Continuous numerical mapping</p>
              <p>✓ Highly noise-robust in NISQ</p>
              <p>✕ Qubit count scales linearly with features</p>
            </div>
          </div>

          {/* Card 3: Amplitude Encoding */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-pink-950/60 text-pink-300 border border-pink-800/40">
                O(log2 N) Qubits
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Amplitude Encoding</h3>
              <p className="text-xs font-mono text-pink-300">|ψ⟩ = ∑ x_i |i⟩</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Exponentially compresses $2^n$ features into $n$ qubits. Requires multi-level CNOT state-preparation trees that increase depth and noise susceptibility.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1 text-slate-400">
              <p>✓ Exponential qubit compression</p>
              <p>✕ Deep multi-controlled CNOT circuits</p>
              <p>✕ Vulnerable to NISQ decoherence</p>
            </div>
          </div>
        </div>
      </section>

      {/* How AutoQEncode Works Pipeline */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">How AutoQEncode Works</h2>
          <p className="text-sm text-slate-400">
            A rigorous, reproducible end-to-end pipeline bridging classical tabular datasets and quantum machine learning.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          {[
            { step: '01', title: 'Dataset', desc: 'CSV Upload & Validation' },
            { step: '02', title: 'Characterize', desc: 'Entropy & Relevance' },
            { step: '03', title: 'Budget', desc: '2-32 Qubits Allocation' },
            { step: '04', title: 'Encodings', desc: 'Basis, Angle, Amplitude' },
            { step: '05', title: 'Train QNN', desc: 'Fair Parameter-Shift VQC' },
            { step: '06', title: 'Noise Sim', desc: 'Aer Depolarizing Profile' },
            { step: '07', title: 'Recommend', desc: 'Pareto Rationale' },
          ].map((s, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5 hover:border-indigo-500/40 transition-all"
            >
              <span className="text-[10px] font-mono font-bold text-indigo-400">{s.step}</span>
              <h4 className="text-xs font-bold text-white">{s.title}</h4>
              <p className="text-[10px] text-slate-400 leading-tight">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Adaptive Hybrid Encoding Patent Section */}
      <section className="rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-950/30 via-slate-950 to-indigo-950/30 p-8 space-y-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 text-xs font-mono text-fuchsia-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PATENT-ORIENTED ADVANCED FUNCTIONALITY</span>
            </div>
            <h3 className="text-2xl font-bold text-white">Adaptive Hybrid Encoding Lab</h3>
          </div>
          <button
            onClick={() => onNavigate('adaptive_lab')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <span>Launch Adaptive Lab</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          Rather than forcing an entire dataset into a single rigid encoding, the Adaptive Controller characterizes each feature individually (type, variance, sparsity, correlation), creates heterogeneous groups, composes a unified hybrid circuit, and iteratively adapts the circuit structure to meet strict hardware constraints.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-cyan-400 font-bold">Group 1: Discrete Flags</span>
            <p className="text-slate-400 font-sans text-xs">Mapped to Basis Encoding for zero rotation gate overhead.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-indigo-400 font-bold">Group 2: Continuous Bounded</span>
            <p className="text-slate-400 font-sans text-xs">Mapped to Angle Rotations for smooth gradient propagation.</p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-pink-400 font-bold">Group 3: High-Variance Correlated</span>
            <p className="text-slate-400 font-sans text-xs">Compressed into logarithmic Amplitude statevector registers.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
