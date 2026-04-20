# Phase 4 Research: Code Editor & Bi-Directional Sync

## Objective
Select the best web-based code editor for the quantum programming studio, capable of providing custom syntax highlighting for OpenQASM 3.0, displaying inline error annotations, and maintaining high performance within a React application.

## Options Evaluated

### Option A: Monaco Editor (VS Code core)
- **Pros**: Extremely powerful, built-in minimap, familiar VS Code feeling, robust error squigglies, incredible performance on massive files.
- **Cons**: Heavy bundle size (~2MB). Writing a custom language grammar requires writing a Monarch token provider, which is somewhat archaic. Overkill for short quantum circuits (typically < 100 lines).

### Option B: CodeMirror 6
- **Pros**: Lightweight, modular via extensions, easily integrates with React via `@uiw/react-codemirror`. Defining custom syntax (using Lezer) is modern, though a simple regular expression based `StreamLanguage` can suffice for simple QASM highlighting. Fast start-up time and highly customizable visual themes.
- **Cons**: Documentation can be dense. React integration requires a specific wrapper library.

## Recommendation
**CodeMirror 6 (via `@uiw/react-codemirror`)**
Given that quantum circuits in this studio are not millions of lines of code, the heavy hit of Monaco's bundle size is undesirable. CodeMirror 6 gives us everything we need for custom tokenizing (QASM syntax), dark mode themes matching our `UX-03` requirement, and excellent hook-based state management in React.

## Key Integration Points
1. **Highlighting**: We will write a lightweight syntax highlighter parsing keywords (`h`, `x`, `cx`, `measure`, `qubit`, `bit`) and variables.
2. **Debounce Engine**: A `useEffect` with a 500ms timeout will wait for the user to stop typing before attempting to parse the QASM back into React state.
3. **Error Annotations**: If the QASM parser fails (e.g., syntax error or referencing out-of-bounds qubits), we will use CodeMirror's `@codemirror/lint` extension to underline the invalid lines in red, fulfilling `SYNC-03`.
