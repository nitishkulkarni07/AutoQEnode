export type ViewMode =
  | 'landing'
  | 'dashboard'
  | 'analyzer'
  | 'preprocessing'
  | 'budget'
  | 'encoding_lab'
  | 'circuit_studio'
  | 'benchmark'
  | 'backend_profiler'
  | 'adaptive_lab'
  | 'recommendation'
  | 'history_reports';

export interface DemoDatasetInfo {
  id: string;
  name: string;
  filename: string;
  description: string;
  suggestedTarget: string;
  rows: number;
  columns: number;
  features: string[];
  category: 'Scientific' | 'Medical' | 'Synthetic';
}

export interface FeatureStats {
  name: string;
  type: 'continuous' | 'binary' | 'categorical';
  uniqueValues: number;
  missingCount: number;
  missingPercent: number;
  mean: number;
  variance: number;
  stdDev: number;
  min: number;
  max: number;
  range: number;
  sparsity: number;
  entropy: number;
  targetCorrelation: number;
  mutualInformation: number;
  selectionRank: number;
  suggestedEncoding: 'basis' | 'angle' | 'amplitude';
  encodingRationale: string;
}

export interface DatasetAnalysis {
  filename: string;
  totalRows: number;
  totalColumns: number;
  missingValuesTotal: number;
  duplicateRows: number;
  numericalFeaturesCount: number;
  categoricalFeaturesCount: number;
  targetCandidate: string;
  classDistribution: Record<string, number>;
  features: FeatureStats[];
  correlationMatrix: { x: string; y: string; correlation: number }[];
  rawPreview: Record<string, any>[];
}

export interface PreprocessingConfig {
  imputation: 'mean' | 'median' | 'most_frequent' | 'drop';
  categoricalEncoding: 'ordinal' | 'one_hot';
  scaling: 'minmax_pi' | 'minmax_unit' | 'standard' | 'none';
  selectedFeatures: string[];
  targetColumn: string;
  trainRatio: number;
  seed: number;
}

export interface PreprocessedData {
  trainX: number[][];
  trainY: number[];
  testX: number[][];
  testY: number[];
  featureNames: string[];
  scalerParams: Record<string, { min: number; max: number; mean: number; std: number }>;
  informationLoss: {
    droppedRows: number;
    imputedValuesCount: number;
    varianceRetainedPercent: number;
    notes: string[];
  };
}

export interface CircuitGate {
  id: string;
  name: string;
  qubits: number[];
  controlQubits?: number[];
  params?: string[];
  column: number;
}

export interface CircuitDefinition {
  encodingType: 'basis' | 'angle' | 'amplitude' | 'dense_angle' | 'data_reuploading' | 'hybrid';
  numQubits: number;
  depth: number;
  totalGates: number;
  singleQubitGates: number;
  twoQubitGates: number;
  estimatedError: number;
  gates: CircuitGate[];
  qasm2: string;
  qasm3: string;
  complexity: {
    qubitScaling: string;
    depthScaling: string;
    twoQubitScaling: string;
    suitableData: string;
  };
}

export interface BackendProfile {
  id: string;
  name: string;
  category: 'Local Simulator' | 'Emulated IBM Hardware' | 'Custom';
  usableQubits: number;
  couplingMap: [number, number][];
  nativeGates: string[];
  singleQubitError: number;
  twoQubitError: number;
  readoutError: number;
  coherenceT1Us: number;
  coherenceT2Us: number;
  maxShots: number;
  maxCircuitDepth: number;
  description: string;
}

export interface TranspilationResult {
  feasible: boolean;
  rejectionReason?: string;
  backendId: string;
  originalDepth: number;
  transpiledDepth: number;
  originalGates: number;
  transpiledGates: number;
  original2QGates: number;
  transpiled2QGates: number;
  swapCount: number;
  routingOverheadPercent: number;
  physicalQubitsUsed: number;
  estimatedFidelity: number;
  executionCostUnits: number;
}

export interface BenchmarkMetrics {
  encoding: 'basis' | 'angle' | 'amplitude' | 'dense_angle' | 'data_reuploading' | 'hybrid';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingTimeMs: number;
  qubits: number;
  depth: number;
  totalGates: number;
  twoQubitGates: number;
  noiseAccuracy: number;
  noiseRobustness: number;
  estimatedError: number;
  feasible: boolean;
}

export interface PriorityWeights {
  predictiveQuality: number;
  resourceEfficiency: number;
  qubitFootprint: number;
  noiseRobustness: number;
  lowError: number;
}

export interface RecommendationOutput {
  recommendedEncoding: 'basis' | 'angle' | 'amplitude' | 'dense_angle' | 'data_reuploading' | 'hybrid';
  overallScore: number;
  scores: Record<string, number>;
  rankings: { encoding: string; score: number; rank: number }[];
  explanation: {
    primaryRationale: string;
    pros: string[];
    cons: string[];
    alternativeComparisons: string[];
  };
  paretoPoints: {
    encoding: string;
    accuracy: number;
    depth: number;
    qubits: number;
    noiseRobustness: number;
    isParetoOptimal: boolean;
  }[];
}

export interface IterationRecord {
  iteration: number;
  featureGrouping: {
    basisFeatures: string[];
    angleFeatures: string[];
    amplitudeFeatures: string[];
  };
  qubitsRequired: number;
  logicalDepth: number;
  transpiledDepth: number;
  twoQubitGates: number;
  estimatedError: number;
  idealAccuracy: number;
  noisyAccuracy: number;
  noiseRobustness: number;
  status: 'passed' | 'rejected' | 'pareto_optimal';
  decisionRationale: string;
  adaptationAction: string;
}

export interface AdaptiveOptimizationResult {
  completed: boolean;
  totalIterations: number;
  iterations: IterationRecord[];
  finalCircuit: CircuitDefinition;
  optimalGrouping: {
    basisFeatures: string[];
    angleFeatures: string[];
    amplitudeFeatures: string[];
  };
  paretoStatus: string;
  reproducibilityFingerprint: string;
}

export interface ReproducibilityManifest {
  manifestId: string;
  timestamp: string;
  datasetHash: string;
  datasetRows: number;
  datasetFeatures: string[];
  targetColumn: string;
  trainRatio: number;
  randomSeed: number;
  preprocessing: {
    scaling: string;
    imputation: string;
    varianceRetained: number;
  };
  qnnArchitecture: {
    ansatzLayers: number;
    rotationGates: string[];
    entanglement: string;
    optimizer: string;
    learningRate: number;
    epochs: number;
  };
  backendProfile: string;
  noiseModel: {
    level: string;
    depolarizingProb: number;
    bitFlipProb: number;
    phaseFlipProb: number;
    readoutErrorProb: number;
  };
  environment: {
    platform: string;
    qiskitCompatibility: string;
    autoQEncodeVersion: string;
  };
}

export interface ExperimentRecord {
  id: string;
  createdAt: string;
  title: string;
  datasetName: string;
  targetColumn: string;
  qubitBudget: number;
  mode: 'controlled_benchmark' | 'adaptive_hybrid';
  noiseLevel: string;
  results: BenchmarkMetrics[];
  recommendation: RecommendationOutput;
  manifest: ReproducibilityManifest;
}
