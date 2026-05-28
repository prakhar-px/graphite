"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { RevisionTopicGroup } from "@/engines/revision/selectors";
import { confidenceToPercent } from "@/engines/revision/selectors";
import { PremiumCard } from "@/components/ui/premium-card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function TopicRetentionAnalytics({
  groups,
}: {
  groups: RevisionTopicGroup[];
}) {
  const [breakdown, setBreakdown] = useState<RevisionTopicGroup | null>(null);

  if (groups.length === 0) return null;

  return (
    <>
      <PremiumCard>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[var(--gp-text)]">
            Topic retention analytics
          </h3>
          <p className="text-sm text-[var(--gp-text-muted)]">
            Topics aggregate problem telemetry — click repeat solves to see which
            problems drove revisions
          </p>
        </div>
        <ul className="space-y-2">
          {groups.map((group) => {
            const recallLabel =
              group.confidence >= 70
                ? "Strong retention"
                : group.confidence >= 50
                  ? "Moderate retention"
                  : group.confidence > 0
                    ? "Weak retention"
                    : null;

            return (
              <li
                key={group.topic}
                className="rounded-xl border px-4 py-3"
                style={{
                  borderColor: "var(--gp-border)",
                  backgroundColor: "var(--gp-surface)",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-[var(--gp-text)]">{group.topic}</p>
                    <p className="text-xs text-[var(--gp-text-faint)]">
                      {group.uniqueProblems} problems
                      {group.confidence > 0
                        ? ` · ${group.confidence}% recall`
                        : ""}
                      {recallLabel ? ` · ${recallLabel}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.revisionPending > 0 ? (
                      <Badge
                        variant="outline"
                        className="border-amber-500/40 text-amber-600 dark:text-amber-300"
                      >
                        {group.revisionPending} need reinforcement
                      </Badge>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setBreakdown(group)}
                      className={cn(
                        "rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-200 transition hover:border-violet-400/50",
                        group.totalRevisions === 0 &&
                          "pointer-events-none opacity-40"
                      )}
                      disabled={group.totalRevisions === 0}
                    >
                      {group.totalRevisions} repeat solve
                      {group.totalRevisions === 1 ? "" : "s"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </PremiumCard>

      <Dialog
        open={breakdown !== null}
        onOpenChange={(open) => !open && setBreakdown(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          {breakdown ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-[var(--gp-text)]">
                  {breakdown.topic} — revision breakdown
                </DialogTitle>
                <DialogDescription>
                  Most revisited problems in this topic ({breakdown.totalRevisions}{" "}
                  repeat solves across {breakdown.uniqueProblems} problems).
                </DialogDescription>
                <p className="text-xs text-[var(--gp-text-faint)]">
                  <span className="text-[var(--gp-text-muted)]">Memory strength</span> is derived
                  from your logs (not stored manually): average confidence, repeat
                  solve count, and days since last solve. Higher % = stronger
                  retention signal.
                </p>
              </DialogHeader>
              <ul className="space-y-3 pt-2">
                {breakdown.problems
                  .filter((p) => p.revisionCount > 0)
                  .map((problem) => (
                    <li
                      key={problem.identityKey}
                      className="rounded-lg border px-3 py-3"
                      style={{
                        borderColor: "var(--gp-border)",
                        backgroundColor: "var(--gp-surface)",
                      }}
                    >
                      <p className="font-medium text-[var(--gp-text)]">{problem.title}</p>
                      <p className="mt-0.5 text-xs text-[var(--gp-text-faint)]">
                        {problem.revisionCount} revision
                        {problem.revisionCount === 1 ? "" : "s"} ·{" "}
                        {problem.solveCount} solves · {problem.recallStrength}%
                        memory strength
                      </p>
                      <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-[var(--gp-text-faint)]">
                        Solve history
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {problem.solves.map((solve) => (
                          <span
                            key={solve.id}
                            className="rounded-md border px-2 py-0.5 text-[10px] text-[var(--gp-text-muted)]"
                            style={{ borderColor: "var(--gp-border)" }}
                          >
                            {format(new Date(solve.solvedAt), "MMM d, yyyy")}
                            {solve.confidence
                              ? ` · ${confidenceToPercent(solve.confidence)}%`
                              : ""}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                {breakdown.problems.every((p) => p.revisionCount === 0) ? (
                  <p className="text-sm text-[var(--gp-text-muted)]">
                    No repeat solves in this topic yet.
                  </p>
                ) : null}
              </ul>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
