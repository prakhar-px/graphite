"use client";

import { Shell } from "@/components/layout/shell";
import { PlannerCalendar } from "@/components/planner/planner-calendar";
import { TaskCard } from "@/components/planner/task-card";
import { dailyPlan } from "@/lib/data";
import { useAppStore } from "@/store/app-store";

export default function PlannerPage() {
  const selectedDay = useAppStore((s) => s.plannerSelectedDay);
  const setPlannerSelectedDay = useAppStore((s) => s.setPlannerSelectedDay);
  const day = dailyPlan.find((d) => d.day === selectedDay) ?? dailyPlan[0];

  return (
    <Shell title="Daily Planner" subtitle="70-day FAANG roadmap">
      <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-2 lg:p-8">
        <div className="space-y-4">
          <PlannerCalendar
            selectedDay={selectedDay}
            onSelectDay={setPlannerSelectedDay}
          />
        </div>
        <TaskCard day={day} />
      </div>
    </Shell>
  );
}
