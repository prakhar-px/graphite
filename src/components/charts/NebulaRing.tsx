"use client";

import { cn } from "@/lib/utils";

type Props = { value: number; size?: number; label?: string; className?: string };

export function NebulaRing({ value, size = 168, label, className }: Props) {
  const center = size / 2;
  const clamped = Math.min(100, Math.max(0, value));
  const hue = clamped < 40 ? 0 : clamped < 70 ? 40 : 140;
  const sat = clamped < 40 ? 80 : 70;
  const stroke = 8;
  const radius = (size - stroke) / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const segments = 30;
  const gapDeg = 1.5;
  const beadArcDeg = (360 - gapDeg * segments) / segments;
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
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <filter id="ng-outer-glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="ng-arc-glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="ng-bead-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="ng-core-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="ng-satellite-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <radialGradient id="ng-ambient" cx="50%" cy="50%" r="55%">
            <stop offset="50%" stopColor={`hsl(${hue}, ${sat}%, 50%)`} stopOpacity="0.05" />
            <stop offset="80%" stopColor={`hsl(${hue}, ${sat}%, 60%)`} stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Ambient nebula glow */}
        <circle cx={center} cy={center} r={radius + 12} fill="url(#ng-ambient)" />

        {/* Outer halo ring */}
        <circle
          cx={center} cy={center} r={radius + 2}
          fill="none"
          stroke={`hsl(${hue}, ${sat}%, 50%)`}
          strokeWidth={20}
          opacity="0.04"
          filter="url(#ng-outer-glow)"
        />

        {/* Track ring */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke="#27272A"
          strokeWidth={stroke}
        />

        {/* Glowing progress arc (blur layer) */}
        {clamped > 0 && (
          <circle
            cx={center} cy={center} r={radius}
            fill="none"
            stroke={`hsl(${hue}, ${sat}%, 55%)`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            filter="url(#ng-arc-glow)"
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}

        {/* Sharp progress arc */}
        {clamped > 0 && (
          <circle
            cx={center} cy={center} r={radius}
            fill="none"
            stroke={`hsl(${hue}, ${sat}%, 70%)`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}

        {/* Orbital micro-beads */}
        {Array.from({ length: segments }, (_, i) => {
          const angleDeg = -90 + i * (beadArcDeg + gapDeg) + beadArcDeg / 2;
          const p = polar(angleDeg);
          const isFilled = i < filled;
          return (
            <circle
              key={i}
              cx={p.x} cy={p.y}
              r={isFilled ? 2.5 : 1.5}
              fill={isFilled ? `hsl(${hue}, ${Math.min(sat + 10, 90)}, 72%)` : "#52525B"}
              opacity={isFilled ? 1 : 0.3}
              filter={isFilled ? "url(#ng-bead-glow)" : undefined}
            />
          );
        })}

        {/* Progress head satellite */}
        {clamped > 0 && clamped < 100 && (() => {
          const headDeg = (clamped / 100) * 360 - 90;
          const head = polar(headDeg);
          return (
            <>
              <circle cx={head.x} cy={head.y} r={5} fill={`hsl(${hue}, ${sat}%, 75%)`} filter="url(#ng-satellite-glow)" />
              <circle cx={head.x} cy={head.y} r={2.5} fill="white" opacity="0.9" />
            </>
          );
        })()}

        {/* Central orb layers */}
        <circle cx={center} cy={center} r={center * 0.45} fill={`hsl(${hue}, ${sat}%, 50%)`} opacity="0.06" />
        <circle cx={center} cy={center} r={center * 0.28} fill={`hsl(${hue}, ${sat}%, 50%)`} opacity="0.12" />
        <circle cx={center} cy={center} r={center * 0.14} fill={`hsl(${hue}, ${sat}%, 55%)`} opacity="0.3" />
        <circle cx={center} cy={center} r={center * 0.06} fill={`hsl(${hue}, ${sat}%, 72%)`} filter="url(#ng-core-glow)" />
      </svg>

      <div className="absolute text-center">
        <div className="font-mono text-2xl font-bold text-[var(--gp-text)]">{value}%</div>
        {label && (
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--gp-text-faint)]">
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
