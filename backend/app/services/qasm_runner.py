"""
qasm_runner.py
Parses an OpenQASM 3.0 string and runs an exact statevector simulation
using Qiskit Aer.  Falls back to a simple manual gate-builder when the
Qiskit qasm3 importer is unavailable or the QASM code is a partial draft.
"""
import re
import numpy as np
from typing import Dict, Any

# ── Qiskit imports ────────────────────────────────────────────────────────────
try:
    from qiskit import qasm3 as _qasm3_mod
    _HAS_QASM3 = True
except ImportError:
    _HAS_QASM3 = False

from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator


# ── Public API ────────────────────────────────────────────────────────────────

def simulate_from_qasm(qasm_code: str) -> Dict[str, Any]:
    """
    Accept an OpenQASM 3.0 string, simulate it, and return a rich result dict.

    Returns:
        {
            "probabilities": {"00": 0.5, "11": 0.5, ...},
            "statevector":   ["0.7071 + 0.0000j", ...],
            "qubit_count":   2,
            "gate_count":    2,
            "top_states":    [{"state": "00", "prob": 0.5}, ...],   # top-5
        }
    """
    qc = _build_circuit(qasm_code)
    return _run_statevector(qc)


def count_qubits_in_qasm(qasm_code: str) -> int:
    """Quick regex scan — avoids a full parse just to get qubit count."""
    total = 0
    for m in re.finditer(r'qubit\s*\[(\d+)\]', qasm_code):
        total += int(m.group(1))
    return total or 1


# ── Internal helpers ──────────────────────────────────────────────────────────

def _build_circuit(qasm_code: str) -> QuantumCircuit:
    """Try qasm3 loader first; fall back to our own lightweight parser."""
    if _HAS_QASM3:
        try:
            return _qasm3_mod.loads(qasm_code)
        except Exception:
            pass  # Fall through to manual parser
    return _manual_parse(qasm_code)


def _manual_parse(code: str) -> QuantumCircuit:
    """
    Minimal QASM 3.0 parser that handles the gates we care about:
    h, x, y, z, s, t, cx/cnot, cz, rx, ry, rz, ccx/toffoli, swap
    """
    lines = code.split('\n')
    num_qubits = 1

    # First pass — find qubit register size
    for line in lines:
        m = re.match(r'qubit\s*\[(\d+)\]', line.strip())
        if m:
            num_qubits = int(m.group(1))
            break

    qc = QuantumCircuit(num_qubits)

    single_map = {
        'h': qc.h, 'x': qc.x, 'y': qc.y, 'z': qc.z,
        's': qc.s, 't': qc.t, 'sdg': qc.sdg, 'tdg': qc.tdg,
        'id': qc.id,
    }
    rotation_map = {
        'rx': qc.rx, 'ry': qc.ry, 'rz': qc.rz,
    }

    for line in lines:
        line = line.strip().rstrip(';')
        if not line or line.startswith('//') or line.startswith('OPENQASM') \
                or line.startswith('include') or line.startswith('bit') \
                or line.startswith('qubit') or line.startswith('measure'):
            continue

        # Single-qubit gate: h q[0]
        m = re.match(r'^([a-z]+)\s+q\[(\d+)\]$', line, re.IGNORECASE)
        if m:
            gate, tgt = m.group(1).lower(), int(m.group(2))
            if gate in single_map and tgt < num_qubits:
                single_map[gate](tgt)
            continue

        # Rotation gate: rx(0.5) q[0]
        m = re.match(r'^([a-z]+)\s*\(([^)]+)\)\s+q\[(\d+)\]$', line, re.IGNORECASE)
        if m:
            gate, angle_str, tgt = m.group(1).lower(), m.group(2), int(m.group(3))
            if gate in rotation_map and tgt < num_qubits:
                try:
                    rotation_map[gate](float(angle_str), tgt)
                except ValueError:
                    pass
            continue

        # Two-qubit gate: cx q[0], q[1]
        m = re.match(r'^(cx|cnot|cz|swap)\s+q\[(\d+)\],\s*q\[(\d+)\]$', line, re.IGNORECASE)
        if m:
            gate, ctrl, tgt = m.group(1).lower(), int(m.group(2)), int(m.group(3))
            if ctrl < num_qubits and tgt < num_qubits:
                if gate in ('cx', 'cnot'):
                    qc.cx(ctrl, tgt)
                elif gate == 'cz':
                    qc.cz(ctrl, tgt)
                elif gate == 'swap':
                    qc.swap(ctrl, tgt)
            continue

        # Three-qubit gate: ccx q[0], q[1], q[2]
        m = re.match(r'^(ccx|toffoli)\s+q\[(\d+)\],\s*q\[(\d+)\],\s*q\[(\d+)\]$', line, re.IGNORECASE)
        if m:
            c1, c2, tgt = int(m.group(2)), int(m.group(3)), int(m.group(4))
            if c1 < num_qubits and c2 < num_qubits and tgt < num_qubits:
                qc.ccx(c1, c2, tgt)
            continue

    return qc


def _run_statevector(qc: QuantumCircuit) -> Dict[str, Any]:
    """Run statevector simulation and return the rich result dict."""
    backend = AerSimulator(method='statevector')
    qc_copy = qc.copy()
    qc_copy.save_statevector()

    result = backend.run(qc_copy).result()
    sv = result.get_statevector(qc_copy)

    probs: Dict[str, float] = sv.probabilities_dict()

    # Build top-5 states list sorted by probability
    top_states = sorted(
        [{"state": k, "prob": round(v, 6)} for k, v in probs.items()],
        key=lambda x: x["prob"],
        reverse=True
    )[:5]

    statevector_list = [
        f"{c.real:.4f} + {c.imag:.4f}j" for c in sv
    ]

    # Count gates from the circuit object
    gate_count = sum(
        1 for inst in qc.data
        if inst.operation.name not in ('barrier', 'measure', 'reset', 'save_statevector')
    )

    return {
        "probabilities": {k: round(v, 6) for k, v in probs.items()},
        "statevector": statevector_list,
        "qubit_count": qc.num_qubits,
        "gate_count": gate_count,
        "top_states": top_states,
    }
