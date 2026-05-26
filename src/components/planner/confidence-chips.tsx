"use client";

import { cn } from "@/lib/utils";

const PRESETS = [
  { value: 4, label: "Low", hint: "Struggled" },
  { value: 6, label: "Med", hint: "Okay" },
  { value: 8, label: "High", hint: "Solid" },
] as const;

interface ConfidenceChipsProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function ConfidenceChips({ value, onChange, className }: ConfidenceChipsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {PRESETS.map((preset) => (
        <button
          key={preset.value}
          type="button"
          title={preset.hint}
          onClick={() => onChange(preset.value)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm transition",
            value === preset.value
              ? "border-violet-500 bg-violet-600/20 text-zinc-100"
              : "border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:border-zinc-500"
          )}
        >
          {preset.label}
        </button>
      ))}
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 flex-1 min-w-[80px] accent-violet-500"
        aria-label="Confidence slider"
      />
      <span className="w-8 font-mono text-xs text-zinc-400">{value}</span>
    </div>
  );
}
