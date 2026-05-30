"use client";

import { useState } from "react";
import { Scale } from "lucide-react";
import { PremiumCard } from "@/components/ui/premium-card";
import { ProblemDrillDownSheet } from "@/components/drill-down/problem-drill-down-sheet";
import type { PreparationBalance } from "@/engines/telemetry/selectors";
import type { ProblemRevisionState } from "@/engines/revision/selectors";

interface PreparationBalanceWidgetProps {
  items: PreparationBalance[];
  allProblems: ProblemRevisionState[];
}

export function PreparationBalanceWidget({ items, allProblems }: PreparationBalanceWidgetProps) {
  const [drill, setDrill] = useState<{ title: string; list: ProblemRevisionState[] } | null>(null);
  const overfocused = items.filter((i) => i.imbalance === "overfocused");
  const underprepared = items.filter((i) => i.imbalance === "underprepared");

  if (overfocused.length === 0 && underprepared.length === 0) {
    return (
      <PremiumCard>
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-[var(--gp-text-faint)]" />
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--gp-text-faint)]">
            Preparation Balance
          </p>
        </div>
        <p className="mt-3 text-sm text-[var(--gp-text-muted)]">Log more problems to see balance insights.</p>
      </PremiumCard>
    );
  }

  return (
    <>
      <PremiumCard>
        <div className="mb-3 flex items-center gap-2">
          <Scale className="h-4 w-4 text-[var(--gp-text-muted)]" />
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--gp-text-faint)]">
            Preparation Balance
          </p>
        </div>
        <div className="space-y-2">
          {overfocused.length > 0 ? (
            <div>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-violet-600 dark:text-violet-400" title="Solved more than planned for this topic.">
                Overfocused
              </p>
              {overfocused.slice(0, 3).map((t) => (
                <button
                  key={t.topic}
                  type="button"
                  onClick={() => setDrill({
                    title: `Overfocused: ${t.topic}`,
                    list: allProblems.filter((p) => p.parentTopic === t.topic),
                  })}
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                  style={{
                    borderColor: "rgba(124,58,237,0.3)",
                    backgroundColor: "rgba(124,58,237,0.06)",
                  }}
                >
                  <span className="text-sm text-[var(--gp-text)]">{t.topic}</span>
                  <span className="font-mono text-xs text-violet-600 dark:text-violet-400">{t.solvedCount} solves</span>
                </button>
              ))}
            </div>
          ) : null}
          {underprepared.length > 0 ? (
            <div>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400" title="Solved less than planned for this topic.">
                Underprepared
              </p>
              {underprepared.slice(0, 3).map((t) => (
                <div
                  key={t.topic}
                  className="flex items-center justify-between rounded-lg border px-3 py-1.5"
                  style={{
                    borderColor: "rgba(245,158,11,0.3)",
                    backgroundColor: "rgba(245,158,11,0.06)",
                  }}
                >
                  <span className="text-sm text-[var(--gp-text)]">{t.topic}</span>
                  <span className="font-mono text-xs text-amber-600 dark:text-amber-400">{t.solvedCount} solves</span>
                </div>
              ))}
            </div>
          ) : null}
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
