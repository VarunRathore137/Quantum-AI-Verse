import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Gate {
  type: string;
  target: number;
  control?: number;
  params?: number[];
}

export interface CircuitData {
  qubits: number;
  gates: Gate[];
}

interface AppState {
  messages: ChatMessage[];
  isLoading: boolean;
  activeVisualization: any | null; // Config for 3D
  code: string;
  circuitData: CircuitData;
  history: string[];
  historyIndex: number;
  currentSubtitle: string;
  mainSpeechQueue: string[];
  hasInterruptedSpeech: boolean;
  
  addMessage: (msg: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setVisualization: (viz: any) => void;
  setCode: (code: string) => void;
  setCircuitData: (data: CircuitData) => void;
  setSubtitle: (text: string) => void;
  setMainSpeechQueue: (queue: string[]) => void;
  setHasInterruptedSpeech: (val: boolean) => void;
  undo: () => void;
  redo: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  messages: [],
  isLoading: false,
  activeVisualization: null,
  code: 'OPENQASM 3.0;\ninclude "stdgates.inc";\n\nqubit[3] q;\nbit[3] c;\n\n',
  circuitData: { qubits: 3, gates: [] },
  history: ['OPENQASM 3.0;\ninclude "stdgates.inc";\n\nqubit[3] q;\nbit[3] c;\n\n'],
  historyIndex: 0,
  currentSubtitle: '',
  mainSpeechQueue: [],
  hasInterruptedSpeech: false,
  
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setVisualization: (viz) => set({ activeVisualization: viz }),
  setCode: (newCode) => set((state) => {
     const newHistory = state.history.slice(0, state.historyIndex + 1);
     newHistory.push(newCode);
     return { code: newCode, history: newHistory, historyIndex: newHistory.length - 1 };
  }),
  setCircuitData: (data) => set({ circuitData: data }),
  setSubtitle: (text) => set({ currentSubtitle: text }),
  setMainSpeechQueue: (queue) => set({ mainSpeechQueue: queue }),
  setHasInterruptedSpeech: (val) => set({ hasInterruptedSpeech: val }),
  undo: () => set((state) => {
     if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return { code: state.history[newIndex], historyIndex: newIndex };
     }
     return state;
  }),
  redo: () => set((state) => {
     if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return { code: state.history[newIndex], historyIndex: newIndex };
     }
     return state;
  }),
}));
