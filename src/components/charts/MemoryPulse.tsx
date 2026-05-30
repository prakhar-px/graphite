"use client";

import { cn } from "@/lib/utils";

type Props = {
  value: number;
  size?: number;
  segments?: number;
  label?: string;
  className?: string;
};

function stateLabel(value: number) {
  if (value >= 80) return "Strong Recall";
  if (value >= 60) return "Memory Stable";
  if (value >= 40) return "Momentum Building";
  if (value >= 20) return "Recall Improving";
  return "Preparation Active";
}

function stateSub(value: number) {
  if (value >= 80) return "Consistent reinforcement";
  if (value >= 60) return "Retention is solid";
  if (value >= 40) return "Freshness trending up";
  if (value >= 20) return "Building consistency";
  return "Early stage progress";
}

function segmentColor(i: number, total: number, filled: number) {
  if (i >= filled) return { fill: "#1a1a2e", glow: false, alpha: 1 };
  const distFromMax = filled - 1 - i;
  if (distFromMax <= 2) return { fill: "#22C55E", glow: true, alpha: 1 };
  if (distFromMax <= 6) return { fill: "#22C55E", glow: false, alpha: 0.6 };
  if (distFromMax <= 12) return { fill: "#3B82F6", glow: false, alpha: 0.35 };
  return { fill: "#7C3AED", glow: false, alpha: 0.2 };
}

export function MemoryPulse({
  value,
  size = 168,
  segments = 36,
  label,
  className,
}: Props) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const gap = 0.8;
  const beadArc = (360 - gap * segments) / segments;
  const clamped = Math.min(100, Math.max(0, value));
  const filled = Math.round((clamped / 100) * segments);

  function polar(deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
  }

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <filter id="pulse-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="pulse-ambient">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        {Array.from({ length: segments }, (_, i) => {
          const angle = i * (beadArc + gap) - 90;
          const p1 = polar(angle);
          const p2 = polar(angle + beadArc);
          const c = segmentColor(i, segments, filled);
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={c.fill}
              strokeWidth={stroke}
              strokeLinecap="round"
              opacity={c.alpha}
              filter={c.glow ? "url(#pulse-glow)" : undefined}
            />
          );
        })}
        {filled > 0 && (
          <circle
            cx={center}
            cy={center}
            r={radius * 0.65}
            fill="none"
            stroke="rgba(34,197,94,0.08)"
            strokeWidth={radius * 0.7}
            filter="url(#pulse-ambient)"
          />
        )}
      </svg>
      <div className="absolute text-center">
        <div className="font-mono text-2xl font-bold tracking-tight text-[var(--gp-text)]">
          {value}%
        </div>
        <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-green-600 dark:text-green-400">
          {stateLabel(value)}
        </div>
        {label && (
          <div className="mt-2 text-[9px] uppercase tracking-[0.18em] text-[var(--gp-text-faint)]">
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
