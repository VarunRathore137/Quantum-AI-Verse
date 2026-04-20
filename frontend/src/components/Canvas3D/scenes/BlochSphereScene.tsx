import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';

interface BlochData {
  theta: number;  // polar angle: 0=|0⟩, PI=|1⟩
  phi: number;    // azimuthal angle
  label: string;
  description: string;
}

// ── State Vector Arrow ────────────────────────────────────────────
function StateArrow({ theta, phi }: { theta: number; phi: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const target = new THREE.Euler(
    Math.PI / 2 - theta, // make y-up = |0⟩
    phi,
    0,
    'ZXY'
  );

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x += (target.x - groupRef.current.rotation.x) * 0.06;
    groupRef.current.rotation.y += (target.y - groupRef.current.rotation.y) * 0.06;
  });

  return (
    <group ref={groupRef}>
      {/* Shaft */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.9]} />
        <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={1.0} />
      </mesh>
      {/* Tip cone */}
      <mesh position={[0, 1.95, 0]}>
        <coneGeometry args={[0.13, 0.28, 16]} />
        <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={1.2} />
      </mesh>
      {/* Glow */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 2.0]} />
        <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.4} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// ── Full Bloch Sphere Scene ───────────────────────────────────────
export default function BlochSphereScene({ data }: { data?: BlochData }) {
  const theta = data?.theta ?? 0;
  const phi = data?.phi ?? 0;
  const label = data?.label ?? '|0⟩';
  const description = data?.description ?? '';

  return (
    <group>
      {/* Outer glass sphere */}
      <mesh>
        <sphereGeometry args={[2, 48, 48]} />
        <meshPhysicalMaterial color="#3b82f6" transparent opacity={0.08} roughness={0.0} transmission={0.95} />
      </mesh>
      {/* Wireframe */}
      <mesh>
        <sphereGeometry args={[2, 18, 18]} />
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.08} />
      </mesh>

      {/* Equatorial circle */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.012, 8, 80]} />
        <meshBasicMaterial color="#334155" transparent opacity={0.5} />
      </mesh>

      {/* Axes */}
      {[
        { rot: [0,0,0] as [number,number,number], color: '#34d399' },           // Z
        { rot: [0,0,Math.PI/2] as [number,number,number], color: '#60a5fa' },  // X
        { rot: [Math.PI/2,0,0] as [number,number,number], color: '#f472b6' },  // Y
      ].map(({ rot, color }, i) => (
        <mesh key={i} rotation={rot}>
          <cylinderGeometry args={[0.018, 0.018, 4.4]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Axis labels */}
      <Text position={[0, 2.4, 0]} fontSize={0.28} color="#34d399">|0⟩</Text>
      <Text position={[0, -2.4, 0]} fontSize={0.28} color="#34d399">|1⟩</Text>
      <Text position={[2.5, 0, 0]} fontSize={0.22} color="#60a5fa">|+⟩</Text>
      <Text position={[-2.5, 0, 0]} fontSize={0.22} color="#60a5fa">|-⟩</Text>
      <Text position={[0, 0, 2.5]} fontSize={0.22} color="#f472b6">|i⟩</Text>
      <Text position={[0, 0, -2.5]} fontSize={0.22} color="#f472b6">|-i⟩</Text>

      {/* State arrow */}
      <StateArrow theta={theta} phi={phi} />

      {/* State label */}
      <Text position={[0, -3.0, 0]} fontSize={0.24} color="#f59e0b" anchorX="center" fontWeight={700}>
        {label}
      </Text>
      {description && (
        <Text position={[0, -3.4, 0]} fontSize={0.12} color="#64748b" anchorX="center" maxWidth={5}>
          {description}
        </Text>
      )}
    </group>
  );
}
