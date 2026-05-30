"use client";

import { useState } from "react";
import { getRevisionSummary } from "@/engines/revision/selectors";
import { PremiumCard } from "@/components/ui/premium-card";
import { ProblemDrillDownSheet } from "@/components/drill-down/problem-drill-down-sheet";
import type { ProblemRevisionState } from "@/engines/revision/selectors";

type RevisionSummary = ReturnType<typeof getRevisionSummary>;

interface CardDef {
  label: string;
  value: string | number;
  hint: string;
  accent: string;
  glow?: boolean;
  filter?: (p: ProblemRevisionState) => boolean;
}

export function RevisionIntelligenceSummary({
  summary,
  problems,
}: {
  summary: RevisionSummary;
  problems: ProblemRevisionState[];
}) {
  const [drill, setDrill] = useState<{ title: string; list: ProblemRevisionState[] } | null>(null);

  const cards: CardDef[] = [
    {
      label: "Unique problems",
      value: summary.uniqueProblems,
      hint: "canonical identities in log",
      accent: "text-[var(--gp-text)]",
      glow: true,
      filter: () => true,
    },
    {
      label: "Repeat solves",
      value: summary.repeatSolves,
      hint: "re-solves after first pass",
      accent: "text-violet-600 dark:text-violet-400",
      filter: (p) => p.revisionCount > 0,
    },
    {
      label: "Revision rate",
      value: `${summary.revisionRatePercent}%`,
      hint: "problems revisited at least once",
      accent: "text-sky-600 dark:text-sky-400",
      filter: (p) => p.revisionCount > 0,
    },
    {
      label: "Overdue",
      value: summary.overdueRevisions,
      hint: "long gap or weak retention",
      accent: "text-rose-600 dark:text-rose-400",
      filter: (p) => p.isOverdue,
    },
    {
      label: "Needs reinforcement",
      value: summary.needsReinforcement,
      hint: "weak or flagged",
      accent: "text-amber-600 dark:text-amber-400",
      filter: (p) => p.needsReinforcement,
    },
    {
      label: "Avg recall",
      value: `${summary.avgRecallStrength}%`,
      hint: "memory score across all tracked",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => {
              if (!card.filter) return;
              setDrill({
                title: card.label,
                list: problems.filter(card.filter),
              });
            }}
            disabled={!card.filter}
            className="rounded-xl border p-3 text-left transition hover:scale-[1.02] disabled:cursor-default disabled:hover:scale-100"
            style={{
              borderColor: "var(--gp-border)",
              backgroundColor: "var(--gp-surface)",
            }}
          >
            <p className="text-[11px] text-[var(--gp-text-faint)]">{card.label}</p>
            <p className={`mt-1 font-mono text-xl font-bold ${card.accent}`}>
              {card.value}
            </p>
            <p className="mt-0.5 text-[10px] text-[var(--gp-text-faint)]">{card.hint}</p>
          </button>
        ))}
      </div>
      <ProblemDrillDownSheet
        open={!!drill}
        onOpenChange={(o) => { if (!o) setDrill(null); }}
        title={drill?.title ?? ""}
        problems={drill?.list ?? []}
      />
    </>
  );
}
