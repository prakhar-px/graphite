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
          <Scale className="h-4 w-4 text-zinc-500" />
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Preparation Balance
          </p>
        </div>
        <p className="mt-3 text-sm text-zinc-500">Log more problems to see balance insights.</p>
      </PremiumCard>
    );
  }

  return (
    <>
      <PremiumCard>
        <div className="mb-3 flex items-center gap-2">
          <Scale className="h-4 w-4 text-zinc-400" />
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Preparation Balance
          </p>
        </div>
        <div className="space-y-2">
          {overfocused.length > 0 ? (
            <div>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-violet-400" title="Solved more than planned for this topic.">
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
                  className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-violet-800/30 bg-violet-950/20 px-3 py-1.5 text-left transition hover:border-violet-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                >
                  <span className="text-sm text-zinc-200">{t.topic}</span>
                  <span className="font-mono text-xs text-violet-400">{t.solvedCount} solves</span>
                </button>
              ))}
            </div>
          ) : null}
          {underprepared.length > 0 ? (
            <div>
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-amber-400" title="Solved less than planned for this topic.">
                Underprepared
              </p>
              {underprepared.slice(0, 3).map((t) => (
                <div
                  key={t.topic}
                  className="flex items-center justify-between rounded-lg border border-amber-800/30 bg-amber-950/20 px-3 py-1.5"
                >
                  <span className="text-sm text-zinc-200">{t.topic}</span>
                  <span className="font-mono text-xs text-amber-400">{t.solvedCount} solves</span>
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
