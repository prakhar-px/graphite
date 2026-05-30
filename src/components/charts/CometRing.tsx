"use client";

import { cn } from "@/lib/utils";

type Props = { value: number; size?: number; label?: string; className?: string };

export function CometRing({ value, size = 168, label, className }: Props) {
  const center = size / 2;
  const stroke = 3;
  const radius = (size - 16) / 2;
  const clamped = Math.min(100, Math.max(0, value));
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const hue = clamped < 40 ? 0 : clamped < 70 ? 40 : 140;
  const sat = clamped < 40 ? 80 : 70;
  const tailLen = circumference * 0.08;
  const dashGap = 9999;

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <style>{`
@keyframes cr-orbit {
  0% { stroke-dashoffset: ${-tailLen}; }
  100% { stroke-dashoffset: ${-tailLen - circumference}; }
}
.cr-orbit { animation: cr-orbit 1.8s linear infinite; }
.cr-orbit-fast { animation: cr-orbit 1.8s linear infinite; }
`}</style>
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <filter id="cr-comet-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="cr-tail" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor={`hsl(${hue}, ${sat}%, 75%)`} stopOpacity="0" />
            <stop offset="80%" stopColor={`hsl(${hue}, ${sat}%, 55%)`} stopOpacity="0.6" />
            <stop offset="100%" stopColor={`hsl(${hue}, ${sat}%, 70%)`} stopOpacity="1" />
          </linearGradient>
        </defs>

        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke="#27272A" strokeWidth={stroke}
        />

        {clamped > 0 && (
          <circle
            cx={center} cy={center} r={radius}
            fill="none" stroke={`hsl(${hue}, ${sat}%, 55%)`}
            strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}

        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke="url(#cr-tail)"
          strokeWidth={stroke + 4} strokeLinecap="round"
          strokeDasharray={`${tailLen} ${dashGap}`}
          filter="url(#cr-comet-glow)"
          className="cr-orbit"
          transform={`rotate(-90 ${center} ${center})`}
        />

        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke={`hsl(${hue}, ${sat}%, 80%)`}
          strokeWidth={stroke + 2} strokeLinecap="round"
          strokeDasharray={`4 ${dashGap}`}
          filter="url(#cr-comet-glow)"
          className="cr-orbit"
          transform={`rotate(-90 ${center} ${center})`}
        />
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
