import { dailyPlan } from "@/lib/data";
import { getTopicConfidencePercent } from "@/engines/confidence/selectors";
import type { UserSnapshot } from "@/engines/core/types";
import type { ProblemLog } from "@/engines/problems/types";
import {
  getPlanWithStatuses,
  isDoneStatus,
} from "@/engines/planner/selectors";
import {
  getProblemSolvedCount,
  isBulkQuickLog,
} from "@/engines/problems/helpers";
import {
  getLogsForTopic,
  getTrackedTopicNames,
} from "@/engines/topics/helpers";
import type { TopicProgress } from "@/types";

/** Most recent named problem log for this topic, from actual telemetry */
export function getTopicRecentActivity(
  problemLog: ProblemLog[],
  topicName: string
): string | null {
  const logs = getLogsForTopic(problemLog, topicName)
    .filter((problem) => problem.title?.trim() && !isBulkQuickLog(problem))
    .sort(
      (a, b) =>
        new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime()
    );

  const latest = logs[0];
  if (!latest?.title) return null;

  const dateLabel = new Date(latest.solvedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `${latest.title} · ${dateLabel}`;
}

export function buildTopicProgress(snapshot: UserSnapshot): TopicProgress[] {
  const plan = getPlanWithStatuses(snapshot.dayStatuses);
  const topicNames = getTrackedTopicNames(snapshot.solvedProblems);

  return topicNames.map((name) => {
    const days = plan.filter((d) => d.topic === name);
    const completed = days.filter((d) => isDoneStatus(d.status)).length;
    const total = days.length || 1;
    const topicLogs = getLogsForTopic(snapshot.solvedProblems, name);
    const logSolved = topicLogs.reduce(
      (sum, problem) => sum + getProblemSolvedCount(problem),
      0
    );
    const confidence = getTopicConfidencePercent(snapshot.solvedProblems, name);
    const revisionCount = topicLogs.filter(
      (problem) => problem.revisionNeeded
    ).length;
    const targetTotal =
      days.reduce((sum, d) => sum + d.recommendedSolveCount, 0) ||
      completed + (total - completed);

    const status: TopicProgress["status"] =
      logSolved > 0 && confidence > 0 && confidence < 50
        ? "weak"
        : topicLogs.some((problem) => problem.revisionNeeded)
          ? "revision-pending"
          : logSolved >= targetTotal && logSolved > 0
            ? "completed"
            : logSolved > 0 || completed > 0
              ? "in-progress"
              : days.length > 0
                ? "revision-pending"
                : "in-progress";

    return {
      name,
      solved: logSolved,
      total: targetTotal,
      missionsCompleted: completed,
      revisionCount,
      confidence,
      status,
      recentActivity: getTopicRecentActivity(snapshot.solvedProblems, name),
    };
  });
}

export function getTopicDistributionForChart(snapshot: UserSnapshot) {
  const byTag = new Map<string, number>();

  for (const problem of snapshot.solvedProblems) {
    const tags =
      problem.topics?.length || problem.topicTags?.length
        ? [...(problem.topics ?? problem.topicTags ?? [])]
        : (() => {
            const day = problem.linkedPlannerDay ?? problem.plannerDay;
            const planDay = dailyPlan.find((d) => d.day === day);
            return planDay ? [planDay.topic.split("+")[0]?.trim() ?? planDay.topic] : ["General"];
          })();

    const count = getProblemSolvedCount(problem);
    for (const tag of tags) {
      const key = tag.trim() || "General";
      byTag.set(key, (byTag.get(key) ?? 0) + count);
    }
  }

  return [...byTag.entries()]
    .map(([topic, target]) => ({
      topic: topic.replace(" + ", " / "),
      target,
    }))
    .sort((a, b) => b.target - a.target)
    .slice(0, 12);
}
