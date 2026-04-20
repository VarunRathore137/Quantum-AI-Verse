---
phase: 4
plan: 2
wave: 2
depends_on: [1]
files_modified:
  - src/store/circuitStore.ts
  - src/components/CodeEditor/CodeEditor.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "When the visual circuit store changes, the QASM string updates in the CodeMirror editor instantly."
    - "Does not cause infinite loops."
  artifacts:
    - "Updates to the Zustand circuit store to expose a serializable QASM string view."
---

# Plan 4.2: Visual-to-Code Sync (Live updates)

<objective>
Wire up one half of the bi-directional sync: dragging and dropping gates in the visual editor must instantly update the QASM code displayed in the CodeMirror panel.
</objective>

<context>
Load for context:
- src/store/circuitStore.ts
- src/components/CodeEditor/CodeEditor.tsx
</context>

<tasks>

<task type="auto">
  <name>Expose QASM String in Store</name>
  <files>src/store/circuitStore.ts</files>
  <action>
    Ensure `circuitStore` automatically builds an up-to-date QASM string representation of the current `CircuitState` whenever gates modify the state.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Store has a serialized QASM state available.</done>
</task>

<task type="auto">
  <name>Bind CodeEditor Value to Store</name>
  <files>src/components/CodeEditor/CodeEditor.tsx</files>
  <action>
    Extract the serialized QASM from the Zustand store. Bind it to the `value` prop of the ReactCodeMirror component.
    Take precautions to only update CodeMirror if the text is fundamentally different to prevent cursor jumping when typing.
  </action>
  <verify>npx vite build --emptyOutDir</verify>
  <done>Component sets its value directly to the visual store representation.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Dragging an H gate onto the visual circuit appends `h q[X];` to the code editor within 100ms.
- [ ] Deleting a visual gate deletes the line of code instantly.
</verification>

<success_criteria>
- [ ] SYNC-01 requirement matched exactly.
</success_criteria>
