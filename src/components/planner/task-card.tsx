"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import type { DailyPlanDay } from "@/types";
import { useAppStore } from "@/store/app-store";
import { LogProblemDialog } from "@/components/planner/log-problem-dialog";
import { SolvedProblemsList } from "@/components/planner/solved-problems-list";
import { PremiumCard } from "@/components/ui/premium-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  day: DailyPlanDay;
}

export function TaskCard({ day }: TaskCardProps) {
  const { completedTasks, toggleTask, setDayStatus, dayStatuses } =
    useAppStore();
  const status = dayStatuses[day.day] ?? day.status;

  return (
    <PremiumCard glow>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs text-zinc-500">{day.date}</p>
          <h2 className="text-xl font-bold text-zinc-100">{day.topic}</h2>
          <p className="text-sm text-violet-400">{day.subtopic}</p>
        </div>
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

      <div className="mb-4 flex gap-4 text-sm text-zinc-400">
        <span>{day.timeGoal}</span>
        <span className="font-mono">{day.problemTarget} problems</span>
      </div>

      <ul className="mb-4 space-y-2">
        {day.tasks.map((task, i) => {
          const id = `day-${day.day}-task-${i}`;
          const done = completedTasks.includes(id);
          return (
            <motion.li
              key={id}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-800/50"
              onClick={() => toggleTask(id)}
            >
              {done ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 text-zinc-600" />
              )}
              <span
                className={cn(
                  "text-sm",
                  done && "text-zinc-500 line-through"
                )}
              >
                {task}
              </span>
            </motion.li>
          );
        })}
      </ul>

      {day.notes && (
        <p className="mb-4 text-sm text-zinc-500">{day.notes}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <LogProblemDialog plannerDay={day.day} />
        <Button
          size="sm"
          variant="outline"
          className="border-zinc-700"
          onClick={() => setDayStatus(day.day, "in-progress")}
        >
          In Progress
        </Button>
        <Button
          size="sm"
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50"
          disabled={status === "completed"}
          onClick={() => setDayStatus(day.day, "completed")}
        >
          {status === "completed" ? "Completed" : "Mark Complete"}
        </Button>
      </div>

      <SolvedProblemsList plannerDay={day.day} limit={5} />
    </PremiumCard>
  );
}
