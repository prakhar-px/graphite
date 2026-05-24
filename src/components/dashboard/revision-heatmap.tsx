"use client";

import { revisionTopics } from "@/lib/data";
import { PremiumCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";

export function RevisionHeatmap() {
  return (
    <PremiumCard>
      <h3 className="mb-1 text-lg font-semibold text-zinc-100">
        Confidence Heatmap
      </h3>
      <p className="mb-4 text-sm text-zinc-500">Topic mastery intensity</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {revisionTopics.map((t) => (
          <div
            key={t.topic}
            className={cn(
              "rounded-xl border border-zinc-800/80 px-3 py-2 text-center transition-transform hover:scale-[1.02]",
              t.confidence >= 70
                ? "bg-green-500/15"
                : t.confidence >= 50
                  ? "bg-amber-500/10"
                  : "bg-red-500/10"
            )}
          >
            <p className="truncate text-xs text-zinc-400">{t.topic}</p>
            <p className="font-mono text-lg font-bold text-zinc-100">
              {t.confidence}%
            </p>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
}
