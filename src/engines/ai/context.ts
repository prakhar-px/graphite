import { getFullAnalyticsSnapshot } from "@/engines/analytics/selectors";
import type { UserSnapshot } from "@/engines/core/types";
import type { ProblemLog } from "@/engines/problems/types";

export function buildPreparationIntelligenceContext(
  snapshot: UserSnapshot
) {
  return getFullAnalyticsSnapshot(snapshot);
}

export function buildPreparationIntelligenceFromLog(problemLog: ProblemLog[]) {
  return buildPreparationIntelligenceContext({
    dayStatuses: {},
    completedTasks: [],
    solvedProblems: problemLog,
  });
}
