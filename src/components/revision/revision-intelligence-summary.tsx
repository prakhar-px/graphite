"use client";

import { getRevisionSummary } from "@/engines/revision/selectors";
import { PremiumCard } from "@/components/ui/premium-card";

type RevisionSummary = ReturnType<typeof getRevisionSummary>;

export function RevisionIntelligenceSummary({
  summary,
}: {
  summary: RevisionSummary;
}) {
  const cards = [
    {
      label: "Unique problems",
      value: summary.uniqueProblems,
      hint: "canonical identities in log",
      accent: "text-zinc-100",
      glow: true,
    },
    {
      label: "Repeat solves",
      value: summary.repeatSolves,
      hint: "re-solves after first pass",
      accent: "text-violet-400",
    },
    {
      label: "Revision rate",
      value: `${summary.revisionRatePercent}%`,
      hint: "problems revisited at least once",
      accent: "text-sky-400",
    },
    {
      label: "Overdue",
      value: summary.overdueRevisions,
      hint: "long gap or weak retention",
      accent: "text-rose-400",
    },
    {
      label: "Needs reinforcement",
      value: summary.needsReinforcement,
      hint: "flagged, weak, or stale",
      accent: "text-amber-400",
    },
    {
      label: "Strong recall",
      value: summary.strongRecall,
      hint: "memory strength ≥ 60%",
      accent: "text-green-400",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <PremiumCard key={card.label} glow={card.glow}>
            <p className="text-xs text-zinc-500">{card.label}</p>
            <p className={`font-mono text-2xl font-bold ${card.accent}`}>
              {card.value}
            </p>
            <p className="text-[11px] text-zinc-600">{card.hint}</p>
          </PremiumCard>
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
    </div>
  );
}
