"use client";

import { dailyPlan } from "@/lib/data";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { PremiumCard } from "@/components/ui/premium-card";

interface PlannerCalendarProps {
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

export function PlannerCalendar({
  selectedDay,
  onSelectDay,
}: PlannerCalendarProps) {
  const dayStatuses = useAppStore((s) => s.dayStatuses);

  return (
    <PremiumCard className="h-full">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">70-Day Roadmap</h3>
      <div className="graphite-scrollbar-inset grid max-h-[600px] grid-cols-5 gap-2 overflow-y-auto pr-2 sm:grid-cols-7">
        {dailyPlan.map((d) => {
          const status = dayStatuses[d.day] ?? d.status;
          return (
            <button
              key={d.day}
              type="button"
              onClick={() => onSelectDay(d.day)}
              className={cn(
                "flex flex-col items-center rounded-xl border p-2 text-center transition-all hover:scale-105",
                selectedDay === d.day
                  ? "border-violet-500 bg-violet-600/20 shadow-[0_0_20px_rgba(124,58,237,0.2)]"
                  : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-600",
                status === "completed" && "border-green-500/40",
                status === "in-progress" && "border-blue-500/40"
              )}
            >
              <span className="font-mono text-xs text-zinc-500">{d.day}</span>
              <span className="mt-1 line-clamp-2 text-[9px] leading-tight text-zinc-400">
                {d.subtopic.slice(0, 12)}
              </span>
            </button>
          );
        })}
      </div>
    </PremiumCard>
  );
}
