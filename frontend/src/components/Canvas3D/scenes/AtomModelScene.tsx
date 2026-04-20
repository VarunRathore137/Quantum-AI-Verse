import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface AtomData {
  element: string;
  protons: number;
  neutrons: number;
  electron_shells: number[];
  description?: string;
}

export default function AtomModelScene({
  data,
  onInteract,
}: {
  data: AtomData;
  onInteract?: (msg: string) => void;
}) {
  const element = data?.element ?? 'Hydrogen';
  const protons = data?.protons ?? 1;
  const neutrons = data?.neutrons ?? 0;
  const shells = data?.electron_shells ?? [1];

  // Electron angle accumulators (one per electron on each shell)
  const electronAngles = useRef<number[][]>(
    shells.map((count) => Array.from({ length: count }, (_, i) => (i / count) * Math.PI * 2))
  );
  const electronRefs = useRef<(THREE.Mesh | null)[][]>(
    shells.map((count) => Array(count).fill(null))
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    shells.forEach((count, si) => {
      const orbitRadius = 1.2 * (si + 1) + 0.8;
      const speed = 0.6 / (si + 1); // outer shells orbit slower
      Array.from({ length: count }).forEach((_, ei) => {
        const mesh = electronRefs.current[si]?.[ei];
        if (!mesh) return;
        const angle = t * speed + (ei / count) * Math.PI * 2;
        mesh.position.x = orbitRadius * Math.cos(angle);
        mesh.position.y = orbitRadius * Math.sin(angle) * 0.3; // flattened ellipse
        mesh.position.z = orbitRadius * Math.sin(angle);
      });
    });
  });

  // Build nucleus: cluster protons and neutrons
  const nucleusParticles: { color: string; pos: [number, number, number] }[] = [];
  for (let i = 0; i < Math.min(protons, 6); i++) {
    const a = (i / protons) * Math.PI * 2;
    nucleusParticles.push({ color: '#ef4444', pos: [Math.cos(a) * 0.18, Math.sin(a) * 0.18, 0] });
  }
  for (let i = 0; i < Math.min(neutrons, 6); i++) {
    const a = (i / Math.max(neutrons, 1)) * Math.PI * 2 + 0.5;
    nucleusParticles.push({ color: '#94a3b8', pos: [Math.cos(a) * 0.18, Math.sin(a) * 0.18, 0.12] });
  }

  return (
    <group>
      {/* Nucleus */}
      <group
        onPointerDown={() =>
          onInteract?.(
            `The nucleus contains ${protons} proton(s) and ${neutrons} neutron(s). Its positive charge binds the electrons in their quantum orbitals.`
          )
        }
      >
        {nucleusParticles.map((p, i) => (
          <mesh key={`nuc-${i}`} position={p.pos}>
            <sphereGeometry args={[0.13, 10, 10]} />
            <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.4} />
          </mesh>
        ))}
      </group>

      {/* Orbital rings + electrons */}
      {shells.map((count, si) => {
        const orbitRadius = 1.2 * (si + 1) + 0.8;
        return (
          <group key={`shell-${si}`}>
            {/* Orbit torus */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[orbitRadius, 0.008, 6, 80]} />
              <meshBasicMaterial color="#1e293b" transparent opacity={0.5} />
            </mesh>
            {/* Electrons */}
            {Array.from({ length: count }).map((_, ei) => (
              <mesh
                key={`e-${si}-${ei}`}
                ref={(el) => {
                  if (!electronRefs.current[si]) electronRefs.current[si] = [];
                  electronRefs.current[si][ei] = el;
                }}
                onPointerDown={() =>
                  onInteract?.(
                    `That's an electron in shell ${si + 1}! It carries negative charge and exists in a quantum orbital — not a fixed path, but a probability cloud.`
                  )
                }
              >
                <sphereGeometry args={[0.1, 10, 10]} />
                <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.6} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Element label */}
      <Text position={[0, -(shells.length * 1.2 + 1.6), 0]} fontSize={0.22} color="#f59e0b" anchorX="center">
        {element}
      </Text>
    </group>
  );
}
