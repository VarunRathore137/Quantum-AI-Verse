import React, { Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useAppStore } from '../../store';
import { useSpeech } from '../../lib/useSpeech';

import IdleScene from './scenes/IdleScene';
import BlochSphereScene from './scenes/BlochSphereScene';
import QRAMScene from './scenes/QRAMScene';
import SuperpositionScene from './scenes/SuperpositionScene';
import QuantumRegisterScene from './scenes/QuantumRegisterScene';
import EntanglementScene from './scenes/EntanglementScene';
import NeuralNetworkScene from './scenes/NeuralNetworkScene';
import WaveInterferenceScene from './scenes/WaveInterferenceScene';
import AlgorithmFlowScene from './scenes/AlgorithmFlowScene';
import ProbabilityDistScene from './scenes/ProbabilityDistScene';
import AtomModelScene from './scenes/AtomModelScene';
import ConceptMapScene from './scenes/ConceptMapScene';
import GradientDescentScene from './scenes/GradientDescentScene';

// ── Loading fallback ──────────────────────────────────────────────
function SceneLoading() {
  return null;
}

// ── Viz Router — picks the right scene ───────────────────────────
function VisualizationRouter({
  viz,
  onInteract,
}: {
  viz: any;
  onInteract: (msg: string) => void;
}) {
  if (!viz) return <IdleScene />;

  const type = viz.type?.toLowerCase() ?? '';
  const data = viz.data ?? {};

  switch (type) {
    case 'bloch_sphere':
      return <BlochSphereScene data={data} />;
    case 'qram_structure':
      return <QRAMScene data={data} />;
    case 'superposition_wave':
      return <SuperpositionScene data={data} />;
    case 'quantum_register':
      return <QuantumRegisterScene data={data} />;
    case 'entanglement_bell':
      return <EntanglementScene data={data} />;
    case 'neural_network':
      return <NeuralNetworkScene data={data} onInteract={onInteract} />;
    case 'wave_interference':
      return <WaveInterferenceScene data={data} onInteract={onInteract} />;
    case 'algorithm_flow':
      return <AlgorithmFlowScene data={data} onInteract={onInteract} />;
    case 'probability_dist':
      return <ProbabilityDistScene data={data} onInteract={onInteract} />;
    case 'atom_model':
      return <AtomModelScene data={data} onInteract={onInteract} />;
    case 'concept_map':
      return <ConceptMapScene data={data} onInteract={onInteract} />;
    case 'gradient_descent':
      return <GradientDescentScene data={data} onInteract={onInteract} />;
    default:
      return <IdleScene />;
  }
}

// ── Viz type → label ──────────────────────────────────────────────
const VIZ_LABELS: Record<string, string> = {
  bloch_sphere: '⚛  Bloch Sphere',
  qram_structure: '🧠  Q-RAM Structure',
  superposition_wave: '〜  Superposition Wave',
  quantum_register: '📊  Quantum Register',
  entanglement_bell: '🔗  Bell State Entanglement',
  neural_network: '🧠  Neural Network',
  wave_interference: '〜  Wave Interference',
  algorithm_flow: '⚙️  Algorithm Flow',
  probability_dist: '📊  Probability Distribution',
  atom_model: '⚛  Atom Model',
  concept_map: '🗺  Concept Map',
  gradient_descent: '📉  Gradient Descent',
};

const VIZ_COLORS: Record<string, string> = {
  bloch_sphere: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
  qram_structure: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  superposition_wave: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  quantum_register: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
  entanglement_bell: 'from-blue-500/20 to-pink-500/20 border-pink-500/30',
  neural_network: 'from-pink-500/20 to-violet-500/20 border-pink-500/30',
  wave_interference: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30',
  algorithm_flow: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
  probability_dist: 'from-sky-500/20 to-blue-500/20 border-sky-500/30',
  atom_model: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30',
  concept_map: 'from-violet-500/20 to-indigo-500/20 border-violet-500/30',
  gradient_descent: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
};

// ── Main Canvas ───────────────────────────────────────────────────
export default function Main3DCanvas() {
  const { activeVisualization } = useAppStore();
  const { speak } = useSpeech();
  const vizType = activeVisualization?.type ?? '';
  const hasViz = !!activeVisualization;

  const handleInteract = useCallback(
    (msg: string) => {
      console.log('[INTERACT]', msg);
      return speak(msg, { interrupt: true, tourEvent: true });
    },
    [speak]
  );

  return (
    <div className="w-full h-full bg-[#020617] relative overflow-hidden">
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.05) 0%, transparent 70%)',
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        className="z-10 relative"
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.6} />
        <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1.5} castShadow />
        <pointLight position={[-8, -8, -8]} intensity={0.8} color="#6366f1" />
        <pointLight position={[8, -4, 4]} intensity={0.5} color="#f472b6" />

        {/* Background star field */}
        <Stars radius={80} depth={50} count={800} factor={2} saturation={0.4} fade speed={0.5} />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          autoRotate={!hasViz}
          autoRotateSpeed={0.3}
          minDistance={3}
          maxDistance={16}
        />

        <Suspense fallback={<SceneLoading />}>
          <VisualizationRouter viz={activeVisualization} onInteract={handleInteract} />
        </Suspense>
      </Canvas>

      {/* ── Header badge ── */}
      <div className="absolute top-4 left-4 pointer-events-none z-20">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em]">
            Quantum Visualizer
          </span>
        </div>
      </div>

      {/* ── QUANTUM AI VERSE watermark ── */}
      <div className="absolute top-4 right-4 pointer-events-none z-20">
        <h1 className="text-xl font-black tracking-tighter text-white/30 select-none">
          Q-AI <span className="text-blue-500/50">VERSE</span>
        </h1>
      </div>

      {/* ── Active visualization badge ── */}
      {hasViz && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
          <div
            className={`glass animate-slide-up backdrop-blur-xl border px-5 py-2.5 rounded-full
              flex items-center gap-3 shadow-2xl bg-gradient-to-r
              ${VIZ_COLORS[vizType] ?? 'from-slate-800/80 to-slate-900/80 border-slate-700/50'}`}
          >
            <span className="text-sm font-semibold text-slate-200 tracking-wide">
              {VIZ_LABELS[vizType] ?? 'Quantum Visualization'}
            </span>
            <button
              className="w-5 h-5 rounded-full bg-slate-700/50 hover:bg-slate-600/70 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-all pointer-events-auto"
              onClick={() => useAppStore.getState().setVisualization(null)}
              title="Close visualization"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
