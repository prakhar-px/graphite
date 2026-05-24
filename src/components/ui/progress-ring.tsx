import { cn } from "@/lib/utils";

type ProgressRingProps = {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
};

export function ProgressRing({
  value,
  size = 104,
  stroke = 9,
  label,
  className,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, value) / 100) * circumference;

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#27272A"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#graphiteRingGradient)"
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="graphiteRingGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="55%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="font-mono text-2xl font-bold text-zinc-50">{value}%</div>
        {label ? (
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            {label}
          </div>
        ) : null}
      </div>
    </div>
  );
}
