"use client";

import type { ProblemRevisionState } from "@/engines/revision/selectors";
import { formatDifficulty } from "@/engines/problems/helpers";
import { PremiumCard } from "@/components/ui/premium-card";
import { Badge } from "@/components/ui/badge";

function reinforcementReason(problem: ProblemRevisionState): string {
  if (problem.revisionPending) return "Flagged for reinforcement";
  if (problem.solveCount === 1) {
    return `Only solved once · ${problem.daysSinceLastSolve}d ago`;
  }
  if (problem.confidence > 0 && problem.confidence < 50) {
    return `Low recall confidence · ${problem.confidence}%`;
  }
  if (problem.recallStrength < 50) {
    return `Memory strength ${problem.recallStrength}%`;
  }
  return `Last solved ${problem.daysSinceLastSolve} days ago`;
}

export function RevisionReinforcementQueue({
  queue,
}: {
  queue: ProblemRevisionState[];
}) {
  return (
    <PremiumCard>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[var(--gp-text)]">
          Needs reinforcement
        </h3>
        <p className="text-sm text-[var(--gp-text-muted)]">
          Derived from solve history — low recall, long gaps, single passes, or
          flags
        </p>
      </div>
      {queue.length === 0 ? (
        <p
          className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-[var(--gp-text-muted)]"
          style={{ borderColor: "var(--gp-border)" }}
        >
          No problems need reinforcement right now. Re-solve any problem on a
          later day to build revision telemetry.
        </p>
      ) : (
        <ul className="space-y-2">
          {queue.map((problem) => (
            <li
              key={problem.identityKey}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3"
              style={{
                borderColor: "var(--gp-border)",
                backgroundColor: "var(--gp-surface)",
              }}
            >
              <div>
                <p className="font-medium text-[var(--gp-text)]">{problem.title}</p>
                <p className="text-xs text-[var(--gp-text-faint)]">
                  {problem.parentTopic}
                  {problem.difficulty
                    ? ` · ${formatDifficulty(problem.difficulty)}`
                    : ""}
                </p>
                <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-200/90">
                  {reinforcementReason(problem)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-[var(--gp-text)]">
                  {problem.recallStrength}%
                </span>
                {problem.difficulty ? (
                  <Badge
                    variant="outline"
                    className="text-[10px]"
                  >
                    {formatDifficulty(problem.difficulty)}
                  </Badge>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </PremiumCard>
  );
}
