"use client";

import { useState } from "react";
import { PremiumCard } from "@/components/ui/premium-card";
import { OrbCore } from "@/components/charts/OrbCore";
import { ProblemDrillDownSheet } from "@/components/drill-down/problem-drill-down-sheet";
import type { ProblemRevisionState } from "@/engines/revision/selectors";

interface MemoryStrengthWidgetProps {
  avgRecallStrength: number;
  strongRecall: number;
  weakRecall: number;
  totalProblems: number;
  problems: ProblemRevisionState[];
}

export function MemoryStrengthWidget({
  avgRecallStrength,
  strongRecall,
  weakRecall,
  totalProblems,
  problems,
}: MemoryStrengthWidgetProps) {
  const [drill, setDrill] = useState<{ title: string; list: ProblemRevisionState[] } | null>(null);

  return (
    <>
      <PremiumCard glow className="flex flex-col items-center justify-center py-6">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--gp-text-faint)]">
          Memory Strength
        </p>
        <div title="How well you know this topic. Higher = better.">
          <OrbCore value={avgRecallStrength} size={120} label="recall" />
        </div>
        <div className="mt-4 grid w-full grid-cols-3 gap-2 text-center text-xs">
          <button
            type="button"
            onClick={() => setDrill({ title: "Strong recall", list: problems.filter((p) => p.recallStrength >= 60) })}
            className="cursor-pointer rounded-lg transition hover:bg-[var(--gp-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
          >
            <p className="font-mono text-sm font-bold text-green-600 dark:text-green-400">{strongRecall}</p>
            <p className="text-[var(--gp-text-faint)]">strong</p>
          </button>
          <button
            type="button"
            onClick={() => setDrill({ title: "All tracked", list: problems })}
            className="cursor-pointer rounded-lg transition hover:bg-[var(--gp-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gp-border)]"
          >
            <p className="font-mono text-sm font-bold text-[var(--gp-text)]">{totalProblems}</p>
            <p className="text-[var(--gp-text-faint)]">tracked</p>
          </button>
          <button
            type="button"
            onClick={() => setDrill({ title: "Weak recall", list: problems.filter((p) => p.recallStrength > 0 && p.recallStrength < 50) })}
            className="cursor-pointer rounded-lg transition hover:bg-[var(--gp-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
          >
            <p className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">{weakRecall}</p>
            <p className="text-[var(--gp-text-faint)]">weak</p>
          </button>
        </div>
      </PremiumCard>
      <ProblemDrillDownSheet
        open={!!drill}
        onOpenChange={(o) => { if (!o) setDrill(null); }}
        title={drill?.title ?? ""}
        problems={drill?.list ?? []}
      />
    </>
  );
}
