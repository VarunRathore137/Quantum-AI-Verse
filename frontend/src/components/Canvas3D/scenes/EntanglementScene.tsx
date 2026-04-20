import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';

interface EntanglementData {
  bell_state: string;
  qubit_a: string;
  qubit_b: string;
  correlation: string;
  state_formula: string;
  description: string;
}

// ── Entangled Qubit Sphere ────────────────────────────────────────
function EntangledSphere({
  position, color, label, phase
}: {
  position: [number, number, number];
  color: string;
  label: string;
  phase: number;
}) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const time = useRef(phase);

  useFrame((_, delta) => {
    time.current += delta * 1.2;
    if (sphereRef.current) {
      sphereRef.current.rotation.y = time.current * 0.5;
      sphereRef.current.rotation.x = Math.sin(time.current * 0.3) * 0.2;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = time.current * 0.8;
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(time.current * 0.4) * 0.3;
    }
    if (glowRef.current) {
      const scale = 1.0 + Math.sin(time.current * 2) * 0.15;
      glowRef.current.scale.setScalar(scale);
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(time.current * 2) * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Outer pulse glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.75, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.12} />
      </mesh>

      {/* Main qubit sphere */}
      <mesh ref={sphereRef}>
        <icosahedronGeometry args={[0.48, 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.5}
          roughness={0.15}
          wireframe={false}
        />
      </mesh>

      {/* Orbit ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.75, 0.018, 8, 60]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.7} />
      </mesh>

      {/* Label */}
      <Text position={[0, 1.15, 0]} fontSize={0.22} color={color} anchorX="center" fontWeight={700}>
        {label}
      </Text>
    </group>
  );
}

// ── Pulsing Entanglement Link ─────────────────────────────────────
function EntanglementLink({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null);
  const time = useRef(0);

  const mid = useMemo(() => new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5), [from, to]);
  const dir = useMemo(() => new THREE.Vector3().subVectors(to, from), [from, to]);
  const len = dir.length();

  useFrame((_, delta) => {
    time.current += delta * 2;
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.sin(time.current) * 0.5;
      mat.opacity = 0.3 + Math.sin(time.current) * 0.2;
    }
  });

  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const normalized = dir.clone().normalize();
    q.setFromUnitVectors(up, normalized);
    return q;
  }, [dir]);

  return (
    <group position={mid} quaternion={quaternion}>
      {/* Core line */}
      <mesh ref={ref}>
        <cylinderGeometry args={[0.025, 0.025, len, 12]} />
        <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={0.8} transparent opacity={0.5} />
      </mesh>
      {/* Outer glow line */}
      <mesh>
        <cylinderGeometry args={[0.08, 0.08, len, 8]} />
        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.3} transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

// ── Bell State Entanglement Scene ─────────────────────────────────
export default function EntanglementScene({ data }: { data: EntanglementData }) {
  const {
    bell_state = 'Phi+',
    qubit_a = 'q₀',
    qubit_b = 'q₁',
    state_formula = '|Φ+⟩ = (|00⟩ + |11⟩) / √2',
    correlation = 'Measuring one qubit instantly defines the other',
    description = 'Maximum quantum entanglement',
  } = data;

  const posA = new THREE.Vector3(-2.2, 0, 0);
  const posB = new THREE.Vector3(2.2, 0, 0);

  return (
    <group>
      <EntangledSphere position={[-2.2, 0, 0]} color="#60a5fa" label={qubit_a} phase={0} />
      <EntanglementLink from={posA} to={posB} />
      <EntangledSphere position={[2.2, 0, 0]} color="#f472b6" label={qubit_b} phase={Math.PI} />

      {/* Bell state formula */}
      <Text position={[0, -1.6, 0]} fontSize={0.22} color="#a78bfa" anchorX="center" fontWeight={700}>
        {state_formula}
      </Text>

      {/* Bell state label */}
      <Text position={[0, 1.6, 0]} fontSize={0.18} color="#94a3b8" anchorX="center" fontWeight={600}>
        Bell State |{bell_state}⟩ — Quantum Entanglement
      </Text>

      {/* Correlation text */}
      <Text position={[0, -2.1, 0]} fontSize={0.11} color="#64748b" anchorX="center" maxWidth={6}>
        {correlation}
      </Text>
    </group>
  );
}
