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
          <p className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Calendar className="h-3.5 w-3.5" />
            {day.actualDate} · {day.dayName}
          </p>
          <h2 className="mt-1 text-xl font-bold text-zinc-100">{day.topic}</h2>
          <p className="text-sm text-violet-400">{day.subtopic}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge
            variant="outline"
            className={cn(
              isWeekend
                ? "border-indigo-500/40 text-indigo-300"
                : "border-zinc-600 text-zinc-400"
            )}
          >
            {day.dayType}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              status === "completed" && "border-green-500/50 text-green-400",
              status === "in-progress" && "border-blue-500/50 text-blue-400"
            )}
          >
            {status}
          </Badge>
        </div>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-zinc-300">{day.learningGoal}</p>

      <div className="mb-4 space-y-3">
        <div className="w-full rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Suggested
          </p>
          <ul className="space-y-1">
            {day.suggestedQuestions.length > 0 ? (
              day.suggestedQuestions.map((q) => (
                <li key={q} className="flex items-center gap-2 break-words text-sm text-zinc-200">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                  {q}
                </li>
              ))
            ) : (
              <li className="text-sm text-zinc-500">Open practice for topic</li>
            )}
          </ul>
        </div>
        {day.optionalQuestions.length > 0 ? (
          <div className="w-full rounded-xl border border-zinc-800/60 bg-zinc-950/30 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-600">
              Optional
            </p>
            <ul className="space-y-1">
              {day.optionalQuestions.map((q) => (
                <li key={q} className="break-words text-sm text-zinc-500">
                  {q}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-sm text-zinc-400">
        <span className="flex items-center gap-1">
          <BookOpen className="h-4 w-4 text-zinc-500" />
          {day.resourceFocus}
        </span>
        <span className="flex items-center gap-1">
          <Target className="h-4 w-4 text-zinc-500" />
          {getMissionWorkloadLabel(day)} · {day.sessionType}
        </span>
      </div>

      {day.revisionFocus ? (
        <p className="mb-4 text-xs text-indigo-300/90">{day.revisionFocus}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          className="border-zinc-700"
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
