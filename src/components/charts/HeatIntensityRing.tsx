"use client";

import { cn } from "@/lib/utils";

type Props = { value: number; size?: number; segments?: number; label?: string; className?: string };

export function HeatIntensityRing({ value, size = 168, segments = 36, label, className }: Props) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const gap = 1;
  const beadArc = (360 - gap * segments) / segments;
  const clamped = Math.min(100, Math.max(0, value));
  const filled = Math.round((clamped / 100) * segments);

  function polar(deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
  }

  function heatColor(i: number) {
    const ratio = i / segments;
    const distFromActive = Math.abs(i - filled);
    if (i >= filled) return "#1a1a2e";
    if (distFromActive <= 3) return `hsl(142, 70%, ${65 - distFromActive * 12}%)`;
    if (ratio < 0.3) return "hsl(142, 60%, 35%)";
    if (ratio < 0.6) return "hsl(170, 60%, 30%)";
    return "hsl(190, 60%, 25%)";
  }

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <filter id="heat-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {Array.from({ length: segments }, (_, i) => {
          const angle = i * (beadArc + gap) - 90;
          const p1 = polar(angle);
          const p2 = polar(angle + beadArc);
          const color = heatColor(i);
          const isHot = i < filled && Math.abs(i - filled) <= 3;
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              filter={isHot ? "url(#heat-glow)" : undefined}
            />
          );
        })}
      </svg>
      <div className="absolute text-center">
        <div className="font-mono text-2xl font-bold text-[var(--gp-text)]">{value}%</div>
          {label && (
            <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--gp-text-faint)]">{label}</div>
          )}
      </div>
    </div>
  );
}
