"use client";

import { cn } from "@/lib/utils";

type Props = { value: number; size?: number; label?: string; className?: string };

const styles = `
@keyframes pbr-wave {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
@keyframes pbr-ambient {
  0%, 100% { opacity: 0.04; }
  50% { opacity: 0.1; }
}
.pbr-wave { animation: pbr-wave 3s ease-in-out infinite; }
.pbr-ambient { animation: pbr-ambient 4s ease-in-out infinite; }
`;

export function PulseBeadRing({ value, size = 168, label, className }: Props) {
  const center = size / 2;
  const clamped = Math.min(100, Math.max(0, value));
  const hue = clamped < 40 ? 0 : clamped < 70 ? 40 : 140;
  const sat = clamped < 40 ? 80 : 70;
  const segments = 16;
  const gapDeg = 2;
  const beadArcDeg = (270 - gapDeg * segments) / segments;
  const startAngle = -225;
  const radius = (size - 12) / 2;
  const filled = Math.round((clamped / 100) * segments);

  const polar = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
  };

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <style>{styles}</style>
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <filter id="pbr-bead-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient glow */}
        <circle
          cx={center} cy={center} r={radius + 4}
          fill="none"
          stroke={`hsl(${hue}, ${sat}%, 50%)`}
          strokeWidth={18}
          className="pbr-ambient"
        />

        {/* Unfilled beads */}
        {Array.from({ length: segments }, (_, i) => {
          const angleDeg = startAngle + i * (beadArcDeg + gapDeg) + beadArcDeg / 2;
          const p = polar(angleDeg);
          const isFilled = i < filled;
          return (
            <circle
              key={i}
              cx={p.x} cy={p.y}
              r={5}
              fill={isFilled ? `hsl(${hue}, ${sat}%, 62%)` : "#27272A"}
              opacity={isFilled ? 1 : 0.5}
              filter={isFilled ? "url(#pbr-bead-glow)" : undefined}
              className={isFilled && i === filled - 1 ? "pbr-wave" : undefined}
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
