import { Shell } from "@/components/layout/shell";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { TopicDistributionChart } from "@/components/dashboard/topic-distribution-chart";
import { RevisionHeatmap } from "@/components/dashboard/revision-heatmap";
import { MasteryChart } from "@/components/topics/mastery-chart";
import { StatsGrid } from "@/components/dashboard/stats-grid";

export default function AnalyticsPage() {
  return (
    <Shell title="Analytics" subtitle="Deep performance insights">
      <div className="space-y-8 p-4 lg:p-8">
        <StatsGrid />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <WeeklyChart />
          <MasteryChart />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TopicDistributionChart />
          <RevisionHeatmap />
        </div>
      </div>
    </Shell>
  );
}
