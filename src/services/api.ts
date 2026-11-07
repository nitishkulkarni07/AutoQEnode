import {
  DemoDatasetInfo,
  DatasetAnalysis,
  PreprocessingConfig,
  PreprocessedData,
  CircuitDefinition,
  BackendProfile,
  TranspilationResult,
  BenchmarkMetrics,
  PriorityWeights,
  RecommendationOutput,
  AdaptiveOptimizationResult,
  ExperimentRecord,
} from '../types';

import { DEMO_DATASETS, DemoDataset } from '../engine/data/datasets';
import { parseCSV, analyzeDataset } from '../engine/analysis/datasetAnalyzer';
import { preprocessDataset } from '../engine/analysis/preprocessor';
import { generateCircuit } from '../engine/quantum/circuits';
import { BACKEND_PROFILES, transpileCircuit } from '../engine/quantum/transpiler';
import {
  VariationalClassifier,
  VQCConfig,
  NOISE_PRESETS,
} from '../engine/quantum/simulator';
import { runAdaptiveHybridOptimization, AdaptiveConstraints } from '../engine/quantum/adaptive';
import { generateRecommendation } from '../engine/recommendation/engine';
import {
  getExperiments,
  saveExperiment,
  deleteExperiment,
} from '../engine/storage/history';

export const api = {
  // Health
  async getHealth(): Promise<{ status: string; platform: string; qiskitCompatible: boolean }> {
    return {
      status: 'operational',
      platform: 'AutoQEncode Hybrid Classical-Quantum Engine v2.4.0',
      qiskitCompatible: true,
    };
  },

  // Demo datasets
  async getDemoDatasets(): Promise<DemoDatasetInfo[]> {
    return Object.values(DEMO_DATASETS).map((d: DemoDataset) => ({
      id: d.id,
      name: d.name,
      filename: d.filename,
      description: d.description,
      suggestedTarget: d.suggestedTarget,
      rows: d.rows,
      columns: d.columns,
      features: d.features,
      category: d.category,
    }));
  },

  async getDemoDatasetContent(id: string): Promise<{ dataset: { csvContent: string; name: string; suggestedTarget: string } }> {
    const d: DemoDataset = DEMO_DATASETS[id] || DEMO_DATASETS['small_medical_demo'];
    return {
      dataset: {
        csvContent: d.csvContent,
        name: d.name,
        suggestedTarget: d.suggestedTarget,
      },
    };
  },

  // Upload & analyze
  async uploadCSV(filename: string, csvContent: string): Promise<{ analysis: DatasetAnalysis }> {
    const { headers, rows } = parseCSV(csvContent);
    const analysis = analyzeDataset(filename, headers, rows);
    return { analysis };
  },

  async analyzeDataset(filename: string, csvContent: string): Promise<DatasetAnalysis> {
    const { headers, rows } = parseCSV(csvContent);
    return analyzeDataset(filename, headers, rows);
  },

  // Preprocess
  async preprocessDataset(csvContent: string, config: PreprocessingConfig): Promise<PreprocessedData> {
    const { rows } = parseCSV(csvContent);
    return preprocessDataset(rows, config);
  },

  // Qubit budget
  async evaluateQubitBudget(numFeatures: number, availableQubits: number) {
    const budget = Math.max(2, Math.min(32, availableQubits));
    const n = Math.max(1, numFeatures);

    const basisReq = n;
    const angleReq = n;
    const ampReq = Math.max(1, Math.ceil(Math.log2(n)));

    const getStatus = (req: number) => {
      if (req <= budget) return { status: 'feasible', label: 'Feasible', color: 'emerald' };
      if (req <= budget + 2) return { status: 'expensive', label: 'Exceeds by <=2', color: 'amber' };
      return { status: 'infeasible', label: 'Infeasible', color: 'rose' };
    };

    return {
      availableQubits: budget,
      featuresCount: n,
      evaluations: {
        basis: { requiredQubits: basisReq, ...getStatus(basisReq) },
        angle: { requiredQubits: angleReq, ...getStatus(angleReq) },
        dense_angle: { requiredQubits: Math.ceil(n / 2), ...getStatus(Math.ceil(n / 2)) },
        data_reuploading: { requiredQubits: n, ...getStatus(n) },
        amplitude: { requiredQubits: ampReq, ...getStatus(ampReq) },
        hybrid: { requiredQubits: Math.min(budget, Math.max(2, Math.ceil(n / 2))), status: 'feasible', label: 'Feasible' },
      },
    };
  },

  // Circuit generation
  async generateCircuit(
    encoding: 'basis' | 'angle' | 'amplitude' | 'dense_angle' | 'data_reuploading' | 'hybrid',
    numFeatures: number,
    numQubits: number,
    includeAnsatz: boolean = true,
    ansatzLayers: number = 1
  ): Promise<CircuitDefinition> {
    return generateCircuit(encoding, numFeatures, numQubits, includeAnsatz, ansatzLayers);
  },

  // Backends & Transpilation
  async getBackends(): Promise<BackendProfile[]> {
    return Object.values(BACKEND_PROFILES);
  },

  async transpileCircuit(circuit: CircuitDefinition, backendId: string): Promise<{ transpilation: TranspilationResult; backend: BackendProfile }> {
    const backend = BACKEND_PROFILES[backendId] || BACKEND_PROFILES['noisy_sim'];
    const transpilation = transpileCircuit(circuit, backend);
    return { transpilation, backend };
  },

  // Controlled Benchmark (Fair Academic Evaluation)
  async runControlledBenchmark(payload: {
    trainX: number[][];
    trainY: number[];
    testX: number[][];
    testY: number[];
    featureNames: string[];
    qubitBudget: number;
    ansatzLayers?: number;
    epochs?: number;
    learningRate?: number;
    noiseLevel?: string;
    seed?: number;
    backendId?: string;
  }): Promise<{
    benchmarkId: string;
    results: BenchmarkMetrics[];
    recommendation: RecommendationOutput;
    fairnessAudit: any;
  }> {
    const {
      trainX,
      trainY,
      testX,
      testY,
      featureNames,
      qubitBudget,
      ansatzLayers = 1,
      epochs = 8,
      learningRate = 0.15,
      noiseLevel = 'low',
      seed = 42,
      backendId = 'noisy_sim',
    } = payload;

    const numFeatures = featureNames?.length || trainX[0]?.length || 4;
    const budget = qubitBudget || 4;
    const noise = NOISE_PRESETS[noiseLevel] || NOISE_PRESETS['low'];
    const backend = BACKEND_PROFILES[backendId] || BACKEND_PROFILES['noisy_sim'];

    const encodingsToTest = ['basis', 'angle', 'amplitude', 'dense_angle', 'data_reuploading'] as const;
    const results: BenchmarkMetrics[] = [];

    for (const enc of encodingsToTest) {
      const reqQubits =
        enc === 'amplitude'
          ? Math.max(1, Math.ceil(Math.log2(numFeatures)))
          : enc === 'dense_angle' ? Math.ceil(numFeatures / 2) : numFeatures;

      // Browser statevector allocation is exponential; do not exhaust client memory.
      const effectiveQubits = Math.max(1, Math.min(8, budget, reqQubits));
      const isFeasible = reqQubits <= budget && reqQubits <= 8;

      const circuit = generateCircuit(enc, numFeatures, effectiveQubits, true, ansatzLayers);
      const transpile = transpileCircuit(circuit, backend);

      const vqcConfig: VQCConfig = {
        numQubits: effectiveQubits,
        numLayers: ansatzLayers,
        learningRate,
        epochs,
        seed,
        entanglement: 'linear',
      };

      const vqc = new VariationalClassifier(vqcConfig);
      const { trainingTimeMs } = isFeasible ? vqc.train(trainX, trainY, enc) : { trainingTimeMs: 0 };

      const emptyEval = { accuracy: 0, precision: 0, recall: 0, f1Score: 0 };
      const idealEval = isFeasible ? vqc.evaluate(testX, testY, enc, undefined) : emptyEval;
      const noisyEval = isFeasible ? vqc.evaluate(testX, testY, enc, noise) : emptyEval;

      const noiseRobustness =
        idealEval.accuracy > 0
          ? parseFloat(((noisyEval.accuracy / idealEval.accuracy) * 100).toFixed(1))
          : 100;

      results.push({
        encoding: enc,
        accuracy: idealEval.accuracy,
        precision: idealEval.precision,
        recall: idealEval.recall,
        f1Score: idealEval.f1Score,
        trainingTimeMs,
        qubits: effectiveQubits,
        depth: transpile.transpiledDepth || circuit.depth,
        totalGates: transpile.transpiledGates || circuit.totalGates,
        twoQubitGates: transpile.transpiled2QGates || circuit.twoQubitGates,
        noiseAccuracy: noisyEval.accuracy,
        noiseRobustness,
        estimatedError: parseFloat((1 - transpile.estimatedFidelity).toFixed(4)),
        feasible: isFeasible && transpile.feasible,
      });
    }

    const recommendation = generateRecommendation(results);

    return {
      benchmarkId: `BM-${Date.now().toString(36).toUpperCase()}`,
      results,
      recommendation,
      fairnessAudit: {
        sameDatasetSplit: true,
        sameFeatureSet: true,
        browserStatevectorLimit: 'At most 8 qubits; infeasible rows are not trained and must not be used to infer performance',
        sameQnnAnsatz: `Ry-Rz (${ansatzLayers} layers) + Linear CNOT entanglement; data re-uploading adds repeated non-trainable data gates`,
        sameOptimizer: 'Parameter-Shift Analytic GD',
        sameEpochs: epochs,
        sameSeed: seed,
        controlledVariableOnly: 'Quantum Data Encoding Strategy (including re-uploading schedule)',
      },
    };
  },

  // Adaptive Hybrid Optimization
  async runAdaptiveOptimization(payload: {
    featureNames: string[];
    featureTypes: Record<string, string>;
    trainX: number[][];
    trainY: number[];
    testX: number[][];
    testY: number[];
    constraints: any;
    noiseLevel?: string;
  }): Promise<{ adaptiveResult: AdaptiveOptimizationResult }> {
    const {
      featureNames,
      featureTypes,
      trainX,
      trainY,
      testX,
      testY,
      constraints,
      noiseLevel = 'low',
    } = payload;

    const noise = NOISE_PRESETS[noiseLevel] || NOISE_PRESETS['low'];
    const defaultConstraints: AdaptiveConstraints = {
      qubitBudget: 4,
      maxDepth: 30,
      max2QGates: 12,
      maxError: 0.1,
      minAccuracy: 0.75,
      maxIterations: 5,
      backendId: 'noisy_sim',
      ...constraints,
    };

    const adaptiveResult = runAdaptiveHybridOptimization(
      featureNames,
      featureTypes || {},
      trainX,
      trainY,
      testX,
      testY,
      defaultConstraints,
      noise
    );

    return { adaptiveResult };
  },

  // Recommendation engine
  async getRecommendation(results: BenchmarkMetrics[], weights: PriorityWeights): Promise<RecommendationOutput> {
    return generateRecommendation(results, weights);
  },

  // Experiment History
  async getExperiments(): Promise<ExperimentRecord[]> {
    return getExperiments();
  },

  async saveExperiment(record: ExperimentRecord): Promise<ExperimentRecord> {
    return saveExperiment(record);
  },

  async deleteExperiment(id: string): Promise<boolean> {
    return deleteExperiment(id);
  },
};
