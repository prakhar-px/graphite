"use client";

import dynamic from "next/dynamic";
import { PremiumCard } from "@/components/ui/premium-card";

const TopicDistributionCanvas = dynamic(
  () =>
    import("@/components/charts/topic-distribution-canvas").then(
      (module) => module.TopicDistributionCanvas
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full rounded-2xl border border-zinc-800 bg-zinc-950/40" />
    ),
  }
);

export function TopicDistributionChart() {
  return (
    <PremiumCard className="min-w-0">
      <div className="mb-5">
        <p className="text-sm text-zinc-500">Telemetry Analytics</p>
        <h3 className="mt-1 text-lg font-semibold text-zinc-100">
          Actual solved exposure
        </h3>
      </div>
      <div className="relative h-80 w-full min-w-0 overflow-hidden">
        <TopicDistributionCanvas />
      </div>
    </PremiumCard>
  );
}
