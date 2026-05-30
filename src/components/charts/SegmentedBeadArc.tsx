"use client";

import { cn } from "@/lib/utils";

const schemes: Record<string, { stops: { r: number; g: number; b: number }[] }> = {
  violet: {
    stops: [
      { r: 124, g: 58, b: 237 },
      { r: 59, g: 130, b: 246 },
      { r: 34, g: 197, b: 94 },
    ],
  },
  cyan: {
    stops: [
      { r: 6, g: 182, b: 212 },
      { r: 20, g: 184, b: 166 },
    ],
  },
  graphite: {
    stops: [
      { r: 82, g: 82, b: 91 },
      { r: 96, g: 165, b: 250 },
    ],
  },
  amber: {
    stops: [
      { r: 245, g: 158, b: 11 },
      { r: 252, g: 211, b: 77 },
    ],
  },
  electric: {
    stops: [
      { r: 34, g: 211, b: 238 },
      { r: 34, g: 197, b: 94 },
    ],
  },
  teal: {
    stops: [
      { r: 13, g: 148, b: 136 },
      { r: 52, g: 211, b: 153 },
    ],
  },
  rose: {
    stops: [
      { r: 244, g: 63, b: 94 },
      { r: 139, g: 92, b: 246 },
    ],
  },
  green: {
    stops: [
      { r: 61, g: 143, b: 94 },
      { r: 57, g: 191, b: 114 },
      { r: 61, g: 224, b: 138 },
    ],
  },
};

type ColorScheme = keyof typeof schemes;

type Props = { value: number; size?: number; segments?: number; label?: string; className?: string; colorScheme?: ColorScheme };

export function SegmentedBeadArc({ value, size = 168, segments = 24, label, className, colorScheme = "violet" }: Props) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const sweep = 270;
  const startAngle = -225;
  const gap = 1.5;
  const beadArc = (sweep - gap * segments) / segments;
  const clamped = Math.min(100, Math.max(0, value));
  const filled = Math.round((clamped / 100) * segments);

  function polar(deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
  }

  function lerpColor(t: number) {
    const stops = schemes[colorScheme].stops;
    if (stops.length === 1) return `rgb(${stops[0].r},${stops[0].g},${stops[0].b})`;
    const seg = t * (stops.length - 1);
    const idx = Math.min(Math.floor(seg), stops.length - 2);
    const p = seg - idx;
    const a = stops[idx];
    const b_ = stops[idx + 1];
    return `rgb(${Math.round(a.r + (b_.r - a.r) * p)},${Math.round(a.g + (b_.g - a.g) * p)},${Math.round(a.b + (b_.b - a.b) * p)})`;
  }

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <filter id="bead-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {Array.from({ length: segments }, (_, i) => {
          const angle = startAngle + i * (beadArc + gap) + beadArc / 2;
          const p = polar(angle);
          const isFilled = i < filled;
          const color = isFilled ? lerpColor(i / segments) : "#27272A";
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={stroke * 0.45}
              fill={color}
              opacity={isFilled ? 1 : 0.5}
              filter={isFilled ? "url(#bead-glow)" : undefined}
            />
          );
        })}
      </svg>
      <div className="absolute text-center">
        <div className="font-mono text-2xl font-bold text-[var(--gp-text)]">{value}%</div>
        {label && (
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--gp-text-faint)]">
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
