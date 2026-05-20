import React, { useState } from 'react';
import instructorImg from './instructor_avatar.png';
import assistantImg from './assistant_avatar.png';

type Agent = 'instructor' | 'assistant';

interface Props {
  onSelect: (agent: Agent) => void;
}

export default function AgentSelectPage({ onSelect }: Props) {
  const [hovered, setHovered] = useState<Agent | null>(null);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 30%, #0f172a 0%, #020617 70%)',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Starfield */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() > 0.8 ? '2px' : '1px',
              height: Math.random() > 0.8 ? '2px' : '1px',
              background: 'white',
              borderRadius: '50%',
              left: `${(i * 9.97) % 100}%`,
              top: `${(i * 7.33) % 100}%`,
              opacity: 0.1 + (i % 5) * 0.08,
              animation: `pulse ${2 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${(i % 7) * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Animated glow accents */}
      <div style={{
        position: 'absolute', top: '10%', left: '15%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '15%',
        width: '350px', height: '350px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 16px', borderRadius: '999px',
          border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.1)',
          marginBottom: '24px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#34d399', display: 'inline-block',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#93c5fd', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Quantum-AI Verse
          </span>
        </div>

        <h1 style={{ fontSize: '52px', fontWeight: 900, color: 'white', margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Choose Your{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #f472b6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            AI Guide
          </span>
        </h1>
        <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '420px', margin: '0 auto', lineHeight: 1.6 }}>
          Select an agent to begin your quantum learning journey
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', gap: '32px', position: 'relative', zIndex: 10 }}>
        <AgentCard
          id="select-instructor"
          agent="instructor"
          name="The Instructor"
          tagline="Universal Educator & Visualizer"
          description="Explain any quantum, AI, or science concept in simple language with stunning 3D visualizations. Learn through voice-guided analogies and interactive models."
          traits={['3D Visualizations', 'Voice Narration', 'Any Topic']}
          color="blue"
          avatarSrc={instructorImg as string}
          isHovered={hovered === 'instructor'}
          onHover={setHovered}
          onSelect={onSelect}
        />
        <AgentCard
          id="select-assistant"
          agent="assistant"
          name="The Researcher Agent"
          tagline="Quantum Circuit Engineer"
          description="Design, optimize, and simulate quantum circuits. Get hands-on with circuit building, QASM code generation, and real quantum computation experiments."
          traits={['Circuit Design', 'QASM Code', 'Simulation']}
          color="green"
          avatarSrc={assistantImg as string}
          isHovered={hovered === 'assistant'}
          onHover={setHovered}
          onSelect={onSelect}
        />
      </div>

      {/* Footer */}
      <p style={{ color: '#1e293b', fontSize: '12px', marginTop: '48px', position: 'relative', zIndex: 10 }}>
        You can switch agents at any time from within the studio
      </p>
    </div>
  );
}

// ── Agent Card ────────────────────────────────────────────────────
type CardColor = 'blue' | 'green';

function AgentCard({
  id, agent, name, tagline, description, traits, color, avatarSrc,
  isHovered, onHover, onSelect,
}: {
  id: string;
  agent: Agent;
  name: string;
  tagline: string;
  description: string;
  traits: string[];
  color: CardColor;
  avatarSrc: string;
  isHovered: boolean;
  onHover: (a: Agent | null) => void;
  onSelect: (a: Agent) => void;
}) {
  const colorMap = {
    blue: {
      glow: 'rgba(99,102,241,0.35)',
      border: 'rgba(99,102,241,0.45)',
      traitBg: 'rgba(99,102,241,0.15)',
      traitText: '#a5b4fc',
      traitBorder: 'rgba(165,180,252,0.2)',
      btn: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      shadow: '0 0 80px rgba(99,102,241,0.25), 0 24px 48px rgba(0,0,0,0.4)',
    },
    green: {
      glow: 'rgba(16,185,129,0.35)',
      border: 'rgba(16,185,129,0.45)',
      traitBg: 'rgba(16,185,129,0.12)',
      traitText: '#6ee7b7',
      traitBorder: 'rgba(110,231,183,0.2)',
      btn: 'linear-gradient(135deg, #10b981, #06b6d4)',
      shadow: '0 0 80px rgba(16,185,129,0.2), 0 24px 48px rgba(0,0,0,0.4)',
    },
  };

  const c = colorMap[color];

  return (
    <div
      id={id}
      onMouseEnter={() => onHover(agent)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(agent)}
      style={{
        cursor: 'pointer',
        width: '340px',
        background: isHovered
          ? `radial-gradient(ellipse at 50% 0%, ${c.glow} 0%, rgba(8,13,27,0.97) 65%)`
          : 'rgba(8,13,27,0.85)',
        border: `1px solid ${isHovered ? c.border : 'rgba(30,41,59,0.7)'}`,
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: isHovered ? c.shadow : '0 4px 32px rgba(0,0,0,0.5)',
        transition: 'all 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isHovered ? 'scale(1.035) translateY(-10px)' : 'scale(1) translateY(0)',
      }}
    >
      {/* Avatar */}
      <div style={{ height: '270px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={avatarSrc}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            filter: isHovered ? 'brightness(1.15) saturate(1.1)' : 'brightness(0.75) saturate(0.9)',
            transition: 'filter 0.35s ease',
          }}
        />
        {/* Gradient overlay merging into card body */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 35%, rgba(8,13,27,1) 100%)',
        }} />
        {/* Top glow line */}
        {isHovered && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
            background: `linear-gradient(90deg, transparent, ${c.border}, transparent)`,
          }} />
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '20px 24px 28px' }}>
        <div style={{ marginBottom: '4px' }}>
          <span style={{
            fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em',
            color: c.traitText, textTransform: 'uppercase',
          }}>
            {tagline}
          </span>
        </div>
        <h2 style={{
          fontSize: '28px', fontWeight: 900, color: 'white', margin: '0 0 10px',
          letterSpacing: '-0.02em',
        }}>
          {name}
        </h2>
        <p style={{
          fontSize: '13px', color: '#64748b', lineHeight: 1.65, margin: '0 0 18px',
        }}>
          {description}
        </p>

        {/* Traits */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '22px' }}>
          {traits.map(t => (
            <span key={t} style={{
              padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
              background: c.traitBg, color: c.traitText,
              border: `1px solid ${c.traitBorder}`,
            }}>
              {t}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          style={{
            width: '100%', padding: '14px', borderRadius: '12px',
            background: c.btn, border: 'none', color: 'white',
            fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            letterSpacing: '0.05em',
            opacity: isHovered ? 1 : 0.75,
            transition: 'opacity 0.2s, box-shadow 0.2s',
            boxShadow: isHovered ? `0 8px 24px ${c.glow}` : 'none',
          }}
        >
          Start with {name} →
        </button>
      </div>
    </div>
  );
}
