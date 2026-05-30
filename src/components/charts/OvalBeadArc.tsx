"use client";

import { cn } from "@/lib/utils";

type Props = { value: number; size?: number; segments?: number; label?: string; className?: string };

export function OvalBeadArc({ value, size = 168, segments = 24, label, className }: Props) {
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
    const violet = { r: 124, g: 58, b: 237 };
    const blue = { r: 59, g: 130, b: 246 };
    const green = { r: 34, g: 197, b: 94 };
    let r: number, g: number, b: number;
    if (t < 0.5) {
      const p = t / 0.5;
      r = violet.r + (blue.r - violet.r) * p;
      g = violet.g + (blue.g - violet.g) * p;
      b = violet.b + (blue.b - green.b) * p;
    } else {
      const p = (t - 0.5) / 0.5;
      r = blue.r + (green.r - blue.r) * p;
      g = blue.g + (green.g - blue.g) * p;
      b = blue.b + (green.b - blue.b) * p;
    }
    return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
  }

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <filter id="oval-bead-glow">
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
            <ellipse
              key={i}
              cx={p.x}
              cy={p.y}
              rx={stroke * 0.5}
              ry={stroke * 0.35}
              transform={`rotate(${angle + 90}, ${p.x}, ${p.y})`}
              fill={color}
              opacity={isFilled ? 1 : 0.4}
              filter={isFilled ? "url(#oval-bead-glow)" : undefined}
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
