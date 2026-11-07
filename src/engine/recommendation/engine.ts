import { BenchmarkMetrics, PriorityWeights, RecommendationOutput } from '../../types';

export function generateRecommendation(
  results: BenchmarkMetrics[],
  weights: PriorityWeights = {
    predictiveQuality: 40,
    resourceEfficiency: 25,
    qubitFootprint: 15,
    noiseRobustness: 20,
    lowError: 10,
  }
): RecommendationOutput {
  if (results.length === 0) {
    throw new Error('Cannot recommend without benchmark results.');
  }

  const totalWeight =
    weights.predictiveQuality +
    weights.resourceEfficiency +
    weights.qubitFootprint +
    weights.noiseRobustness +
    weights.lowError || 1;

  const wPred = weights.predictiveQuality / totalWeight;
  const wRes = weights.resourceEfficiency / totalWeight;
  const wQub = weights.qubitFootprint / totalWeight;
  const wNoise = weights.noiseRobustness / totalWeight;
  const wErr = weights.lowError / totalWeight;

  const maxAcc = Math.max(...results.map(r => r.accuracy), 1e-4);
  const minDepth = Math.min(...results.map(r => r.depth));
  const maxDepth = Math.max(...results.map(r => r.depth), 1);
  const minQubits = Math.min(...results.map(r => r.qubits));
  const maxQubits = Math.max(...results.map(r => r.qubits), 1);

  const scores: Record<string, number> = {};

  for (const r of results) {
    if (!r.feasible) {
      scores[r.encoding] = 0;
      continue;
    }

    const uPred = r.f1Score || r.accuracy;
    const depthSpan = maxDepth - minDepth || 1;
    const uDepth = 1 - (r.depth - minDepth) / depthSpan;
    const qubitSpan = maxQubits - minQubits || 1;
    const uQubits = 1 - (r.qubits - minQubits) / qubitSpan;
    const uNoise = r.noiseRobustness / 100;
    const uError = Math.max(0, 1 - r.estimatedError * 5);

    const composite =
      wPred * uPred +
      wRes * uDepth +
      wQub * uQubits +
      wNoise * uNoise +
      wErr * uError;

    scores[r.encoding] = parseFloat((composite * 100).toFixed(1));
  }

  const rankings = Object.keys(scores)
    .map(enc => ({ encoding: enc, score: scores[enc], rank: 0 }))
    .sort((a, b) => b.score - a.score);

  rankings.forEach((item, index) => {
    item.rank = index + 1;
  });

  const winner = (rankings[0]?.encoding || 'angle') as 'basis' | 'angle' | 'amplitude' | 'dense_angle' | 'data_reuploading' | 'hybrid';
  const winnerData = results.find(r => r.encoding === winner)!;

  const pros: string[] = [];
  const cons: string[] = [];
  const alternativeComparisons: string[] = [];

  if (winnerData.accuracy >= 0.75) {
    pros.push(`Attained superior predictive performance with ${(winnerData.accuracy * 100).toFixed(1)}% test accuracy and ${winnerData.f1Score.toFixed(3)} F1 score.`);
  } else {
    pros.push(`Achieved balanced classification accuracy of ${(winnerData.accuracy * 100).toFixed(1)}% within resource boundaries.`);
  }

  if (winnerData.depth <= minDepth + 2) {
    pros.push(`Produces a shallow state-preparation circuit (depth ${winnerData.depth}), preserving quantum coherence.`);
  }

  if (winnerData.noiseRobustness >= 80) {
    pros.push(`Exhibits strong noise tolerance with ${winnerData.noiseRobustness.toFixed(1)}% performance retention under calibrated noise models.`);
  }

  if (winnerData.qubits === maxQubits && maxQubits > minQubits) {
    cons.push(`Demands higher logical qubit allocation (${winnerData.qubits} qubits) compared to compressed logarithmic alternatives.`);
  }

  if (winnerData.twoQubitGates > 5) {
    cons.push(`Requires ${winnerData.twoQubitGates} two-qubit entangling gates, which are more susceptible to physical CNOT drift.`);
  }

  for (const r of results) {
    if (r.encoding === winner) continue;
    if (r.encoding === 'amplitude') {
      alternativeComparisons.push(
        `Amplitude Encoding compresses features into ${r.qubits} qubits (vs ${winnerData.qubits}), but increases circuit depth to ${r.depth} and exhibits ${r.noiseRobustness.toFixed(1)}% noise robustness.`
      );
    } else if (r.encoding === 'basis') {
      alternativeComparisons.push(
        `Basis Encoding executed with ${r.depth} depth, but discrete binarization yielded ${(r.accuracy * 100).toFixed(1)}% accuracy due to continuous information loss.`
      );
    } else if (r.encoding === 'dense_angle') {
      alternativeComparisons.push(`Dense angle packs pairs of features into ${r.qubits} qubits, achieving ${(r.accuracy*100).toFixed(1)}% accuracy with depth ${r.depth}.`);
    } else if (r.encoding === 'data_reuploading') {
      alternativeComparisons.push(`Data re-uploading repeats feature embedding after variational layers and achieved ${(r.accuracy*100).toFixed(1)}% accuracy with depth ${r.depth}.`);
    } else if (r.encoding === 'angle') {
      alternativeComparisons.push(
        `Angle Encoding achieved ${(r.accuracy * 100).toFixed(1)}% accuracy with depth ${r.depth}, remaining competitive for continuous single-qubit rotations.`
      );
    }
  }

  const primaryRationale = `${winner.toUpperCase()} encoding was designated optimal because it attained a composite utility score of ${scores[winner]}/100 under the current priority weighting. It maintained ${(winnerData.accuracy * 100).toFixed(1)}% accuracy at depth ${winnerData.depth} with ${winnerData.twoQubitGates} entangling gates.`;

  const paretoPoints = results.map(r => {
    const isDominated = results.some(
      other =>
        other.encoding !== r.encoding &&
        other.feasible &&
        other.accuracy >= r.accuracy &&
        other.depth <= r.depth &&
        (other.accuracy > r.accuracy || other.depth < r.depth)
    );
    return {
      encoding: r.encoding,
      accuracy: r.accuracy,
      depth: r.depth,
      qubits: r.qubits,
      noiseRobustness: r.noiseRobustness,
      isParetoOptimal: !isDominated && r.feasible,
    };
  });

  return {
    recommendedEncoding: winner,
    overallScore: scores[winner] || 0,
    scores,
    rankings,
    explanation: {
      primaryRationale,
      pros,
      cons: cons.length > 0 ? cons : ['Requires monitoring of scaling behavior on higher feature counts.'],
      alternativeComparisons,
    },
    paretoPoints,
  };
}
