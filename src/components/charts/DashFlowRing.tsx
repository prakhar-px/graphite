"use client";

import { cn } from "@/lib/utils";

type Props = { value: number; size?: number; label?: string; className?: string };

export function DashFlowRing({ value, size = 168, label, className }: Props) {
  const center = size / 2;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const clamped = Math.min(100, Math.max(0, value));
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const hue = clamped < 40 ? 0 : clamped < 70 ? 40 : 140;
  const sat = clamped < 40 ? 80 : 70;
  const dashLen = 8;
  const gapLen = 6;
  const pattern = dashLen + gapLen;
  const flowStart = offset + circumference;

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <style>{`
@keyframes df-flow {
  0% { stroke-dashoffset: ${flowStart}; }
  100% { stroke-dashoffset: ${flowStart - pattern}; }
}
.df-flow { animation: df-flow 0.6s linear infinite; }
`}</style>
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <filter id="df-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="df-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={`hsl(${hue}, ${sat}%, 50%)`} />
            <stop offset="50%" stopColor={`hsl(${hue}, ${sat}%, 65%)`} />
            <stop offset="100%" stopColor={`hsl(${hue}, ${sat}%, 75%)`} />
          </linearGradient>
        </defs>

        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke="#27272A" strokeWidth={stroke}
        />

        {clamped > 0 && (
          <>
            <circle
              cx={center} cy={center} r={radius}
              fill="none" stroke="url(#df-grad)" strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${dashLen} ${gapLen}`} strokeDashoffset={offset}
              transform={`rotate(-90 ${center} ${center})`}
            />
            <circle
              cx={center} cy={center} r={radius}
              fill="none" stroke={`hsl(${hue}, ${sat}%, 78%)`}
              strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={`${dashLen} ${gapLen}`}
              filter="url(#df-glow)"
              className="df-flow"
              transform={`rotate(-90 ${center} ${center})`}
              opacity="0.5"
            />
          </>
        )}
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
