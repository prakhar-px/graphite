"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { getTodayPlan, getUpcomingDays } from "@/lib/data";
import { useAppStore } from "@/store/app-store";
import { PremiumCard } from "@/components/ui/premium-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DailyFocus() {
  const dayStatuses = useAppStore((s) => s.dayStatuses);
  const today = getTodayPlan(dayStatuses);
  const upcoming = getUpcomingDays(4, dayStatuses);
  const completedTasks = useAppStore((s) => s.completedTasks);
  const toggleTask = useAppStore((s) => s.toggleTask);

  return (
    <div className="space-y-4">
      <PremiumCard glow>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-violet-400">
              Daily Focus
            </p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-100">
              {today.topic}
            </h3>
            <p className="text-sm text-zinc-500">{today.subtopic}</p>
          </div>
          <Badge variant="outline" className="border-zinc-700 text-zinc-400">
            Day {today.day}
          </Badge>
        </div>

        <div className="mb-4 flex gap-4 text-sm text-zinc-400">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {today.timeGoal}
          </span>
          <span className="font-mono text-zinc-300">
            {today.problemTarget} problems
          </span>
        </div>

        <ul className="space-y-2">
          {today.tasks.map((task, i) => {
            const id = `day-${today.day}-task-${i}`;
            const done = completedTasks.includes(id);
            return (
              <motion.li
                key={id}
                layout
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800/80 px-3 py-2 transition-colors hover:bg-zinc-800/40",
                  done && "opacity-60"
                )}
                onClick={() => toggleTask(id)}
              >
                {done ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-zinc-600" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    done ? "text-zinc-500 line-through" : "text-zinc-300"
                  )}
                >
                  {task}
                </span>
              </motion.li>
            );
          })}
        </ul>
      </PremiumCard>

      <PremiumCard>
        <h4 className="mb-3 text-sm font-medium text-zinc-300">Upcoming Queue</h4>
        <div className="space-y-3">
          {upcoming.map((day) => (
            <div
              key={day.day}
              className="flex items-center justify-between border-l-2 border-violet-600/40 pl-3"
            >
              <div>
                <p className="text-sm text-zinc-300">{day.subtopic}</p>
                <p className="text-xs text-zinc-500">
                  Day {day.day} · {day.date}
                </p>
              </div>
              <span className="font-mono text-xs text-zinc-500">
                {day.problemTarget}p
              </span>
            </div>
          ))}
        </div>
      </PremiumCard>
    </div>
  );
}
