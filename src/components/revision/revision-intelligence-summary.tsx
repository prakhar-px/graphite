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
      accent: "text-zinc-100",
      glow: true,
      filter: () => true,
    },
    {
      label: "Repeat solves",
      value: summary.repeatSolves,
      hint: "re-solves after first pass",
      accent: "text-violet-400",
      filter: (p) => p.revisionCount > 0,
    },
    {
      label: "Revision rate",
      value: `${summary.revisionRatePercent}%`,
      hint: "problems revisited at least once",
      accent: "text-sky-400",
      filter: (p) => p.revisionCount > 0,
    },
    {
      label: "Overdue",
      value: summary.overdueRevisions,
      hint: "long gap or weak retention",
      accent: "text-rose-400",
      filter: (p) => p.isOverdue,
    },
    {
      label: "Needs reinforcement",
      value: summary.needsReinforcement,
      hint: "flagged, weak, or stale",
      accent: "text-amber-400",
      filter: (p) => p.needsReinforcement,
    },
    {
      label: "Strong recall",
      value: summary.strongRecall,
      hint: "memory strength ≥ 60%",
      accent: "text-green-400",
      filter: (p) => p.recallStrength >= 60,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => {
              if (card.filter && typeof card.value === "number") {
                setDrill({ title: card.label, list: problems.filter(card.filter) });
              }
            }}
            className="cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/50 rounded-xl"
          >
            <PremiumCard glow={card.glow} className="transition hover:border-zinc-700/60">
              <p className="text-xs text-zinc-500">{card.label}</p>
              <p className={`font-mono text-2xl font-bold ${card.accent}`}>
                {card.value}
              </p>
              <p className="text-[11px] text-zinc-600">{card.hint}</p>
            </PremiumCard>
          </button>
        ))}
      </div>
      {summary.avgRecallStrength > 0 ? (
        <p className="text-sm text-zinc-500">
          Average memory strength across tracked problems:{" "}
          <span className="font-mono text-zinc-300">
            {summary.avgRecallStrength}%
          </span>
        </p>
      ) : null}
      <ProblemDrillDownSheet
        open={!!drill}
        onOpenChange={(o) => { if (!o) setDrill(null); }}
        title={drill?.title ?? ""}
        problems={drill?.list ?? []}
      />
    </div>
  );
}
