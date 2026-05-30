"use client";

import { BookOpen, Calendar, Target } from "lucide-react";
import type { DailyPlanDay } from "@/types";
import { useAppStore } from "@/store/app-store";
import { CompleteDayDialog } from "@/components/planner/complete-day-dialog";
import { SolvedProblemsList } from "@/components/planner/solved-problems-list";
import { PremiumCard } from "@/components/ui/premium-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMissionWorkloadLabel } from "@/engines/planner/mission";

interface TaskCardProps {
  day: DailyPlanDay;
}

export function TaskCard({ day }: TaskCardProps) {
  const { setDayStatus, dayStatuses } = useAppStore();
  const status = dayStatuses[day.day] ?? day.status;
  const isWeekend = day.dayType === "weekend";

  return (
    <PremiumCard glow>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs text-[var(--gp-text-faint)]">
            <Calendar className="h-3.5 w-3.5" />
            {day.actualDate} · {day.dayName}
          </p>
          <h2 className="mt-1 text-xl font-bold text-[var(--gp-text)]">{day.topic}</h2>
          <p className="text-sm text-violet-600 dark:text-violet-400">{day.subtopic}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge
            variant="outline"
            className={cn(
              isWeekend
                ? "border-indigo-500/40 text-indigo-600 dark:text-indigo-300"
                : "border-[var(--gp-border)] text-[var(--gp-text-muted)]"
            )}
          >
            {day.dayType}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              status === "completed" && "border-green-500/50 text-green-600 dark:text-green-400",
              status === "in-progress" && "border-blue-500/50 text-blue-600 dark:text-blue-400",
              status === "pending" && "border-[var(--gp-border)] text-[var(--gp-text-muted)]"
            )}
          >
            {status}
          </Badge>
        </div>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-[var(--gp-text-muted)]">{day.learningGoal}</p>

      <div className="mb-4 space-y-3">
        <div
          className="w-full rounded-xl border p-3"
          style={{
            backgroundColor: "var(--gp-surface)",
            borderColor: "var(--gp-border)",
          }}
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--gp-text-faint)]">
            Suggested
          </p>
          <ul className="space-y-1">
            {day.suggestedQuestions.length > 0 ? (
              day.suggestedQuestions.map((q) => (
                <li key={q} className="flex items-center gap-2 break-words text-sm text-[var(--gp-text)]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500 dark:bg-violet-400" />
                  {q}
                </li>
              ))
            ) : (
              <li className="text-sm text-[var(--gp-text-faint)]">Open practice for topic</li>
            )}
          </ul>
        </div>
        {day.optionalQuestions.length > 0 ? (
          <div
            className="w-full rounded-xl border p-3"
            style={{
              backgroundColor: "var(--gp-surface)",
              borderColor: "var(--gp-border-subtle)",
            }}
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--gp-text-faint)]">
              Optional
            </p>
            <ul className="space-y-1">
              {day.optionalQuestions.map((q) => (
                <li key={q} className="break-words text-sm text-[var(--gp-text-muted)]">
                  {q}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-sm text-[var(--gp-text-muted)]">
        <span className="flex items-center gap-1">
          <BookOpen className="h-4 w-4 text-[var(--gp-text-faint)]" />
          {day.resourceFocus}
        </span>
        <span className="flex items-center gap-1">
          <Target className="h-4 w-4 text-[var(--gp-text-faint)]" />
          {getMissionWorkloadLabel(day)} · {day.sessionType}
        </span>
      </div>

      {day.revisionFocus ? (
        <p className="mb-4 text-xs text-indigo-600 dark:text-indigo-300/90">{day.revisionFocus}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          className="border-[var(--gp-border)] text-[var(--gp-text-muted)] hover:text-[var(--gp-text)]"
          onClick={() => setDayStatus(day.day, "in-progress")}
        >
          In progress
        </Button>
        <CompleteDayDialog day={day} disabled={status === "completed"} />
      </div>

      <SolvedProblemsList plannerDay={day.day} limit={5} />
    </PremiumCard>
  );
}
