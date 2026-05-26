"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  formatDifficulty,
  getProblemPlannerDay,
  getProblemSolvedCount,
  getProblemTopics,
} from "@/engines/problems/helpers";
import { useAppStore } from "@/store/app-store";
import { PremiumCard } from "@/components/ui/premium-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SolvedProblemsListProps {
  plannerDay?: number;
  limit?: number;
  onViewAll?: () => void;
}

export function SolvedProblemsList({
  plannerDay,
  limit = 8,
  onViewAll,
}: SolvedProblemsListProps) {
  const problemLog = useAppStore((s) => s.problemLog);
  const removeSolvedProblem = useAppStore((s) => s.removeSolvedProblem);

  const items = problemLog
    .filter((p) => (plannerDay ? getProblemPlannerDay(p) === plannerDay : true))
    .slice(0, limit);

  if (problemLog.length === 0) {
    return null;
  }

  return (
    <PremiumCard className="mt-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-200">
        {plannerDay ? `Solves · Day ${plannerDay}` : "Recent solves"}
      </h3>
      {items.length === 0 ? (
        <p className="text-xs text-zinc-500">No problems logged for this day yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((problem) => (
            <li
              key={problem.id}
              className="flex items-start justify-between gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {problem.url ? (
                    <>
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-sm font-medium text-zinc-100 hover:text-violet-300"
                      >
                        {problem.title}
                      </a>
                      <ExternalLink className="h-3 w-3 shrink-0 text-zinc-600" />
                    </>
                  ) : (
                    <span className="truncate text-sm font-medium text-zinc-100">
                      {problem.title ?? "Quick logged problems"}
                    </span>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      problem.difficulty === "easy" && "border-green-500/40 text-green-400",
                      problem.difficulty === "medium" &&
                        "border-amber-500/40 text-amber-400",
                      problem.difficulty === "hard" && "border-red-500/40 text-red-400"
                    )}
                  >
                    {problem.loggingMode === "quick"
                      ? `${getProblemSolvedCount(problem)} solves`
                      : formatDifficulty(problem.difficulty)}
                  </Badge>
                  {problem.confidence ? (
                    <span className="text-[10px] text-zinc-500">
                      conf {problem.confidence}/10
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  {getProblemTopics(problem).slice(0, 3).join(" · ") || "—"} ·{" "}
                  {format(new Date(problem.solvedAt), "MMM d")}
                  {problem.source === "leetcode-sync" ? " · sync" : ""}
                </p>
              </div>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="shrink-0 text-zinc-500 hover:text-red-400"
                onClick={() => removeSolvedProblem(problem.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {problemLog.length > limit && !plannerDay ? (
        <button
          type="button"
          onClick={onViewAll}
          className="mt-2 text-[11px] text-violet-400 hover:underline"
        >
          View all {problemLog.length} entries
        </button>
      ) : null}
    </PremiumCard>
  );
}

