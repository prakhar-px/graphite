"use client";

/** Phase 2: optional hero roadmap viz (arc + 70-day dot grid). Not used in hero yet. */

import { dailyPlan } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types";

type RoadmapProgressProps = {
  completion: number;
  completedDays: number;
  dayStatuses: Record<number, TaskStatus>;
};

function cellColor(status: TaskStatus): string {
  if (status === "completed") return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.45)]";
  if (status === "in-progress") return "bg-violet-500 shadow-[0_0_8px_rgba(124,58,237,0.4)]";
  return "bg-zinc-800/90";
}

export function RoadmapProgress({
  completion,
  completedDays,
  dayStatuses,
}: RoadmapProgressProps) {
  const total = dailyPlan.length;

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative flex h-44 w-44 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#27272A"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="url(#roadmapArc)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${(completion / 100) * 264} 264`}
          />
          <defs>
            <linearGradient id="roadmapArc" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
          </defs>
        </svg>
        <div className="relative z-10 text-center">
          <div className="font-mono text-3xl font-bold text-zinc-50">
            {completion}%
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            roadmap
          </div>
        </div>
      </div>

      <div
        className="mt-5 grid w-full max-w-[220px] gap-1"
        style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}
        aria-label={`${completedDays} of ${total} days completed`}
      >
        {dailyPlan.map((day) => {
          const status = dayStatuses[day.day] ?? day.status;
          return (
            <div
              key={day.day}
              title={`Day ${day.day}: ${day.subtopic}`}
              className={cn(
                "aspect-square rounded-[3px] transition-colors",
                cellColor(status)
              )}
            />
          );
        })}
      </div>

      <div className="mt-3 flex gap-4 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-emerald-500" />
          Done
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-violet-500" />
          Active
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-zinc-700" />
          Queued
        </span>
      </div>
    </div>
  );
}
