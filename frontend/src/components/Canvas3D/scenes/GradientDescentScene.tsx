import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface GradientData {
  loss_at_step: number[];
  current_step: number;
  learning_rate: number;
  description?: string;
}

export default function GradientDescentScene({
  data,
  onInteract,
}: {
  data: GradientData;
  onInteract?: (msg: string) => void;
}) {
  const lossAtStep = data?.loss_at_step ?? [2.5, 1.8, 1.2, 0.8, 0.5, 0.3];
  const currentStep = data?.current_step ?? 3;
  const totalSteps = lossAtStep.length;

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.15;
  });

  // Parabola surface: bowl shape y = x^2 + z^2
  // Render as a grid of dots/line mesh approximation
  const GRID = 10;
  const RANGE = 2;
  const surfacePoints: [number, number, number][] = [];
  for (let xi = 0; xi <= GRID; xi++) {
    for (let zi = 0; zi <= GRID; zi++) {
      const x = (xi / GRID) * RANGE * 2 - RANGE;
      const z = (zi / GRID) * RANGE * 2 - RANGE;
      const y = (x * x + z * z) * 0.4 - 1.5; // scale down, offset to center
      surfacePoints.push([x, y, z]);
    }
  }

  // Path spheres along the descent (plotted along x=-2..2, z=0)
  const pathSpheres = lossAtStep.map((loss, i) => {
    const x = (i / (totalSteps - 1)) * 4 - 2;
    const z = 0;
    const y = (x * x) * 0.4 - 1.5;
    return { pos: [x, y + 0.05, z] as [number, number, number], loss, i };
  });

  return (
    <group ref={groupRef}>
      {/* Surface grid lines */}
      {Array.from({ length: GRID + 1 }).map((_, xi) => {
        const pts: number[] = [];
        for (let zi = 0; zi <= GRID; zi++) {
          const x = (xi / GRID) * RANGE * 2 - RANGE;
          const z = (zi / GRID) * RANGE * 2 - RANGE;
          const y = (x * x + z * z) * 0.4 - 1.5;
          pts.push(x, y, z);
        }
        return (
          <line key={`xline-${xi}`}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[new Float32Array(pts), 3]} />
            </bufferGeometry>
            <lineBasicMaterial color="#0f4c75" transparent opacity={0.5} />
          </line>
        );
      })}
      {Array.from({ length: GRID + 1 }).map((_, zi) => {
        const pts: number[] = [];
        for (let xi = 0; xi <= GRID; xi++) {
          const x = (xi / GRID) * RANGE * 2 - RANGE;
          const z = (zi / GRID) * RANGE * 2 - RANGE;
          const y = (x * x + z * z) * 0.4 - 1.5;
          pts.push(x, y, z);
        }
        return (
          <line key={`zline-${zi}`}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[new Float32Array(pts), 3]} />
            </bufferGeometry>
            <lineBasicMaterial color="#0f4c75" transparent opacity={0.5} />
          </line>
        );
      })}

      {/* Path spheres */}
      {pathSpheres.map((s) => (
        <group key={`step-${s.i}`}>
          <mesh
            position={s.pos}
            onPointerDown={() =>
              onInteract?.(
                `At step ${s.i}, the loss was ${s.loss.toFixed(2)}. The algorithm is moving downhill towards the minimum — each step reduces the error a little more!`
              )
            }
          >
            <sphereGeometry args={[0.13, 10, 10]} />
            <meshStandardMaterial
              color={s.i === currentStep ? '#f59e0b' : '#e2e8f0'}
              emissive={s.i === currentStep ? '#f59e0b' : '#94a3b8'}
              emissiveIntensity={s.i === currentStep ? 0.8 : 0.2}
            />
          </mesh>
          {s.i === currentStep && (
            <Text
              position={[s.pos[0], s.pos[1] + 0.28, s.pos[2]]}
              fontSize={0.15}
              color="#f59e0b"
              anchorX="center"
            >
              Step {s.i}
            </Text>
          )}
        </group>
      ))}

      {/* Path line connecting spheres */}
      {pathSpheres.length > 1 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(pathSpheres.flatMap((s) => s.pos)), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#f59e0b" transparent opacity={0.6} />
        </line>
      )}
    </group>
  );
}
