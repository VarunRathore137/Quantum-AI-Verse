import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';

interface QRAMData {
  depth: number;
  active_address: string;
  memory_values: Record<string, string>;
  description: string;
}

// ── Single Memory Node ────────────────────────────────────────────
function MemoryNode({
  position, isActive, isOnPath, label, memValue, depth
}: {
  position: [number, number, number];
  isActive: boolean;
  isOnPath: boolean;
  label: string;
  memValue?: string;
  depth: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const time = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (isActive) {
      time.current += delta * 3;
      const s = 1 + Math.sin(time.current) * 0.1;
      meshRef.current.scale.setScalar(s);
    }
  });

  const color = isActive ? '#f59e0b' : isOnPath ? '#60a5fa' : '#334155';
  const emissive = isActive ? '#f59e0b' : isOnPath ? '#3b82f6' : '#1e293b';
  const emissiveIntensity = isActive ? 1.0 : isOnPath ? 0.5 : 0.1;
  const size = depth === 0 ? 0.22 : depth === 1 ? 0.18 : 0.14;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[size, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={isOnPath ? 1 : 0.5}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>
      <Text position={[0, size + 0.12, 0]} fontSize={0.09} color={isOnPath ? '#93c5fd' : '#475569'} anchorX="center">
        {label}
      </Text>
      {memValue && isActive && (
        <Text position={[0, -(size + 0.18), 0]} fontSize={0.08} color="#fcd34d" anchorX="center" maxWidth={1}>
          {memValue}
        </Text>
      )}
      {/* Glow ring for active */}
      {isActive && (
        <mesh>
          <torusGeometry args={[size + 0.08, 0.02, 8, 32]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2} transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

// ── Tree Connection Line ──────────────────────────────────────────
function TreeEdge({ from, to, isActive }: { from: THREE.Vector3; to: THREE.Vector3; isActive: boolean }) {
  const color = isActive ? '#60a5fa' : '#1e293b';
  return (
    <Line
      points={[from, to]}
      color={color}
      lineWidth={isActive ? 2 : 0.8}
      transparent
      opacity={isActive ? 0.9 : 0.3}
    />
  );
}

// ── Q-RAM Scene (3-level binary tree) ────────────────────────────
export default function QRAMScene({ data }: { data: QRAMData }) {
  const depth = Math.min(data.depth || 3, 3);
  const activeAddress = data.active_address || '101';
  const memValues = data.memory_values || {};

  // Build layout positions
  const nodes = useMemo(() => {
    const result: Array<{
      id: string;
      position: [number, number, number];
      label: string;
      depth: number;
      memValue?: string;
    }> = [];

    const hSpacing = [0, 2.6, 1.4, 0.7];
    const yPositions = [1.8, 0.6, -0.6, -1.8];

    function buildTree(nodeId: string, nodeDepth: number, x: number) {
      if (nodeDepth > depth) return;
      const label = nodeDepth === 0 ? 'ROOT' : nodeId;
      const isLeaf = nodeDepth === depth;
      result.push({
        id: nodeId,
        position: [x, yPositions[nodeDepth], 0],
        label,
        depth: nodeDepth,
        memValue: isLeaf ? memValues[nodeId.slice(-depth)] : undefined,
      });
      if (nodeDepth < depth) {
        const childSpacing = hSpacing[nodeDepth + 1];
        buildTree(nodeId + '0', nodeDepth + 1, x - childSpacing);
        buildTree(nodeId + '1', nodeDepth + 1, x + childSpacing);
      }
    }

    buildTree('', 0, 0);
    return result;
  }, [depth, memValues]);

  // Edges between nodes
  const edges = useMemo(() => {
    const edgeList: Array<{ from: string; to: string }> = [];
    for (const node of nodes) {
      if (node.id.length > 0) {
        const parentId = node.id.slice(0, -1);
        edgeList.push({ from: parentId, to: node.id });
      }
    }
    return edgeList;
  }, [nodes]);

  const nodeMap = useMemo(() => {
    const map: Record<string, (typeof nodes)[0]> = {};
    for (const n of nodes) map[n.id] = n;
    return map;
  }, [nodes]);

  // Which nodes are on the active path?
  const activePath = useMemo(() => {
    const path = new Set<string>();
    path.add('');
    for (let i = 0; i < activeAddress.length; i++) {
      path.add(activeAddress.slice(0, i + 1));
    }
    return path;
  }, [activeAddress]);

  return (
    <group position={[0, 0.3, 0]}>
      {/* Edges */}
      {edges.map((edge, i) => {
        const fromNode = nodeMap[edge.from];
        const toNode = nodeMap[edge.to];
        if (!fromNode || !toNode) return null;
        const isActive = activePath.has(edge.from) && activePath.has(edge.to);
        return (
          <TreeEdge
            key={i}
            from={new THREE.Vector3(...fromNode.position)}
            to={new THREE.Vector3(...toNode.position)}
            isActive={isActive}
          />
        );
      })}
      {/* Nodes */}
      {nodes.map((node) => (
        <MemoryNode
          key={node.id}
          position={node.position}
          isActive={node.id === activeAddress}
          isOnPath={activePath.has(node.id)}
          label={node.label === 'ROOT' ? 'ROOT' : `|${node.id}⟩`}
          memValue={node.memValue}
          depth={node.depth}
        />
      ))}
      {/* Title */}
      <Text
        position={[0, 2.8, 0]}
        fontSize={0.22}
        color="#f59e0b"
        anchorX="center"
        fontWeight={700}
      >
        Q-RAM (Bucket Brigade)
      </Text>
      <Text
        position={[0, 2.45, 0]}
        fontSize={0.12}
        color="#64748b"
        anchorX="center"
        maxWidth={6}
      >
        Address: |{activeAddress}⟩ — active path highlighted
      </Text>
    </group>
  );
}
