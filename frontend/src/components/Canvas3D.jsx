import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import RotatingCube from './RotatingCube'

function Canvas3D() {
   return (
      <Canvas
         camera={{ position: [5, 5, 5], fov: 50 }}
         shadows
         style={{ background: 'transparent' }}
      >
         {/* Ambient Light - soft overall lighting */}
         <ambientLight intensity={0.5} />

         {/* Directional Light - main light source */}
         <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
         />

         {/* Point Light - accent lighting */}
         <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

         {/* Rotating Cube */}
         <RotatingCube />

         {/* Grid Floor - helps with spatial orientation */}
         <Grid
            args={[10, 10]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#6366f1"
            sectionSize={2}
            sectionThickness={1}
            sectionColor="#8b5cf6"
            fadeDistance={25}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid={false}
            position={[0, -2, 0]}
         />

         {/* Orbit Controls - enables camera interaction */}
         <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={20}
         />
      </Canvas>
   )
}

export default Canvas3D
