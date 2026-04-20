import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface QubitState {
  label: string;
  alpha: number;
  beta: number;
  phase: number;
  description: string;
}

interface QuantumRegisterData {
  num_qubits: number;
  qubit_states: QubitState[];
  description: string;
}

// ── Single Qubit Atom ─────────────────────────────────────────────
function QubitAtom({ qubit, index, total }: { qubit: QubitState; index: number; total: number }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const dotRef = useRef<THREE.Mesh>(null);
  const time = useRef(index * (Math.PI * 2 / total));

  // Colors based on state: blue = |0⟩, purple = superposition, pink = |1⟩
  const isZero = qubit.alpha > 0.95;
  const isOne = qubit.beta > 0.95;
  const color = isZero ? '#38bdf8' : isOne ? '#f472b6' : '#a78bfa';
  const emissive = isZero ? '#0ea5e9' : isOne ? '#ec4899' : '#8b5cf6';

  useFrame((_, delta) => {
    if (orbitRef.current) orbitRef.current.rotation.y += delta * (0.8 + index * 0.2);
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.5;
      coreRef.current.rotation.z += delta * 0.3;
    }
    if (dotRef.current) {
      time.current += delta * 1.5;
      dotRef.current.position.set(
        Math.cos(time.current) * 0.55,
        Math.sin(time.current * 0.6) * 0.3,
        Math.sin(time.current) * 0.55,
      );
    }
  });

  const spacing = Math.min(5.0 / total, 1.5);
  const startX = -((total - 1) * spacing) / 2;
  const x = startX + index * spacing;

  // Alpha/Beta visual bars (small stacked segments on sphere face)
  const alphaH = qubit.alpha * 0.5;
  const betaH = qubit.beta * 0.5;

  return (
    <group position={[x, 0, 0]}>
      {/* ── Core sphere ── */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.32, 1]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.6} metalness={0.5} roughness={0.2} />
      </mesh>

      {/* ── Orbital ring + electron dot ── */}
      <group ref={orbitRef}>
        {/* Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.012, 8, 64]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.6} />
        </mesh>
        {/* Electron */}
        <mesh ref={dotRef} position={[0.55, 0, 0]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.0} />
        </mesh>
      </group>

      {/* ── Alpha bar (|0⟩ component) ── */}
      <mesh position={[-0.25, -0.85 + alphaH / 2, 0]}>
        <boxGeometry args={[0.18, alphaH, 0.08]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} transparent opacity={0.9} />
      </mesh>
      <Text position={[-0.25, -0.85 - 0.1, 0]} fontSize={0.09} color="#38bdf8" anchorX="center">
        α={qubit.alpha.toFixed(2)}
      </Text>

      {/* ── Beta bar (|1⟩ component) ── */}
      <mesh position={[0.25, -0.85 + betaH / 2, 0]}>
        <boxGeometry args={[0.18, betaH, 0.08]} />
        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.6} transparent opacity={0.9} />
      </mesh>
      <Text position={[0.25, -0.85 - 0.1, 0]} fontSize={0.09} color="#f472b6" anchorX="center">
        β={qubit.beta.toFixed(2)}
      </Text>

      {/* ── Divider ── */}
      <mesh position={[0, -0.85, 0]}>
        <boxGeometry args={[0.01, 0.6, 0.06]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* ── Qubit label ── */}
      <Text position={[0, 0.65, 0]} fontSize={0.15} color={color} anchorX="center" fontWeight={600}>
        {qubit.label}
      </Text>

      {/* ── State formula ── */}
      <Text position={[0, -1.4, 0]} fontSize={0.085} color="#64748b" anchorX="center" maxWidth={1.4}>
        {qubit.description}
      </Text>
    </group>
  );
}

// ── Quantum Register Scene ────────────────────────────────────────
export default function QuantumRegisterScene({ data }: { data: QuantumRegisterData }) {
  const {
    qubit_states = [],
    description = 'Quantum register in superposition',
  } = data;

  const n = qubit_states.length;

  return (
    <group>
      {qubit_states.map((q, i) => (
        <QubitAtom key={i} qubit={q} index={i} total={n} />
      ))}

      {/* Title */}
      <Text position={[0, 2.2, 0]} fontSize={0.22} color="#a78bfa" anchorX="center" fontWeight={700}>
        Quantum Register — {n} Qubits
      </Text>
      <Text position={[0, 1.85, 0]} fontSize={0.11} color="#64748b" anchorX="center" maxWidth={8}>
        {description}
      </Text>

      {/* Connection line between qubits */}
      {n > 1 && (
        <mesh position={[0, 0, -0.15]}>
          <boxGeometry args={[Math.max((n - 1) * Math.min(5 / n, 1.5), 0.1), 0.01, 0.01]} />
          <meshStandardMaterial color="#1e3a5f" emissive="#1e3a5f" emissiveIntensity={0.5} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}
