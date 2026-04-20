import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

// ── Floating Quantum Particle ─────────────────────────────────────
function QuantumParticle({ position, color, speed, radius }: {
  position: [number, number, number];
  color: string;
  speed: number;
  radius: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const time = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!ref.current) return;
    time.current += delta * speed;
    ref.current.position.x = position[0] + Math.sin(time.current) * radius;
    ref.current.position.y = position[1] + Math.cos(time.current * 0.7) * radius * 0.8;
    ref.current.position.z = position[2] + Math.sin(time.current * 0.5 + 1) * radius;
    ref.current.rotation.x += delta * speed * 0.5;
    ref.current.rotation.y += delta * speed * 0.3;
  });

  return (
    <mesh ref={ref} position={position}>
      <icosahedronGeometry args={[0.06, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.2}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

// ── Orbital Ring ─────────────────────────────────────────────────
function OrbitalRing({ radius, color, speed, tilt }: {
  radius: number; color: string; speed: number; tilt: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });

  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return pts;
  }, [radius]);

  return (
    <group ref={ref} rotation={[tilt, 0, 0]}>
      <Line points={points} color={color} lineWidth={0.8} transparent opacity={0.4} />
      {/* Orbit dot */}
      <mesh position={[radius, 0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

// ── Central Nucleus ───────────────────────────────────────────────
function Nucleus() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.4;
      ref.current.rotation.y += delta * 0.6;
    }
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.35, 2]} />
      <meshStandardMaterial
        color="#3b82f6"
        emissive="#6366f1"
        emissiveIntensity={0.8}
        wireframe={false}
        roughness={0.1}
        metalness={0.6}
      />
    </mesh>
  );
}

// ── Main Idle Scene ───────────────────────────────────────────────
export default function IdleScene() {
  const particles = useMemo(() => [
    { position: [-3, 1, -1] as [number,number,number], color: '#60a5fa', speed: 0.8, radius: 0.6 },
    { position: [3, -1, 1] as [number,number,number], color: '#a78bfa', speed: 0.5, radius: 0.8 },
    { position: [-2, -2, 2] as [number,number,number], color: '#f472b6', speed: 1.0, radius: 0.5 },
    { position: [2, 2, -2] as [number,number,number], color: '#34d399', speed: 0.7, radius: 0.7 },
    { position: [0, 3, 1] as [number,number,number], color: '#fbbf24', speed: 0.9, radius: 0.5 },
    { position: [1, -3, -1] as [number,number,number], color: '#38bdf8', speed: 0.6, radius: 0.6 },
    { position: [-3, 0, -3] as [number,number,number], color: '#c084fc', speed: 1.1, radius: 0.4 },
    { position: [3, 0, 3] as [number,number,number], color: '#fb7185', speed: 0.75, radius: 0.7 },
  ], []);

  return (
    <group>
      <Nucleus />
      <OrbitalRing radius={1.4} color="#60a5fa" speed={0.7} tilt={0} />
      <OrbitalRing radius={1.8} color="#a78bfa" speed={0.4} tilt={Math.PI / 4} />
      <OrbitalRing radius={2.2} color="#f472b6" speed={0.55} tilt={Math.PI / 3} />
      {particles.map((p, i) => (
        <QuantumParticle key={i} {...p} />
      ))}
      <Text
        position={[0, -3.2, 0]}
        fontSize={0.28}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2"
      >
        Ask the Instructor to visualize a quantum concept
      </Text>
    </group>
  );
}
