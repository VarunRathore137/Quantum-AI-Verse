import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WaveData {
  wave1_freq: number;
  wave2_freq: number;
  amplitude: number;
  description?: string;
}

export default function WaveInterferenceScene({
  data,
  onInteract,
}: {
  data: WaveData;
  onInteract?: (msg: string) => void;
}) {
  const wave1Freq = data?.wave1_freq ?? 2.0;
  const wave2Freq = data?.wave2_freq ?? 2.5;
  const amplitude = data?.amplitude ?? 1.0;
  const POINT_COUNT = 40;

  const meshRefs = useRef<(THREE.Mesh | null)[]>(Array(POINT_COUNT).fill(null));
  const timeRef = useRef(0);

  // Evenly spaced x positions
  const xPositions = useMemo(
    () => Array.from({ length: POINT_COUNT }, (_, i) => (i / (POINT_COUNT - 1)) * 10 - 5),
    []
  );

  useFrame(({ clock }) => {
    timeRef.current = clock.getElapsedTime();
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const x = xPositions[i];
      const t = timeRef.current;
      const y =
        amplitude * Math.sin(wave1Freq * x + t) +
        amplitude * Math.sin(wave2Freq * x - t);
      mesh.position.y = y * 0.5;
      // Color based on interference
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (y > 0.3) {
        mat.color.set('#8b5cf6');
        mat.emissive.set('#8b5cf6');
        mat.emissiveIntensity = 0.5;
      } else if (y < -0.3) {
        mat.color.set('#3b82f6');
        mat.emissive.set('#3b82f6');
        mat.emissiveIntensity = 0.5;
      } else {
        mat.color.set('#475569');
        mat.emissive.set('#475569');
        mat.emissiveIntensity = 0.1;
      }
    });
  });

  return (
    <group>
      {/* Reference line at y=0 */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([-5, 0, 0, 5, 0, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#1e293b" transparent opacity={0.6} />
      </line>

      {/* Wave points */}
      {xPositions.map((x, i) => (
        <mesh
          key={i}
          position={[x, 0, 0]}
          ref={(el) => { meshRefs.current[i] = el; }}
          onPointerDown={() =>
            onInteract?.(
              "That's a point of constructive interference! The two waves add together here to create a bigger amplitude — this is how quantum superposition creates probability peaks."
            )
          }
        >
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.4} />
        </mesh>
      ))}

      {/* Connecting lines between adjacent points for wave visual */}
      {xPositions.slice(0, -1).map((_, i) => (
        <line key={`wl-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([xPositions[i], 0, 0, xPositions[i + 1], 0, 0]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#6366f1" transparent opacity={0.2} />
        </line>
      ))}
    </group>
  );
}
