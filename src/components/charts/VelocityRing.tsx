"use client";

import { cn } from "@/lib/utils";

type Props = { value: number; size?: number; label?: string; className?: string };

const styles = `
@keyframes vr-surge {
  0%, 100% { opacity: 0.3; }
  20% { opacity: 1; }
  40% { opacity: 0.4; }
  55% { opacity: 0.9; }
  70% { opacity: 0.3; }
}
.vr-surge { animation: vr-surge 0.7s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
.vr-trail { animation: vr-surge 0.7s cubic-bezier(0.22, 1, 0.36, 1) infinite; animation-delay: 0.12s; }
`;

export function VelocityRing({ value, size = 168, label, className }: Props) {
  const center = size / 2;
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const clamped = Math.min(100, Math.max(0, value));
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const hue = clamped < 40 ? 0 : clamped < 70 ? 40 : 140;
  const sat = clamped < 40 ? 80 : 70;

  const headAngle = (clamped / 100) * 360 - 90;
  const hx = center + radius * Math.cos((headAngle * Math.PI) / 180);
  const hy = center + radius * Math.sin((headAngle * Math.PI) / 180);

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <style>{styles}</style>
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <filter id="vr-dot-glow">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="vr-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={`hsl(${hue}, ${sat}%, 50%)`} />
            <stop offset="100%" stopColor={`hsl(${hue}, ${sat}%, 74%)`} />
          </linearGradient>
        </defs>

        <circle
          cx={center} cy={center} r={radius}
          fill="none" strokeWidth={stroke}
          style={{ stroke: "var(--gp-text-faint)" }}
        />

        {clamped > 0 && (
          <>
            <circle
              cx={center} cy={center} r={radius}
              fill="none" stroke={`hsl(${hue}, ${sat}%, 55%)`}
              strokeWidth={2.5} strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset + 30}
              opacity="0.2" className="vr-trail"
              transform={`rotate(-90 ${center} ${center})`}
            />
            <circle
              cx={center} cy={center} r={radius}
              fill="none" stroke="url(#vr-grad)" strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              transform={`rotate(-90 ${center} ${center})`}
            />
          </>
        )}

        {clamped > 0 && clamped < 100 && (
          <>
            <circle
              cx={hx} cy={hy} r={5}
              fill={`hsl(${hue}, ${sat}%, 75%)`}
              filter="url(#vr-dot-glow)" className="vr-surge"
            />
            <circle cx={hx} cy={hy} r={2} fill="white" opacity="0.92" />
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
