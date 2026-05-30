"use client";

import type { LogoType } from "@/components/brand/graphite-logo";
import { useLogo } from "@/hooks/use-logo";
import { GraphiteLogo } from "@/components/brand/graphite-logo";
import { PremiumCard } from "@/components/ui/premium-card";

const options: { type: LogoType; label: string }[] = [
  { type: "hex-solid", label: "Hex B/W" },
  { type: "g", label: "Monogram «g»" },
  { type: "hex-faceted", label: "Hex Faceted" },
  { type: "compass", label: "Compass" },
  { type: "progress-arrow", label: "Progress Arrow" },
];

export function LogoPickerPanel() {
  const [active, setLogo] = useLogo();

  return (
    <PremiumCard>
      <h3 className="font-semibold text-[var(--gp-text)]">Logo Variant</h3>
      <p className="mt-1 text-sm text-[var(--gp-text-muted)]">
        Pick which logo appears in the sidebar and tab favicon.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {options.map(({ type, label }) => {
          const selected = active === type;
          return (
            <button
              key={type}
              onClick={() => setLogo(type)}
              className={`
                flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all
                ${
                  selected
                    ? "border-violet-500 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                    : "border-[var(--gp-border)] hover:border-[var(--gp-text-faint)] hover:bg-[var(--gp-surface-raised)]"
                }
              `}
            >
              <GraphiteLogo size={32} type={type} />
              <span
                className={`text-xs font-medium ${
                  selected ? "text-violet-500" : "text-[var(--gp-text-muted)]"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </PremiumCard>
  );
}
