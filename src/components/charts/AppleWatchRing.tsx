"use client";

import { cn } from "@/lib/utils";

type Props = {
  value: number;
  size?: number;
  segments?: number;
  label?: string;
  className?: string;
};

const rainbow = [
  "#FF3B30",
  "#FF9500",
  "#FFCC00",
  "#34C759",
  "#5AC8FA",
  "#007AFF",
  "#AF52DE",
];

export function AppleWatchRing({
  value,
  size = 168,
  segments = 28,
  label,
  className,
}: Props) {
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const gap = 1.2;
  const beadArc = (360 - gap * segments) / segments;
  const clamped = Math.min(100, Math.max(0, value));
  const filled = Math.round((clamped / 100) * segments);

  function polar(deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
  }

  const circleCircumference = 2 * Math.PI * radius;
  const segLen = (beadArc / 360) * circleCircumference;
  const gapLen = (gap / 360) * circleCircumference;

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <filter id="aw-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {Array.from({ length: segments }, (_, i) => {
          const angle = i * (beadArc + gap) - 90;
          const p1 = polar(angle);
          const p2 = polar(angle + beadArc);
          const isFilled = i < filled;
          const color = rainbow[i % rainbow.length];
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={isFilled ? color : "#27272A"}
              strokeWidth={stroke}
              strokeLinecap="round"
              opacity={isFilled ? 1 : 0.35}
              filter={isFilled ? "url(#aw-glow)" : undefined}
            />
          );
        })}
        <circle
          cx={center}
          cy={center}
          r={radius + stroke * 0.6}
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth={0.5}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-mono text-2xl font-bold text-zinc-50">{value}%</div>
        {label && (
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
