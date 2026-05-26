"use client";

import { BookOpen, Calendar, Target } from "lucide-react";
import { getTodayPlan, getUpcomingDays } from "@/lib/data";
import { useAppStore } from "@/store/app-store";
import { PremiumCard } from "@/components/ui/premium-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getMissionWorkloadLabel } from "@/engines/planner/mission";

export function DailyFocus() {
  const dayStatuses = useAppStore((s) => s.dayStatuses);
  const today = getTodayPlan(dayStatuses);
  const upcoming = getUpcomingDays(4, dayStatuses);

  return (
    <div className="space-y-4">
      <PremiumCard glow>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-violet-400">
              Today&apos;s mission
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-100">{today.topic}</h3>
            <p className="text-sm text-zinc-500">{today.subtopic}</p>
          </div>
          <Badge variant="outline" className="border-zinc-700 text-zinc-400">
            #{today.sequence}
          </Badge>
        </div>

        <p className="mb-3 text-sm text-zinc-400">{today.learningGoal}</p>

        <div className="mb-4 flex flex-wrap gap-3 text-sm text-zinc-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {today.actualDate}
          </span>
          <span className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            {getMissionWorkloadLabel(today)}
          </span>
          <Badge
            variant="outline"
            className={cn(
              today.dayType === "weekend"
                ? "border-indigo-500/40 text-indigo-300"
                : "border-zinc-700"
            )}
          >
            {today.dayType}
          </Badge>
        </div>

        {today.suggestedQuestions.length > 0 ? (
          <ul className="space-y-1.5">
            {today.suggestedQuestions.map((q) => (
              <li
                key={q}
                className="flex items-center gap-2 rounded-lg border border-zinc-800/60 px-3 py-2 text-sm text-zinc-300"
              >
                <BookOpen className="h-4 w-4 shrink-0 text-violet-500/70" />
                {q}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">Concept-focused session — no fixed problem list.</p>
        )}
      </PremiumCard>

      <PremiumCard>
        <h4 className="mb-3 text-sm font-medium text-zinc-300">Upcoming missions</h4>
        <div className="space-y-3">
          {upcoming.map((mission) => (
            <div
              key={mission.day}
              className={cn(
                "flex items-center justify-between border-l-2 pl-3",
                mission.dayType === "weekend"
                  ? "border-indigo-500/50"
                  : "border-violet-600/40"
              )}
            >
              <div>
                <p className="text-sm text-zinc-300">{mission.subtopic}</p>
                <p className="text-xs text-zinc-500">
                  #{mission.sequence} · {mission.actualDate}
                </p>
              </div>
              <span className="font-mono text-xs text-zinc-500">
                {mission.recommendedSolveCount}p
              </span>
            </div>
          ))}
        </div>
      </PremiumCard>
    </div>
  );
}
