from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
import numpy as np
from app.models.schemas import CircuitSpec

def simulate_circuit(spec: CircuitSpec):
    # Setup quantum circuit
    qc = QuantumCircuit(spec.num_qubits)
    for gate in spec.gates:
        gtype = gate.type.upper()
        if gtype == 'H':
            qc.h(gate.target)
        elif gtype == 'X':
            qc.x(gate.target)
        elif gtype == 'CNOT' or gtype == 'CX':
            if gate.control is not None:
                qc.cx(gate.control, gate.target)
                
    # Use Aer simulator backend for statevector
    backend = AerSimulator(method='statevector')
    
    # Needs save_statevector to extract state
    qc.save_statevector()
    
    # Run the circuit
    result = backend.run(qc).result()
    statevector = result.get_statevector(qc)
    
    # Convert numpy complex array to strings to safely send via JSON
    probs = statevector.probabilities_dict()
    statevector_list = [f"{c.real:.4f} + {c.imag:.4f}j" for c in statevector]
    
    return {
        "statevector": statevector_list,
        "probabilities": probs
    }
