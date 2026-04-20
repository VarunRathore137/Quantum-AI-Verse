import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface ProbDistData {
  labels: string[];
  values: number[];
  colors: string[];
  description?: string;
}

const COLOR_MAP: Record<string, string> = {
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#10b981',
  red: '#ef4444',
  gold: '#f59e0b',
};

export default function ProbabilityDistScene({
  data,
  onInteract,
}: {
  data: ProbDistData;
  onInteract?: (msg: string) => void;
}) {
  const labels = data?.labels ?? ['A', 'B'];
  const values = data?.values ?? [0.5, 0.5];
  const colors = data?.colors ?? ['blue', 'purple'];
  const description = data?.description ?? '';

  const barCount = labels.length;
  const totalWidth = barCount * 1.2;
  const startX = -totalWidth / 2 + 0.6;

  const barRefs = useRef<(THREE.Mesh | null)[]>(Array(barCount).fill(null));

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    barRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      // Tiny oscillation for tall bars only
      if (values[i] > 0.1) {
        const delta = 0.02 * Math.sin(t * 1.5 + i * 0.8);
        mesh.scale.y = 1 + delta;
      }
    });
  });

  return (
    <group position={[0, -1.5, 0]}>
      {labels.map((label, i) => {
        const x = startX + i * 1.2;
        const barHeight = Math.max(values[i] * 4, 0.05);
        const color = COLOR_MAP[colors[i]] ?? '#3b82f6';

        return (
          <group key={i}>
            {/* Bar */}
            <mesh
              position={[x, barHeight / 2, 0]}
              ref={(el) => { barRefs.current[i] = el; }}
              onPointerDown={() =>
                onInteract?.(
                  `${label} has a ${(values[i] * 100).toFixed(0)}% probability of being measured. ${description}`
                )
              }
            >
              <boxGeometry args={[0.5, barHeight, 0.2]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.35}
                transparent
                opacity={0.9}
              />
            </mesh>

            {/* Label below bar */}
            <Text
              position={[x, -0.4, 0]}
              fontSize={0.18}
              color="#94a3b8"
              anchorX="center"
            >
              {label}
            </Text>

            {/* Value above bar */}
            <Text
              position={[x, barHeight + 0.2, 0]}
              fontSize={0.16}
              color={color}
              anchorX="center"
            >
              {(values[i] * 100).toFixed(0)}%
            </Text>
          </group>
        );
      })}

      {/* X axis line */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([startX - 0.4, 0, 0, startX + barCount * 1.2, 0, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#334155" />
      </line>
    </group>
  );
}
