import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  Code2,
  Download,
  Info,
} from 'lucide-react';
import { CircuitDefinition } from '../../types';

interface CircuitCanvasProps {
  circuit: CircuitDefinition;
  title?: string;
  isTranspiled?: boolean;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  circuit,
  title,
  isTranspiled = false,
}) => {
  const [zoom, setZoom] = useState(1);
  const [showQasmModal, setShowQasmModal] = useState(false);
  const [qasmVersion, setQasmVersion] = useState<'2.0' | '3.0'>('2.0');
  const [copied, setCopied] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const numQubits = Math.max(1, circuit.numQubits);
  const wireSpacing = 60;
  const colWidth = 56;
  const startX = 80;
  const startY = 50;

  // Find max column in gates
  const maxCol = Math.max(
    circuit.depth || 1,
    ...circuit.gates.map(g => g.column || 0)
  );

  const width = Math.max(650, startX + (maxCol + 1) * colWidth + 80);
  const height = startY + numQubits * wireSpacing + 40;

  const handleCopyQasm = () => {
    const text = qasmVersion === '2.0' ? circuit.qasm2 : circuit.qasm3;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `autoqencode_circuit_${circuit.encodingType}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-md overflow-hidden shadow-xl">
      {/* Circuit Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-sm text-slate-200">
            {title || `${circuit.encodingType.toUpperCase()} Quantum Circuit`}
          </span>
          {isTranspiled && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/40 bg-amber-950/50 text-amber-300 font-semibold">
              TRANSPILED HARDWARE MAPPING
            </span>
          )}
          <span className="text-xs text-slate-400 font-mono">
            {circuit.numQubits} Qubits • Depth {circuit.depth} • {circuit.totalGates} Gates
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <div className="flex items-center space-x-1 border border-slate-800 rounded-lg bg-slate-900/80 p-0.5">
            <button
              onClick={() => setZoom(z => Math.max(0.6, z - 0.1))}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(1.8, z + 0.1))}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowQasmModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>OpenQASM</span>
          </button>

          <button
            onClick={handleExportSvg}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>SVG</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative overflow-x-auto p-4 bg-slate-950 min-h-[220px] flex items-center justify-center">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} className="transition-transform">
          <svg
            ref={svgRef}
            width={width}
            height={height}
            className="select-none font-sans"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="gateGradRy" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="gateGradRz" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="gateGradX" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
              <linearGradient id="gateGradH" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>

            {/* Qubit Wires & State Labels */}
            {Array.from({ length: numQubits }).map((_, q) => {
              const y = startY + q * wireSpacing;
              return (
                <g key={`wire_${q}`}>
                  {/* Wire Label |0> */}
                  <text
                    x={20}
                    y={y + 4}
                    fill="#94a3b8"
                    fontSize={12}
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    q[{q}] |0⟩
                  </text>
                  {/* Quantum Wire line */}
                  <line
                    x1={startX - 10}
                    y1={y}
                    x2={width - 20}
                    y2={y}
                    stroke="#334155"
                    strokeWidth={1.5}
                  />
                </g>
              );
            })}

            {/* Circuit Gates */}
            {circuit.gates.map(gate => {
              const col = gate.column || 0;
              const x = startX + col * colWidth + 24;

              // 1. Two-Qubit CNOT (CX) Gate
              if (gate.name === 'CX' && gate.controlQubits && gate.controlQubits.length > 0) {
                const cQubit = gate.controlQubits[0];
                const tQubit = gate.qubits[0];
                const cY = startY + cQubit * wireSpacing;
                const tY = startY + tQubit * wireSpacing;

                return (
                  <g key={gate.id}>
                    {/* Vertical connecting line */}
                    <line
                      x1={x}
                      y1={cY}
                      x2={x}
                      y2={tY}
                      stroke="#38bdf8"
                      strokeWidth={2}
                    />
                    {/* Control Dot */}
                    <circle cx={x} cy={cY} r={5} fill="#38bdf8" />
                    {/* Target Crosshair Circle */}
                    <circle
                      cx={x}
                      cy={tY}
                      r={11}
                      fill="#0f172a"
                      stroke="#38bdf8"
                      strokeWidth={2}
                    />
                    {/* Target plus lines */}
                    <line x1={x - 8} y1={tY} x2={x + 8} y2={tY} stroke="#38bdf8" strokeWidth={2} />
                    <line x1={x} y1={tY - 8} x2={x} y2={tY + 8} stroke="#38bdf8" strokeWidth={2} />
                  </g>
                );
              }

              // 2. SWAP Gate
              if (gate.name === 'SWAP' && gate.qubits.length >= 2) {
                const q1 = gate.qubits[0];
                const q2 = gate.qubits[1];
                const y1 = startY + q1 * wireSpacing;
                const y2 = startY + q2 * wireSpacing;

                return (
                  <g key={gate.id}>
                    <line x1={x} y1={y1} x2={x} y2={y2} stroke="#f59e0b" strokeWidth={2} />
                    {/* Cross 1 */}
                    <line x1={x - 5} y1={y1 - 5} x2={x + 5} y2={y1 + 5} stroke="#f59e0b" strokeWidth={2} />
                    <line x1={x + 5} y1={y1 - 5} x2={x - 5} y2={y1 + 5} stroke="#f59e0b" strokeWidth={2} />
                    {/* Cross 2 */}
                    <line x1={x - 5} y1={y2 - 5} x2={x + 5} y2={y2 + 5} stroke="#f59e0b" strokeWidth={2} />
                    <line x1={x + 5} y1={y2 - 5} x2={x - 5} y2={y2 + 5} stroke="#f59e0b" strokeWidth={2} />
                  </g>
                );
              }

              // 3. Measurement Gate
              if (gate.name === 'Measure') {
                const q = gate.qubits[0];
                const y = startY + q * wireSpacing;
                return (
                  <g key={gate.id}>
                    <rect
                      x={x - 16}
                      y={y - 16}
                      width={32}
                      height={32}
                      rx={4}
                      fill="#1e293b"
                      stroke="#64748b"
                      strokeWidth={1.5}
                    />
                    <path
                      d={`M ${x - 8} ${y + 6} A 9 9 0 0 1 ${x + 8} ${y + 6}`}
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth={1.5}
                    />
                    <line x1={x} y1={y + 6} x2={x + 6} y2={y - 4} stroke="#38bdf8" strokeWidth={1.5} />
                  </g>
                );
              }

              // 4. Standard 1-Qubit Rotation / Pauli / Hadamard Gate
              const targetQubit = gate.qubits[0];
              const y = startY + targetQubit * wireSpacing;

              let fillGrad = 'url(#gateGradRy)';
              if (gate.name === 'Rz') fillGrad = 'url(#gateGradRz)';
              else if (gate.name === 'X') fillGrad = 'url(#gateGradX)';
              else if (gate.name === 'H') fillGrad = 'url(#gateGradH)';

              const label = gate.params && gate.params.length > 0 ? `${gate.name}` : gate.name;
              const subLabel = gate.params?.[0] ? gate.params[0] : '';

              return (
                <g key={gate.id} className="transition-all hover:brightness-125 cursor-pointer">
                  <rect
                    x={x - 18}
                    y={y - 18}
                    width={36}
                    height={36}
                    rx={6}
                    fill={fillGrad}
                    stroke="#ffffff33"
                    strokeWidth={1}
                    filter="drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.4))"
                  />
                  <text
                    x={x}
                    y={subLabel ? y - 1 : y + 4}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={12}
                    fontWeight="bold"
                  >
                    {label}
                  </text>
                  {subLabel && (
                    <text
                      x={x}
                      y={y + 11}
                      textAnchor="middle"
                      fill="#cbd5e1"
                      fontSize={8}
                      fontFamily="monospace"
                    >
                      {subLabel}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Gate Legend & Resource Metrics */}
      <div className="px-4 py-2.5 border-t border-slate-800/80 bg-slate-900/30 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-blue-600 to-indigo-600 inline-block" />
            <span>Rotations (Ry, Rz)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" />
            <span>Superposition (H)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
            <span>Entanglement (CNOT)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-fuchsia-500 inline-block" />
            <span>Pauli X (Basis)</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 font-mono text-[11px]">
          <span>Single-Qubit: <strong className="text-slate-200">{circuit.singleQubitGates}</strong></span>
          <span>Two-Qubit: <strong className="text-cyan-300">{circuit.twoQubitGates}</strong></span>
          <span>Est. Coherent Error: <strong className="text-amber-300">{(circuit.estimatedError * 100).toFixed(2)}%</strong></span>
        </div>
      </div>

      {/* OpenQASM Code Modal */}
      {showQasmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-950 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">Quantum Assembly (QASM) Export</h3>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs">
                  <button
                    onClick={() => setQasmVersion('2.0')}
                    className={`px-2.5 py-1 rounded font-mono ${
                      qasmVersion === '2.0' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    OpenQASM 2.0
                  </button>
                  <button
                    onClick={() => setQasmVersion('3.0')}
                    className={`px-2.5 py-1 rounded font-mono ${
                      qasmVersion === '3.0' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    OpenQASM 3.0
                  </button>
                </div>
                <button
                  onClick={() => setShowQasmModal(false)}
                  className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded"
                >
                  ✕
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto max-h-80 select-all">
              {qasmVersion === '2.0' ? circuit.qasm2 : circuit.qasm3}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Ready to paste into IBM Quantum Lab or Qiskit QuantumCircuit.from_qasm_str()
              </span>
              <button
                onClick={handleCopyQasm}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy QASM Code'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
