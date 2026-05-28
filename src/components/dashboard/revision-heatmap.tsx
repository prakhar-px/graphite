"use client";

import { getConfidenceHeatmap } from "@/engines/confidence/selectors";
import { getTrackedTopicNames } from "@/engines/topics/helpers";
import { useUserSnapshot } from "@/store/app-store";
import { PremiumCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";

export function RevisionHeatmap() {
  const snapshot = useUserSnapshot();
  const topicNames = getTrackedTopicNames(snapshot.solvedProblems);
  const cells = getConfidenceHeatmap(snapshot.solvedProblems, topicNames);

  return (
    <PremiumCard>
      <h3 className="mb-1 text-lg font-semibold text-[var(--gp-text)]">
        Confidence Heatmap
      </h3>
      <p className="mb-4 text-sm text-[var(--gp-text-muted)]">
        Topic mastery from logged problems
      </p>
      {cells.length === 0 ? (
        <p
          className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-[var(--gp-text-muted)]"
          style={{ borderColor: "var(--gp-border)" }}
        >
          Log problems with confidence to populate this heatmap.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {cells.map((cell) => (
            <div
              key={cell.topic}
              className={cn(
                "rounded-xl border px-3 py-2 text-center transition-transform hover:scale-[1.02]",
                cell.confidence >= 70
                  ? "bg-green-500/15 border-green-500/20"
                  : cell.confidence >= 50
                    ? "bg-amber-500/10 border-amber-500/15"
                    : cell.confidence > 0
                      ? "bg-red-500/10 border-red-500/15"
                      : "border-[var(--gp-border)]"
              )}
              style={
                cell.confidence === 0
                  ? { backgroundColor: "var(--gp-surface)" }
                  : undefined
              }
            >
              <p className="truncate text-xs text-[var(--gp-text-muted)]">{cell.topic}</p>
              <p className="font-mono text-lg font-bold text-[var(--gp-text)]">
                {cell.confidence > 0 ? `${cell.confidence}%` : "—"}
              </p>
              <p className="text-[10px] text-[var(--gp-text-faint)]">{cell.exposure} solved</p>
            </div>
          ))}
        </div>
      )}
    </PremiumCard>
  );
}
