---
phase: 5
plan: 1
wave: 1
depends_on: []
files_modified:
  - backend/app/services/instructor_agent.py
  - frontend/src/components/Canvas3D/scenes/NeuralNetworkScene.tsx
  - frontend/src/components/Canvas3D/scenes/WaveInterferenceScene.tsx
  - frontend/src/components/Canvas3D/scenes/AlgorithmFlowScene.tsx
  - frontend/src/components/Canvas3D/scenes/ProbabilityDistScene.tsx
  - frontend/src/components/Canvas3D/scenes/AtomModelScene.tsx
  - frontend/src/components/Canvas3D/scenes/ConceptMapScene.tsx
  - frontend/src/components/Canvas3D/scenes/GradientDescentScene.tsx
  - frontend/src/components/Canvas3D/Main3DCanvas.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "The instructor agent accepts ANY educational topic (quantum, AI, physics, CS, math)"
    - "The agent validates topic genuineness and politely declines non-educational requests"
    - "7 new 3D scene components exist and render without crashing"
    - "The VisualizationRouter handles all 12 viz types (5 old + 7 new)"
    - "The agent's explanation is always in simple, accessible language"
  artifacts:
    - "instructor_agent.py updated with expanded universal system prompt"
    - "7 new scene files exist in frontend/src/components/Canvas3D/scenes/"
    - "Main3DCanvas.tsx VisualizationRouter handles all 12 types"
  key_links:
    - "New scene components receive { data: any, onInteract?: (msg: string) => void } props"
    - "All new viz types must exist in VIZ_LABELS and VIZ_COLORS in Main3DCanvas.tsx"
---

# Plan 5.1: Universal Visualization Engine — Backend + New Scenes

## Objective
Transform the Instructor from a narrow Q-RAM/Bloch-sphere bot into a **universal educational AI**
that can explain and visualize ANY topic (quantum computing, AI/ML, classical CS, physics).

This plan handles:
1. Expanded backend system prompt with 12 viz types + topic validation
2. 7 new React Three Fiber scene components
3. Extended VisualizationRouter in Main3DCanvas

## Context
- .planning/phases/5/RESEARCH.md
- backend/app/services/instructor_agent.py  ← MODIFY
- frontend/src/components/Canvas3D/Main3DCanvas.tsx  ← MODIFY
- frontend/src/components/Canvas3D/scenes/BlochSphereScene.tsx  ← REFERENCE for scene structure

## Tasks

<task type="auto">
  <name>Expand instructor_agent.py with universal system prompt and 12 viz types</name>
  <files>
    backend/app/services/instructor_agent.py
  </files>
  <action>
    Replace the SYSTEM_PROMPT string completely with the new universal prompt below.
    Keep the rest of the file (Groq client, generate_instructor_response function) unchanged.

    New SYSTEM_PROMPT must:

    1. ROLE: "You are THE INSTRUCTOR, an expert educator in the QUANTUM-AI VERSE platform. You can
       explain ANY topic in science, technology, math, or engineering — with a focus on quantum computing
       and AI/ML concepts."

    2. TOPIC VALIDATION: Before answering, if the request is:
       - Not educational (e.g., "write a poem", "tell me a joke"): set explanation to a polite redirect
         like "I'm designed to teach science and tech concepts! Try asking me about neural networks,
         quantum circuits, algorithms, or physics." Set visualization to null.
       - Harmful/inappropriate: decline with "That's outside my teaching scope."
       - Genuine educational question: proceed normally.

    3. EXPLANATION STYLE:
       - Always explain in SIMPLE, accessible language first (as if to a curious 16-year-old)
       - Then optionally go deeper
       - Use real-world analogies ALWAYS
       - Use **bold** for key terms, \n\n for paragraph breaks, - for bullet points

    4. VISUALIZATION TYPES (12 total) — always pick the CLOSEST one to the topic:

       --- bloch_sphere --- (keep existing schema exactly)
       Use for: single qubits, quantum gates, quantum state, superposition of one qubit

       --- qram_structure --- (keep existing schema exactly)
       Use for: Q-RAM, quantum memory, quantum addressing

       --- superposition_wave --- (keep existing schema exactly)
       Use for: quantum superposition, interference, probability amplitudes

       --- quantum_register --- (keep existing schema exactly)
       Use for: multi-qubit states, qubit arrays, quantum data representation

       --- entanglement_bell --- (keep existing schema exactly)
       Use for: quantum entanglement, Bell states, EPR pairs

       --- neural_network ---
       Use for: neural networks, deep learning, AI, machine learning, perceptrons, transformers
       Schema:
       {
         "type": "neural_network",
         "data": {
           "layers": [3, 4, 4, 2],
           "active_layer": 1,
           "description": "A 3-layer neural network for image classification"
         }
       }
       layers = array of integers (neurons per layer), max 5 layers, max 6 neurons each
       active_layer = 0-indexed layer to highlight (the one being explained)

       --- wave_interference ---
       Use for: wave-particle duality, interference patterns, light waves, sound waves, quantum tunneling
       Schema:
       {
         "type": "wave_interference",
         "data": {
           "wave1_freq": 2.0,
           "wave2_freq": 2.5,
           "amplitude": 1.0,
           "description": "Two quantum probability waves interfering"
         }
       }

       --- algorithm_flow ---
       Use for: sorting algorithms, search algorithms, graph traversal, BFS, DFS, Dijkstra,
                Grover's algorithm steps, Shor's algorithm steps, any step-by-step process
       Schema:
       {
         "type": "algorithm_flow",
         "data": {
           "nodes": [
             {"id": "start", "label": "Start", "type": "start"},
             {"id": "check", "label": "Is sorted?", "type": "decision"},
             {"id": "swap", "label": "Swap elements", "type": "process"},
             {"id": "end", "label": "Done!", "type": "end"}
           ],
           "edges": [
             {"from": "start", "to": "check"},
             {"from": "check", "to": "swap", "label": "No"},
             {"from": "check", "to": "end", "label": "Yes"},
             {"from": "swap", "to": "check"}
           ],
           "description": "Bubble sort algorithm flow"
         }
       }
       Max 8 nodes. node.type = "start" | "process" | "decision" | "end"

       --- probability_dist ---
       Use for: probability distributions, statistics, measurement outcomes, quantum measurement,
                classical probability, Gaussian bell curve
       Schema:
       {
         "type": "probability_dist",
         "data": {
           "labels": ["|00⟩", "|01⟩", "|10⟩", "|11⟩"],
           "values": [0.5, 0.0, 0.0, 0.5],
           "colors": ["blue", "purple", "purple", "blue"],
           "description": "Bell state measurement probabilities"
         }
       }
       values must sum to ~1.0. colors = "blue"|"purple"|"green"|"red"|"gold"

       --- atom_model ---
       Use for: atoms, electrons, protons, neutrons, atomic orbitals, quantum numbers,
                periodic table, electron spin, Bohr model
       Schema:
       {
         "type": "atom_model",
         "data": {
           "element": "Hydrogen",
           "protons": 1,
           "neutrons": 0,
           "electron_shells": [1],
           "description": "Hydrogen atom — simplest element with 1 electron"
         }
       }
       electron_shells = array of integers (electrons per shell), max 3 shells

       --- concept_map ---
       Use for: general explanations where a web of concepts is best, comparing ideas, overview topics,
                topics that don't fit any specific viz type above (use this as the FALLBACK)
       Schema:
       {
         "type": "concept_map",
         "data": {
           "center": "Quantum Computing",
           "nodes": [
             {"label": "Superposition", "color": "blue", "angle": 0},
             {"label": "Entanglement", "color": "purple", "angle": 60},
             {"label": "Interference", "color": "green", "angle": 120},
             {"label": "Measurement", "color": "gold", "angle": 180},
             {"label": "Gates", "color": "red", "angle": 240},
             {"label": "Circuits", "color": "blue", "angle": 300}
           ],
           "description": "Core concepts of quantum computing"
         }
       }
       Max 8 satellite nodes. angle in degrees (0-360). colors = "blue"|"purple"|"green"|"red"|"gold"

       --- gradient_descent ---
       Use for: optimization, machine learning training, gradient descent, loss functions,
                learning rate, backpropagation, convex optimization
       Schema:
       {
         "type": "gradient_descent",
         "data": {
           "loss_at_step": [2.5, 1.8, 1.2, 0.8, 0.5, 0.3, 0.2, 0.15],
           "current_step": 4,
           "learning_rate": 0.1,
           "description": "Gradient descent minimizing a loss function"
         }
       }
       loss_at_step = array of floats (loss values over training steps), 4-10 values

    5. SELECTION RULE: Always pick ONE visualization type. If topic doesn't clearly match any of
       bloch_sphere..gradient_descent, use "concept_map" as the fallback universal visualizer.
       NEVER return visualization: null for a genuine educational question.

    6. RESPONSE FORMAT: Same as existing — raw JSON:
       {
         "explanation": "...",
         "visualization": { "type": "...", "data": {...} },
         "follow_up_suggestions": ["...", "...", "..."]
       }

    AVOID changing the function signature, Groq client setup, or error handling.
  </action>
  <verify>
    cd backend && python -c "from app.services.instructor_agent import generate_instructor_response; r = generate_instructor_response('Explain neural networks'); print(r.get('visualization', {}).get('type'))"
  </verify>
  <done>
    - Script prints a viz type (neural_network or concept_map) without error
    - SYSTEM_PROMPT in the file contains all 12 visualization types
    - Non-educational query test: generate_instructor_response('write me a poem') returns explanation
      with no visualization / polite redirect
  </done>
</task>

<task type="auto">
  <name>Create 7 new 3D scene components and extend VisualizationRouter</name>
  <files>
    frontend/src/components/Canvas3D/scenes/NeuralNetworkScene.tsx
    frontend/src/components/Canvas3D/scenes/WaveInterferenceScene.tsx
    frontend/src/components/Canvas3D/scenes/AlgorithmFlowScene.tsx
    frontend/src/components/Canvas3D/scenes/ProbabilityDistScene.tsx
    frontend/src/components/Canvas3D/scenes/AtomModelScene.tsx
    frontend/src/components/Canvas3D/scenes/ConceptMapScene.tsx
    frontend/src/components/Canvas3D/scenes/GradientDescentScene.tsx
    frontend/src/components/Canvas3D/Main3DCanvas.tsx
  </files>
  <action>
    Create each scene file. All scenes receive: `{ data: any; onInteract?: (msg: string) => void }`.
    Import from '@react-three/fiber' and '@react-three/drei'. Use `useFrame` for animations.

    === NeuralNetworkScene.tsx ===
    - Render `layers` as columns of sphere meshes (neurons)
    - Each neuron: Sphere radius=0.18, color = #6366f1 (inactive) or #f472b6 (active_layer)
    - Connect adjacent layer neurons with Line components (thin, opacity 0.3, color #334155)
    - Active connections (to/from active_layer): color #818cf8, opacity 0.7
    - Animate: pulse active_layer neurons with useFrame (scale 1 + 0.15*sin(time*2))
    - onPointerDown on any neuron → onInteract(`"You activated neuron ${i} in layer ${l}! Signals propagate forward through the network."`)
    - Position layers evenly: x = (layerIndex - (totalLayers-1)/2) * 2.0
    - Position neurons in each layer: y = (neuronIndex - (neuronsInLayer-1)/2) * 0.6

    === WaveInterferenceScene.tsx ===
    - Create a grid of ~30x1 sphere points along X axis
    - Calculate y-value for each point: y = amplitude * sin(wave1_freq * x + time) + amplitude * sin(wave2_freq * x - time)
    - Use useFrame to update point y-positions each frame (creating animated wave)
    - Color points based on constructive (+bright purple) vs destructive interference (-bright blue)
    - onPointerDown on any wave point → onInteract("That's a point of constructive interference! The waves add together here to create a bigger amplitude.")
    - Add a thin horizontal reference line at y=0

    === AlgorithmFlowScene.tsx ===
    - Render nodes as rounded BoxGeometry or Sphere meshes at computed 3D positions
    - node.type → color: start=#10b981 (green), process=#6366f1 (blue), decision=#f59e0b (amber), end=#ef4444 (red)
    - Layout: arrange nodes in a rough grid (left-to-right, top-to-bottom based on order in array)
      Use positions: [((i % 3) - 1) * 2.5, (-Math.floor(i/3)) * 1.8, 0]
    - Render edges as Line components with arrowhead (small cone at endpoint)
    - Label each node with @react-three/drei Text component (fontSize=0.18, color="white")
    - onPointerDown on node → onInteract(`"${node.label} — this is the ${node.type} step in the algorithm."`)

    === ProbabilityDistScene.tsx ===
    - Render as 3D bar chart: one BoxGeometry per label
    - Bar height = value * 4 (scaled for visibility), width = 0.5
    - Position along X: evenly spaced (center the group)
    - Colors: blue=#3b82f6, purple=#8b5cf6, green=#10b981, red=#ef4444, gold=#f59e0b
    - Animate tall bars with gentle oscillation (useFrame, tiny amplitude)
    - Use Text for labels below each bar and value above
    - onPointerDown on bar → onInteract(`"${label} has a ${(value*100).toFixed(0)}% probability of being measured. ${description}"`)

    === AtomModelScene.tsx ===
    - Center nucleus: cluster of red spheres (protons) + grey spheres (neutrons), radius 0.15 each
    - Electron shells: Torus rings around nucleus for each shell (radius = 1.2 * shellIndex + 1.0)
    - Electrons: small cyan spheres orbiting on the torus path
    - Animate with useFrame: electrons orbit at different speeds per shell
    - onPointerDown on electron → onInteract(`"That's an electron in shell ${shellIndex + 1}! It carries negative charge and exists in a quantum orbital — not a fixed path."`)
    - onPointerDown on nucleus → onInteract(`"The nucleus contains ${protons} proton(s) and ${neutrons} neutron(s). Its positive charge binds the electrons."`)

    === ConceptMapScene.tsx ===
    - Center node: larger sphere (radius=0.4) at [0,0,0], color #6366f1, labeled with center text
    - Satellite nodes: medium sphere (radius=0.22) at radius=3.0 from center, using angle degrees
      Position: [3.0 * cos(angle * PI/180), 3.0 * sin(angle * PI/180), 0]
    - Color map: blue=#3b82f6, purple=#8b5cf6, green=#10b981, red=#ef4444, gold=#f59e0b
    - Connections: Line from center to each satellite
    - Animate: satellites gently float (y += 0.05 * sin(time + angle), using useFrame)
    - onPointerDown on satellite → onInteract(`"${label} is a key concept related to ${center}. It represents ${label} in the bigger picture of this topic."`)

    === GradientDescentScene.tsx ===
    - Render a smooth 3D parabolic surface as a grid of small sphere points or a PlaneGeometry
      Height at (x,z) = x*x + z*z (bowl shape), range x,z in [-2, 2]
    - Use a MeshStandardMaterial with wireframe=false, color gradient (high=red, low=blue)
      Approximate with vertex colors or a fixed teal color
    - Plot loss_at_step as a descending path of colored spheres on the surface
      x-position = (stepIndex / total_steps) * 4 - 2, y-position = parabola height at x
    - Highlight current_step sphere in bright gold, others in white/gray
    - Animate: the parabola bowl slowly rotates on Y axis for 3D effect
    - onPointerDown on a step sphere → onInteract(`"At step ${i}, the loss was ${loss_at_step[i].toFixed(2)}. The algorithm is moving downhill towards the minimum."`)

    === Main3DCanvas.tsx MODIFICATIONS ===
    Import all 7 new scenes. Add all 12 types to VIZ_LABELS and VIZ_COLORS.
    Extend VisualizationRouter switch-case:
    - 'neural_network' → NeuralNetworkScene
    - 'wave_interference' → WaveInterferenceScene
    - 'algorithm_flow' → AlgorithmFlowScene
    - 'probability_dist' → ProbabilityDistScene
    - 'atom_model' → AtomModelScene
    - 'concept_map' → ConceptMapScene
    - 'gradient_descent' → GradientDescentScene

    Pass `onInteract` prop from VisualizationRouter to each scene:
    - Add `onInteract` to VisualizationRouter props: `{ viz, onInteract }`
    - In Main3DCanvas, define: `const handleInteract = (msg: string) => { /* speak msg — wired in Plan 5.2 */ console.log('[INTERACT]', msg); }`
    - Pass it down: `<VisualizationRouter viz={activeVisualization} onInteract={handleInteract} />`

    VIZ_LABELS additions:
    'neural_network': '🧠  Neural Network',
    'wave_interference': '〜  Wave Interference',
    'algorithm_flow': '⚙️  Algorithm Flow',
    'probability_dist': '📊  Probability Distribution',
    'atom_model': '⚛  Atom Model',
    'concept_map': '🗺  Concept Map',
    'gradient_descent': '📉  Gradient Descent',

    VIZ_COLORS: assign appropriate color combos (match the color theme of each scene)

    AVOID: importing any npm package not already in package.json.
    AVOID: using @react-three/drei's Html for labels inside Canvas without checking existing usage pattern.
    Check BlochSphereScene.tsx for the exact import/export/props pattern to follow.
  </action>
  <verify>
    cd frontend && npx tsc --noEmit 2>&1 | head -30
  </verify>
  <done>
    - TypeScript compilation passes with no errors related to the new scene files
    - All 7 new scene files exist and export a default React component
    - Main3DCanvas.tsx has 12 cases in the switch statement
    - Manually test: send "explain neural networks" in chat → visualization type "neural_network" renders
  </done>
</task>

## Success Criteria
- [ ] Backend accepts any educational topic and classifies it correctly
- [ ] Non-educational queries (jokes, creative writing) get a polite decline
- [ ] All 12 visualization types route to a scene without crashing
- [ ] TypeScript compiles clean (`npx tsc --noEmit` exits 0 in frontend/)
- [ ] "Explain gradient descent" → renders GradientDescentScene
- [ ] "What is a neural network" → renders NeuralNetworkScene
- [ ] "How does bubble sort work" → renders AlgorithmFlowScene
