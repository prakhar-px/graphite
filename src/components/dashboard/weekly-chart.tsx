"use client";

import dynamic from "next/dynamic";
import { PremiumCard } from "@/components/ui/premium-card";

const WeeklyChartCanvas = dynamic(
  () =>
    import("@/components/charts/weekly-chart-canvas").then(
      (module) => module.WeeklyChartCanvas
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-full rounded-2xl border"
        style={{
          backgroundColor: "var(--gp-surface)",
          borderColor: "var(--gp-border)",
        }}
      />
    ),
  }
);

export function WeeklyChart() {
  return (
    <PremiumCard className="min-w-0 xl:col-span-2">
      <div className="mb-5">
        <p className="text-sm text-[var(--gp-text-faint)]">Telemetry Velocity</p>
        <h3 className="mt-1 text-lg font-semibold text-[var(--gp-text)]">
          Solved velocity
        </h3>
      </div>
      <div className="relative h-80 w-full min-w-0 overflow-hidden">
        <WeeklyChartCanvas />
      </div>
    </PremiumCard>
  );
}
