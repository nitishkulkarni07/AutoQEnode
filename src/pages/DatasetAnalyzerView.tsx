import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sliders,
  Sparkles,
  ArrowRight,
  Database,
} from 'lucide-react';
import { DatasetAnalysis, FeatureStats } from '../types';

interface DatasetAnalyzerViewProps {
  analysis: DatasetAnalysis | null;
  onUploadCSV: (filename: string, content: string) => void;
  onLoadDemo: (demoId: string) => void;
  selectedFeatures: string[];
  onToggleFeature: (featureName: string) => void;
  onSelectAllFeatures: (features: string[]) => void;
  targetColumn: string;
  onSelectTarget: (targetName: string) => void;
  trainRatio: number;
  onChangeTrainRatio: (ratio: number) => void;
  seed: number;
  onChangeSeed: (seed: number) => void;
  onProceedToPreprocessing: () => void;
}

export const DatasetAnalyzerView: React.FC<DatasetAnalyzerViewProps> = ({
  analysis,
  onUploadCSV,
  onLoadDemo,
  selectedFeatures,
  onToggleFeature,
  onSelectAllFeatures,
  targetColumn,
  onSelectTarget,
  trainRatio,
  onChangeTrainRatio,
  seed,
  onChangeSeed,
  onProceedToPreprocessing,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      onUploadCSV(file.name, content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
            <span>Dataset Analyzer & Quantum Feature Profiler</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Characterize mathematical distributions, entropy, mutual information, and target correlation for quantum register mapping.
          </p>
        </div>

        {/* Demo Dataset Selector Bar */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-mono">Load Demo:</span>
          <button
            onClick={() => onLoadDemo('small_medical_demo')}
            className="px-2.5 py-1 rounded-lg border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Medical Demo (Hybrid)
          </button>
          <button
            onClick={() => onLoadDemo('iris_quantum')}
            className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Iris Quantum
          </button>
          <button
            onClick={() => onLoadDemo('binary_classification')}
            className="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Diagnostic 6-Feat
          </button>
        </div>
      </div>

      {/* Upload Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all ${
          dragActive
            ? 'border-cyan-400 bg-cyan-950/20'
            : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
        }`}
      >
        <input
          type="file"
          id="csv-file-input"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="space-y-3 max-w-md mx-auto pointer-events-none">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-cyan-400">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              Drag & Drop your CSV dataset here, or <span className="text-cyan-400">browse files</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports continuous numerical, binary, and categorical columns. Automatic header detection.
            </p>
          </div>
        </div>
      </div>

      {analysis && (
        <>
          {/* Analysis Summary Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Filename</span>
              <span className="font-bold text-slate-200 truncate block">{analysis.filename}</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Total Rows</span>
              <span className="font-bold text-white block text-sm">{analysis.totalRows}</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Columns</span>
              <span className="font-bold text-white block text-sm">{analysis.totalColumns}</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Missing Values</span>
              <span className={`font-bold block text-sm ${analysis.missingValuesTotal > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {analysis.missingValuesTotal}
              </span>
            </div>
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Continuous</span>
              <span className="font-bold text-cyan-300 block text-sm">{analysis.numericalFeaturesCount}</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Discrete/Cat</span>
              <span className="font-bold text-violet-300 block text-sm">{analysis.categoricalFeaturesCount}</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Target Column</span>
              <span className="font-bold text-emerald-400 block text-sm truncate">{targetColumn || analysis.targetCandidate}</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/50">
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Classes</span>
              <span className="font-bold text-indigo-300 block text-sm">
                {Object.keys(analysis.classDistribution).length} (Binary)
              </span>
            </div>
          </div>

          {/* Interactive Configuration Bar */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              {/* Target column select */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 font-mono">Target Column:</span>
                <select
                  value={targetColumn}
                  onChange={e => onSelectTarget(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-mono"
                >
                  {analysis.features.map(f => (
                    <option key={f.name} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                  {analysis.targetCandidate && (
                    <option value={analysis.targetCandidate}>{analysis.targetCandidate}</option>
                  )}
                </select>
              </div>

              {/* Train/test split slider */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 font-mono">Train Split:</span>
                <input
                  type="range"
                  min="0.5"
                  max="0.9"
                  step="0.05"
                  value={trainRatio}
                  onChange={e => onChangeTrainRatio(parseFloat(e.target.value))}
                  className="w-24 accent-indigo-500"
                />
                <span className="font-mono text-cyan-300 font-bold">{Math.round(trainRatio * 100)}%</span>
              </div>

              {/* Seed */}
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 font-mono">Seed:</span>
                <input
                  type="number"
                  value={seed}
                  onChange={e => onChangeSeed(parseInt(e.target.value, 10) || 42)}
                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 font-mono"
                />
              </div>
            </div>

            <button
              onClick={onProceedToPreprocessing}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md transition-colors cursor-pointer"
            >
              <span>Next: Preprocessing Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature Characterization Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/50">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-slate-200">Feature Characterization & Quantum Suitability</h3>
                <span className="text-xs text-slate-400 font-mono">
                  ({selectedFeatures.length} of {analysis.features.length} selected for circuit mapping)
                </span>
              </div>
              <button
                onClick={() => onSelectAllFeatures(analysis.features.map(f => f.name))}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer"
              >
                Select All Features
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-8">Select</th>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Feature</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Unique</th>
                    <th className="p-3">Mean ± Std</th>
                    <th className="p-3">Range</th>
                    <th className="p-3">Entropy</th>
                    <th className="p-3">Correlation</th>
                    <th className="p-3">Mutual Info</th>
                    <th className="p-3">Suggested Encoding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {analysis.features.map(f => {
                    const isSelected = selectedFeatures.includes(f.name);
                    return (
                      <tr
                        key={f.name}
                        onClick={() => onToggleFeature(f.name)}
                        className={`hover:bg-slate-900/40 cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-950/15' : 'opacity-60'
                        }`}
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded accent-indigo-500"
                          />
                        </td>
                        <td className="p-3 font-bold text-slate-400">#{f.selectionRank}</td>
                        <td className="p-3 font-semibold text-white">{f.name}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                              f.type === 'binary'
                                ? 'bg-purple-950/70 text-purple-300 border border-purple-700/40'
                                : f.type === 'categorical'
                                ? 'bg-pink-950/70 text-pink-300 border border-pink-700/40'
                                : 'bg-cyan-950/70 text-cyan-300 border border-cyan-700/40'
                            }`}
                          >
                            {f.type}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{f.uniqueValues}</td>
                        <td className="p-3 text-slate-300">{f.mean} ± {f.stdDev}</td>
                        <td className="p-3 text-slate-300">[{f.min}, {f.max}]</td>
                        <td className="p-3 text-slate-300">{f.entropy}</td>
                        <td className="p-3">
                          <span className={Math.abs(f.targetCorrelation) > 0.4 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                            {f.targetCorrelation}
                          </span>
                        </td>
                        <td className="p-3 text-cyan-300 font-bold">{f.mutualInformation}</td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1.5" title={f.encodingRationale}>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                f.suggestedEncoding === 'basis'
                                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                  : f.suggestedEncoding === 'amplitude'
                                  ? 'bg-pink-950 text-pink-300 border border-pink-800'
                                  : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                              }`}
                            >
                              {f.suggestedEncoding}
                            </span>
                            <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Data Preview Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <h4 className="font-bold text-sm text-slate-300">Raw Data Preview (First 8 Rows)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400 font-mono">
                <thead className="border-b border-slate-800 text-[10px] uppercase text-slate-500">
                  <tr>
                    {Object.keys(analysis.rawPreview[0] || {}).map(col => (
                      <th key={col} className="p-2">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {analysis.rawPreview.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-900/30">
                      {Object.values(row).map((val: any, j) => (
                        <td key={j} className="p-2 text-slate-300">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
