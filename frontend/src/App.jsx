import { useState } from 'react'
import HealthCheck from './components/HealthCheck'
import Canvas3D from './components/Canvas3D'

function App() {
   return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
         <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <header className="text-center mb-12">
               <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  Q-AI Quantum Interface
               </h1>
               <p className="text-gray-300 text-lg">
                  Advanced Quantum Computing Visualization
               </p>
            </header>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
               {/* Left Column - Health Check */}
               <div className="space-y-6">
                  <HealthCheck />
               </div>

               {/* Right Column - 3D Visualization */}
               <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-2xl">
                     <h2 className="text-2xl font-semibold text-white mb-4">
                        3D Quantum Gate Visualization
                     </h2>
                     <div className="h-[500px] rounded-xl overflow-hidden bg-black/30">
                        <Canvas3D />
                     </div>
                     <p className="text-gray-400 text-sm mt-4">
                        Click and drag to orbit • Scroll to zoom
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default App
