---
phase: 5
plan: 4
wave: 3
depends_on: [5.2, 5.3]
files_modified:
  - frontend/src/components/AvatarPopup/FloatingAvatar.tsx
  - frontend/src/App.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "A floating avatar popup appears periodically (every 60-90 seconds) or on trigger events"
    - "The popup shows the active agent's avatar face + a speech bubble with a tip or greeting"
    - "The popup speaks its text via TTS (useSpeech hook)"
    - "The popup auto-dismisses after 5 seconds and can be closed manually"
    - "Trigger events: first message sent, first visualization rendered, 90s idle"
  artifacts:
    - "frontend/src/components/AvatarPopup/FloatingAvatar.tsx exists"
    - "FloatingAvatar is rendered in App.tsx when current view is 'studio'"
  key_links:
    - "FloatingAvatar reads selectedAgent and activeVisualization from useAppStore"
    - "FloatingAvatar imports useSpeech to speak its messages"
---

# Plan 5.4: Floating Avatar Popup System

## Objective
Make the AI agents feel alive and present. A floating popup appears in the bottom-right corner
of the studio, showing the active agent's avatar with a speech bubble containing a contextual tip,
prompt, or greeting. It speaks via TTS and auto-dismisses after 5 seconds.

This creates an "assistant companion" feel — like having a guide that occasionally checks in.

## Context
- .planning/phases/5/RESEARCH.md (Floating Avatar Popup section)
- frontend/src/App.tsx ← mount FloatingAvatar in studio view
- frontend/src/store/index.ts ← may need new state for popup trigger
- frontend/src/lib/useSpeech.ts ← for TTS in popup

## Tasks

<task type="auto">
  <name>Create FloatingAvatar.tsx — the popup companion widget</name>
  <files>
    frontend/src/components/AvatarPopup/FloatingAvatar.tsx
  </files>
  <action>
    Create `frontend/src/components/AvatarPopup/FloatingAvatar.tsx`.

    The component:
    - Positioned: fixed, bottom-right corner (bottom: 24px, right: 24px), z-index: 9999
    - Visible only when `isVisible` internal state is true
    - Animates in with a slide-up + fade-in CSS animation
    - Consists of:
      a) A speech bubble (above the avatar)
      b) A circular avatar image (bottom of the popup)
      c) A close button (✕) on the bubble

    MESSAGES PER CONTEXT:
    Define an array of contextual messages for the Instructor:
    ```typescript
    const INSTRUCTOR_TIPS = [
      { trigger: 'idle', text: "Curious about something? Try asking me to explain quantum entanglement or how neural networks work!" },
      { trigger: 'first_viz', text: "You can click and drag the 3D visualization to explore it from any angle. Try it!" },
      { trigger: 'first_message', text: "Great question! I'll explain it simply and show you a 3D visualization to make it crystal clear." },
      { trigger: 'idle', text: "Did you know? Grover's algorithm can search an unsorted database of N items in √N steps — try asking me to show it!" },
      { trigger: 'idle', text: "Try asking me: 'How does gradient descent work?' — I'll show you a beautiful animation!" },
    ];

    const ASSISTANT_TIPS = [
      { trigger: 'idle', text: "Ready to build a circuit? Try dragging a Hadamard gate onto the circuit grid!" },
      { trigger: 'first_message', text: "I can help you design, optimize, and simulate quantum circuits. What shall we build?" },
      { trigger: 'idle', text: "You can export your circuit as QASM code using the Code Editor tab!" },
      { trigger: 'idle', text: "Try creating a Bell state: H on q[0], then CNOT with q[0] as control and q[1] as target." },
    ];
    ```

    TRIGGER LOGIC (useEffect-based):
    1. IDLE TIMER: set a timeout for 90 seconds → show a random 'idle' message
       Reset the timer every time the popup is shown (so it shows again 90s later)
    2. Store a react ref `hasShownFirstViz` — when `activeVisualization` changes from null to non-null,
       show the 'first_viz' tip ONCE. Track with ref `firstVizShown = useRef(false)`.
    3. Store a react ref `hasShownFirstMessage` — when messages.length changes from 0 to 1 (user's first message),
       show 'first_message' tip ONCE. Track with ref `firstMsgShown = useRef(false)`.
    4. Read from `useAppStore()`: `{ messages, activeVisualization }`
    5. Props: `selectedAgent: 'instructor' | 'assistant'`

    POPUP RENDERING:
    ```tsx
    // Position: fixed bottom-right
    // When isVisible === false: opacity 0, transform: translateY(20px), pointer-events: none
    // When isVisible === true: opacity 1, transform: translateY(0), pointer-events: auto
    // Transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)

    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      pointerEvents: isVisible ? 'auto' : 'none',
      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      {/* Speech bubble */}
      <div style={{
        maxWidth: '260px', padding: '14px 16px',
        background: 'rgba(8,13,27,0.96)',
        border: '1px solid rgba(99,102,241,0.4)',
        borderRadius: '16px 16px 4px 16px',
        boxShadow: '0 8px 32px rgba(99,102,241,0.2)',
        position: 'relative',
      }}>
        <button onClick={dismiss} style={{
          position: 'absolute', top: '8px', right: '8px',
          width: '20px', height: '20px', borderRadius: '50%',
          background: 'rgba(51,65,85,0.6)', border: 'none', color: '#94a3b8',
          cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center',
          justifyContent: 'center',
        }}>✕</button>
        <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.5,
          paddingRight: '16px', margin: 0 }}>
          {currentMessage}
        </p>
      </div>

      {/* Avatar circle - use the same imported PNG from AgentSelectPage */}
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid rgba(99,102,241,0.6)',
        boxShadow: '0 0 20px rgba(99,102,241,0.4)',
      }}>
        <img src={selectedAgent === 'instructor' ? instructorImg : assistantImg}
          alt="Agent"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
        />
      </div>
    </div>
    ```

    AUTO-DISMISS:
    - When `isVisible` becomes true, set a timeout of 5000ms → call `dismiss()`
    - `dismiss()` sets `isVisible = false`
    - Clear the timeout ref on dismiss to prevent double-dismiss

    TTS:
    - Import `useSpeech` and call `speak(currentMessage)` whenever `isVisible` becomes true
    - Import the avatar images from `../AgentSelect/` (same files used in Plan 5.3)
      Adjust import path to match the exact filenames generated

    AVOID: Showing the popup more than once every 90 seconds.
    AVOID: Showing popup during loading states (check isLoading from store — if true, skip).
    AVOID: Making the popup block any interactive UI element (z-index 9999 but small and corner-positioned).
  </action>
  <verify>
    cd frontend && npx tsc --noEmit 2>&1 | grep "FloatingAvatar" | head -5
  </verify>
  <done>
    - FloatingAvatar.tsx exists with no TypeScript errors
    - Component accepts selectedAgent prop
    - Idle timer logic exists (90s)
    - First-viz and first-message triggers exist (useRef guards)
  </done>
</task>

<task type="auto">
  <name>Mount FloatingAvatar in App.tsx studio view</name>
  <files>
    frontend/src/App.tsx
  </files>
  <action>
    In App.tsx, when rendering the studio view:

    1. Import FloatingAvatar:
       `import FloatingAvatar from './components/AvatarPopup/FloatingAvatar';`

    2. After the main studio layout div (the `<div className="flex h-screen...">` wrapper),
       add `<FloatingAvatar selectedAgent={selectedAgent} />` as a sibling element,
       wrapped in a React Fragment `<>...</>`.

    The complete studio return should look like:
    ```tsx
    return (
      <>
        <div className="flex h-screen bg-[#020617] ...">
          {/* existing studio layout */}
        </div>
        <FloatingAvatar selectedAgent={selectedAgent} />
      </>
    );
    ```

    This places FloatingAvatar outside the flex layout but still in the React tree,
    allowing its `fixed` positioning to work correctly relative to the viewport.

    AVOID: Nesting FloatingAvatar inside any overflow:hidden container.
  </action>
  <verify>
    cd frontend && npx tsc --noEmit 2>&1 | head -15
  </verify>
  <done>
    - TypeScript compiles without errors
    - FloatingAvatar is mounted in the studio view
    - On manual test: wait 90 seconds in the studio → popup appears bottom-right with agent avatar and tip text
    - Clicking ✕ dismisses the popup
    - After dismissal, popup appears again after another 90 seconds
  </done>
</task>

## Success Criteria
- [ ] FloatingAvatar.tsx exists and compiles
- [ ] Popup appears after 90 seconds idle in the studio
- [ ] Popup appears immediately after user sends their first message
- [ ] Popup appears when first visualization renders
- [ ] Popup auto-dismisses after 5 seconds
- [ ] Popup speaks its message via TTS
- [ ] ✕ button dismisses popup early
- [ ] Popup shows correct avatar image matching selected agent
- [ ] `npx tsc --noEmit` exits 0 in frontend/
