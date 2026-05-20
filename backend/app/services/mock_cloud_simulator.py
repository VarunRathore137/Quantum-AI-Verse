"""
mock_cloud_simulator.py
Simulates submitting a quantum circuit to a real cloud backend (e.g. IBM Quantum).
Returns a realistic mock response including job metadata and measurement counts.
Used when qubit count exceeds the local simulator threshold (> 20 qubits).
"""
import re
import random
import time
import uuid
from typing import Dict, Any

# ── Available mock backends ───────────────────────────────────────────────────
_BACKENDS = [
    {"name": "ibm_sherbrooke", "qubits": 127, "basis_gates": ["cx", "id", "rz", "sx", "x"]},
    {"name": "ibm_brisbane",   "qubits": 127, "basis_gates": ["cx", "id", "rz", "sx", "x"]},
    {"name": "ibm_kyiv",       "qubits": 127, "basis_gates": ["cx", "id", "rz", "sx", "x"]},
    {"name": "ibm_eagle",      "qubits": 433, "basis_gates": ["ecr", "id", "rz", "sx", "x"]},
]

SHOTS = 1024


# ── Public API ────────────────────────────────────────────────────────────────

def submit_cloud_job(qasm_code: str, qubit_count: int) -> Dict[str, Any]:
    """
    Simulate submitting a large circuit to an IBM Quantum backend.

    Returns:
        {
            "job_id":         "abc123...",
            "backend":        "ibm_sherbrooke",
            "status":         "COMPLETED",
            "shots":          1024,
            "qubit_count":    25,
            "queue_time_s":   3.2,
            "exec_time_s":    1.8,
            "counts":         {"000...": 512, "111...": 512, ...},
            "top_states":     [{"state": "000...", "count": 512, "prob": 0.5}, ...],
            "error_rate":     0.012,
        }
    """
    # Pick appropriate backend
    backend = _select_backend(qubit_count)

    # Simulate realistic timing
    queue_time = round(random.uniform(1.5, 8.0), 2)
    exec_time  = round(random.uniform(0.5, 3.0), 2)
    error_rate = round(random.uniform(0.005, 0.025), 4)

    # Generate mock measurement counts
    counts = _generate_counts(qasm_code, qubit_count, error_rate)

    # Build top-5 states
    top_states = sorted(
        [{"state": k, "count": v, "prob": round(v / SHOTS, 4)} for k, v in counts.items()],
        key=lambda x: x["count"],
        reverse=True
    )[:5]

    return {
        "job_id":       str(uuid.uuid4())[:8].upper(),
        "backend":      backend["name"],
        "status":       "COMPLETED",
        "shots":        SHOTS,
        "qubit_count":  qubit_count,
        "queue_time_s": queue_time,
        "exec_time_s":  exec_time,
        "error_rate":   error_rate,
        "counts":       counts,
        "top_states":   top_states,
    }


# ── Internal helpers ──────────────────────────────────────────────────────────

def _select_backend(qubit_count: int) -> Dict[str, Any]:
    """Pick the smallest backend that fits the circuit."""
    for b in sorted(_BACKENDS, key=lambda x: x["qubits"]):
        if b["qubits"] >= qubit_count:
            return b
    return _BACKENDS[-1]  # largest available


def _generate_counts(qasm_code: str, n_qubits: int, error_rate: float) -> Dict[str, int]:
    """
    Generate plausible measurement counts.
    Detects Bell-like / GHZ-like patterns in QASM for more realistic output;
    otherwise returns a noisy uniform distribution.
    """
    # Cap display to 8 qubits to keep counts manageable
    display_qubits = min(n_qubits, 8)

    has_h  = bool(re.search(r'\bh\b', qasm_code, re.IGNORECASE))
    has_cx = bool(re.search(r'\bcx\b|\bcnot\b', qasm_code, re.IGNORECASE))

    counts: Dict[str, int] = {}

    if has_h and has_cx:
        # GHZ-like: concentrate on |00..0⟩ and |11..1⟩
        zero_state = "0" * display_qubits
        one_state  = "1" * display_qubits
        # Ideal split with some noise
        ideal_half = SHOTS // 2
        noise = int(SHOTS * error_rate * random.uniform(-1, 1))
        counts[zero_state] = max(0, ideal_half + noise)
        counts[one_state]  = max(0, SHOTS - counts[zero_state])

        # Sprinkle error states
        remaining = SHOTS - counts[zero_state] - counts[one_state]
        if remaining < 0:
            counts[one_state] += remaining

        # Add a handful of error bit-flip states
        for _ in range(int(SHOTS * error_rate * 3)):
            err_state = _flip_random_bit(zero_state if random.random() < 0.5 else one_state)
            counts[err_state] = counts.get(err_state, 0) + 1

    elif has_h:
        # Hadamard-only: uniform superposition with noise
        num_states = min(2 ** display_qubits, 16)
        base_count = SHOTS // num_states
        remaining  = SHOTS
        states     = [format(i, f'0{display_qubits}b') for i in range(num_states)]
        random.shuffle(states)
        for s in states[:-1]:
            noisy = max(0, base_count + int(base_count * error_rate * random.uniform(-2, 2)))
            counts[s] = noisy
            remaining -= noisy
        counts[states[-1]] = max(0, remaining)

    else:
        # All-zero deterministic circuit with error noise
        zero_state = "0" * display_qubits
        counts[zero_state] = SHOTS - int(SHOTS * error_rate * 2)
        # Noise states
        for _ in range(int(SHOTS * error_rate * 2)):
            err_state = _flip_random_bit(zero_state)
            counts[err_state] = counts.get(err_state, 0) + 1

    return {k: v for k, v in counts.items() if v > 0}


def _flip_random_bit(state: str) -> str:
    """Randomly flip one bit in a bitstring — models a single-qubit error."""
    idx = random.randrange(len(state))
    flipped = list(state)
    flipped[idx] = '1' if state[idx] == '0' else '0'
    return "".join(flipped)
