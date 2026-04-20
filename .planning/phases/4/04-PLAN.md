---
phase: 4
plan: 4
wave: 3
depends_on: [2, 3]
files_modified:
  - src/store/circuitStore.ts
  - src/components/CodeEditor/CodeEditor.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Pressing CMD+Z inside CodeMirror undoes the code edit, and ALSO ripples that undo to the visual circuit."
    - "Pressing CMD+Z on the visual grid undoes a dragging action, and ALSO ripples that out to CodeMirror."
  artifacts:
    - "Updates to the global circuit store and CodeMirror history bindings."
---

# Plan 4.4: Unified Undo/Redo tracking across both views

<objective>
To prevent bifurcated histories, unify the undo/redo functionality so that an undo action in either the visual editor or the code editor uses the exact same stack.
</objective>

<context>
Load for context:
- src/store/circuitStore.ts
- src/components/CodeEditor/CodeEditor.tsx
</context>

<tasks>

<task type="auto">
  <name>Consolidate History Stack</name>
  <files>
    src/store/circuitStore.ts
    src/components/CodeEditor/CodeEditor.tsx
  </files>
  <action>
    CodeMirror has its own internal history. We must intercept the standard `undo` and `redo` keyboard shortcuts mapped by `@codemirror/commands` and pipe them to our Zustand `undo` and `redo` functions, overriding the default behavior.
    Alternatively, sync the Zustand store to the CodeMirror history by ensuring any non-user (state-driven) updates are injected as separate transactions.
    Choose the easiest path: disable CodeMirror's internal history and map `Ctrl-Z` / `Cmd-Z` precisely to our Zustand global store undo/redo actions.
  </action>
  <verify>npx vite build --emptyOutDir</verify>
  <done>Hitting Undo/Redo triggers the Zustand store reliably without causing CodeMirror cursor glitches.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Drag an H gate visually. Wait. Type an X gate in code. Hit `Cmd+Z` while focused on the code editor. The X gate disappears (from code and visual). Hit `Cmd+Z` again, the H gate disappears.
</verification>

<success_criteria>
- [ ] SYNC-04 requirement matched exactly. No conflicting undo histories.
</success_criteria>
