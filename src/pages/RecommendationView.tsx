import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Sliders,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ViewMode,
  RecommendationOutput,
  PriorityWeights,
  BenchmarkMetrics,
} from '../types';
import { ParetoFrontierPlot } from '../components/charts/QuantumCharts';

interface RecommendationViewProps {
  recommendation: RecommendationOutput | null;
  benchmarkResults: BenchmarkMetrics[] | null;
  onUpdateWeights: (weights: PriorityWeights) => void;
  onNavigate: (view: ViewMode) => void;
  onExportReport: (format: 'json' | 'csv' | 'pdf') => void;
}

export const RecommendationView: React.FC<RecommendationViewProps> = ({
  recommendation,
  benchmarkResults,
  onUpdateWeights,
  onNavigate,
  onExportReport,
}) => {
  const [weights, setWeights] = useState<PriorityWeights>({
    predictiveQuality: 40,
    resourceEfficiency: 25,
    qubitFootprint: 15,
    noiseRobustness: 20,
    lowError: 10,
  });

  const handleSliderChange = (key: keyof PriorityWeights, val: number) => {
    const updated = { ...weights, [key]: val };
    setWeights(updated);
    onUpdateWeights(updated);
  };

  const winner = recommendation?.recommendedEncoding || 'angle';

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Award className="w-6 h-6 text-yellow-400" />
            <span>Multi-Objective Recommendation & Pareto Frontier</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Empirical multi-attribute utility decision: synthesizes predictive quality, hardware depth, qubit bounds, and noise tolerance.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onExportReport('json')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => onExportReport('csv')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => onNavigate('history_reports')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            <span>Full Research Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Priority Weights Sliders Panel */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Custom Multi-Objective Priority Weightings</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            Real-Time Utility Normalization
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs font-mono">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Predictive Quality</span>
              <span className="text-cyan-300 font-bold">{weights.predictiveQuality}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.predictiveQuality}
              onChange={e => handleSliderChange('predictiveQuality', parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Resource Depth</span>
              <span className="text-indigo-300 font-bold">{weights.resourceEfficiency}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.resourceEfficiency}
              onChange={e => handleSliderChange('resourceEfficiency', parseInt(e.target.value, 10))}
              className="w-full accent-indigo-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Low Qubit Footprint</span>
              <span className="text-purple-300 font-bold">{weights.qubitFootprint}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.qubitFootprint}
              onChange={e => handleSliderChange('qubitFootprint', parseInt(e.target.value, 10))}
              className="w-full accent-purple-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Noise Robustness</span>
              <span className="text-emerald-300 font-bold">{weights.noiseRobustness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.noiseRobustness}
              onChange={e => handleSliderChange('noiseRobustness', parseInt(e.target.value, 10))}
              className="w-full accent-emerald-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Low Coherent Error</span>
              <span className="text-amber-300 font-bold">{weights.lowError}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.lowError}
              onChange={e => handleSliderChange('lowError', parseInt(e.target.value, 10))}
              className="w-full accent-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Large Recommendation Banner */}
      {recommendation && (
        <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 via-slate-950 to-violet-950/40 p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-indigo-400">
                RECOMMENDED QUANTUM ENCODING STRATEGY
              </span>
              <h3 className="text-3xl font-black text-white uppercase tracking-tight mt-1 flex items-center space-x-3">
                <span>{winner} ENCODING</span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                  SCORE: {recommendation.overallScore}/100
                </span>
              </h3>
            </div>

            <div className="flex items-center space-x-2 font-mono text-xs">
              {recommendation.rankings.map(rk => (
                <div
                  key={rk.encoding}
                  className={`px-3 py-1 rounded-lg border ${
                    rk.encoding === winner
                      ? 'border-indigo-500/60 bg-indigo-900/40 text-cyan-300 font-bold'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400'
                  }`}
                >
                  <span className="uppercase">{rk.encoding}:</span> {rk.score}
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Natural Language Explanation */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-200">Traceable Scientific Justification:</h4>
            <p className="text-sm text-slate-300 leading-relaxed font-normal bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              {recommendation.explanation.primaryRationale}
            </p>
          </div>

          {/* Pros & Cons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/15 space-y-2">
              <span className="font-bold text-emerald-400 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Empirical Strengths</span>
              </span>
              <div className="space-y-1.5 text-slate-300">
                {recommendation.explanation.pros.map((p, i) => (
                  <p key={i}>• {p}</p>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/15 space-y-2">
              <span className="font-bold text-amber-400 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Physical Constraints & Trade-offs</span>
              </span>
              <div className="space-y-1.5 text-slate-300">
                {recommendation.explanation.cons.map((c, i) => (
                  <p key={i}>• {c}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Alternative Comparisons */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-slate-300 font-mono">Comparative Trade-off Analysis:</span>
            <div className="space-y-1 text-slate-400 font-mono text-[11px]">
              {recommendation.explanation.alternativeComparisons.map((alt, i) => (
                <p key={i}>→ {alt}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pareto Frontier 2D Scatter Plot */}
      {recommendation?.paretoPoints && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-white">Multi-Objective Pareto Frontier Analysis</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Accuracy vs Circuit Depth: Green marks non-dominated candidate encodings that achieve optimal trade-off frontiers.
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="flex items-center space-x-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span>Pareto Optimal</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
                <span>Dominated</span>
              </span>
            </div>
          </div>

          <ParetoFrontierPlot points={recommendation.paretoPoints} />
        </div>
      )}
    </div>
  );
};
