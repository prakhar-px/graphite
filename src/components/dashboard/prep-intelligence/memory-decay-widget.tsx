"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { PremiumCard } from "@/components/ui/premium-card";
import { ProblemDrillDownSheet } from "@/components/drill-down/problem-drill-down-sheet";
import { cn } from "@/lib/utils";
import type { TopicFreshness } from "@/engines/telemetry/selectors";
import type { ProblemRevisionState } from "@/engines/revision/selectors";

interface MemoryDecayWidgetProps {
  topics: TopicFreshness[];
  allProblems: ProblemRevisionState[];
}

export function MemoryDecayWidget({ topics, allProblems }: MemoryDecayWidgetProps) {
  const [drill, setDrill] = useState<{ title: string; list: ProblemRevisionState[] } | null>(null);

  if (topics.length === 0) {
    return (
      <PremiumCard>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[var(--gp-text-faint)]" />
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--gp-text-faint)]">
            Topic Freshness
          </p>
        </div>
        <p className="mt-3 text-sm text-[var(--gp-text-muted)]">Log problems to track memory freshness.</p>
      </PremiumCard>
    );
  }

  return (
    <>
      <PremiumCard>
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-[var(--gp-text-muted)]" />
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--gp-text-faint)]">
            Topic Freshness
          </p>
        </div>
        <p className="mb-2 text-[10px] text-[var(--gp-text-faint)]">Days since last solve</p>
        <div className="space-y-1.5">
          {topics.slice(0, 6).map((t) => (
            <button
              key={t.topic}
              type="button"
              onClick={() => setDrill({
                title: `Freshness: ${t.topic}`,
                list: allProblems.filter((p) => p.parentTopic === t.topic),
              })}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-1 py-1 text-left transition hover:bg-[var(--gp-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gp-border)]"
            >
              <span className="w-24 truncate text-sm text-[var(--gp-text)]">{t.topic}</span>
              <div
                className="h-2 flex-1 overflow-hidden rounded-full"
                style={{ backgroundColor: "var(--gp-border)" }}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    t.freshness === "fresh" && "bg-green-500",
                    t.freshness === "fading" && "bg-amber-500",
                    t.freshness === "stale" && "bg-red-500"
                  )}
                  style={{
                    width: t.freshness === "fresh" ? "100%"
                      : t.freshness === "fading" ? "50%"
                      : "15%",
                  }}
                />
              </div>
              <span
                title="Days since last solve. Fresh ≤ 7d, Stale > 21d."
                className={cn(
                "w-16 text-right font-mono text-[11px]",
                t.freshness === "fresh" && "text-green-600 dark:text-green-400",
                t.freshness === "fading" && "text-amber-600 dark:text-amber-400",
                t.freshness === "stale" && "text-red-600 dark:text-red-400",
              )}>
                {t.daysSinceLastSolve}d
              </span>
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
