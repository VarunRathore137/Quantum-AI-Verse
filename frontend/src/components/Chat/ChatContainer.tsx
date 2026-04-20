import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store';
import { useSpeech } from '../../lib/useSpeech';
import { Send } from 'lucide-react';

// ── Simple Markdown Renderer ──────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="my-2 space-y-1">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-2 text-slate-300">
              <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: inlineMarkdown(item) }} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const inlineMarkdown = (s: string) =>
    s
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-300 font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-purple-300">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-700">$1</code>');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      listItems.push(trimmed.slice(2));
    } else {
      flushList();
      elements.push(
        <p key={key++} className="text-slate-200 leading-relaxed text-[14px]"
          dangerouslySetInnerHTML={{ __html: inlineMarkdown(trimmed) }} />
      );
    }
  }
  flushList();
  return <div className="space-y-2">{elements}</div>;
}

// ── Suggestion Chips ──────────────────────────────────────────────
const QUICK_STARTS = [
  'How does a neural network learn?',
  'Explain quantum superposition',
  'Show me how gradient descent works',
  'What is quantum entanglement?',
  'How does bubble sort compare to quicksort?',
];

// ── Main Chat Container ───────────────────────────────────────────
export default function ChatContainer({ selectedAgent = 'instructor' }: { selectedAgent?: 'instructor' | 'assistant' }) {
  const { messages, addMessage, isLoading, setLoading, setVisualization } = useAppStore();
  const { speak, isSpeaking, isMuted, toggleMute } = useSpeech();
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    setSuggestions([]);
    addMessage({ id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() });
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/chat/instructor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text,
        timestamp: new Date(),
        suggestions: data.follow_up_suggestions ?? [],
      } as any);

      if (data.visualization) {
        setTimeout(() => {
          setVisualization(data.visualization);
          setTimeout(() => {
            speak(data.text);
          }, 800);
        }, 300);
      } else {
        setTimeout(() => {
          speak(data.text);
        }, 300);
      }

      if (data.follow_up_suggestions?.length) {
        setSuggestions(data.follow_up_suggestions.slice(0, 3));
      }
    } catch {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "**Connection error** — couldn't reach the Quantum Brain.\n\nMake sure the backend is running on `:8000`.",
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
    }
  }, [isLoading, addMessage, setLoading, setVisualization]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (window.speechSynthesis) {
        // Unlock speech synthesis immediately on user interaction
        const u = new SpeechSynthesisUtterance('');
        u.volume = 0;
        window.speechSynthesis.speak(u);
    }
    sendMessage(input);
    setInput('');
  };

  const handleSuggestion = (s: string) => {
    setSuggestions([]);
    sendMessage(s);
  };

  return (
    <div className="flex flex-col h-full w-[400px] flex-shrink-0 bg-[#080d1b] border-r border-slate-800/70 relative overflow-hidden">
      {/* ── Ambient gradient ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-64 opacity-20"
          style={{ background: 'radial-gradient(ellipse at 50% -20%, #3b82f640 0%, transparent 70%)' }} />
      </div>

      {/* ── Header ── */}
      <div className="relative px-5 py-4 border-b border-slate-800/70 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-lg animate-quantum-pulse
              ${selectedAgent === 'instructor'
                ? 'bg-gradient-to-br from-blue-600 to-violet-600'
                : 'bg-gradient-to-br from-emerald-600 to-teal-600'}`}>
              {selectedAgent === 'instructor' ? '🎓' : '🔬'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#080d1b]" />
          </div>
          {/* Title */}
          <div>
            <h2 className="text-lg font-bold gradient-text-quantum leading-none">
              {selectedAgent === 'instructor' ? 'THE INSTRUCTOR' : 'THE LAB ASSISTANT'}
            </h2>
            <p className="text-[10px] text-slate-500 font-semibold tracking-[0.12em] uppercase mt-0.5">
              {selectedAgent === 'instructor' ? 'Universal Educator · AI Guide' : 'Circuit Engineer · Simulator'}
            </p>
          </div>
          {/* Mute button */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute voice' : 'Mute voice'}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50
              text-slate-400 hover:text-slate-200 transition-all text-xs font-medium"
          >
            {isMuted ? '🔇' : isSpeaking ? '🔊' : '🔈'}
            <span>{isMuted ? 'Muted' : isSpeaking ? 'Speaking...' : 'Voice'}</span>
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10" ref={scrollRef}>
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="animate-fade-in pt-2">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/30 to-violet-600/30 border border-blue-500/20 flex items-center justify-center mx-auto mb-3 animate-float">
                <span className="text-3xl">⚛️</span>
              </div>
              <p className="text-slate-400 font-medium text-sm">Ask me anything in science, tech, or math.</p>
              <p className="text-slate-600 text-xs mt-1">I'll explain it simply and visualize it in 3D.</p>
            </div>

            {/* Quick start chips */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">Try asking</p>
              {QUICK_STARTS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(s)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 text-xs transition-all duration-200 group animate-slide-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="text-blue-500/70 group-hover:text-blue-400 mr-1.5">›</span>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg: any, idx: number) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-xs flex-shrink-0 mr-2 mt-1 shadow-md">
                🎓
              </div>
            )}
            <div className={`max-w-[82%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div
                className={`px-4 py-3 rounded-2xl shadow-md text-[14px] leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm shadow-blue-900/30'
                    : 'bg-slate-900/90 border border-slate-800/70 text-slate-200 rounded-bl-sm'
                  }`}
              >
                {msg.role === 'assistant'
                  ? renderMarkdown(msg.content)
                  : <p>{msg.content}</p>
                }
              </div>
              <span className="text-[10px] text-slate-600 px-1">
                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
          </div>
        ))}

        {/* Loading dots */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-xs flex-shrink-0 mr-2 mt-0.5">
              🎓
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800/70 rounded-bl-sm">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.18}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Follow-up suggestion chips */}
        {suggestions.length > 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 pl-9 animate-fade-in">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSuggestion(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-blue-200 transition-all duration-200"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Input ── */}
      <div className="p-4 border-t border-slate-800/70 z-10 flex-shrink-0">
        <form onSubmit={handleSubmit}>
          <div className="relative group">
            <input
              ref={inputRef}
              id="chat-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about quantum, AI, algorithms, physics…"
              disabled={isLoading}
              className="w-full bg-slate-900 text-slate-100 rounded-xl pl-4 pr-12 py-3.5 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-600
                border border-slate-800 focus:border-blue-500/50 transition-all duration-200
                disabled:opacity-50 shadow-inner"
            />
            <button
              type="submit"
              id="chat-send-btn"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg
                bg-gradient-to-br from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500
                text-white disabled:opacity-40 transition-all duration-200 shadow-md
                hover:shadow-blue-900/50 active:scale-90 disabled:cursor-not-allowed"
            >
              <Send size={16} className={input.trim() && !isLoading ? 'ml-0.5' : ''} />
            </button>
          </div>
        </form>
        <p className="text-[10px] text-slate-700 text-center mt-2">
          Powered by Groq · Quantum-AI Verse
        </p>
      </div>
    </div>
  );
}
