"use client";

import { Sparkles } from "lucide-react";
import { getWeeklyProgress } from "@/lib/data";
import { useUserSnapshot } from "@/store/app-store";
import { PremiumCard } from "@/components/ui/premium-card";

export function MotivationCard() {
  const snapshot = useUserSnapshot();
  const weeks = getWeeklyProgress(snapshot);
  const weeklySolved = weeks[weeks.length - 1]?.solved ?? weeks[0]?.solved ?? 0;

  return (
    <PremiumCard className="bg-gradient-to-br from-violet-950/40 to-zinc-900/60">
      <div className="flex gap-3">
        <Sparkles className="h-5 w-5 shrink-0 text-violet-400" />
        <div>
          <p className="text-sm font-medium text-zinc-200">Elite Insight</p>
          <p className="mt-1 text-sm text-zinc-400">
            You solved {weeklySolved} problems in your latest plan week. Graph
            mastery is improving — stay consistent through Phase 2.
          </p>
        </div>
      </div>
    </PremiumCard>
  );
}
