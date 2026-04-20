import React, { useEffect, useState, useRef, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { qasmLanguage } from '../../lib/qasm/syntax';
import { parseQASM, QASMSyntaxError } from '../../lib/qasm/parser';
import { useAppStore } from '../../store';
import { linter, Diagnostic } from '@codemirror/lint';
import { Play, AlertCircle, CheckCircle, RotateCcw, Copy } from 'lucide-react';

// ── Custom CodeMirror theme extension ────────────────────────────
const editorTheme = EditorView.theme({
  '&': { height: '100%', backgroundColor: '#0a0f1e' },
  '.cm-scroller': { fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '13.5px', lineHeight: '1.75' },
  '.cm-content': { paddingTop: '12px', paddingBottom: '12px' },
  '.cm-gutters': { backgroundColor: '#080d1b', borderRight: '1px solid #1e293b', color: '#334155' },
  '.cm-activeLineGutter': { backgroundColor: '#0f172a' },
  '.cm-activeLine': { backgroundColor: '#0f172a80' },
  '.cm-selectionBackground': { backgroundColor: '#1e40af40 !important' },
  '.cm-cursor': { borderLeftColor: '#60a5fa', borderLeftWidth: '2px' },
  '.cm-line': { paddingLeft: '8px' },
});

const INITIAL_CODE = `OPENQASM 3.0;
include "stdgates.inc";

// Quantum register — 3 qubits
qubit[3] q;
bit[3] c;

// Apply Hadamard to put q[0] in superposition
h q[0];

// Entangle q[0] and q[1]
cx q[0], q[1];

// Measure
c = measure q;
`;

export default function CodeEditor() {
  const { code, setCode, setCircuitData, undo, redo } = useAppStore();
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // One-time initialization of code if empty
  useEffect(() => {
    if (!code.trim() || code === 'OPENQASM 3.0;\ninclude "stdgates.inc";\n\nqubit[3] q;\nbit[3] c;\n\n') {
      setCode(INITIAL_CODE);
    }
  }, []);

  const qasmLinter = linter(() => diagnostics);

  const onChange = useCallback((value: string, viewUpdate: any) => {
    setCode(value);
    setCharCount(value.length);

    // Update cursor position
    const cursor = viewUpdate.state.selection.main.head;
    const line = viewUpdate.state.doc.lineAt(cursor);
    setCursorPos({ line: line.number, col: cursor - line.from + 1 });

    // Debounced parse
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        const newData = parseQASM(value);
        setDiagnostics([]);
        setCircuitData(newData);
      } catch (e: any) {
        if (e instanceof QASMSyntaxError) {
          const doc = viewUpdate.state.doc;
          const lineNum = Math.min(e.line, doc.lines);
          const lineInfo = doc.line(lineNum);
          setDiagnostics([{ from: lineInfo.from, to: lineInfo.to, severity: 'error', message: e.message }]);
        }
      }
    }, 500);
  }, [setCode, setCircuitData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    setCode(INITIAL_CODE);
    setDiagnostics([]);
  };

  const hasErrors = diagnostics.length > 0;
  const lineCount = code.split('\n').length;

  return (
    <div className="h-full w-full flex flex-col bg-[#0a0f1e] overflow-hidden">
      {/* ── IDE Header ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#080d1b] border-b border-slate-800/80 flex-shrink-0">
        {/* File tabs */}
        <div className="flex items-center gap-0">
          {/* Active file tab */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#0a0f1e] rounded-t-lg border border-b-0 border-slate-700/60 text-slate-300">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500/70" />
            <span className="text-xs font-semibold font-mono text-blue-300">main.qasm</span>
            <span className="text-slate-600 text-xs">×</span>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
            title="Copy code"
          >
            {copied ? <CheckCircle size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
            title="Reset to template"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
          <div className="h-4 w-px bg-slate-800 mx-1" />
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
              bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500
              text-white transition-all shadow-md shadow-emerald-900/30 active:scale-95"
            title="Run / Simulate circuit"
          >
            <Play size={12} fill="currentColor" />
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* ── Editor Body ── */}
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={code}
          height="100%"
          theme={oneDark}
          extensions={[qasmLanguage, qasmLinter, editorTheme]}
          onChange={onChange}
          style={{ height: '100%' }}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: false,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>

      {/* ── Status Bar ── */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#060b17] border-t border-slate-800/70 text-[10px] font-medium flex-shrink-0">
        <div className="flex items-center gap-4">
          {/* Error/OK indicator */}
          <div className={`flex items-center gap-1.5 ${hasErrors ? 'text-red-400' : 'text-emerald-400'}`}>
            {hasErrors
              ? <><AlertCircle size={11} /><span>{diagnostics.length} error{diagnostics.length > 1 ? 's' : ''}</span></>
              : <><CheckCircle size={11} /><span>No errors</span></>
            }
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500">{lineCount} lines · {charCount} chars</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-500">Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span className="text-slate-600">|</span>
          <span className="text-blue-400/70 font-semibold tracking-wide">OpenQASM 3.0</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500">UTF-8</span>
        </div>
      </div>
    </div>
  );
}
