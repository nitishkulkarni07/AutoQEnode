import { ExperimentRecord } from '../../types';

let EXPERIMENT_HISTORY: ExperimentRecord[] = [
  {
    id: 'EXP-QENC-INITIAL-01',
    createdAt: new Date().toISOString(),
    title: 'Controlled Botanical Subspace Benchmark',
    datasetName: 'iris_quantum.csv',
    targetColumn: 'target',
    qubitBudget: 4,
    mode: 'controlled_benchmark',
    noiseLevel: 'low',
    results: [
      {
        encoding: 'basis',
        accuracy: 0.80,
        precision: 0.80,
        recall: 0.80,
        f1Score: 0.80,
        trainingTimeMs: 124,
        qubits: 4,
        depth: 7,
        totalGates: 15,
        twoQubitGates: 4,
        noiseAccuracy: 0.75,
        noiseRobustness: 93.8,
        estimatedError: 0.045,
        feasible: true,
      },
      {
        encoding: 'angle',
        accuracy: 0.95,
        precision: 0.94,
        recall: 0.96,
        f1Score: 0.95,
        trainingTimeMs: 148,
        qubits: 4,
        depth: 8,
        totalGates: 16,
        twoQubitGates: 4,
        noiseAccuracy: 0.90,
        noiseRobustness: 94.7,
        estimatedError: 0.048,
        feasible: true,
      },
      {
        encoding: 'amplitude',
        accuracy: 0.90,
        precision: 0.89,
        recall: 0.91,
        f1Score: 0.90,
        trainingTimeMs: 162,
        qubits: 2,
        depth: 14,
        totalGates: 22,
        twoQubitGates: 8,
        noiseAccuracy: 0.80,
        noiseRobustness: 88.9,
        estimatedError: 0.082,
        feasible: true,
      },
    ],
    recommendation: {
      recommendedEncoding: 'angle',
      overallScore: 92.4,
      scores: { angle: 92.4, basis: 73.1, amplitude: 81.6 },
      rankings: [
        { encoding: 'angle', score: 92.4, rank: 1 },
        { encoding: 'amplitude', score: 81.6, rank: 2 },
        { encoding: 'basis', score: 73.1, rank: 3 },
      ],
      explanation: {
        primaryRationale: 'ANGLE encoding was designated optimal because it attained a composite utility score of 92.4/100 under current priorities.',
        pros: [
          'Attained superior predictive performance with 95.0% test accuracy and 0.950 F1 score.',
          'Maintains high noise robustness (94.7%) under depolarizing channels.',
        ],
        cons: ['Demands 4 logical qubits compared to 2 qubits for amplitude encoding.'],
        alternativeComparisons: [
          'Amplitude Encoding compressed features into 2 qubits, but depth expanded to 14 with 8 CNOTs.',
        ],
      },
      paretoPoints: [
        { encoding: 'angle', accuracy: 0.95, depth: 8, qubits: 4, noiseRobustness: 94.7, isParetoOptimal: true },
        { encoding: 'amplitude', accuracy: 0.90, depth: 14, qubits: 2, noiseRobustness: 88.9, isParetoOptimal: true },
        { encoding: 'basis', accuracy: 0.80, depth: 7, qubits: 4, noiseRobustness: 93.8, isParetoOptimal: false },
      ],
    },
    manifest: {
      manifestId: 'MAN-7A9B1C',
      timestamp: new Date().toISOString(),
      datasetHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      datasetRows: 100,
      datasetFeatures: ['sepal_length', 'sepal_width', 'petal_length', 'petal_width'],
      targetColumn: 'target',
      trainRatio: 0.75,
      randomSeed: 42,
      preprocessing: {
        scaling: 'minmax_pi',
        imputation: 'mean',
        varianceRetained: 99.4,
      },
      qnnArchitecture: {
        ansatzLayers: 1,
        rotationGates: ['Ry', 'Rz'],
        entanglement: 'linear',
        optimizer: 'parameter_shift_gd',
        learningRate: 0.15,
        epochs: 10,
      },
      backendProfile: 'noisy_sim',
      noiseModel: {
        level: 'low',
        depolarizingProb: 0.015,
        bitFlipProb: 0.008,
        phaseFlipProb: 0.008,
        readoutErrorProb: 0.02,
      },
      environment: {
        platform: 'Linux x86_64',
        qiskitCompatibility: 'v1.1.0',
        autoQEncodeVersion: '2.4.0-research',
      },
    },
  },
];

export function getExperiments(): ExperimentRecord[] {
  return EXPERIMENT_HISTORY;
}

export function saveExperiment(experiment: ExperimentRecord): ExperimentRecord {
  EXPERIMENT_HISTORY.unshift(experiment);
  if (EXPERIMENT_HISTORY.length > 50) {
    EXPERIMENT_HISTORY = EXPERIMENT_HISTORY.slice(0, 50);
  }
  return experiment;
}

export function deleteExperiment(id: string): boolean {
  const initialLen = EXPERIMENT_HISTORY.length;
  EXPERIMENT_HISTORY = EXPERIMENT_HISTORY.filter(e => e.id !== id);
  return EXPERIMENT_HISTORY.length < initialLen;
}
