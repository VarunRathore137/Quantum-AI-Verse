---
phase: 4
plan: 3
wave: 2
depends_on: [1]
files_modified:
  - src/lib/qasm/parser.ts
  - src/components/CodeEditor/CodeEditor.tsx
  - src/store/circuitStore.ts
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Typing valid QASM instantly or quickly builds the visual circuit."
    - "Typing invalid QASM highlights the error but doesn't crash the visual canvas."
  artifacts:
    - "src/lib/qasm/parser.ts — A robust AST parser (or RegEx interpreter) that emits errors."
---

# Plan 4.3: Code-to-Visual Sync with Error Annotations (Debounced)

<objective>
Wire up the second half of the bi-directional sync: typing code in the CodeMirror editor updates the visual circuit state. If the user types invalid syntax, display an inline error squiggly in CodeMirror.
</objective>

<context>
Load for context:
- src/store/circuitStore.ts
- src/components/CodeEditor/CodeEditor.tsx
</context>

<tasks>

<task type="auto">
  <name>Build Fault-Tolerant QASM Parser</name>
  <files>src/lib/qasm/parser.ts</files>
  <action>
    Create a parsing utility that takes a raw QASM string and attempts to rebuild the `CircuitState` (gates, array positions).
    If a line is un-parseable, or references a qubit index that is out of bounds, the parser should immediately return a `SyntaxError` object with line and column mappings, rather than crashing the app.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Parser handles valid syntax and catches invalid syntax with accurate line traces.</done>
</task>

<task type="auto">
  <name>Wire Debounced Editor updates</name>
  <files>
    src/components/CodeEditor/CodeEditor.tsx
    src/store/circuitStore.ts
  </files>
  <action>
    Use a 500ms debounce on the `onChange` event in `ReactCodeMirror`. When fired, pass the text to `parser.ts`.
    If parsed successfully, update the `circuitStore` state.
    If it fails, use CodeMirror's `@codemirror/lint` extension to paint a squiggly line and tooltip over the offending text. 
    Crucially, do NOT wipe the circuit store if the code is temporarily invalid while the user is typing.
  </action>
  <verify>npx vite build --emptyOutDir</verify>
  <done>Typing `h q[0];` builds the visual gate. Typing `z q[99];` underlines it in red.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] User can manually type QASM, and after 500ms the visual circuit matches it.
- [ ] CodeMirror linting works seamlessly.
</verification>

<success_criteria>
- [ ] SYNC-02 and SYNC-03 requirements met.
</success_criteria>
