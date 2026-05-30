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
              ? "border-violet-500 bg-violet-500/15 text-violet-700 dark:text-violet-200"
              : "border-[var(--gp-border)] text-[var(--gp-text-faint)] hover:border-[var(--gp-text-faint)]"
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
      <span className="w-8 font-mono text-xs text-[var(--gp-text-faint)]">{value}</span>
    </div>
  );
}
