"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import type { ProblemRevisionState } from "@/engines/revision/selectors";
import { confidenceToPercent } from "@/engines/revision/selectors";
import { formatDifficulty } from "@/engines/problems/helpers";
import { PremiumCard } from "@/components/ui/premium-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RecallTrendLabel } from "@/components/revision/recall-trend-label";
import { cn } from "@/lib/utils";

export function ProblemMemoryTimeline({
  problems,
}: {
  problems: ProblemRevisionState[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return problems;
    return problems.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.parentTopic.toLowerCase().includes(q) ||
        p.topics.some((t) => t.toLowerCase().includes(q))
    );
  }, [problems, query]);

  return (
    <PremiumCard>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">
            Problem memory timeline
          </h3>
          <p className="text-sm text-zinc-500">
            Each card is one canonical problem — revision count is derived from
            solve events
          </p>
        </div>
        <Input
          placeholder="Search problems…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs border-zinc-800 bg-zinc-950/80"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
          {problems.length === 0
            ? "Log named problems to build memory telemetry. Same problem on different days counts as revision."
            : "No problems match your search."}
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((problem) => (
            <li
              key={problem.identityKey}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 px-4 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-100">{problem.title}</p>
                  <p className="text-xs text-zinc-500">
                    {problem.parentTopic}
                    {problem.difficulty
                      ? ` · ${formatDifficulty(problem.difficulty)}`
                      : ""}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {problem.solveCount} solve
                    {problem.solveCount === 1 ? "" : "s"}
                    {problem.revisionCount > 0
                      ? ` · ${problem.revisionCount} revision${problem.revisionCount === 1 ? "" : "s"}`
                      : " · first pass"}
                    {" · "}
                    Last solved{" "}
                    {problem.daysSinceLastSolve === 0
                      ? "today"
                      : `${problem.daysSinceLastSolve}d ago`}
                  </p>
                  <div className="mt-1">
                    <RecallTrendLabel trend={problem.recallTrend} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-mono text-sm text-violet-300">
                    {problem.recallStrength}% memory
                  </span>
                  {problem.confidence > 0 ? (
                    <span className="font-mono text-xs text-zinc-500">
                      {problem.confidence}% avg confidence
                    </span>
                  ) : null}
                  {problem.needsReinforcement ? (
                    <Badge
                      variant="outline"
                      className="border-amber-500/40 text-amber-300"
                    >
                      Needs reinforcement
                    </Badge>
                  ) : problem.recallStrength >= 60 ? (
                    <Badge
                      variant="outline"
                      className="border-green-500/30 text-green-300"
                    >
                      Strong recall
                    </Badge>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {problem.solves.map((solve) => (
                  <span
                    key={solve.id}
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[10px]",
                      solve.revisionNeeded
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                        : "border-zinc-800 text-zinc-500"
                    )}
                    title={
                      solve.plannerDay
                        ? `Planner day ${solve.plannerDay} (metadata)`
                        : undefined
                    }
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
        </ul>
      )}
    </PremiumCard>
  );
}
