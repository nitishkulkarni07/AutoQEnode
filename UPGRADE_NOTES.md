# AutoQEncode: five-method upgrade

## Delivered

- Original UI/navigation preserved; the supplied logo is displayed on the landing page.
- Controlled benchmark now compares **basis**, **angle**, **amplitude**, **dense-angle**, and **data re-uploading** feature embeddings on the same split with the same trainable VQC configuration.
- Encoding Lab + Circuit Studio include the two methods, their circuit diagrams, suitability/trade-off descriptions, and symbolic gate details.
- Recommendation output ranks the five candidates and explains their differences.
- Python Qiskit backend exposes both new encoders via `/api/circuit/generate`.
- Qubit-budget API includes the new methods.

## Definitions / defensible examples

- Dense angle: `Ry(pi*x[2q])` then `Rz(pi*x[2q+1])` on qubit q; typically ceil(features/2) qubits. The second axis matters because it changes relative phase, which subsequent trainable operations can exploit.
- Data re-uploading: `Ry(pi*x[q])` at input followed by `[variational Ry, variational Rz, entanglers, Ry(pi*x[q])]` per ansatz layer in the browser simulator. Compare extra expressivity vs circuit depth and errors.
- Dataset example: four continuous features: angle uses four wires, dense angle uses two; re-uploading uses four wires with additional gates per training layer.
- These circuits include an illustrative fixed variational ansatz; QASM exports carry pi/4 placeholders for data and trainable rotations and do **not** represent a trained instance.

## Known limitations and alignment with the two documents

- Original synopsis focuses on **three** controlled methods; the patent adds dense angle and re-uploading as **hybrid circuit primitives**. The five-way benchmark here is an extended comparison; it is not a complete implementation of the patent's adaptive mixed-encoding circuit-generation and calibration feedback loop.
- The existing browser simulator supports statevector learning and *approximate/stochastic* noise and transpilation scoring. It is not genuine hardware calibration or backend transpilation. Backend API can construct genuine Qiskit circuits for these encodings but is **not connected** to the browser benchmark.
- The browser caps runnable statevectors at eight qubits. Infeasible choices are shown with zero predictive metrics, and should not be reported as measured accuracy. More advanced scenarios should use Qiskit on a backend with controlled resource accounting.
- Additional patent work still required: feature-group assignment across all five primitives in one circuit, calibration-age checks, true backend-specific Qiskit transpilation, progressive multi-fidelity evaluation/hardware probes, dynamic regeneration, and reproducible benchmark manifests with per-candidate resource and information-loss logs.

## Run

```powershell
npm install
npm run dev
```

Visit http://localhost:3000. For the separate FastAPI service see the existing README; install backend requirements and run uvicorn.
