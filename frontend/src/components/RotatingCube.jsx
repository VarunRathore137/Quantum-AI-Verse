import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function RotatingCube() {
   const meshRef = useRef()

   // Rotate cube continuously
   useFrame((state, delta) => {
      if (meshRef.current) {
         meshRef.current.rotation.x += delta * 0.5
         meshRef.current.rotation.y += delta * 0.7
      }
   })

   return (
      <mesh ref={meshRef} position={[0, 0.5, 0]}>
         {/* Box Geometry - represents a quantum gate */}
         <boxGeometry args={[2, 2, 2]} />

         {/* Material with gradient-like effect */}
         <meshStandardMaterial
            color="#8b5cf6"
            metalness={0.6}
            roughness={0.2}
            emissive="#6366f1"
            emissiveIntensity={0.2}
         />

         {/* Wireframe overlay for quantum gate appearance */}
         <mesh>
            <boxGeometry args={[2.01, 2.01, 2.01]} />
            <meshBasicMaterial
               color="#ec4899"
               wireframe={true}
               transparent={true}
               opacity={0.3}
            />
         </mesh>
      </mesh>
   )
}

export default RotatingCube
