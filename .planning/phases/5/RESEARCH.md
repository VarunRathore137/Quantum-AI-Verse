# Research — Phase 5: Universal Viz + Voice + Agent Avatars

## Feature 1: Universal Topic Visualization

### Current State
- Visualization is hardcoded to 5 types: `bloch_sphere`, `qram_structure`, `superposition_wave`,
  `quantum_register`, `entanglement_bell`
- `Main3DCanvas.tsx` has a switch-case `VisualizationRouter` that falls through to `IdleScene` for any
  unknown type
- The instructor agent system prompt explicitly limits topics to these 5 quantum types
- `ChatContainer.tsx` quick-start chips are all Q-RAM / quantum only

### Required Change: "Universal Viz" Architecture
The AI needs to become a **general-purpose education agent** covering:
- Any quantum computing topic (gates, algorithms, phenomena)
- AI/ML concepts (neural networks, decision trees, gradient descent, attention mechanism)
- Classical CS concepts (sorting, graphs, data structures)
- Physics concepts related to quantum (wave-particle duality, interference)

**Approach: Dynamic Visualization Schema**
- Replace the hardcoded 5-type system with a **universal visualization schema**
- The LLM returns a `viz_type` from an EXTENDED set of ~15 types
- Each type maps to a React Three Fiber scene component
- New types to add:
  - `neural_network` — Animated nodes/layers for AI concepts
  - `wave_interference` — Interference patterns for wave physics
  - `algorithm_flow` — Flowchart-style node/edge graph for algorithms
  - `probability_distribution` — 3D bar chart / surface plot
  - `atom_model` — Orbiting electrons for atomic physics
  - `graph_traversal` — BFS/DFS style network visualization
  - `matrix_transform` — Geometric transformation visualization
  - `decision_tree` — Branching tree structure
  - `gradient_descent` — 3D surface with descending ball
  - `concept_map` — Central node + satellite concept nodes

**Request Validation**
- Agent must: 1) validate if topic is educational/genuine, 2) explain in simple language, 3) pick closest viz
- Add a "topic classifier" prompt layer: topics that are NOT educational get a polite redirect
- No external library needed — pure LLM classification via system prompt

### Frontend Extension
- `Main3DCanvas.tsx`: Extend `VisualizationRouter` with new type handlers
- Each new scene is a React Three Fiber component procedurally generating geometry from `data` props
- Use `@react-three/drei` helpers: `Text`, `Line`, `Sphere`, `Box`, `Torus`, `Html` overlay

---

## Feature 2: Voice Explanation (TTS)

### API Choice: Web Speech API (`SpeechSynthesis`)
- **Zero dependencies** — built into all modern browsers (Chrome, Edge, Safari, Firefox)
- **No cost** — no API key needed
- **Low latency** — speaks immediately as text is available
- TypeScript types: included in `lib.dom.d.ts` — no extra packages

### Implementation Pattern
```typescript
// Custom hook: useSpeech.ts
const speak = (text: string) => {
  window.speechSynthesis.cancel(); // Stop previous
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.95;  // Slightly slower for clarity
  utt.pitch = 1.0;
  // Select a good English voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang === 'en-US' && v.name.includes('Google'));
  if (preferred) utt.voice = preferred;
  window.speechSynthesis.speak(utt);
};
```

### UX Pattern
- When assistant message arrives → auto-speak the explanation text
- Strip markdown (`**`, `*`, `-`, ``` ` ```) before speaking
- Show a "🔊 Speaking..." indicator on the active agent avatar
- Mute button in chat header to toggle auto-speak on/off
- Voice for agent interactions ("You dragged a gate!", "Superposition collapses when measured!")

---

## Feature 3: Interactive 3D Visualizations

### What "Interactive" Means
- User can click/drag/rotate objects in 3D scene
- Agent narrates effects as user interacts (via voice)
- Examples:
  - Click a qubit sphere → hear "You collapsed the superposition!"
  - Drag a node in neural network → hear "That neuron now has stronger connections"
  - Spin the Bloch sphere → hear "You're rotating through quantum state space"

### Implementation
- Each scene component gets an `onInteract` callback prop
- `onInteract(actionDescription: string)` → triggers `useSpeech.speak(actionDescription)`
- Use `@react-three/fiber`'s `onPointerDown`, `onPointerEnter` mesh events
- No new libraries needed — all within existing Three.js/R3F stack

---

## Feature 4: Agent Avatars & Selection Page

### Avatar Design
- **The Instructor**: Scientific, academic vibe. Tall holographic figure with glowing quantum aura.
  Generate an AI avatar image using `generate_image` tool.
- **The Lab Assistant**: Practical, energetic vibe. Compact, tech-focused holographic figure.
  Generate a second AI avatar image.

### Agent Selection Page (Page 2 after Landing)
- New route/view: `AgentSelectPage`
- Shows two cards side-by-side with large avatar renders
- Hover → avatar "activates" with glow and subtle animation
- Click → navigates to the main studio with that agent active
- App currently has no routing — use React state-based routing (no react-router needed)

### Floating Avatar Popup System
- Small floating avatar widget appears in corner of screen periodically
  (every 60-90 seconds or on key events like first message, long idle)
- Shows agent's face in a circular frame with a speech bubble
- Speaks a short contextual message via TTS
- Messages triggered by: idle too long, user's first message, achieving a visualization, exploration milestones
- Disappear after 5 seconds or on click
- Implemented as a fixed-position overlay component outside the main layout

### Current App Flow
- `App.tsx` has no routing, just renders `ChatContainer` + tabbed `Main3DCanvas / CodeEditor`
- Need to add: `currentView: 'landing' | 'agent-select' | 'studio'` state
- Landing page already exists or is the current Studio — add an agent selection screen BEFORE it

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| TTS engine | Web Speech API | Zero deps, zero cost, instant |
| New viz scenes | R3F procedural TSX | Consistent with existing architecture |
| Routing | React state (no router) | App is SPA, no URL routing needed |
| Avatar images | AI-generated PNG | Embedded as `<img>` or CSS background |
| Avatar popups | Fixed CSS overlay | Simple, no portal needed |
| Viz schema | Extended type union | Backward compatible with existing 5 types |
| Topic validation | System prompt layer | No external classifier API needed |

---

## Risk: LLM Response Size for 15+ Viz Types

The expanded system prompt with 15+ visualization type schemas will be ~3000 tokens.
Groq with Llama-3 handles 8192 context easily, so this is fine.
Mitigation: Use a "vizType → minimal data schema" approach (only required fields per type).
