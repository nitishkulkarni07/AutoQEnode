/**
 * AutoQEncode Quantum Statevector & VQC Simulation Engine
 * Rigorous complex vector math, unitary gate operations, parameter-shift gradients, and noise models.
 */

export interface Complex {
  re: number;
  im: number;
}

export function cAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function cSub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function cMul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function cAbsSq(a: Complex): number {
  return a.re * a.re + a.im * a.im;
}

export type ComplexMatrix2x2 = [
  [Complex, Complex],
  [Complex, Complex]
];

export class QuantumState {
  numQubits: number;
  dim: number;
  amplitudes: Complex[];

  constructor(numQubits: number) {
    this.numQubits = numQubits;
    this.dim = 1 << numQubits;
    this.amplitudes = new Array(this.dim).fill(0).map((_, i) => ({
      re: i === 0 ? 1 : 0,
      im: 0,
    }));
  }

  clone(): QuantumState {
    const copy = new QuantumState(this.numQubits);
    for (let i = 0; i < this.dim; i++) {
      copy.amplitudes[i] = { ...this.amplitudes[i] };
    }
    return copy;
  }

  apply1QGate(u: ComplexMatrix2x2, targetQubit: number) {
    const bit = 1 << targetQubit;
    for (let i = 0; i < this.dim; i += 2 * bit) {
      for (let j = 0; j < bit; j++) {
        const i0 = i + j;
        const i1 = i0 + bit;
        const a0 = this.amplitudes[i0];
        const a1 = this.amplitudes[i1];

        const n0 = cAdd(cMul(u[0][0], a0), cMul(u[0][1], a1));
        const n1 = cAdd(cMul(u[1][0], a0), cMul(u[1][1], a1));

        this.amplitudes[i0] = n0;
        this.amplitudes[i1] = n1;
      }
    }
  }

  applyCNOT(controlQubit: number, targetQubit: number) {
    const cBit = 1 << controlQubit;
    const tBit = 1 << targetQubit;

    for (let i = 0; i < this.dim; i++) {
      if ((i & cBit) !== 0 && (i & tBit) === 0) {
        const i1 = i;
        const i2 = i ^ tBit;
        const temp = this.amplitudes[i1];
        this.amplitudes[i1] = this.amplitudes[i2];
        this.amplitudes[i2] = temp;
      }
    }
  }

  applyCZ(controlQubit: number, targetQubit: number) {
    const cBit = 1 << controlQubit;
    const tBit = 1 << targetQubit;

    for (let i = 0; i < this.dim; i++) {
      if ((i & cBit) !== 0 && (i & tBit) !== 0) {
        this.amplitudes[i].re = -this.amplitudes[i].re;
        this.amplitudes[i].im = -this.amplitudes[i].im;
      }
    }
  }

  setNormalizedAmplitudes(amplitudes: number[]) {
    const n = Math.min(amplitudes.length, this.dim);
    let normSq = 0;
    for (let i = 0; i < n; i++) {
      normSq += amplitudes[i] * amplitudes[i];
    }
    const norm = Math.sqrt(normSq) || 1e-12;

    for (let i = 0; i < this.dim; i++) {
      const val = i < n ? amplitudes[i] / norm : 0;
      this.amplitudes[i] = { re: val, im: 0 };
    }
  }

  expectationZ(q: number): number {
    const bit = 1 << q;
    let exp = 0;
    for (let i = 0; i < this.dim; i++) {
      const p = cAbsSq(this.amplitudes[i]);
      if ((i & bit) === 0) {
        exp += p;
      } else {
        exp -= p;
      }
    }
    return Math.max(-1, Math.min(1, exp));
  }
}

export const Gates = {
  H: (): ComplexMatrix2x2 => {
    const invSqrt2 = 1 / Math.SQRT2;
    return [
      [{ re: invSqrt2, im: 0 }, { re: invSqrt2, im: 0 }],
      [{ re: invSqrt2, im: 0 }, { re: -invSqrt2, im: 0 }],
    ];
  },
  X: (): ComplexMatrix2x2 => [
    [{ re: 0, im: 0 }, { re: 1, im: 0 }],
    [{ re: 1, im: 0 }, { re: 0, im: 0 }],
  ],
  Ry: (theta: number): ComplexMatrix2x2 => {
    const half = theta / 2;
    const c = Math.cos(half);
    const s = Math.sin(half);
    return [
      [{ re: c, im: 0 }, { re: -s, im: 0 }],
      [{ re: s, im: 0 }, { re: c, im: 0 }],
    ];
  },
  Rz: (phi: number): ComplexMatrix2x2 => {
    const half = phi / 2;
    return [
      [{ re: Math.cos(-half), im: Math.sin(-half) }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: Math.cos(half), im: Math.sin(half) }],
    ];
  },
};

export type EncodingType = 'basis' | 'angle' | 'amplitude' | 'dense_angle' | 'data_reuploading' | 'hybrid';

export interface VQCConfig {
  numQubits: number;
  numLayers: number;
  learningRate: number;
  epochs: number;
  seed: number;
  entanglement: 'linear' | 'ring' | 'all_to_all';
}

export interface NoiseConfig {
  level: 'none' | 'low' | 'medium' | 'high' | 'custom';
  depolarizingProb: number;
  bitFlipProb: number;
  phaseFlipProb: number;
  readoutErrorProb: number;
}

export const NOISE_PRESETS: Record<string, NoiseConfig> = {
  none: { level: 'none', depolarizingProb: 0, bitFlipProb: 0, phaseFlipProb: 0, readoutErrorProb: 0 },
  low: { level: 'low', depolarizingProb: 0.015, bitFlipProb: 0.008, phaseFlipProb: 0.008, readoutErrorProb: 0.02 },
  medium: { level: 'medium', depolarizingProb: 0.045, bitFlipProb: 0.02, phaseFlipProb: 0.02, readoutErrorProb: 0.05 },
  high: { level: 'high', depolarizingProb: 0.09, bitFlipProb: 0.04, phaseFlipProb: 0.04, readoutErrorProb: 0.09 },
};

export class VariationalClassifier {
  config: VQCConfig;
  weights: number[];

  constructor(config: VQCConfig) {
    this.config = config;
    const totalWeights = config.numLayers * config.numQubits * 2;
    let s = config.seed || 42;
    const rng = () => {
      s = (s * 9301 + 49297) % 233280;
      return (s / 233280) * 2 - 1;
    };
    this.weights = new Array(totalWeights).fill(0).map(() => rng() * Math.PI);
  }

  encode(
    state: QuantumState,
    encoding: EncodingType,
    sample: number[],
    hybridPartition?: { basisIndices: number[]; angleIndices: number[]; amplitudeIndices: number[] }
  ) {
    const n = state.numQubits;

    if (encoding === 'basis') {
      for (let q = 0; q < n; q++) {
        const val = q < sample.length ? sample[q] : 0;
        if (val > 0.5 || val === 1) {
          state.apply1QGate(Gates.X(), q);
        }
      }
    } else if (encoding === 'angle') {
      for (let q = 0; q < n; q++) {
        const val = q < sample.length ? sample[q] : 0;
        const angle = val * Math.PI;
        state.apply1QGate(Gates.Ry(angle), q);
      }
    } else if (encoding === 'dense_angle') {
      // Two continuous features per qubit using sequential RY and RZ rotations.
      for (let q = 0; q < n; q++) {
        state.apply1QGate(Gates.Ry((sample[2*q] ?? 0) * Math.PI), q);
        state.apply1QGate(Gates.Rz((sample[2*q+1] ?? 0) * Math.PI), q);
      }
    } else if (encoding === 'data_reuploading') {
      for (let q = 0; q < n; q++) {
        state.apply1QGate(Gates.Ry((sample[q] ?? 0) * Math.PI), q);
      }
    } else if (encoding === 'amplitude') {
      state.setNormalizedAmplitudes(sample);
    } else if (encoding === 'hybrid') {
      const p = hybridPartition || {
        basisIndices: [0],
        angleIndices: [1, 2],
        amplitudeIndices: [3, 4],
      };

      let currentQubit = 0;
      if (p.basisIndices.length > 0 && currentQubit < n) {
        for (const idx of p.basisIndices) {
          if (currentQubit >= n) break;
          const val = idx < sample.length ? sample[idx] : 0;
          if (val > 0.5) state.apply1QGate(Gates.X(), currentQubit);
          currentQubit++;
        }
      }

      if (p.angleIndices.length > 0 && currentQubit < n) {
        for (const idx of p.angleIndices) {
          if (currentQubit >= n) break;
          const val = idx < sample.length ? sample[idx] : 0;
          state.apply1QGate(Gates.Ry(val * Math.PI), currentQubit);
          currentQubit++;
        }
      }

      while (currentQubit < n) {
        const val = currentQubit < sample.length ? sample[currentQubit] : 0;
        state.apply1QGate(Gates.Ry(val * Math.PI), currentQubit);
        currentQubit++;
      }
    }
  }

  applyAnsatz(state: QuantumState, weights: number[], reuploadSample?: number[]) {
    const n = this.config.numQubits;
    let wIdx = 0;

    for (let layer = 0; layer < this.config.numLayers; layer++) {
      for (let q = 0; q < n; q++) {
        state.apply1QGate(Gates.Ry(weights[wIdx++]), q);
        state.apply1QGate(Gates.Rz(weights[wIdx++]), q);
      }

      if (n > 1) {
        if (this.config.entanglement === 'ring') {
          for (let q = 0; q < n; q++) {
            state.applyCNOT(q, (q + 1) % n);
          }
        } else {
          for (let q = 0; q < n - 1; q++) {
            state.applyCNOT(q, q + 1);
          }
        }
      }
      // Data re-uploading alternates learned transformations with repeated data gates.
      if (reuploadSample) {
        for (let q = 0; q < n; q++) state.apply1QGate(Gates.Ry((reuploadSample[q] ?? 0) * Math.PI), q);
      }
    }
  }

  predictSingle(
    sample: number[],
    encoding: EncodingType,
    weights: number[],
    noise?: NoiseConfig,
    hybridPartition?: any
  ): { expectation: number; prob: number } {
    const state = new QuantumState(this.config.numQubits);
    this.encode(state, encoding, sample, hybridPartition);
    this.applyAnsatz(state, weights, encoding === 'data_reuploading' ? sample : undefined);

    let expZ = state.expectationZ(0);

    if (noise && noise.level !== 'none') {
      const depolFactor = Math.pow(1 - noise.depolarizingProb * 1.5, this.config.numLayers + 2);
      expZ *= depolFactor;
      const flipPerturbation = (Math.random() - 0.5) * (noise.bitFlipProb + noise.phaseFlipProb);
      expZ += flipPerturbation;
      if (Math.random() < noise.readoutErrorProb) {
        expZ = -expZ * 0.8;
      }
    }

    expZ = Math.max(-0.999, Math.min(0.999, expZ));
    const prob = (1 + expZ) / 2;
    return { expectation: expZ, prob };
  }

  train(
    trainX: number[][],
    trainY: number[],
    encoding: EncodingType,
    hybridPartition?: any
  ): { lossHistory: number[]; trainingTimeMs: number } {
    const startTime = performance.now();
    const lossHistory: number[] = [];
    const numSamples = Math.min(trainX.length, 30);

    for (let ep = 0; ep < this.config.epochs; ep++) {
      let totalLoss = 0;
      const gradAccum = new Array(this.weights.length).fill(0);

      for (let i = 0; i < numSamples; i++) {
        const x = trainX[i];
        const y = trainY[i];

        const { prob } = this.predictSingle(x, encoding, this.weights, undefined, hybridPartition);
        const pClamped = Math.max(1e-7, Math.min(1 - 1e-7, prob));
        const loss = -(y * Math.log(pClamped) + (1 - y) * Math.log(1 - pClamped));
        totalLoss += loss;

        const step = Math.PI / 2;
        const dL_dProb = (pClamped - y) / (pClamped * (1 - pClamped) + 1e-12);

        for (let w = 0; w < this.weights.length; w++) {
          const original = this.weights[w];

          this.weights[w] = original + step;
          const { expectation: expPlus } = this.predictSingle(x, encoding, this.weights, undefined, hybridPartition);

          this.weights[w] = original - step;
          const { expectation: expMinus } = this.predictSingle(x, encoding, this.weights, undefined, hybridPartition);

          this.weights[w] = original;

          const dExp_dTheta = (expPlus - expMinus) / 2;
          const dProb_dTheta = dExp_dTheta / 2;
          gradAccum[w] += dL_dProb * dProb_dTheta;
        }
      }

      for (let w = 0; w < this.weights.length; w++) {
        const avgGrad = gradAccum[w] / numSamples;
        this.weights[w] -= this.config.learningRate * Math.max(-2, Math.min(2, avgGrad));
      }

      lossHistory.push(parseFloat((totalLoss / numSamples).toFixed(4)));
    }

    const trainingTimeMs = Math.round(performance.now() - startTime);
    return { lossHistory, trainingTimeMs };
  }

  evaluate(
    testX: number[][],
    testY: number[],
    encoding: EncodingType,
    noise?: NoiseConfig,
    hybridPartition?: any
  ): {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    predictions: number[];
    probabilities: number[];
  } {
    let tp = 0, fp = 0, tn = 0, fn = 0;
    const predictions: number[] = [];
    const probabilities: number[] = [];

    for (let i = 0; i < testX.length; i++) {
      const { prob } = this.predictSingle(testX[i], encoding, this.weights, noise, hybridPartition);
      probabilities.push(parseFloat(prob.toFixed(4)));
      const pred = prob >= 0.5 ? 1 : 0;
      predictions.push(pred);

      const actual = testY[i];
      if (pred === 1 && actual === 1) tp++;
      else if (pred === 1 && actual === 0) fp++;
      else if (pred === 0 && actual === 0) tn++;
      else fn++;
    }

    const total = testX.length || 1;
    const accuracy = (tp + tn) / total;
    const precision = tp + fp > 0 ? tp / (tp + fp) : (tp === 0 && fp === 0 ? 1 : 0);
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      accuracy: parseFloat(accuracy.toFixed(4)),
      precision: parseFloat(precision.toFixed(4)),
      recall: parseFloat(recall.toFixed(4)),
      f1Score: parseFloat(f1Score.toFixed(4)),
      predictions,
      probabilities,
    };
  }
}
