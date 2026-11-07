"""
AutoQEncode - FastAPI Backend Application Entry Point
Research-grade RESTful interface for Qiskit-driven benchmark execution.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.quantum.circuits import (
    create_basis_encoding,
    create_angle_encoding,
    create_amplitude_encoding,
    create_hybrid_encoding,
    create_dense_angle_encoding,
    create_data_reuploading_encoding,
)
from app.quantum.noise import get_noise_model_config
from app.adaptive.controller import AdaptiveEncodingController

app = FastAPI(
    title="AutoQEncode Quantum Research API",
    version="2.4.0",
    description="Automated Quantum Data Encoding Benchmarking, Recommendation & Adaptive Circuit Generation",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {
        "status": "operational",
        "service": "AutoQEncode FastAPI Backend",
        "qiskit_available": True,
        "mode": "Research & Patent-Oriented Prototype",
    }


class CircuitGenRequest(BaseModel):
    encoding: str
    num_features: int
    num_qubits: int
    rotation: Optional[str] = 'Y'
    layers: int = 2


@app.post("/api/circuit/generate")
def generate_circuit_endpoint(req: CircuitGenRequest):
    import numpy as np
    dummy_feats = np.linspace(0.1, 0.9, req.num_features)
    if req.encoding == 'basis':
        qc = create_basis_encoding(dummy_feats, req.num_qubits)
    elif req.encoding == 'amplitude':
        qc = create_amplitude_encoding(dummy_feats, req.num_qubits)
    elif req.encoding == 'dense_angle':
        qc = create_dense_angle_encoding(dummy_feats, req.num_qubits)
    elif req.encoding == 'data_reuploading':
        qc = create_data_reuploading_encoding(dummy_feats, req.num_qubits, req.layers)
    elif req.encoding == 'hybrid':
        qc = create_hybrid_encoding(dummy_feats, req.num_qubits, [0], [1], list(range(2, req.num_features)))
    elif req.encoding == 'angle':
        qc = create_angle_encoding(dummy_feats, req.num_qubits, req.rotation or 'Y')
    else:
        raise HTTPException(status_code=400, detail='Unsupported encoding method')

    return {
        "encoding": req.encoding,
        "num_qubits": qc.num_qubits,
        "depth": qc.depth(),
        "total_gates": sum(qc.count_ops().values()),
        "qasm": qc.qasm() if hasattr(qc, 'qasm') else str(qc),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
