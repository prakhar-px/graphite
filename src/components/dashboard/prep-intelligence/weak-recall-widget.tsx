"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { PremiumCard } from "@/components/ui/premium-card";
import { ProblemDrillDownSheet } from "@/components/drill-down/problem-drill-down-sheet";
import type { WeakRecallTopic } from "@/engines/telemetry/selectors";
import type { ProblemRevisionState } from "@/engines/revision/selectors";

interface WeakRecallWidgetProps {
  topics: WeakRecallTopic[];
  allProblems: ProblemRevisionState[];
}

export function WeakRecallWidget({ topics, allProblems }: WeakRecallWidgetProps) {
  const [drill, setDrill] = useState<{ title: string; list: ProblemRevisionState[] } | null>(null);

  if (topics.length === 0) {
    return (
      <PremiumCard>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Weak Recall
        </p>
        <p className="mt-3 text-sm text-zinc-500">No weak topics — your recall is solid.</p>
      </PremiumCard>
    );
  }

  return (
    <>
      <PremiumCard>
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Weak Recall
          </p>
        </div>
        <div className="space-y-2">
          {topics.map((t) => (
            <button
              key={t.topic}
              type="button"
              onClick={() => setDrill({
                title: `Weak: ${t.topic}`,
                list: allProblems.filter((p) => p.parentTopic === t.topic),
              })}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/30 px-3 py-2 text-left transition hover:border-zinc-700/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
            >
              <div>
                <p className="text-sm font-medium text-zinc-200">{t.topic}</p>
                <p className="text-[11px] text-zinc-500">
                    {t.problemCount} problem{t.problemCount === 1 ? "" : "s"}
                    {t.overdueCount > 0 ? <span title="Problems not reviewed in 21+ days, or flagged for revision.">{` · ${t.overdueCount} overdue`}</span> : null}
                </p>
              </div>
              <span className="font-mono text-sm text-red-400" title="Confidence score. Lower means needs review.">{t.recallPercent}%</span>
            </button>
          ))}
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
