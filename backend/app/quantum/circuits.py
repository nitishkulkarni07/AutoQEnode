"""
AutoQEncode - Quantum Circuit Encodings (Qiskit Implementation)
Basis, Angle, Amplitude, and Hybrid state preparation circuits.
"""

import math
import numpy as np
from qiskit import QuantumCircuit


def create_basis_encoding(features: np.ndarray, num_qubits: int) -> QuantumCircuit:
    n = min(len(features), num_qubits)
    qc = QuantumCircuit(num_qubits, name="Basis_Encoding")
    for i in range(n):
        if features[i] > 0.5 or int(features[i]) == 1:
            qc.x(i)
    return qc


def create_angle_encoding(features: np.ndarray, num_qubits: int, rotation: str = 'Y') -> QuantumCircuit:
    n = min(len(features), num_qubits)
    qc = QuantumCircuit(num_qubits, name="Angle_Encoding")
    for i in range(n):
        theta = float(features[i]) * math.pi
        if rotation.upper() == 'Y':
            qc.ry(theta, i)
        elif rotation.upper() == 'X':
            qc.rx(theta, i)
        else:
            qc.rz(theta, i)
    return qc


def create_amplitude_encoding(features: np.ndarray, num_qubits: int) -> QuantumCircuit:
    dim = 2 ** num_qubits
    padded = np.zeros(dim, dtype=float)
    n = min(len(features), dim)
    padded[:n] = features[:n]

    norm = np.linalg.norm(padded)
    if norm > 1e-12:
        padded /= norm
    else:
        padded[0] = 1.0

    qc = QuantumCircuit(num_qubits, name="Amplitude_Encoding")
    qc.prepare_state(padded, qc.qubits)
    return qc


def create_hybrid_encoding(
    features: np.ndarray,
    num_qubits: int,
    basis_indices: list,
    angle_indices: list,
    amplitude_indices: list
) -> QuantumCircuit:
    qc = QuantumCircuit(num_qubits, name="Hybrid_Encoding")
    wire = 0

    for idx in basis_indices:
        if wire >= num_qubits:
            break
        val = features[idx] if idx < len(features) else 0
        if val > 0.5:
            qc.x(wire)
        wire += 1

    for idx in angle_indices:
        if wire >= num_qubits:
            break
        val = features[idx] if idx < len(features) else 0
        qc.ry(float(val) * math.pi, wire)
        wire += 1

    if amplitude_indices and wire < num_qubits:
        remaining_wires = num_qubits - wire
        sub_feats = [features[i] for i in amplitude_indices if i < len(features)]
        sub_dim = 2 ** remaining_wires
        padded = np.zeros(sub_dim, dtype=float)
        padded[:min(len(sub_feats), sub_dim)] = sub_feats[:sub_dim]
        norm = np.linalg.norm(padded)
        if norm > 1e-12:
            padded /= norm
        else:
            padded[0] = 1.0

        sub_qc = QuantumCircuit(remaining_wires)
        sub_qc.prepare_state(padded, sub_qc.qubits)
        qc.compose(sub_qc, qubits=list(range(wire, num_qubits)), inplace=True)

    return qc


def create_dense_angle_encoding(features: np.ndarray, num_qubits: int) -> QuantumCircuit:
    """Encode a pair (x[2i], x[2i+1]) via Ry then Rz on qubit i."""
    qc = QuantumCircuit(num_qubits, name="Dense_Angle_Encoding")
    for q in range(num_qubits):
        qc.ry(float(features[2*q]) * math.pi if 2*q < len(features) else 0.0, q)
        qc.rz(float(features[2*q+1]) * math.pi if 2*q+1 < len(features) else 0.0, q)
    return qc


def create_data_reuploading_encoding(features: np.ndarray, num_qubits: int, layers: int = 2) -> QuantumCircuit:
    """Repeated feature embedding interleaved with parameterized variational layers."""
    if not 1 <= layers <= 16:
        raise ValueError("layers must be between 1 and 16")
    qc = QuantumCircuit(num_qubits, name="Data_Reuploading_Encoding")
    from qiskit.circuit import Parameter
    for layer in range(layers):
        for q in range(num_qubits):
            angle = float(features[q]) * math.pi if q < len(features) else 0.0
            qc.ry(angle, q)
            qc.ry(Parameter(f'w_{layer}_{q}_y'), q)
            qc.rz(Parameter(f'w_{layer}_{q}_z'), q)
        for q in range(num_qubits - 1):
            qc.cx(q, q+1)
    return qc
