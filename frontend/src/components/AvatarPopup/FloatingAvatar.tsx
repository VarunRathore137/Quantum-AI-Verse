import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store';
import { useSpeech } from '../../lib/useSpeech';

import instructorImg from '../AgentSelect/instructor_avatar.png';
import assistantImg from '../AgentSelect/assistant_avatar.png';

interface FloatingAvatarProps {
  selectedAgent: 'instructor' | 'assistant';
}

const INSTRUCTOR_TIPS = [
  { trigger: 'idle', text: "Curious about something? Try asking me to explain quantum entanglement or how neural networks work!" },
  { trigger: 'first_viz', text: "You can click and drag the 3D visualization to explore it from any angle. Try it!" },
  { trigger: 'first_message', text: "Great question! I'll explain it simply and show you a 3D visualization to make it crystal clear." },
  { trigger: 'idle', text: "Did you know? Grover's algorithm can search an unsorted database of N items in √N steps — try asking me to show it!" },
  { trigger: 'idle', text: "Try asking me: 'How does gradient descent work?' — I'll show you a beautiful animation!" },
];

const ASSISTANT_TIPS = [
  { trigger: 'idle', text: "Ready to build a circuit? Try dragging a Hadamard gate onto the circuit grid!" },
  { trigger: 'first_message', text: "I can help you design, optimize, and simulate quantum circuits. What shall we build?" },
  { trigger: 'idle', text: "You can export your circuit as QASM code using the Code Editor tab!" },
  { trigger: 'idle', text: "Try creating a Bell state: H on q[0], then CNOT with q[0] as control and q[1] as target." },
];

export default function FloatingAvatar({ selectedAgent }: FloatingAvatarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  
  const messages = useAppStore(state => state.messages);
  const isLoading = useAppStore(state => state.isLoading);
  const activeVisualization = useAppStore(state => state.activeVisualization);

  const { speak } = useSpeech();

  const firstVizShown = useRef(false);
  const firstMsgShown = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showPopup = (text: string) => {
    if (isLoading) return; // Don't interrupt while loading
    setCurrentMessage(text);
    setIsVisible(true);
    speak(text);

    // Auto-dismiss after 5 seconds
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      dismiss();
    }, 5000);
  };

  const dismiss = () => {
    setIsVisible(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    resetIdleTimer(); // Restart idle timer when dismissed
  };

  const getTips = () => selectedAgent === 'instructor' ? INSTRUCTOR_TIPS : ASSISTANT_TIPS;

  const triggerIdle = () => {
    const tips = getTips().filter(t => t.trigger === 'idle');
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    if (randomTip) showPopup(randomTip.text);
  };

  const resetIdleTimer = () => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => {
      triggerIdle();
    }, 90000); // 90 seconds
  };

  // Setup idle timer on mount
  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [selectedAgent]);

  // First visualization trigger
  useEffect(() => {
    if (activeVisualization && !firstVizShown.current) {
      firstVizShown.current = true;
      const tip = getTips().find(t => t.trigger === 'first_viz');
      if (tip) showPopup(tip.text);
    }
  }, [activeVisualization, selectedAgent]);

  // First message trigger
  useEffect(() => {
    if (messages.length === 1 && !firstMsgShown.current) {
      firstMsgShown.current = true;
      const tip = getTips().find(t => t.trigger === 'first_message');
      if (tip) showPopup(tip.text);
    }
  }, [messages.length, selectedAgent]);

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      pointerEvents: isVisible ? 'auto' : 'none',
      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      {/* Speech bubble */}
      <div style={{
        maxWidth: '260px', padding: '14px 16px',
        background: 'rgba(8,13,27,0.96)',
        border: '1px solid rgba(99,102,241,0.4)',
        borderRadius: '16px 16px 4px 16px',
        boxShadow: '0 8px 32px rgba(99,102,241,0.2)',
        position: 'relative',
      }}>
        <button onClick={dismiss} style={{
          position: 'absolute', top: '8px', right: '8px',
          width: '20px', height: '20px', borderRadius: '50%',
          background: 'rgba(51,65,85,0.6)', border: 'none', color: '#94a3b8',
          cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center',
          justifyContent: 'center',
        }}>✕</button>
        <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.5,
          paddingRight: '16px', margin: 0 }}>
          {currentMessage}
        </p>
      </div>

      {/* Avatar circle */}
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid rgba(99,102,241,0.6)',
        boxShadow: '0 0 20px rgba(99,102,241,0.4)',
      }}>
        <img src={selectedAgent === 'instructor' ? instructorImg : assistantImg}
          alt="Agent"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
        />
      </div>
    </div>
  );
}
