import React, { useState, useEffect } from 'react';
import {
  History,
  FileText,
  Download,
  Trash2,
  GitCompare,
  Eye,
  CheckCircle,
  Copy,
  Check,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { ExperimentRecord } from '../types';
import { api } from '../services/api';

export const HistoryAndReportsView: React.FC = () => {
  const [experiments, setExperiments] = useState<ExperimentRecord[]>([]);
  const [selectedExp, setSelectedExp] = useState<ExperimentRecord | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const fetchHistory = async () => {
    try {
      const list = await api.getExperiments();
      setExperiments(list);
      if (list.length > 0 && !selectedExp) {
        setSelectedExp(list[0]);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.deleteExperiment(id);
    fetchHistory();
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleExport = (format: 'json' | 'csv') => {
    if (!selectedExp) return;
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedExp, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `${selectedExp.id}_report.json`;
      a.click();
    } else {
      let csv = 'Encoding,Accuracy,Precision,Recall,F1Score,Depth,Qubits,TwoQubitGates,NoiseAccuracy,NoiseRobustness\n';
      selectedExp.results.forEach(r => {
        csv += `${r.encoding},${r.accuracy},${r.precision},${r.recall},${r.f1Score},${r.depth},${r.qubits},${r.twoQubitGates},${r.noiseAccuracy},${r.noiseRobustness}\n`;
      });
      const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `${selectedExp.id}_benchmark.csv`;
      a.click();
    }
  };

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (compareList.includes(id)) {
      setCompareList(compareList.filter(item => item !== id));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare a maximum of 3 experiments at once.');
        return;
      }
      setCompareList([...compareList, id]);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <History className="w-6 h-6 text-indigo-400" />
            <span>Experiment History & Reproducibility Registry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Persisted experimental runs, cryptographic dataset fingerprints, and downloadable scientific publication reports.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {compareList.length >= 2 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare Selected ({compareList.length})</span>
            </button>
          )}

          <button
            onClick={() => handleExport('json')}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Experiment List (Left) + Detail & Manifest Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Experiment List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-200">Logged Experiments ({experiments.length})</h3>
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {experiments.map(exp => {
              const isSelected = selectedExp?.id === exp.id;
              const isComparing = compareList.includes(exp.id);
              const winner = exp.recommendation?.recommendedEncoding || 'angle';

              return (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExp(exp)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 text-xs ${
                    isSelected
                      ? 'border-indigo-500/60 bg-indigo-950/30 shadow-md ring-1 ring-indigo-500/40'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-300 font-bold">{exp.id}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(exp.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm truncate">{exp.title}</h4>

                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                    <span>Dataset: {exp.datasetName}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase font-bold">
                      {winner}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={e => toggleCompare(exp.id, e)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                        isComparing
                          ? 'border-cyan-500 bg-cyan-950 text-cyan-300 font-bold'
                          : 'border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isComparing ? '✓ Comparing' : '+ Compare'}
                    </button>

                    <button
                      onClick={e => handleDelete(exp.id, e)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Experiment Detail & Manifest (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {selectedExp ? (
            <div className="space-y-5">
              {/* Summary Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">EXPERIMENT AUDIT RECORD</span>
                    <h3 className="text-xl font-bold text-white">{selectedExp.title}</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 uppercase">
                    WINNER: {selectedExp.recommendation?.recommendedEncoding}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Dataset</span>
                    <span className="font-bold text-white truncate block">{selectedExp.datasetName}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Target Column</span>
                    <span className="font-bold text-slate-200 truncate block">{selectedExp.targetColumn}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Qubit Budget</span>
                    <span className="font-bold text-cyan-300 block">{selectedExp.qubitBudget} Qubits</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Noise Profile</span>
                    <span className="font-bold text-amber-300 block uppercase">{selectedExp.noiseLevel}</span>
                  </div>
                </div>

                {/* Benchmark Summary Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 font-mono">
                    <thead className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                      <tr>
                        <th className="py-2">Encoding</th>
                        <th className="py-2">Accuracy</th>
                        <th className="py-2">F1</th>
                        <th className="py-2">Depth</th>
                        <th className="py-2">Qubits</th>
                        <th className="py-2">Robustness</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {selectedExp.results.map(r => (
                        <tr key={r.encoding}>
                          <td className="py-2 font-bold uppercase text-white">{r.encoding}</td>
                          <td className="py-2 text-emerald-400">{(r.accuracy * 100).toFixed(1)}%</td>
                          <td className="py-2 text-cyan-300">{r.f1Score.toFixed(3)}</td>
                          <td className="py-2 text-slate-300">{r.depth}</td>
                          <td className="py-2 text-slate-300">{r.qubits}</td>
                          <td className="py-2 text-amber-300">{r.noiseRobustness.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Dynamic Scientific Rationale */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-indigo-400 font-semibold font-mono">Explanation: </strong>
                  {selectedExp.recommendation?.explanation?.primaryRationale}
                </div>
              </div>

              {/* Reproducibility Manifest Card */}
              {selectedExp.manifest && (
                <div className="p-6 rounded-2xl border border-indigo-500/30 bg-slate-950/80 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                      <ShieldCheck className="w-5 h-5" />
                      <span>Reproducibility Manifest (Academic Standard)</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {selectedExp.manifest.manifestId}
                    </span>
                  </div>

                  {/* Cryptographic SHA-256 Fingerprint */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="truncate mr-2">
                      <span className="text-slate-500 text-[10px] block">Dataset Cryptographic SHA-256 Hash:</span>
                      <span className="text-cyan-300 truncate block">{selectedExp.manifest.datasetHash}</span>
                    </div>
                    <button
                      onClick={() => handleCopyHash(selectedExp.manifest.datasetHash)}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="Copy Hash"
                    >
                      {copiedHash ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Manifest Specification Parameters */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Dataset Rows / Dim:</span>
                      <span className="text-slate-200 font-bold">{selectedExp.manifest.datasetRows} samples / {selectedExp.manifest.datasetFeatures.length} feats</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Deterministic Seed:</span>
                      <span className="text-cyan-300 font-bold">{selectedExp.manifest.randomSeed}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Train / Test Ratio:</span>
                      <span className="text-slate-200 font-bold">{selectedExp.manifest.trainRatio * 100}% / {(1 - selectedExp.manifest.trainRatio) * 100}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Scaling Strategy:</span>
                      <span className="text-slate-200 font-bold">{selectedExp.manifest.preprocessing.scaling}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">VQC Ansatz Layers:</span>
                      <span className="text-indigo-300 font-bold">{selectedExp.manifest.qnnArchitecture.ansatzLayers} Layer ({selectedExp.manifest.qnnArchitecture.entanglement})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Software Kernel:</span>
                      <span className="text-emerald-400 font-bold">{selectedExp.manifest.environment.autoQEncodeVersion}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">
              Select an experiment from the left column to view audit records.
            </div>
          )}
        </div>
      </div>

      {/* Side-by-side Experiment Compare Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <GitCompare className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">Side-by-Side Experiment Comparison</h3>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
              {experiments
                .filter(exp => compareList.includes(exp.id))
                .map(exp => (
                  <div key={exp.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                    <span className="text-cyan-400 font-bold block">{exp.id}</span>
                    <h5 className="font-bold text-white truncate font-sans">{exp.title}</h5>

                    <div className="space-y-1.5 text-slate-300 border-t border-slate-800 pt-2">
                      <div className="flex justify-between">
                        <span>Dataset:</span>
                        <span className="text-slate-100">{exp.datasetName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Qubit Budget:</span>
                        <span className="text-cyan-300">{exp.qubitBudget} Q</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Noise:</span>
                        <span className="text-amber-300 uppercase">{exp.noiseLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Winner:</span>
                        <span className="text-emerald-400 font-bold uppercase">{exp.recommendation?.recommendedEncoding}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Winner Score:</span>
                        <span className="text-white font-bold">{exp.recommendation?.overallScore}/100</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
