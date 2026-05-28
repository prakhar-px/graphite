"use client";

import { cn } from "@/lib/utils";

type Props = { value: number; size?: number; label?: string; className?: string };

export function GlassmorphismRing({ value, size = 168, label, className }: Props) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const clamped = Math.min(100, Math.max(0, value));
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const hue = clamped >= 70 ? 142 : clamped >= 40 ? 38 : 0;
  const sat = clamped >= 70 ? 60 : 50;

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <filter id="glass-blur">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
          <filter id="glass-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.4)" />
          </filter>
          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={`hsl(${hue}, ${sat}%, 60%)`} />
            <stop offset="100%" stopColor={`hsl(${hue + 30}, ${sat + 10}%, 50%)`} />
          </linearGradient>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#glassGrad)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter="url(#glass-shadow)"
          opacity="0.9"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`hsla(${hue}, ${sat}%, 65%, 0.25)`}
          strokeWidth={stroke + 8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter="url(#glass-blur)"
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
