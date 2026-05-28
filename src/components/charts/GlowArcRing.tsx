"use client";

import { cn } from "@/lib/utils";

type Props = { value: number; size?: number; label?: string; className?: string };

export function GlowArcRing({ value, size = 168, label, className }: Props) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const sweep = 270;
  const startAngle = -225;
  const endAngle = startAngle + sweep;
  const clamped = Math.min(100, Math.max(0, value));

  function polar(deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
  }

  const start = polar(startAngle);
  const endAngleRad = startAngle + (clamped / 100) * sweep;
  const end = polar(endAngleRad);
  const largeArc = endAngleRad - startAngle > 180 ? 1 : 0;

  const endFull = polar(endAngle);

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <filter id="glow-arc">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
        </defs>
        <path
          d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${endFull.x} ${endFull.y}`}
          fill="none"
          stroke="#27272A"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {clamped > 0 && (
          <path
            d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`}
            fill="none"
            stroke="url(#arcGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            filter="url(#glow-arc)"
          />
        )}
        {clamped > 0 && (
          <path
            d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`}
            fill="none"
            stroke="url(#arcGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        )}
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
