"use client";

import { Hero } from "@/components/dashboard/hero";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { DailyFocus } from "@/components/dashboard/daily-focus";
import { RevisionHeatmap } from "@/components/dashboard/revision-heatmap";
import { AiInsightCard } from "@/components/dashboard/ai-insight-card";
import { PrepIntelligenceGrid } from "@/components/dashboard/prep-intelligence/prep-intelligence-grid";
import { useAppStore } from "@/store/app-store";

export function DashboardView() {
  const focusMode = useAppStore((s) => s.focusMode);

  if (focusMode) {
    return (
      <div className="space-y-8 p-4 lg:p-8">
        <Hero />
        <DailyFocus />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 lg:p-8">
      <Hero />
      <StatsGrid />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <WeeklyChart />
        <DailyFocus />
      </div>

      <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-2">
        <PrepIntelligenceGrid />
        <RevisionHeatmap />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AiInsightCard />
      </div>
    </div>
  );
}
