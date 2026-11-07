import React, { useState } from 'react';
import { BenchmarkMetrics } from '../../types';

interface ComparisonChartsProps {
  results: BenchmarkMetrics[];
}

export const AccuracyDepthChart: React.FC<ComparisonChartsProps> = ({ results }) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const chartHeight = 180;
  const chartWidth = 320;
  const paddingLeft = 40;
  const paddingBottom = 30;
  const paddingTop = 20;
  const paddingRight = 20;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const barGroupWidth = innerWidth / (results.length || 1);
  const barWidth = Math.min(22, (barGroupWidth - 12) / 2);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex items-center justify-end space-x-4 text-[10px] font-mono text-slate-400 mb-2">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block" />
          <span>Ideal Accuracy</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-cyan-400 inline-block" />
          <span>Noisy Accuracy</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 select-none">
        {/* Y Axis Grid lines */}
        {[0, 25, 50, 75, 100].map(val => {
          const y = paddingTop + innerHeight - (val / 100) * innerHeight;
          return (
            <g key={val}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#1e293b"
                strokeDasharray="2 2"
              />
              <text
                x={paddingLeft - 6}
                y={y + 3}
                fill="#64748b"
                fontSize={9}
                fontFamily="monospace"
                textAnchor="end"
              >
                {val}%
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {results.map((r, i) => {
          const groupX = paddingLeft + i * barGroupWidth + 6;
          const idealH = Math.max(2, (r.accuracy) * innerHeight);
          const noisyH = Math.max(2, (r.noiseAccuracy) * innerHeight);

          const idealY = paddingTop + innerHeight - idealH;
          const noisyY = paddingTop + innerHeight - noisyH;

          return (
            <g
              key={r.encoding}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              {/* Ideal Bar */}
              <rect
                x={groupX}
                y={idealY}
                width={barWidth}
                height={idealH}
                rx={3}
                fill="#6366f1"
                className="transition-all hover:brightness-125"
              />
              {/* Noisy Bar */}
              <rect
                x={groupX + barWidth + 3}
                y={noisyY}
                width={barWidth}
                height={noisyH}
                rx={3}
                fill="#06b6d4"
                className="transition-all hover:brightness-125"
              />

              {/* X Axis Label */}
              <text
                x={groupX + barWidth + 1}
                y={chartHeight - 8}
                fill="#94a3b8"
                fontSize={10}
                fontFamily="monospace"
                fontWeight="600"
                textAnchor="middle"
              >
                {r.encoding.toUpperCase()}
              </text>

              {/* Hover Value Badge */}
              {hovered === i && (
                <text
                  x={groupX + barWidth + 1}
                  y={Math.min(idealY, noisyY) - 6}
                  fill="#ffffff"
                  fontSize={10}
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {(r.accuracy * 100).toFixed(0)}% / {(r.noiseAccuracy * 100).toFixed(0)}%
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const CircuitDepthBarChart: React.FC<ComparisonChartsProps> = ({ results }) => {
  const chartHeight = 180;
  const chartWidth = 320;
  const paddingLeft = 40;
  const paddingBottom = 30;
  const paddingTop = 20;
  const paddingRight = 20;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const maxVal = Math.max(...results.map(r => Math.max(r.depth, r.twoQubitGates)), 16);
  const barGroupWidth = innerWidth / (results.length || 1);
  const barWidth = Math.min(22, (barGroupWidth - 12) / 2);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex items-center justify-end space-x-4 text-[10px] font-mono text-slate-400 mb-2">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-violet-500 inline-block" />
          <span>Circuit Depth</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded bg-pink-500 inline-block" />
          <span>2-Qubit Gates (CX)</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 select-none">
        {[0, Math.round(maxVal / 2), maxVal].map((val, idx) => {
          const y = paddingTop + innerHeight - (val / maxVal) * innerHeight;
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#1e293b"
                strokeDasharray="2 2"
              />
              <text
                x={paddingLeft - 6}
                y={y + 3}
                fill="#64748b"
                fontSize={9}
                fontFamily="monospace"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          );
        })}

        {results.map((r, i) => {
          const groupX = paddingLeft + i * barGroupWidth + 6;
          const depthH = Math.max(2, (r.depth / maxVal) * innerHeight);
          const cxH = Math.max(2, (r.twoQubitGates / maxVal) * innerHeight);

          const depthY = paddingTop + innerHeight - depthH;
          const cxY = paddingTop + innerHeight - cxH;

          return (
            <g key={r.encoding} className="hover:opacity-90">
              <rect
                x={groupX}
                y={depthY}
                width={barWidth}
                height={depthH}
                rx={3}
                fill="#8b5cf6"
              />
              <rect
                x={groupX + barWidth + 3}
                y={cxY}
                width={barWidth}
                height={cxH}
                rx={3}
                fill="#ec4899"
              />
              <text
                x={groupX + barWidth + 1}
                y={chartHeight - 8}
                fill="#94a3b8"
                fontSize={10}
                fontFamily="monospace"
                fontWeight="600"
                textAnchor="middle"
              >
                {r.encoding.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const EncodingRadarProfile: React.FC<ComparisonChartsProps> = ({ results }) => {
  const size = 200;
  const center = size / 2;
  const radius = 70;

  const axes = ['Accuracy', 'F1 Score', 'Noise Robust', 'Gate Econ', 'Qubit Econ'];
  const angleStep = (2 * Math.PI) / axes.length;

  const maxGates = Math.max(...results.map(r => r.totalGates), 1);
  const maxQubits = Math.max(...results.map(r => r.qubits), 1);

  const colors: Record<string, string> = {
    basis: '#a855f7',
    angle: '#38bdf8',
    amplitude: '#ec4899',
    hybrid: '#10b981',
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex flex-wrap justify-center gap-3 text-[10px] font-mono text-slate-400 mb-1">
        {results.map(r => (
          <div key={r.encoding} className="flex items-center space-x-1">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: colors[r.encoding] || '#6366f1' }}
            />
            <span className="uppercase">{r.encoding}</span>
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-48 select-none">
        {/* Background Concentric Circles */}
        {[0.25, 0.5, 0.75, 1.0].map((level, idx) => (
          <circle
            key={idx}
            cx={center}
            cy={center}
            r={radius * level}
            fill="none"
            stroke="#1e293b"
            strokeWidth={1}
          />
        ))}

        {/* Axes Lines & Labels */}
        {axes.map((axis, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const labelX = center + (radius + 15) * Math.cos(angle);
          const labelY = center + (radius + 15) * Math.sin(angle);

          return (
            <g key={axis}>
              <line x1={center} y1={center} x2={x} y2={y} stroke="#334155" strokeWidth={1} />
              <text
                x={labelX}
                y={labelY + 3}
                fill="#94a3b8"
                fontSize={8}
                fontFamily="monospace"
                textAnchor="middle"
              >
                {axis}
              </text>
            </g>
          );
        })}

        {/* Radar Polygons for each encoding */}
        {results.map(r => {
          const values = [
            r.accuracy,
            r.f1Score,
            r.noiseRobustness / 100,
            1 - r.totalGates / (maxGates * 1.5),
            1 - r.qubits / (maxQubits * 1.5),
          ];

          const points = values
            .map((val, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const rDist = Math.max(0.05, Math.min(1, val)) * radius;
              const x = center + rDist * Math.cos(angle);
              const y = center + rDist * Math.sin(angle);
              return `${x},${y}`;
            })
            .join(' ');

          const strokeColor = colors[r.encoding] || '#6366f1';

          return (
            <polygon
              key={r.encoding}
              points={points}
              fill={strokeColor}
              fillOpacity={0.2}
              stroke={strokeColor}
              strokeWidth={1.5}
            />
          );
        })}
      </svg>
    </div>
  );
};

export const ParetoFrontierPlot: React.FC<{
  points: { encoding: string; accuracy: number; depth: number; qubits: number; isParetoOptimal: boolean }[];
}> = ({ points }) => {
  const chartWidth = 400;
  const chartHeight = 220;
  const pLeft = 50;
  const pRight = 30;
  const pTop = 20;
  const pBottom = 35;

  const innerW = chartWidth - pLeft - pRight;
  const innerH = chartHeight - pTop - pBottom;

  const minDepth = Math.max(1, Math.min(...points.map(p => p.depth)) - 2);
  const maxDepth = Math.max(...points.map(p => p.depth)) + 4;
  const minAcc = 50;
  const maxAcc = 100;

  return (
    <div className="w-full flex flex-col items-center">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56 select-none">
        {/* Y Grid lines */}
        {[50, 65, 80, 95, 100].map(val => {
          const y = pTop + innerH - ((val - minAcc) / (maxAcc - minAcc)) * innerH;
          return (
            <g key={val}>
              <line x1={pLeft} y1={y} x2={chartWidth - pRight} y2={y} stroke="#1e293b" strokeDasharray="2 2" />
              <text x={pLeft - 8} y={y + 3} fill="#64748b" fontSize={9} fontFamily="monospace" textAnchor="end">
                {val}%
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        <text
          x={chartWidth / 2}
          y={chartHeight - 6}
          fill="#94a3b8"
          fontSize={10}
          fontFamily="monospace"
          textAnchor="middle"
        >
          Circuit Depth (Lower is Better →)
        </text>

        {/* Y Axis Label */}
        <text
          x={14}
          y={chartHeight / 2}
          fill="#94a3b8"
          fontSize={10}
          fontFamily="monospace"
          textAnchor="middle"
          transform={`rotate(-90 14 ${chartHeight / 2})`}
        >
          Accuracy (%)
        </text>

        {/* Data points */}
        {points.map((p) => {
          const x = pLeft + ((p.depth - minDepth) / (maxDepth - minDepth)) * innerW;
          const y = pTop + innerH - (((p.accuracy * 100) - minAcc) / (maxAcc - minAcc)) * innerH;

          return (
            <g key={p.encoding} className="cursor-pointer">
              {p.isParetoOptimal && (
                <circle cx={x} cy={y} r={14} fill="#10b981" fillOpacity={0.15} className="animate-pulse" />
              )}
              <circle
                cx={x}
                cy={y}
                r={7}
                fill={p.isParetoOptimal ? '#10b981' : '#64748b'}
                stroke={p.isParetoOptimal ? '#34d399' : '#94a3b8'}
                strokeWidth={2}
              />
              <text
                x={x}
                y={y - 10}
                fill={p.isParetoOptimal ? '#34d399' : '#cbd5e1'}
                fontSize={10}
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {p.encoding.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
