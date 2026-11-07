"""
AutoQEncode - Adaptive Hybrid Encoding Controller
Dynamic feature grouping, feasibility auditing, and resource-bounded circuit regeneration.
"""

from typing import List, Dict, Any
import numpy as np


class AdaptiveEncodingController:
    def __init__(self, qubit_budget: int, max_depth: int, max_error: float):
        self.qubit_budget = qubit_budget
        self.max_depth = max_depth
        self.max_error = max_error

    def partition_features(self, feature_types: Dict[str, str]) -> Dict[str, List[str]]:
        basis_feats = [f for f, t in feature_types.items() if t in ('binary', 'categorical')]
        angle_feats = [f for f, t in feature_types.items() if t == 'continuous'][:2]
        amp_feats = [f for f, t in feature_types.items() if f not in basis_feats and f not in angle_feats]
        return {
            'basis': basis_feats,
            'angle': angle_feats,
            'amplitude': amp_feats,
        }

    def check_feasibility(self, grouping: Dict[str, List[str]]) -> Dict[str, Any]:
        basis_q = len(grouping['basis'])
        angle_q = len(grouping['angle'])
        amp_q = int(np.ceil(np.log2(max(1, len(grouping['amplitude']))))) if grouping['amplitude'] else 0
        total_q = max(2, basis_q + angle_q + amp_q)

        feasible = total_q <= self.qubit_budget
        return {
            'feasible': feasible,
            'qubits_required': total_q,
            'qubit_budget': self.qubit_budget,
            'reason': 'Within budget' if feasible else f'Requires {total_q} qubits, exceeds budget {self.qubit_budget}',
        }
