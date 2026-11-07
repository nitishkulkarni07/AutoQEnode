"""
AutoQEncode - Variational Quantum Classifier (QNN)
Parameterized Ansatz & Parameter Shift Rule.
"""

import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector


class VariationalQuantumClassifier:
    def __init__(self, num_qubits: int, num_layers: int = 1, entanglement: str = 'linear'):
        self.num_qubits = num_qubits
        self.num_layers = num_layers
        self.entanglement = entanglement
        self.weights_per_layer = num_qubits * 2
        self.total_weights = self.weights_per_layer * num_layers
        self.parameters = ParameterVector("θ", self.total_weights)
        self.weights = np.random.uniform(-np.pi, np.pi, self.total_weights)

    def build_ansatz(self) -> QuantumCircuit:
        qc = QuantumCircuit(self.num_qubits, name="VQC_Ansatz")
        p_idx = 0
        for _ in range(self.num_layers):
            for q in range(self.num_qubits):
                qc.ry(self.parameters[p_idx], q)
                p_idx += 1
                qc.rz(self.parameters[p_idx], q)
                p_idx += 1

            if self.num_qubits > 1:
                if self.entanglement == 'ring':
                    for q in range(self.num_qubits):
                        qc.cx(q, (q + 1) % self.num_qubits)
                else:
                    for q in range(self.num_qubits - 1):
                        qc.cx(q, q + 1)

        return qc
