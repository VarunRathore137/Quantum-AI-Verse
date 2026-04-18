---
phase: 5
plan: 3
wave: 3
depends_on: [5.1, 5.2]
files_modified:
  - frontend/src/App.tsx
  - frontend/src/components/AgentSelect/AgentSelectPage.tsx
  - frontend/src/components/AgentSelect/InstructorAvatar.png (generated asset)
  - frontend/src/components/AgentSelect/AssistantAvatar.png (generated asset)
autonomous: true
user_setup: []

must_haves:
  truths:
    - "A beautiful Agent Selection page exists between app start and the studio"
    - "The Instructor and Lab Assistant have distinct AI avatar images"
    - "User clicks an agent card to enter the studio"
    - "The selected agent name is stored in app state for later use"
    - "Agent cards have hover glow animations"
  artifacts:
    - "frontend/src/components/AgentSelect/AgentSelectPage.tsx exists"
    - "App.tsx has state-based routing: 'agent-select' | 'studio' view"
    - "Avatar images are real, AI-generated PNG files used in the component"
  key_links:
    - "App.tsx currentView state controls which screen is shown"
    - "AgentSelectPage receives onSelect(agent: 'instructor' | 'assistant') callback"
---

# Plan 5.3: Agent Selection Page + AI Avatar Images

## Objective
Create the **"Choose Your Agent"** page — the first screen users see after the app loads.
Two stunning holographic AI agent cards (The Instructor + The Lab Assistant), each with a
generated avatar image, glowing hover effects, and a click-to-enter interaction. This makes
the dual-agent nature of the platform immediately clear and gives the app a premium feel.

This plan also adds React state-based navigation in `App.tsx` (no react-router needed).

## Context
- .planning/phases/5/RESEARCH.md (Avatar Design section)
- frontend/src/App.tsx ← add view routing
- frontend/src/components/AgentSelect/ ← new directory for this page

## Tasks

<task type="auto">
  <name>Generate avatar images using generate_image tool + create AgentSelectPage component</name>
  <files>
    frontend/src/components/AgentSelect/AgentSelectPage.tsx
  </files>
  <action>
    STEP 1 — Generate the two avatar images using the generate_image tool:

    For THE INSTRUCTOR avatar, use this prompt:
    "A sleek holographic AI professor avatar for a quantum computing education platform. 
    Depicted from chest-up against a deep space dark background. The figure wears a futuristic 
    academic coat with glowing blue circuit patterns. The face is stylized and geometric, 
    emitting a soft blue-violet glow. Surrounded by floating quantum equations and Bloch sphere 
    holograms. The overall aesthetic is cyberpunk-academic, premium, dark background, 4K quality."
    Save as: instructor_avatar (use the generate_image tool)

    For THE LAB ASSISTANT avatar:
    "A futuristic AI lab assistant avatar for a quantum computing platform. Depicted from chest-up 
    against a dark space background. The figure wears a sleek tech lab coat with glowing green-cyan 
    circuit patterns. The face is angular and energetic, with green holographic eyes. 
    Surrounded by floating circuit boards and quantum circuit diagrams. 
    Aesthetic: cyberpunk-tech-lab, vibrant, dark background, 4K quality."
    Save as: assistant_avatar (use the generate_image tool)

    Copy the generated images to: frontend/src/components/AgentSelect/
    (Copy from the artifacts directory to the frontend directory)

    STEP 2 — Create AgentSelectPage.tsx:

    ```tsx
    import React, { useState } from 'react';
    // Import the avatar PNG files
    import instructorImg from './instructor_avatar.png'; // adjust filename as generated
    import assistantImg from './assistant_avatar.png';  // adjust filename as generated

    type Agent = 'instructor' | 'assistant';

    interface Props {
      onSelect: (agent: Agent) => void;
    }

    export default function AgentSelectPage({ onSelect }: Props) {
      const [hovered, setHovered] = useState<Agent | null>(null);

      return (
        <div
          className="min-h-screen w-full flex flex-col items-center justify-center"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, #0f172a 0%, #020617 70%)',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Stars background SVG or CSS dots */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Generate 80 star dots via JS */}
            {Array.from({ length: 80 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-30 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          {/* Header */}
          <div className="text-center mb-12 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-blue-300 tracking-widest uppercase">Quantum-AI Verse</span>
            </div>
            <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
              Choose Your{' '}
              <span style={{ background: 'linear-gradient(135deg, #6366f1, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AI Guide
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md mx-auto">
              Select an agent to begin your quantum learning journey
            </p>
          </div>

          {/* Agent Cards */}
          <div className="flex gap-8 z-10 px-8">
            {/* Instructor Card */}
            <AgentCard
              id="select-instructor"
              agent="instructor"
              name="The Instructor"
              tagline="Concept Educator & Visualizer"
              description="Explain any quantum, AI, or science concept in simple language with stunning 3D visualizations. Learn through voice-guided analogies and interactive models."
              traits={['3D Visualizations', 'Voice Explanations', 'Any Topic']}
              color="blue"
              avatarSrc={instructorImg}
              isHovered={hovered === 'instructor'}
              onHover={setHovered}
              onSelect={onSelect}
            />

            {/* Assistant Card */}
            <AgentCard
              id="select-assistant"
              agent="assistant"
              name="The Lab Assistant"
              tagline="Quantum Circuit Engineer"
              description="Design, optimize, and simulate quantum circuits. Get hands-on with circuit building, code generation, and real quantum computation experiments."
              traits={['Circuit Design', 'QASM Code', 'Simulation']}
              color="green"
              avatarSrc={assistantImg}
              isHovered={hovered === 'assistant'}
              onHover={setHovered}
              onSelect={onSelect}
            />
          </div>

          {/* Footer note */}
          <p className="text-slate-600 text-xs mt-12 z-10">
            You can switch agents at any time from within the studio
          </p>
        </div>
      );
    }

    // ── Agent Card Sub-component ──────────────────────────────────────────
    type CardColor = 'blue' | 'green';

    function AgentCard({
      id, agent, name, tagline, description, traits, color, avatarSrc,
      isHovered, onHover, onSelect
    }: {
      id: string;
      agent: Agent;
      name: string;
      tagline: string;
      description: string;
      traits: string[];
      color: CardColor;
      avatarSrc: string;
      isHovered: boolean;
      onHover: (a: Agent | null) => void;
      onSelect: (a: Agent) => void;
    }) {
      const colorMap = {
        blue: {
          glow: 'rgba(99,102,241,0.4)',
          border: 'rgba(99,102,241,0.4)',
          traitBg: 'rgba(99,102,241,0.15)',
          traitText: '#a5b4fc',
          btn: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          shadow: '0 0 60px rgba(99,102,241,0.3)',
        },
        green: {
          glow: 'rgba(16,185,129,0.4)',
          border: 'rgba(16,185,129,0.4)',
          traitBg: 'rgba(16,185,129,0.15)',
          traitText: '#6ee7b7',
          btn: 'linear-gradient(135deg, #10b981, #06b6d4)',
          shadow: '0 0 60px rgba(16,185,129,0.3)',
        },
      };

      const c = colorMap[color];

      return (
        <div
          id={id}
          onMouseEnter={() => onHover(agent)}
          onMouseLeave={() => onHover(null)}
          onClick={() => onSelect(agent)}
          style={{
            cursor: 'pointer',
            width: '340px',
            background: isHovered
              ? `radial-gradient(ellipse at 50% 0%, ${c.glow} 0%, rgba(8,13,27,0.95) 70%)`
              : 'rgba(8,13,27,0.8)',
            border: `1px solid ${isHovered ? c.border : 'rgba(51,65,85,0.5)'}`,
            borderRadius: '20px',
            padding: '0',
            boxShadow: isHovered ? c.shadow : '0 4px 24px rgba(0,0,0,0.4)',
            transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            transform: isHovered ? 'scale(1.03) translateY(-8px)' : 'scale(1)',
            overflow: 'hidden',
          }}
        >
          {/* Avatar image */}
          <div style={{ height: '260px', overflow: 'hidden', position: 'relative' }}>
            <img
              src={avatarSrc}
              alt={name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                filter: isHovered ? 'brightness(1.15)' : 'brightness(0.85)',
                transition: 'filter 0.3s ease',
              }}
            />
            {/* Bottom gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, transparent 40%, rgba(8,13,27,1) 100%)'
            }} />
          </div>

          {/* Card body */}
          <div style={{ padding: '20px 24px 28px' }}>
            <div style={{ marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
                color: c.traitText, textTransform: 'uppercase' }}>
                {tagline}
              </span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'white', marginBottom: '10px',
              letterSpacing: '-0.02em' }}>{name}</h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '16px' }}>
              {description}
            </p>

            {/* Trait pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {traits.map(t => (
                <span key={t} style={{
                  padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                  background: c.traitBg, color: c.traitText,
                  border: `1px solid ${c.traitText}30`,
                }}>
                  {t}
                </span>
              ))}
            </div>

            {/* CTA Button */}
            <button
              style={{
                width: '100%', padding: '13px', borderRadius: '12px',
                background: c.btn, border: 'none', color: 'white',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                letterSpacing: '0.05em',
                transition: 'opacity 0.2s',
                opacity: isHovered ? 1 : 0.8,
              }}
            >
              Start with {name} →
            </button>
          </div>
        </div>
      );
    }
    ```

    IMPORTANT: After creating the component, also run generate_image for both avatars 
    and place the generated PNG files in frontend/src/components/AgentSelect/.
    Update import paths to match the exact generated filenames.

    AVOID: Using TailwindCSS class names for the card — use inline styles for the complex animation
    logic (the card uses JS-controlled isHovered state, not CSS :hover, for dynamic effects).
    Use TailwindCSS classes only for simple static elements.
  </action>
  <verify>
    cd frontend && npx tsc --noEmit 2>&1 | grep "AgentSelect" | head -5
  </verify>
  <done>
    - AgentSelectPage.tsx exists and has no TypeScript errors
    - Two avatar PNG files exist in frontend/src/components/AgentSelect/
    - Component renders two agent cards (confirmed by visual inspection via browser)
  </done>
</task>

<task type="auto">
  <name>Add state-based routing to App.tsx for agent-select → studio flow</name>
  <files>
    frontend/src/App.tsx
  </files>
  <action>
    Refactor App.tsx to support three views: 'agent-select' | 'studio'
    (No landing page needed — start directly at agent-select)

    1. Add imports:
       - `import AgentSelectPage from './components/AgentSelect/AgentSelectPage';`

    2. Replace or augment the existing App component:
       ```tsx
       type AppView = 'agent-select' | 'studio';
       type AgentType = 'instructor' | 'assistant';

       export default function App() {
         const [currentView, setCurrentView] = useState<AppView>('agent-select');
         const [selectedAgent, setSelectedAgent] = useState<AgentType>('instructor');
         const [activeTab, setActiveTab] = useState<RightTab>('visualizer');

         const handleAgentSelect = (agent: AgentType) => {
           setSelectedAgent(agent);
           setCurrentView('studio');
         };

         if (currentView === 'agent-select') {
           return <AgentSelectPage onSelect={handleAgentSelect} />;
         }

         // Studio view — existing layout remains intact
         return (
           <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden"
             style={{ fontFamily: "'Inter', sans-serif" }}>
             <ChatContainer selectedAgent={selectedAgent} />
             <div className="flex-1 flex flex-col min-w-0 relative">
               {/* Tab Bar */}
               <div className="flex items-center gap-0 bg-[#020617] border-b border-slate-800/80 px-2 pt-2 z-30 flex-shrink-0">
                 <TabButton id="tab-visualizer" active={activeTab === 'visualizer'}
                   onClick={() => setActiveTab('visualizer')} icon="⚛" label="Visualizer" badge="3D" />
                 <TabButton id="tab-editor" active={activeTab === 'editor'}
                   onClick={() => setActiveTab('editor')} icon="💻" label="Code Editor" badge="QASM" />
                 {/* Back to agent select button */}
                 <div className="ml-auto flex items-center gap-3 px-3 pb-2">
                   <button
                     onClick={() => setCurrentView('agent-select')}
                     className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 rounded hover:bg-slate-800/50 transition-all"
                     title="Switch agent"
                   >
                     ← Switch Agent
                   </button>
                   <div className="h-4 w-px bg-slate-800" />
                   <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                     <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Live</span>
                   </div>
                   <div className="h-4 w-px bg-slate-800" />
                   <span className="text-sm font-black tracking-tighter text-white/20 select-none">
                     Q-AI <span className="text-blue-500/40">VERSE</span>
                   </span>
                 </div>
               </div>
               {/* Tab Content */}
               <div className="flex-1 min-h-0 relative">
                 <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'visualizer' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                   <Main3DCanvas />
                 </div>
                 <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'editor' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                   <CodeEditor />
                 </div>
               </div>
             </div>
           </div>
         );
       }
       ```

    3. Update `ChatContainer` to optionally accept `selectedAgent` prop.
       In `ChatContainer.tsx`, add an optional prop:
       - `interface Props { selectedAgent?: 'instructor' | 'assistant' }` 
       - Update the component signature: `export default function ChatContainer({ selectedAgent = 'instructor' }: Props)`
       - In the header, change the agent name display: show 'THE INSTRUCTOR' or 'THE LAB ASSISTANT'
         based on selectedAgent prop
       - The API endpoint can remain `/api/chat/instructor` for now (Lab Assistant routing in future)

    AVOID: Importing react-router or any routing library.
    AVOID: Breaking the existing studio layout — only wrap it with the view switch.
  </action>
  <verify>
    cd frontend && npx tsc --noEmit 2>&1 | head -20
  </verify>
  <done>
    - TypeScript compiles without errors  
    - App starts with AgentSelectPage visible (not the studio)
    - Clicking "Start with The Instructor" navigates to studio with chat panel showing "THE INSTRUCTOR"
    - "← Switch Agent" button returns to AgentSelectPage
    - Existing studio functionality is fully preserved
  </done>
</task>

## Success Criteria
- [ ] AgentSelectPage renders with two avatar image cards before the studio
- [ ] Both AI avatar images are real generated images (not placeholder emoji)
- [ ] Hover on cards shows glow/scale animation
- [ ] Clicking a card navigates to the studio with the correct agent selected
- [ ] "← Switch Agent" button in the studio header returns to agent selection
- [ ] TypeScript compiles without errors (`npx tsc --noEmit` exits 0)
