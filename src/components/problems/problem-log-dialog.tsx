"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ExternalLink, Trash2 } from "lucide-react";
import {
  formatDifficulty,
  getProblemPlannerDay,
  getProblemSolvedCount,
  getProblemTopics,
  isBulkQuickLog,
} from "@/engines/problems/helpers";
import { getTelemetrySolvedTotal } from "@/engines/problems/selectors";
import { useAppStore } from "@/store/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type FilterMode = "all" | "named" | "quick";

interface ProblemLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProblemLogDialog({ open, onOpenChange }: ProblemLogDialogProps) {
  const problemLog = useAppStore((s) => s.problemLog);
  const removeSolvedProblem = useAppStore((s) => s.removeSolvedProblem);
  const [filter, setFilter] = useState<FilterMode>("all");

  const filtered = useMemo(() => {
    if (filter === "named") {
      return problemLog.filter((p) => !isBulkQuickLog(p));
    }
    if (filter === "quick") {
      return problemLog.filter((p) => isBulkQuickLog(p));
    }
    return problemLog;
  }, [problemLog, filter]);

  const totalTelemetry = getTelemetrySolvedTotal(problemLog);
  const namedCount = problemLog.filter((p) => !isBulkQuickLog(p)).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle>Problem log</DialogTitle>
          <DialogDescription>
            {totalTelemetry} total solves in telemetry · {namedCount} named entries
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["named", "Named problems"],
              ["quick", "Day / count only"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                filter === key
                  ? "border-violet-500 bg-violet-500/15 text-violet-200"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              No entries yet. Use Log Problems or Complete Day to add telemetry.
            </p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((problem) => (
                <li
                  key={problem.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {problem.url ? (
                        <a
                          href={problem.url}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate text-sm font-medium text-zinc-100 hover:text-violet-300"
                        >
                          {problem.title}
                        </a>
                      ) : (
                        <span className="truncate text-sm font-medium text-zinc-100">
                          {problem.title ?? "Quick logged"}
                        </span>
                      )}
                      {problem.url ? (
                        <ExternalLink className="h-3 w-3 shrink-0 text-zinc-600" />
                      ) : null}
                      <Badge variant="outline" className="text-[10px]">
                        {isBulkQuickLog(problem)
                          ? `+${getProblemSolvedCount(problem)} count`
                          : problem.loggingMode === "quick"
                            ? "quick"
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
                      {format(new Date(problem.solvedAt), "MMM d, yyyy")}
                      {getProblemPlannerDay(problem)
                        ? ` · Day ${getProblemPlannerDay(problem)}`
                        : ""}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
