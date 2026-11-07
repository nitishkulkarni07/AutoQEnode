"""
AutoQEncode - Quantum Noise Modeling
AerSimulator-compatible noise models for depolarizing and readout errors.
"""

from typing import Dict, Any


def get_noise_model_config(level: str = 'low') -> Dict[str, float]:
    presets = {
        'none': {
            'depolarizing_prob': 0.0,
            'bit_flip_prob': 0.0,
            'phase_flip_prob': 0.0,
            'readout_error': 0.0,
        },
        'low': {
            'depolarizing_prob': 0.015,
            'bit_flip_prob': 0.008,
            'phase_flip_prob': 0.008,
            'readout_error': 0.02,
        },
        'medium': {
            'depolarizing_prob': 0.045,
            'bit_flip_prob': 0.02,
            'phase_flip_prob': 0.02,
            'readout_error': 0.05,
        },
        'high': {
            'depolarizing_prob': 0.09,
            'bit_flip_prob': 0.04,
            'phase_flip_prob': 0.04,
            'readout_error': 0.09,
        },
    }
    return presets.get(level.lower(), presets['low'])
