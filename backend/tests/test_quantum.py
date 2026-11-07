"""
AutoQEncode - Unit Tests for Quantum Circuit Encodings & Controller
"""

import numpy as np
from app.adaptive.controller import AdaptiveEncodingController


def test_adaptive_feature_partitioning():
    controller = AdaptiveEncodingController(qubit_budget=4, max_depth=25, max_error=0.05)
    types = {
        'flag_binary': 'binary',
        'type_cat': 'categorical',
        'reading_a': 'continuous',
        'reading_b': 'continuous',
        'reading_c': 'continuous',
    }
    partition = controller.partition_features(types)
    assert 'flag_binary' in partition['basis']
    assert 'type_cat' in partition['basis']
    assert len(partition['angle']) <= 2
    assert 'reading_c' in partition['amplitude']


def test_feasibility_check():
    controller = AdaptiveEncodingController(qubit_budget=4, max_depth=25, max_error=0.05)
    grouping = {
        'basis': ['f1'],
        'angle': ['f2'],
        'amplitude': ['f3', 'f4'],
    }
    res = controller.check_feasibility(grouping)
    assert res['feasible'] is True
    assert res['qubits_required'] <= 4
