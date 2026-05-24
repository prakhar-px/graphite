import { Shell } from "@/components/layout/shell";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default function DashboardPage() {
  return (
    <Shell title="Dashboard" subtitle="Mission control overview">
      <DashboardView />
    </Shell>
  );
}
