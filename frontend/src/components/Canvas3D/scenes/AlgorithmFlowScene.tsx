import React, { useRef, useState } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

interface AlgoNode {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end';
  details?: string;
}

interface AlgoEdge {
  from: string;
  to: string;
  label?: string;
}

interface AlgorithmData {
  nodes: AlgoNode[];
  edges: AlgoEdge[];
  description?: string;
}

const NODE_COLORS: Record<string, string> = {
  start: '#10b981',
  process: '#6366f1',
  decision: '#f59e0b',
  end: '#ef4444',
};

export default function AlgorithmFlowScene({
  data,
  onInteract,
}: {
  data: AlgorithmData;
  onInteract?: (msg: string) => Promise<void> | void;
}) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeEdgeIndex, setActiveEdgeIndex] = useState<number | null>(null);
  const isRunningRef = useRef(false);

  const nodes = data?.nodes ?? [];
  const edges = data?.edges ?? [];

  const nodePositions: Record<string, [number, number, number]> = {};
  nodes.forEach((node, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    nodePositions[node.id] = [(col - 1) * 2.5, (-row) * 1.8, 0];
  });

  const runTour = async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    for (let i = 0; i < nodes.length; i++) {
      if (!isRunningRef.current) break;
        
      const node = nodes[i];
      setActiveNodeId(node.id);
      
      const detail = node.details || `${node.label} — this is the ${node.type} step in the algorithm.`;
      if (onInteract) {
        await onInteract(detail);
      }

      // Find an outgoing edge
      const outEdgeIdx = edges.findIndex(e => e.from === node.id);
      if (outEdgeIdx !== -1 && isRunningRef.current) {
        setActiveEdgeIndex(outEdgeIdx);
        // Small delay to let the arrow highlight
        await new Promise(r => setTimeout(r, 600));
      }
    }

    setActiveNodeId(null);
    setActiveEdgeIndex(null);
    isRunningRef.current = false;
  };

  return (
    <group>
      {edges.map((edge, i) => {
        const startPos = nodePositions[edge.from];
        const endPos = nodePositions[edge.to];
        if (!startPos || !endPos) return null;
        
        const mid: [number, number, number] = [
          (startPos[0] + endPos[0]) / 2,
          (startPos[1] + endPos[1]) / 2,
          0,
        ];
        const isActive = activeEdgeIndex === i;
        
        return (
          <group key={`edge-${i}`}>
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array([...startPos, ...endPos]), 3]}
                />
              </bufferGeometry>
              <lineBasicMaterial color={isActive ? '#38bdf8' : '#475569'} transparent opacity={isActive ? 1.0 : 0.6} />
            </line>
            
            {edge.label && (
              <Text position={[mid[0], mid[1] + 0.2, mid[2]]} fontSize={0.13} color={isActive ? '#38bdf8' : '#94a3b8'} anchorX="center">
                {edge.label}
              </Text>
            )}
            
            {/* Arrowhead cone */}
            {(() => {
              const dx = endPos[0] - startPos[0];
              const dy = endPos[1] - startPos[1];
              const angle = Math.atan2(dx, dy);
              // offset slightly back from the end node so it doesn't clip
              const arrowPos = [endPos[0] - dx*0.12, endPos[1] - dy*0.12, endPos[2]];
              
              return (
                <mesh
                  position={[arrowPos[0], arrowPos[1], arrowPos[2]]}
                  rotation={[0, 0, angle]}
                >
                  <coneGeometry args={[0.08, 0.25, 6]} />
                  <meshStandardMaterial color={isActive ? '#38bdf8' : '#475569'} emissive={isActive ? '#38bdf8' : '#000000'} emissiveIntensity={isActive ? 1.0 : 0}/>
                </mesh>
              );
            })()}
          </group>
        );
      })}

      {nodes.map((node) => {
        const pos = nodePositions[node.id];
        if (!pos) return null;
        const color = NODE_COLORS[node.type] ?? '#6366f1';
        const isActive = activeNodeId === node.id;
        
        return (
          <group key={node.id}>
            <mesh
              position={pos}
              onPointerDown={(e) => {
                e.stopPropagation();
                // If user clicks anywhere, start the tour
                runTour();
              }}
            >
              <boxGeometry args={[0.9, 0.45, 0.12]} />
              <meshStandardMaterial
                color={isActive ? '#ffffff' : color}
                emissive={isActive ? '#ffffff' : color}
                emissiveIntensity={isActive ? 1.5 : 0.3}
              />
            </mesh>
            <Text
              position={[pos[0], pos[1], pos[2] + 0.07]}
              fontSize={0.14}
              color={isActive ? '#1e293b' : 'white'}
              anchorX="center"
              anchorY="middle"
              maxWidth={0.85}
            >
              {node.label}
            </Text>
          </group>
        );
      })}
    </group>
  );
}
