"use client";

import { Shell } from "@/components/layout/shell";
import { RevisionIntelligenceSummary } from "@/components/revision/revision-intelligence-summary";
import { RevisionReinforcementQueue } from "@/components/revision/revision-reinforcement-queue";
import { ProblemMemoryTimeline } from "@/components/revision/problem-memory-timeline";
import { TopicRetentionAnalytics } from "@/components/revision/topic-retention-analytics";
import {
  buildProblemRevisionIndex,
  buildRevisionTopicGroups,
  getNeedsReinforcementQueue,
  getRevisionSummary,
} from "@/engines/revision/selectors";
import { useUserSnapshot } from "@/store/app-store";
import { PremiumCard } from "@/components/ui/premium-card";

export default function RevisionPage() {
  const snapshot = useUserSnapshot();
  const problems = buildProblemRevisionIndex(snapshot.solvedProblems);
  const groups = buildRevisionTopicGroups(snapshot);
  const summary = getRevisionSummary(snapshot);
  const reinforcementQueue = getNeedsReinforcementQueue(
    snapshot.solvedProblems,
    12
  );

  return (
    <Shell
      title="Memory & Retention"
      subtitle="Problem-centric revision telemetry — topics are aggregation only"
    >
      <div className="space-y-8 p-4 lg:p-8">
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--gp-text-faint)]">
            Intelligence summary
          </h2>
          <RevisionIntelligenceSummary summary={summary} problems={problems} />
        </section>

        <section>
          <TopicRetentionAnalytics groups={groups} />
        </section>

        <section>
          <RevisionReinforcementQueue queue={reinforcementQueue} />
        </section>

        <section>
          {problems.length === 0 ? (
            <PremiumCard>
              <p className="text-sm text-[var(--gp-text-muted)]">
                Log named problems (detailed or LeetCode) to build memory
                telemetry. Re-solving the same problem on any later day increases
                its derived revision count — duplicates are expected and useful.
              </p>
            </PremiumCard>
          ) : (
            <ProblemMemoryTimeline problems={problems} />
          )}
        </section>

        {summary.bulkQuickCaptures > 0 ? (
          <p className="text-xs text-[var(--gp-text-faint)]">
            {summary.bulkQuickCaptures} bulk day captures in log (not shown —
            no problem identity).
          </p>
        ) : null}
      </div>
    </Shell>
  );
}
