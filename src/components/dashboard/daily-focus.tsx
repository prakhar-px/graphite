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
            <p className="text-xs uppercase tracking-widest text-violet-600 dark:text-violet-400">
              Today&apos;s mission
            </p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--gp-text)]">{today.topic}</h3>
            <p className="text-sm text-[var(--gp-text-muted)]">{today.subtopic}</p>
          </div>
          <Badge
            variant="outline"
            className="border-[var(--gp-border)] text-[var(--gp-text-muted)]"
          >
            #{today.sequence}
          </Badge>
        </div>

        <p className="mb-3 text-sm text-[var(--gp-text-muted)]">{today.learningGoal}</p>

        <div className="mb-4 flex flex-wrap gap-3 text-sm text-[var(--gp-text-muted)]">
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
                ? "border-indigo-500/40 text-indigo-600 dark:text-indigo-300"
                : "border-[var(--gp-border)] text-[var(--gp-text-muted)]"
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
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-[var(--gp-text)]"
                style={{
                  borderColor: "var(--gp-border)",
                  backgroundColor: "var(--gp-surface)",
                }}
              >
                <BookOpen className="h-4 w-4 shrink-0 text-violet-500 dark:text-violet-500/70" />
                {q}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--gp-text-faint)]">Concept-focused session — no fixed problem list.</p>
        )}
      </PremiumCard>

      <PremiumCard>
        <h4 className="mb-3 text-sm font-medium text-[var(--gp-text)]">Upcoming missions</h4>
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
                <p className="text-sm text-[var(--gp-text)]">{mission.subtopic}</p>
                <p className="text-xs text-[var(--gp-text-faint)]">
                  #{mission.sequence} · {mission.actualDate}
                </p>
              </div>
              <span className="font-mono text-xs text-[var(--gp-text-faint)]">
                {mission.recommendedSolveCount}p
              </span>
            </div>
          ))}
        </div>
      </PremiumCard>
    </div>
  );
}
