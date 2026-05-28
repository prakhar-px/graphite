"use client";

import { cn } from "@/lib/utils";

type Props = { value: number; size?: number; label?: string; className?: string };

export function OrbCore({ value, size = 168, label, className }: Props) {
  const center = size / 2;
  const clamped = Math.min(100, Math.max(0, value));
  const hue = clamped < 40 ? 0 : clamped < 70 ? 40 : 140;
  const sat = clamped < 40 ? 80 : 70;

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <radialGradient id="orb-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`hsl(${hue}, ${sat}%, 60%)`} stopOpacity="0.35" />
            <stop offset="60%" stopColor={`hsl(${hue}, ${sat}%, 40%)`} stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx={center} cy={center} r={center * 0.7} fill="url(#orb-glow)" />
        <circle
          cx={center}
          cy={center}
          r={center * 0.3}
          fill={`hsl(${hue}, ${sat}%, 50%)`}
          opacity="0.2"
        />
        <circle
          cx={center}
          cy={center}
          r={center * 0.18}
          fill={`hsl(${hue}, ${sat}%, 55%)`}
          opacity="0.4"
        />
        <circle
          cx={center}
          cy={center}
          r={center * 0.08}
          fill={`hsl(${hue}, ${sat}%, 70%)`}
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
