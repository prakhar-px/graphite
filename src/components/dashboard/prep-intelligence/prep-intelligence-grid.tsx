"use client";

import { useMemo } from "react";
import { useUserSnapshot } from "@/store/app-store";
import {
  getWeakRecallTopics,
  getTopicFreshness,
  getPreparationBalance,
} from "@/engines/telemetry/selectors";
import { getRevisionSummary, buildProblemRevisionIndex } from "@/engines/revision/selectors";
import type { ProblemRevisionState } from "@/engines/revision/selectors";
import { MemoryStrengthWidget } from "@/components/dashboard/prep-intelligence/memory-strength-widget";
import { WeakRecallWidget } from "@/components/dashboard/prep-intelligence/weak-recall-widget";
import { PreparationBalanceWidget } from "@/components/dashboard/prep-intelligence/preparation-balance-widget";
import { MemoryDecayWidget } from "@/components/dashboard/prep-intelligence/memory-decay-widget";

export function PrepIntelligenceGrid({ horizontal }: { horizontal?: boolean }) {
  const snapshot = useUserSnapshot();

  const revisionSummary = useMemo(() => getRevisionSummary(snapshot), [snapshot]);
  const weakTopics = useMemo(() => getWeakRecallTopics(snapshot), [snapshot]);
  const freshness = useMemo(() => getTopicFreshness(snapshot), [snapshot]);
  const balance = useMemo(() => getPreparationBalance(snapshot), [snapshot]);
  const problems = useMemo(() => buildProblemRevisionIndex(snapshot.solvedProblems), [snapshot]);

  return (
    <div className={horizontal ? "grid grid-cols-2 gap-6 lg:grid-cols-4" : "grid grid-cols-1 gap-6 sm:grid-cols-2"}>
      <MemoryStrengthWidget
        avgRecallStrength={revisionSummary.avgRecallStrength}
        strongRecall={revisionSummary.strongRecall}
        weakRecall={revisionSummary.weakRecall}
        totalProblems={revisionSummary.uniqueProblems}
        problems={problems}
      />
      <WeakRecallWidget topics={weakTopics} allProblems={problems} />
      <PreparationBalanceWidget items={balance} allProblems={problems} />
      <MemoryDecayWidget topics={freshness} allProblems={problems} />
    </div>
  );
}
