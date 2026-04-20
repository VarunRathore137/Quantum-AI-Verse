import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface NeuralNetworkData {
  layers: number[];
  active_layer: number;
  layer_details?: string[];
  description?: string;
}

export default function NeuralNetworkScene({
  data,
  onInteract,
}: {
  data: NeuralNetworkData;
  onInteract?: (msg: string) => Promise<void> | void;
}) {
  const layers = data?.layers ?? [3, 4, 2];
  const defaultActiveLayer = data?.active_layer ?? 0;
  const layerDetails = data?.layer_details ?? [];
  const totalLayers = layers.length;

  const neuronRefs = useRef<(THREE.Mesh | null)[][]>(
    layers.map((n) => Array(n).fill(null))
  );
  
  const [interactedNode, setInteractedNode] = useState<{li: number, ni: number} | null>(null);
  const [tourActiveLayer, setTourActiveLayer] = useState<number | null>(null);
  const isRunningRef = useRef(false);

  const activeLayer = tourActiveLayer !== null ? tourActiveLayer : defaultActiveLayer;

  const runTour = async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    for (let li = 0; li < totalLayers; li++) {
      if (!isRunningRef.current) break;
      setTourActiveLayer(li);
      
      const detail = layerDetails[li] || `Data is now propagating through layer ${li}.`;
      if (onInteract) {
        await onInteract(detail);
      }
      
      // Small pause to highlight propagation to the next layer
      await new Promise(r => setTimeout(r, 400));
    }

    setTourActiveLayer(null);
    setInteractedNode(null);
    isRunningRef.current = false;
  };

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    neuronRefs.current.forEach((layer, li) => {
      layer.forEach((mesh, ni) => {
        if (!mesh) return;
        const isInteracted = interactedNode?.li === li && interactedNode?.ni === ni;
        if (li === activeLayer || isInteracted) {
          const s = 1 + 0.15 * Math.sin(t * (isInteracted ? 6 : 2));
          mesh.scale.setScalar(s);
        } else {
          mesh.scale.setScalar(1);
        }
      });
    });
  });

  const positions: [number, number, number][][] = layers.map((count, li) => {
    const x = (li - (totalLayers - 1) / 2) * 2.0;
    return Array.from({ length: count }, (_, ni) => {
      const y = (ni - (count - 1) / 2) * 0.6;
      return [x, y, 0] as [number, number, number];
    });
  });

  const lineSegments: { start: [number, number, number]; end: [number, number, number]; active: boolean }[] = [];
  for (let li = 0; li < totalLayers - 1; li++) {
    const isActive = li === activeLayer || li + 1 === activeLayer;
    for (const startPos of positions[li]) {
      for (const endPos of positions[li + 1]) {
        lineSegments.push({ start: startPos, end: endPos, active: isActive });
      }
    }
  }

  return (
    <group>
      {lineSegments.map((seg, i) => (
        <line key={`line-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([...seg.start, ...seg.end]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={seg.active ? '#818cf8' : '#334155'}
            transparent
            opacity={seg.active ? 0.7 : 0.3}
          />
        </line>
      ))}

      {positions.map((layerPos, li) =>
        layerPos.map((pos, ni) => (
          <mesh
            key={`n-${li}-${ni}`}
            position={pos}
            ref={(el) => {
              if (!neuronRefs.current[li]) neuronRefs.current[li] = [];
              neuronRefs.current[li][ni] = el;
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              setInteractedNode({li, ni});
              runTour();
            }}
          >
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial
              color={interactedNode?.li === li && interactedNode?.ni === ni ? '#ffffff' : (li === activeLayer ? '#f472b6' : '#6366f1')}
              emissive={interactedNode?.li === li && interactedNode?.ni === ni ? '#ffffff' : (li === activeLayer ? '#f472b6' : '#6366f1')}
              emissiveIntensity={interactedNode?.li === li && interactedNode?.ni === ni ? 1.5 : (li === activeLayer ? 0.6 : 0.2)}
            />
          </mesh>
        ))
      )}

      {positions.map((_, li) => {
        const x = (li - (totalLayers - 1) / 2) * 2.0;
        const label =
          li === 0 ? 'Input' : li === totalLayers - 1 ? 'Output' : `Hidden ${li}`;
        return (
          <Text
            key={`label-${li}`}
            position={[x, -(layers[li] * 0.6) / 2 - 0.6, 0]}
            fontSize={0.16}
            color={li === activeLayer ? '#f472b6' : '#64748b'}
            anchorX="center"
          >
            {label}
          </Text>
        );
      })}
    </group>
  );
}
