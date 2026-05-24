import { Shell } from "@/components/layout/shell";
import { AiSettingsPanel } from "@/components/settings/ai-settings-panel";
import { DataPanels } from "@/components/settings/data-panels";
import { PremiumCard } from "@/components/ui/premium-card";

export default function SettingsPage() {
  return (
    <Shell title="Settings" subtitle="Preferences & data">
      <div className="space-y-4 p-4 lg:p-8">
        <DataPanels />
        <AiSettingsPanel />

        <PremiumCard>
          <h3 className="font-semibold text-zinc-100">Coming in Phase 2</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-400">
            <li>Light theme</li>
            <li>Hero roadmap mini-grid (70-day dots + arc)</li>
            <li>Cloud database sync</li>
          </ul>
        </PremiumCard>

        <PremiumCard>
          <h3 className="font-semibold text-zinc-100">Focus Mode</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Toggle from the sidebar (bottom-left). When on, the dashboard shows
            only the cockpit and daily focus blocks.
          </p>
        </PremiumCard>
      </div>
    </Shell>
  );
}
