import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface ConceptNode {
  label: string;
  color: string;
  angle: number; // degrees
  details?: string;
}

interface ConceptMapData {
  center: string;
  nodes: ConceptNode[];
  description?: string;
}

const COLOR_MAP: Record<string, string> = {
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#10b981',
  red: '#ef4444',
  gold: '#f59e0b',
};

export default function ConceptMapScene({
  data,
  onInteract,
}: {
  data: ConceptMapData;
  onInteract?: (msg: string) => void;
}) {
  const center = data?.center ?? 'Concept';
  const nodes = data?.nodes ?? [];
  const ORBIT_RADIUS = 3.0;

  const nodeRefs = useRef<(THREE.Mesh | null)[]>(Array(nodes.length).fill(null));
  const [activeNodeIndex, setActiveNodeIndex] = useState<number | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    nodeRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const node = nodes[i];
      const baseAngle = (node.angle * Math.PI) / 180;
      const baseX = ORBIT_RADIUS * Math.cos(baseAngle);
      const baseY = ORBIT_RADIUS * Math.sin(baseAngle);
      mesh.position.y = baseY + 0.05 * Math.sin(t + baseAngle);
      mesh.position.x = baseX;
      
      // Pulse animation for active node
      if (i === activeNodeIndex) {
        const scale = 1 + 0.2 * Math.sin(t * 4);
        mesh.scale.set(scale, scale, scale);
      } else {
        mesh.scale.set(1, 1, 1);
      }
    });
  });

  return (
    <group>
      {/* Center node */}
      <mesh>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.4} />
      </mesh>
      <Text position={[0, 0.65, 0]} fontSize={0.22} color="white" anchorX="center">
        {center}
      </Text>

      {/* Satellite nodes */}
      {nodes.map((node, i) => {
        const rad = (node.angle * Math.PI) / 180;
        const basePos: [number, number, number] = [
          ORBIT_RADIUS * Math.cos(rad),
          ORBIT_RADIUS * Math.sin(rad),
          0,
        ];
        const color = COLOR_MAP[node.color] ?? '#3b82f6';

        return (
          <group key={i}>
            {/* Connection line from center */}
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array([0, 0, 0, ...basePos]), 3]}
                />
              </bufferGeometry>
              <lineBasicMaterial color={color} transparent opacity={0.3} />
            </line>

            {/* Satellite sphere */}
            <mesh
              position={basePos}
              ref={(el) => { nodeRefs.current[i] = el; }}
              onPointerDown={(e) => {
                e.stopPropagation();
                setActiveNodeIndex(i);
                const desc = node.details || `${node.label} is a key concept related to ${center}.`;
                onInteract?.(desc);
              }}
            >
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial 
                color={i === activeNodeIndex ? '#ffffff' : color} 
                emissive={i === activeNodeIndex ? '#ffffff' : color} 
                emissiveIntensity={i === activeNodeIndex ? 1.5 : 0.4} 
              />
            </mesh>
            <Text
              position={[basePos[0], basePos[1] + 0.38, basePos[2]]}
              fontSize={0.17}
              color={color}
              anchorX="center"
            >
              {node.label}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
