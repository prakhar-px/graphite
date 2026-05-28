import { Shell } from "@/components/layout/shell";
import { AiSettingsPanel } from "@/components/settings/ai-settings-panel";
import { SubapassPanel } from "@/components/settings/subapass-panel";
import { DataPanels } from "@/components/settings/data-panels";
import { PremiumCard } from "@/components/ui/premium-card";

export default function SettingsPage() {
  return (
    <Shell title="Settings" subtitle="Preferences & data">
      <div className="space-y-4 p-4 lg:p-8">
        <SubapassPanel />
        <DataPanels />
        <AiSettingsPanel />

        <PremiumCard>
          <h3 className="font-semibold text-[var(--gp-text)]">Focus Mode</h3>
          <p className="mt-2 text-sm text-[var(--gp-text-muted)]">
            Toggle from the sidebar (bottom-left). When on, the dashboard shows
            only the cockpit and daily focus blocks.
          </p>
        </PremiumCard>

        <PremiumCard>
          <h3 className="font-semibold text-[var(--gp-text)]">Theme</h3>
          <p className="mt-2 text-sm text-[var(--gp-text-muted)]">
            Toggle between dark and light mode using the sun/moon button in the
            top navigation bar. Your preference is saved locally.
          </p>
        </PremiumCard>
      </div>
    </Shell>
  );
}
