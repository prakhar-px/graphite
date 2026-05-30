import { Shell } from "@/components/layout/shell";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { RevisionHeatmap } from "@/components/dashboard/revision-heatmap";
import { MasteryChart } from "@/components/topics/mastery-chart";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { PrepIntelligenceGrid } from "@/components/dashboard/prep-intelligence/prep-intelligence-grid";

export default function AnalyticsPage() {
  return (
    <Shell title="Analytics" subtitle="Deep performance insights">
      <div className="space-y-8 p-4 lg:p-8">
        <StatsGrid />
        <WeeklyChart />
        <PrepIntelligenceGrid horizontal />
        <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-2">
          <MasteryChart />
          <RevisionHeatmap />
        </div>
      </div>
    </Shell>
  );
}
