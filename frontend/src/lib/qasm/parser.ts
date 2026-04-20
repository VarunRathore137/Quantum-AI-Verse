import { Gate, CircuitData } from '../../store';

export class QASMSyntaxError extends Error {
  line: number;
  constructor(message: string, line: number) {
    super(message);
    this.line = line;
    this.name = 'QASMSyntaxError';
  }
}

export function parseQASM(code: string): CircuitData {
  const lines = code.split('\n');
  let qubits = 0;
  const gates: Gate[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('//') || line.startsWith('OPENQASM') || line.startsWith('include') || line.startsWith('bit')) {
      continue;
    }

    // Parse qubits mapping: "qubit[3] q;"
    const qubitMatch = line.match(/^qubit\s*\[(\d+)\]/);
    if (qubitMatch) {
      qubits = parseInt(qubitMatch[1], 10);
      continue;
    }

    // Parse single qubit gates: "h q[0];" or "x q[1];"
    const singleGateMatch = line.match(/^([a-z]+)\s+q\[(\d+)\]\s*;/i);
    if (singleGateMatch) {
      const type = singleGateMatch[1].toUpperCase();
      const target = parseInt(singleGateMatch[2], 10);
      if (target >= qubits) {
        throw new QASMSyntaxError(`Qubit index ${target} out of bounds`, i + 1);
      }
      gates.push({ type, target });
      continue;
    }

    // Parse two qubit gates: "cx q[0], q[1];"
    const multiGateMatch = line.match(/^([a-z]+)\s+q\[(\d+)\],\s*q\[(\d+)\]\s*;/i);
    if (multiGateMatch) {
      const type = multiGateMatch[1].toUpperCase();
      const control = parseInt(multiGateMatch[2], 10);
      const target = parseInt(multiGateMatch[3], 10);
      if (control >= qubits || target >= qubits) {
        throw new QASMSyntaxError(`Qubit index out of bounds`, i + 1);
      }
      gates.push({ type, target, control });
      continue;
    }
  }

  return { qubits: qubits || 1, gates };
}
