import { CircuitDefinition, BackendProfile, TranspilationResult } from '../../types';

export const BACKEND_PROFILES: Record<string, BackendProfile> = {
  'ideal_sim': {
    id: 'ideal_sim',
    name: 'Local Statevector Simulator (Ideal)',
    category: 'Local Simulator',
    usableQubits: 16,
    couplingMap: [],
    nativeGates: ['U', 'CX', 'H', 'Ry', 'Rz', 'X'],
    singleQubitError: 0.0,
    twoQubitError: 0.0,
    readoutError: 0.0,
    coherenceT1Us: 999999,
    coherenceT2Us: 999999,
    maxShots: 100000,
    maxCircuitDepth: 1000,
    description: 'Exact mathematical statevector simulator without physical dissipation or routing overhead.',
  },
  'noisy_sim': {
    id: 'noisy_sim',
    name: 'Local Aer Density-Matrix Simulator (Noisy)',
    category: 'Local Simulator',
    usableQubits: 12,
    couplingMap: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
    nativeGates: ['RZ', 'SX', 'X', 'CX'],
    singleQubitError: 0.0012,
    twoQubitError: 0.015,
    readoutError: 0.025,
    coherenceT1Us: 120,
    coherenceT2Us: 85,
    maxShots: 20000,
    maxCircuitDepth: 250,
    description: 'Local realistic thermal relaxation and depolarizing simulator with linear bus connectivity.',
  },
  'ibm_manila': {
    id: 'ibm_manila',
    name: 'IBM Manila Emulation Profile (5-Qubit Falcon r5.11)',
    category: 'Emulated IBM Hardware',
    usableQubits: 5,
    couplingMap: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 3]],
    nativeGates: ['ID', 'RZ', 'SX', 'X', 'CX'],
    singleQubitError: 0.0008,
    twoQubitError: 0.0094,
    readoutError: 0.019,
    coherenceT1Us: 154,
    coherenceT2Us: 98,
    maxShots: 8192,
    maxCircuitDepth: 120,
    description: 'Calibrated snapshot of 5-qubit Falcon architecture with T-topology coupling graph.',
  },
  'ibm_melbourne': {
    id: 'ibm_melbourne',
    name: 'IBM Melbourne Emulation Profile (14-Qubit Bowtie)',
    category: 'Emulated IBM Hardware',
    usableQubits: 14,
    couplingMap: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
      [1, 13], [2, 12], [3, 11], [4, 10], [5, 9], [6, 8],
      [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13]
    ],
    nativeGates: ['ID', 'RZ', 'SX', 'X', 'CX'],
    singleQubitError: 0.0016,
    twoQubitError: 0.023,
    readoutError: 0.038,
    coherenceT1Us: 95,
    coherenceT2Us: 64,
    maxShots: 8192,
    maxCircuitDepth: 180,
    description: 'Bowtie heavy-hex 14-qubit lattice snapshot with directional coupling edges.',
  },
};

export function transpileCircuit(
  circuit: CircuitDefinition,
  backend: BackendProfile
): TranspilationResult {
  if (circuit.numQubits > backend.usableQubits) {
    return {
      feasible: false,
      rejectionReason: `Circuit requires ${circuit.numQubits} logical qubits, but ${backend.name} only provides ${backend.usableQubits} usable qubits.`,
      backendId: backend.id,
      originalDepth: circuit.depth,
      transpiledDepth: 0,
      originalGates: circuit.totalGates,
      transpiledGates: 0,
      original2QGates: circuit.twoQubitGates,
      transpiled2QGates: 0,
      swapCount: 0,
      routingOverheadPercent: 0,
      physicalQubitsUsed: backend.usableQubits,
      estimatedFidelity: 0,
      executionCostUnits: 0,
    };
  }

  let swapCount = 0;
  if (backend.couplingMap.length > 0) {
    const isAdjacent = (q1: number, q2: number) => {
      return backend.couplingMap.some(
        ([a, b]) => (a === q1 && b === q2) || (a === q2 && b === q1)
      );
    };

    for (const g of circuit.gates) {
      if (g.name === 'CX' && g.controlQubits && g.controlQubits.length > 0) {
        const c = g.controlQubits[0];
        const t = g.qubits[0];
        if (!isAdjacent(c, t)) {
          const dist = Math.abs(c - t);
          swapCount += Math.max(1, dist - 1);
        }
      }
    }
  }

  const additional2Q = swapCount * 3;
  const transpiled2QGates = circuit.twoQubitGates + additional2Q;
  const transpiledGates = circuit.totalGates + swapCount * 4;

  const depthFactor = swapCount > 0 ? 1 + (swapCount * 2.5) / Math.max(1, circuit.depth) : 1.0;
  const transpiledDepth = Math.round(circuit.depth * depthFactor);

  if (transpiledDepth > backend.maxCircuitDepth) {
    return {
      feasible: false,
      rejectionReason: `Transpiled depth (${transpiledDepth}) exceeds backend maximum threshold (${backend.maxCircuitDepth}).`,
      backendId: backend.id,
      originalDepth: circuit.depth,
      transpiledDepth,
      originalGates: circuit.totalGates,
      transpiledGates,
      original2QGates: circuit.twoQubitGates,
      transpiled2QGates,
      swapCount,
      routingOverheadPercent: Math.round(((transpiledDepth - circuit.depth) / Math.max(1, circuit.depth)) * 100),
      physicalQubitsUsed: circuit.numQubits,
      estimatedFidelity: 0.1,
      executionCostUnits: transpiledDepth * 10,
    };
  }

  const routingOverheadPercent = Math.round(
    ((transpiledDepth - circuit.depth) / Math.max(1, circuit.depth)) * 100
  );

  const n1q = transpiledGates - transpiled2QGates;
  const fid1q = Math.pow(1 - backend.singleQubitError, n1q);
  const fid2q = Math.pow(1 - backend.twoQubitError, transpiled2QGates);
  const fidRo = Math.pow(1 - backend.readoutError, circuit.numQubits);
  const estimatedFidelity = parseFloat(Math.max(0.01, fid1q * fid2q * fidRo).toFixed(4));

  const executionCostUnits = Math.round(transpiledGates * 1.5 + transpiled2QGates * 5);

  return {
    feasible: true,
    backendId: backend.id,
    originalDepth: circuit.depth,
    transpiledDepth,
    originalGates: circuit.totalGates,
    transpiledGates,
    original2QGates: circuit.twoQubitGates,
    transpiled2QGates,
    swapCount,
    routingOverheadPercent,
    physicalQubitsUsed: circuit.numQubits,
    estimatedFidelity,
    executionCostUnits,
  };
}
