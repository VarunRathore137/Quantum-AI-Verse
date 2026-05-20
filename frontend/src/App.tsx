import React, { useState } from 'react';
import ChatContainer from './components/Chat/ChatContainer';
import Main3DCanvas from './components/Canvas3D/Main3DCanvas';
import CodeEditor from './components/CodeEditor/CodeEditor';
import AgentSelectPage from './components/AgentSelect/AgentSelectPage';
import FloatingAvatar from './components/AvatarPopup/FloatingAvatar';
import CustomCursor from './components/CustomCursor';
import LandingPage from './components/LandingPage/LandingPage';
import { useAppStore } from './store';
import { useSpeech } from './lib/useSpeech';

type RightTab = 'visualizer' | 'editor';
type AppView = 'landing' | 'agent-select' | 'studio';
type AgentType = 'instructor' | 'assistant';

function Starfield() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {Array.from({ length: 80 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() > 0.8 ? '2px' : '1px',
            height: Math.random() > 0.8 ? '2px' : '1px',
            background: 'white',
            borderRadius: '50%',
            left: `${(i * 9.97) % 100}%`,
            top: `${(i * 7.33) % 100}%`,
            opacity: 0.1 + (i % 5) * 0.08,
            animation: `pulse ${2 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${(i % 7) * 0.4}s`,
          }}
        />
      ))}
      {/* Animated glow accents */}
      <div style={{
        position: 'absolute', top: '10%', left: '20%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '20%',
        width: '350px', height: '350px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
      }} />
    </div>
  );
}

function ResumePrompt() {
  const hasInterrupted = useAppStore(state => state.hasInterruptedSpeech);
  const currentSubtitle = useAppStore(state => state.currentSubtitle);
  const { resumeSpeech } = useSpeech();

  // Show if there is interrupted speech left, AND the interaction speech has finished (no subtitle playing)
  if (!hasInterrupted || currentSubtitle) return null;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[110] animate-slide-up flex gap-3 items-center glass-dark px-4 py-2 rounded-2xl border border-indigo-500/40 shadow-lg">
      <span className="text-sm font-semibold text-slate-300">Resume explanation?</span>
      <button 
        onClick={resumeSpeech}
        className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-md"
      >
        Play
      </button>
      <button 
        onClick={() => useAppStore.getState().setHasInterruptedSpeech(false)}
        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-xs font-semibold transition-all"
      >
        Cancel
      </button>
    </div>
  );
}

function SubtitleOverlay() {
  const currentSubtitle = useAppStore(state => state.currentSubtitle);

  if (!currentSubtitle) return null;

  return (
    <div className="absolute bottom-10 left-0 right-0 z-[100] flex justify-center pointer-events-none animate-slide-up">
      <div className="max-w-2xl px-8 py-4 glass-dark rounded-3xl border border-blue-500/30 shadow-[0_8px_32px_rgba(99,102,241,0.2)]">
        <p className="text-xl md:text-2xl font-bold text-center bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300 text-transparent bg-clip-text drop-shadow-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[600px]">
          "{currentSubtitle}"
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('instructor');
  const [activeTab, setActiveTab] = useState<RightTab>('visualizer');

  const handleAgentSelect = (agent: AgentType) => {
    setSelectedAgent(agent);
    setCurrentView('studio');
  };

  // ── Landing Screen ───────────────────────────────────────────────
  if (currentView === 'landing') {
    return (
      <>
        <CustomCursor />
        <LandingPage onEnter={() => setCurrentView('agent-select')} />
      </>
    );
  }

  // ── Agent Select Screen ──────────────────────────────────────────
  if (currentView === 'agent-select') {
    return (
      <>
        <CustomCursor />
        <AgentSelectPage onSelect={handleAgentSelect} />
      </>
    );
  }

  // ── Studio Screen ────────────────────────────────────────────────
  return (
    <>
      <CustomCursor />
      <div
        className="flex h-screen overflow-hidden relative"
        style={{ fontFamily: "'Inter', sans-serif", background: 'radial-gradient(ellipse at 50% 30%, #0f172a 0%, #020617 70%)' }}
      >
        <Starfield />

        {/* ── Left: Chat Panel ─────────────────────────────────────── */}
        <div className="z-10 h-full">
          {/* Subtle glass effect behind chat to blend with background */}
          <div className="absolute inset-0 bg-[#080d1b]/80 backdrop-blur-md -z-10" />
          <ChatContainer selectedAgent={selectedAgent} setActiveTab={setActiveTab} />
        </div>

        {/* ── Right: Tabbed Panel ──────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10 glass-dark border-l border-slate-800/50">
          {/* Tab Bar */}
          <div className="flex items-center gap-0 border-b border-slate-800/80 px-2 pt-2 z-30 flex-shrink-0 bg-transparent">
            <TabButton
              id="tab-visualizer"
              active={activeTab === 'visualizer'}
              onClick={() => setActiveTab('visualizer')}
              icon="⚛"
              label="Visualizer"
              badge="3D"
            />
            <TabButton
              id="tab-editor"
              active={activeTab === 'editor'}
              onClick={() => setActiveTab('editor')}
              icon="💻"
              label="Code Editor"
              badge="QASM"
            />

            {/* Spacer + Controls */}
            <div className="ml-auto flex items-center gap-3 px-3 pb-2">
              <button
                onClick={() => setCurrentView('agent-select')}
                className="text-xs font-semibold tracking-wider text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700/50 hover:bg-white/10 hover:border-slate-500/50 transition-all"
                title="Switch agent"
              >
                ← Switch Agent
              </button>
              <div className="h-4 w-px bg-slate-700 md:block hidden" />
              <div className="flex items-center gap-1.5 md:flex hidden">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live</span>
              </div>
              <div className="h-4 w-px bg-slate-700" />
              <span className="text-sm font-black tracking-tighter text-white/20 select-none">
                Q-AI <span className="text-indigo-500/40">VERSE</span>
              </span>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-0 relative">
            <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'visualizer' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              <Main3DCanvas />
              {activeTab === 'visualizer' && (
                <>
                  <SubtitleOverlay />
                  <ResumePrompt />
                </>
              )}
            </div>
            <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'editor' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
              <CodeEditor />
            </div>
          </div>
        </div>
      </div>

      {/* Floating avatar portal — outside flex layout for proper fixed positioning */}
      <FloatingAvatar selectedAgent={selectedAgent} />
    </>
  );
}

// ── Tab Button Component ──────────────────────────────────────────
function TabButton({
  id, active, onClick, icon, label, badge
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  badge: string;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-5 py-3 mb-0 rounded-t-xl text-sm font-semibold
        transition-all duration-300 select-none group backdrop-blur-md
        ${active
          ? 'bg-slate-900/60 text-white border border-b-0 border-indigo-500/30 shadow-[0_-4px_24px_rgba(99,102,241,0.15)]'
          : 'bg-transparent text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-800/40'
        }
      `}
    >
      <span className={`text-lg leading-none transition-transform duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`}>{icon}</span>
      <span>{label}</span>
      <span className={`
        text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase transition-all duration-300
        ${active ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800/80 text-slate-500 group-hover:text-slate-400'}
      `}>
        {badge}
      </span>
      {/* Active indicator line */}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_-2px_10px_rgba(99,102,241,0.5)]" />
      )}
    </button>
  );
}
