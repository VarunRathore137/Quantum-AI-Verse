import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface SuperpositionData {
  num_states: number;
  amplitudes: number[];
  phases: number[];
  labels: string[];
  description: string;
}

const BAR_COLORS = [
  '#60a5fa', '#818cf8', '#a78bfa', '#c084fc',
  '#e879f9', '#f472b6', '#fb7185', '#f59e0b',
];

// ── Probability Amplitude Bar ─────────────────────────────────────
function AmplitudeBar({
  index, amplitude, phase, label, total, color
}: {
  index: number; amplitude: number; phase: number;
  label: string; total: number; color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const time = useRef(phase);

  const spacing = Math.min(6.5 / total, 0.85);
  const startX = -((total - 1) * spacing) / 2;
  const x = startX + index * spacing;

  const maxHeight = 2.5;
  const barH = amplitude * maxHeight;

  useFrame((_, delta) => {
    if (!meshRef.current || !glowRef.current) return;
    time.current += delta * 1.8;
    const wave = Math.sin(time.current + phase) * 0.08 * amplitude;
    const h = barH + wave;
    meshRef.current.scale.y = h / barH || 0.01;
    meshRef.current.position.y = h / 2 - 1.4;
    glowRef.current.scale.y = meshRef.current.scale.y;
    glowRef.current.position.y = meshRef.current.position.y;
  });

  return (
    <group position={[x, 0, 0]}>
      {/* Glow bar (wider, transparent) */}
      <mesh ref={glowRef} position={[0, barH / 2 - 1.4, -0.05]}>
        <boxGeometry args={[spacing * 0.7, barH, 0.05]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.25} />
      </mesh>
      {/* Main bar */}
      <mesh ref={meshRef} position={[0, barH / 2 - 1.4, 0]}>
        <boxGeometry args={[spacing * 0.52, barH, 0.12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} metalness={0.3} roughness={0.2} />
      </mesh>
      {/* Base line */}
      <mesh position={[0, -1.4, 0]}>
        <boxGeometry args={[spacing * 0.55, 0.025, 0.14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      {/* State label */}
      <Text position={[0, -1.75, 0]} fontSize={0.1} color="#64748b" anchorX="center" rotation={[0, 0, -Math.PI / 5]}>
        {label}
      </Text>
      {/* Amplitude value */}
      <Text position={[0, barH - 1.1, 0]} fontSize={0.09} color={color} anchorX="center">
        {amplitude.toFixed(2)}
      </Text>
    </group>
  );
}

// ── Superposition Wave Scene ──────────────────────────────────────
export default function SuperpositionScene({ data }: { data: SuperpositionData }) {
  const {
    amplitudes = Array(8).fill(0.354),
    phases = [0, 0.785, 1.571, 2.356, 3.142, 3.927, 4.712, 5.497],
    labels = ['|000⟩','|001⟩','|010⟩','|011⟩','|100⟩','|101⟩','|110⟩','|111⟩'],
    description = 'Uniform superposition',
  } = data;

  const n = amplitudes.length;

  return (
    <group>
      {/* Baseline */}
      <mesh position={[0, -1.4, -0.1]}>
        <boxGeometry args={[7.5, 0.015, 0.05]} />
        <meshStandardMaterial color="#1e3a5f" emissive="#1e3a5f" emissiveIntensity={0.5} />
      </mesh>

      {/* Bars */}
      {amplitudes.map((amp, i) => (
        <AmplitudeBar
          key={i}
          index={i}
          amplitude={amp}
          phase={phases[i] || 0}
          label={labels[i] || `|${i}⟩`}
          total={n}
          color={BAR_COLORS[i % BAR_COLORS.length]}
        />
      ))}

      {/* Titles */}
      <Text position={[0, 1.55, 0]} fontSize={0.22} color="#c084fc" anchorX="center" fontWeight={700}>
        Quantum Superposition
      </Text>
      <Text position={[0, 1.22, 0]} fontSize={0.11} color="#64748b" anchorX="center" maxWidth={6}>
        {description}
      </Text>
      <Text position={[-4, -0.35, 0]} fontSize={0.1} color="#475569" anchorX="center" rotation={[0, 0, Math.PI / 2]}>
        Probability Amplitude |ψ|
      </Text>
    </group>
  );
}
