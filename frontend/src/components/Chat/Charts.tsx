import React, { useEffect, useRef, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface BarChartData {
  labels: string[];
  values: number[];
  colors?: string[];
  description?: string;
}

interface PieChartData {
  labels: string[];
  values: number[];
  description?: string;
}

interface VisualizationPayload {
  type: 'bar_chart' | 'pie_chart';
  title?: string;
  data: BarChartData | PieChartData;
}

// ─────────────────────────────────────────────────────────────────────────────
// Colour palette helper
// ─────────────────────────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  quantum: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
  cloud:   'linear-gradient(90deg, #06b6d4, #3b82f6)',
  purple:  'linear-gradient(90deg, #a855f7, #ec4899)',
  green:   'linear-gradient(90deg, #10b981, #34d399)',
  red:     'linear-gradient(90deg, #ef4444, #f97316)',
};

const PIE_COLORS = [
  '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
  '#f59e0b', '#ec4899', '#f97316', '#3b82f6',
];

function resolveBarColor(colorKey: string | undefined): string {
  if (!colorKey) return COLOR_MAP.quantum;
  return COLOR_MAP[colorKey] ?? colorKey;
}

// ─────────────────────────────────────────────────────────────────────────────
// BarChart component
// ─────────────────────────────────────────────────────────────────────────────

function BarChart({ title, data }: { title?: string; data: BarChartData }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 80); return () => clearTimeout(t); }, []);

  const maxVal = Math.max(...data.values, 0.001);

  return (
    <div style={{
      background: 'rgba(15,23,42,0.85)',
      border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: '14px',
      padding: '14px 16px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 24px rgba(99,102,241,0.12)',
      marginTop: '8px',
    }}>
      {title && (
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
          ⚛ {title}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {data.labels.map((label, i) => {
          const pct = (data.values[i] / maxVal) * 100;
          const colorKey = data.colors?.[i];
          const gradient = resolveBarColor(colorKey);

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Label */}
              <span style={{
                fontFamily: 'monospace', fontSize: '11px', color: '#94a3b8',
                minWidth: '36px', textAlign: 'right', flexShrink: 0,
              }}>
                |{label}⟩
              </span>
              {/* Bar track */}
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '6px', height: '18px', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  height: '100%',
                  width: animated ? `${pct}%` : '0%',
                  background: gradient,
                  borderRadius: '6px',
                  transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: pct > 30 ? '0 0 10px rgba(99,102,241,0.4)' : 'none',
                }} />
              </div>
              {/* Value */}
              <span style={{ fontSize: '11px', color: '#e2e8f0', minWidth: '38px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {(data.values[i] * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      {data.description && (
        <p style={{ fontSize: '10px', color: '#64748b', marginTop: '10px', fontStyle: 'italic', lineHeight: 1.4 }}>
          {data.description}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PieChart (SVG donut) component
// ─────────────────────────────────────────────────────────────────────────────

function PieChart({ title, data }: { title?: string; data: PieChartData }) {
  const SIZE = 120;
  const R    = 42;
  const cx   = SIZE / 2;
  const cy   = SIZE / 2;
  const strokeW = 22;

  const total = data.values.reduce((s, v) => s + v, 0) || 1;
  const [hovered, setHovered] = useState<number | null>(null);

  // Build arc segments
  let cumAngle = -90; // start at top
  const segments = data.values.map((v, i) => {
    const fraction = v / total;
    const startAngle = cumAngle;
    const sweepAngle = fraction * 360;
    cumAngle += sweepAngle;
    return { fraction, startAngle, sweepAngle, color: PIE_COLORS[i % PIE_COLORS.length], label: data.labels[i] };
  });

  function polarToCart(angle: number, r: number) {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(startAngle: number, sweepAngle: number) {
    if (sweepAngle >= 360) sweepAngle = 359.99;
    const start = polarToCart(startAngle, R);
    const end   = polarToCart(startAngle + sweepAngle, R);
    const large = sweepAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${R} ${R} 0 ${large} 1 ${end.x} ${end.y}`;
  }

  return (
    <div style={{
      background: 'rgba(15,23,42,0.85)',
      border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: '14px',
      padding: '14px 16px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 4px 24px rgba(99,102,241,0.12)',
      marginTop: '8px',
    }}>
      {title && (
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
          ⚛ {title}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Donut SVG */}
        <svg width={SIZE} height={SIZE} style={{ flexShrink: 0 }}>
          {/* Background circle */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeW} />

          {segments.map((seg, i) => (
            <path
              key={i}
              d={describeArc(seg.startAngle, seg.sweepAngle)}
              fill="none"
              stroke={seg.color}
              strokeWidth={hovered === i ? strokeW + 4 : strokeW}
              strokeLinecap="round"
              style={{ transition: 'stroke-width 0.2s', filter: hovered === i ? `drop-shadow(0 0 6px ${seg.color})` : 'none', cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}

          {/* Center label */}
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fill="#e2e8f0" fontWeight="bold">
            {hovered !== null ? `${(segments[hovered].fraction * 100).toFixed(1)}%` : `${segments.length}`}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="7.5" fill="#64748b">
            {hovered !== null ? segments[hovered].label : 'states'}
          </text>
        </svg>

        {/* Legend */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {segments.map((seg, i) => (
            <div
              key={i}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={{
                width: '10px', height: '10px', borderRadius: '3px',
                background: seg.color,
                boxShadow: hovered === i ? `0 0 6px ${seg.color}` : 'none',
                transition: 'box-shadow 0.2s',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: '10.5px', color: hovered === i ? '#e2e8f0' : '#94a3b8', fontFamily: 'monospace' }}>
                |{seg.label}⟩
              </span>
              <span style={{ fontSize: '10px', color: '#64748b', marginLeft: 'auto' }}>
                {(seg.fraction * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {data.description && (
        <p style={{ fontSize: '10px', color: '#64748b', marginTop: '10px', fontStyle: 'italic', lineHeight: 1.4 }}>
          {data.description}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SimStatusBadge component
// ─────────────────────────────────────────────────────────────────────────────

const SIM_STATUS_CONFIG: Record<string, { icon: string; label: string; color: string; glow: string }> = {
  local_sim:   { icon: '⚛', label: 'Local Sim',  color: '#6366f1', glow: 'rgba(99,102,241,0.35)' },
  cloud_job:   { icon: '☁', label: 'Cloud Job',  color: '#06b6d4', glow: 'rgba(6,182,212,0.35)'  },
  optimized:   { icon: '✨', label: 'Optimized',  color: '#10b981', glow: 'rgba(16,185,129,0.35)' },
  sim_error:   { icon: '⚠', label: 'Sim Error',  color: '#f59e0b', glow: 'rgba(245,158,11,0.35)' },
  cloud_error: { icon: '⚠', label: 'Cloud Error', color: '#ef4444', glow: 'rgba(239,68,68,0.35)'  },
};

export function SimStatusBadge({ status }: { status: string }) {
  const cfg = SIM_STATUS_CONFIG[status];
  if (!cfg) return null;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '6px' }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '3px 10px',
        borderRadius: '999px',
        border: `1px solid ${cfg.color}50`,
        background: `${cfg.color}15`,
        boxShadow: `0 0 8px ${cfg.glow}`,
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: cfg.color,
        textTransform: 'uppercase',
      }}>
        {cfg.icon} {cfg.label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// InlineChart — main dispatcher component
// ─────────────────────────────────────────────────────────────────────────────

export default function InlineChart({ visualization }: { visualization: VisualizationPayload }) {
  if (!visualization) return null;

  if (visualization.type === 'bar_chart') {
    return <BarChart title={visualization.title} data={visualization.data as BarChartData} />;
  }
  if (visualization.type === 'pie_chart') {
    return <PieChart title={visualization.title} data={visualization.data as PieChartData} />;
  }

  return null;
}
