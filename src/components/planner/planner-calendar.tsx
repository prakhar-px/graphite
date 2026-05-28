"use client";

import { useMemo } from "react";
import { dailyPlan } from "@/lib/data";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { getMissionWorkloadLabel } from "@/engines/planner/mission";
import { isMissionPastDue } from "@/engines/planner/selectors";

interface PlannerCalendarProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

function groupByWeek(plan: typeof dailyPlan) {
  const weeks: { weekIndex: number; days: typeof plan }[] = [];
  for (let i = 0; i < plan.length; i += 7) {
    weeks.push({
      weekIndex: Math.floor(i / 7) + 1,
      days: plan.slice(i, i + 7),
    });
  }
  return weeks;
}

export function PlannerCalendar({
  selectedDay,
  onSelectDay,
}: PlannerCalendarProps) {
  const dayStatuses = useAppStore((s) => s.dayStatuses);
  const weeks = useMemo(() => groupByWeek(dailyPlan), []);

  function weekProgress(days: typeof dailyPlan) {
    let done = 0;
    for (const d of days) {
      const s = dayStatuses[d.day] ?? d.status;
      if (s === "completed") done++;
    }
    return done;
  }

  return (
    <div className="h-full rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 shadow-md">
      <h3 className="mb-1 text-lg font-semibold text-zinc-100">
        70-Day Sprint
      </h3>
      <p className="mb-4 text-xs text-zinc-500">
        Each square is one study mission — not a single problem.
      </p>
      <div className="graphite-scrollbar-inset max-h-[600px] space-y-4 overflow-y-auto pr-2">
        {weeks.map(({ weekIndex, days }) => {
          const done = weekProgress(days);
          const total = days.length;
          return (
            <div key={weekIndex}>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="font-mono text-[11px] font-semibold text-zinc-400">
                  W{weekIndex}
                </span>
                <div className="h-px flex-1 bg-zinc-800/60" />
                <span className="text-[10px] text-zinc-600">
                  {done}/{total} done
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {days.map((mission) => {
                  const status = dayStatuses[mission.day] ?? mission.status;
                  const pastDue = isMissionPastDue(mission, dayStatuses);
                  const isWeekend = mission.dayType === "weekend";

                  return (
                    <button
                      key={mission.day}
                      type="button"
                      onClick={() => onSelectDay(mission.day)}
                      title={`${mission.topic} — ${getMissionWorkloadLabel(mission)}`}
                      className={cn(
                        "flex min-h-[64px] flex-col items-center overflow-hidden rounded-lg border p-1.5 text-center transition-all hover:scale-[1.02]",
                        selectedDay === mission.day
                          ? "border-violet-500 bg-violet-600/20 shadow-[0_0_20px_rgba(124,58,237,0.2)]"
                          : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-600",
                        isWeekend && "bg-indigo-950/20",
                        status === "completed" &&
                          "border-emerald-500/40 bg-emerald-950/10",
                        status === "in-progress" && "border-blue-500/40",
                        pastDue &&
                          status !== "completed" &&
                          "border-amber-500/30",
                      )}
                    >
                      <span className="font-mono text-[10px] text-zinc-500">
                        {mission.sequence}
                      </span>
                      <span className="mt-0.5 line-clamp-2 text-[9px] font-medium leading-tight text-zinc-300">
                        {mission.subtopic.slice(0, 18)}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 h-1.5 w-1.5 rounded-full",
                          status === "completed" && "bg-emerald-400",
                          status === "in-progress" && "bg-blue-400",
                          status === "pending" && "bg-zinc-600",
                        )}
                      />
                      {isWeekend ? (
                        <span className="mt-0.5 text-[8px] uppercase tracking-wide text-indigo-400/80">
                          wknd
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
