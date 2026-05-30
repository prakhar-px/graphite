"use client";

import { cn } from "@/lib/utils";

type Props = { value: number; size?: number; label?: string; className?: string };

const styles = `
@keyframes pr-breathe {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 0.7; }
}
@keyframes pr-beat {
  0%, 100% { opacity: 0.15; }
  10% { opacity: 1; }
  20% { opacity: 0.4; }
  30% { opacity: 1; }
  40% { opacity: 0.15; }
}
.pr-breathe { animation: pr-breathe 3s ease-in-out infinite; }
.pr-beat { animation: pr-beat 2.4s ease-in-out infinite; }
`;

export function PulseRing({ value, size = 168, label, className }: Props) {
  const center = size / 2;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const clamped = Math.min(100, Math.max(0, value));
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const headAngle = (clamped / 100) * 360 - 90;
  const headRad = (headAngle * Math.PI) / 180;
  const hx = center + radius * Math.cos(headRad);
  const hy = center + radius * Math.sin(headRad);

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <style>{styles}</style>
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <filter id="pr-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="pr-dot-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        
        </defs>

        {/* Track ring */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none" strokeWidth={stroke}
          style={{ stroke: "var(--gp-text-faint)" }}
        />

        {/* Progress arc — inner ring glow (Orb Core: hsl(140, 70%, 55%) × 0.4) */}
        {clamped > 0 && (
          <circle
            cx={center} cy={center} r={radius}
            fill="none"
            stroke="hsl(140, 70%, 55%)"
            strokeWidth={stroke + 3}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            filter="url(#pr-glow)"
            opacity="0.4"
            className="pr-breathe"
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}

        {/* Progress arc — core (Orb Core: hsl(140, 70%, 70%) — primary) */}
        {clamped > 0 && (
          <circle
            cx={center} cy={center} r={radius}
            fill="none"
            stroke="hsl(140, 70%, 70%)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}

        {/* Heartbeat dot at progress head */}
        {clamped > 0 && clamped < 100 && (
          <>
            <circle
              cx={hx} cy={hy} r={5}
              fill="hsl(140, 70%, 70%)"
              filter="url(#pr-dot-glow)"
              className="pr-beat"
            />
            <circle cx={hx} cy={hy} r={2} fill="white" opacity="0.85" />
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
