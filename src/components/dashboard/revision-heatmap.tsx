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
      <h3 className="mb-1 text-lg font-semibold text-zinc-100">
        Confidence Heatmap
      </h3>
      <p className="mb-4 text-sm text-zinc-500">
        Topic mastery from logged problems
      </p>
      {cells.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
          Log problems with confidence to populate this heatmap.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {cells.map((cell) => (
            <div
              key={cell.topic}
              className={cn(
                "rounded-xl border border-zinc-800/80 px-3 py-2 text-center transition-transform hover:scale-[1.02]",
                cell.confidence >= 70
                  ? "bg-green-500/15"
                  : cell.confidence >= 50
                    ? "bg-amber-500/10"
                    : cell.confidence > 0
                      ? "bg-red-500/10"
                      : "bg-zinc-900/60"
              )}
            >
              <p className="truncate text-xs text-zinc-400">{cell.topic}</p>
              <p className="font-mono text-lg font-bold text-zinc-100">
                {cell.confidence > 0 ? `${cell.confidence}%` : "—"}
              </p>
              <p className="text-[10px] text-zinc-600">{cell.exposure} solved</p>
            </div>
          ))}
        </div>
      )}
    </PremiumCard>
  );
}
