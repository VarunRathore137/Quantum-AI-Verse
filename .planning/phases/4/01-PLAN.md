---
phase: 4
plan: 1
wave: 1
depends_on: []
files_modified:
  - package.json
  - src/components/CodeEditor/CodeEditor.tsx
  - src/lib/qasm/syntax.ts
autonomous: true
user_setup: []

must_haves:
  truths:
    - "CodeMirror 6 is installed and renders without layout breaking."
    - "Dark theme is applied and matches UX-03."
    - "Basic QASM keyword highlighting is functional."
  artifacts:
    - "src/components/CodeEditor/CodeEditor.tsx — The React wrapper for CodeMirror."
    - "src/lib/qasm/syntax.ts — Custom syntax tokens for QASM 3.0."
---

# Plan 4.1: Editor Integration & Syntax Highlighting

<objective>
Install and scaffold the CodeMirror 6 code editor component. Give it a proper dark theme and inject a custom syntax highlighter for OpenQASM 3.0 keywords.
</objective>

<context>
Load for context:
- .planning/phases/4/RESEARCH.md
- src/components/CodeEditor/CodeEditor.tsx (to be created/updated)
</context>

<tasks>

<task type="auto">
  <name>Install Dependencies</name>
  <files>package.json</files>
  <action>
    Install `@uiw/react-codemirror` and `@codemirror/theme-one-dark` or equivalent.
  </action>
  <verify>npm list @uiw/react-codemirror</verify>
  <done>Dependencies appear in package.json and node_modules.</done>
</task>

<task type="auto">
  <name>Implement QASM Syntax Highlighting</name>
  <files>
    src/lib/qasm/syntax.ts
  </files>
  <action>
    Write a simple CodeMirror StreamLanguage or Lezer parser implementation to highlight basic QASM 3.0 keywords: `OPENQASM`, `include`, `qreg`, `creg`, `qubit`, `bit`, `measure`, and basic standard gates (`h`, `x`, `y`, `z`, `cx`, etc).
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Syntax file compiles and exports a CodeMirror extension.</done>
</task>

<task type="auto">
  <name>Create CodeEditor React Component</name>
  <files>
    src/components/CodeEditor/CodeEditor.tsx
  </files>
  <action>
    Create the `CodeEditor` component using `ReactCodeMirror` with the One Dark theme and the custom QASM syntax extension.
    Ensure the editor is fully styled with Tailwind to expand and fill its split-pane container.
  </action>
  <verify>npx vite build --emptyOutDir</verify>
  <done>Component builds successfully and is ready to be embedded.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] CodeMirror dependencies are installed.
- [ ] The `CodeEditor` component renders in the app.
- [ ] QASM text displays with colorful syntax highlighting.
</verification>

<success_criteria>
- [ ] You can type `OPENQASM 3.0;` into the editor and `OPENQASM` receives keyword styling.
</success_criteria>
