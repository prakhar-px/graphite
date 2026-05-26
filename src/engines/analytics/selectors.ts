import { getDashboardStats } from "@/engines/dashboard/selectors";
import {
  getPlannerCompletionRate,
  computeStreak,
  getCompletedMissionCount,
} from "@/engines/planner/selectors";
import {
  getAverageProblemConfidence,
  getDifficultyDistribution,
  getNamedProblemsSolvedCount,
  getRevisionLoad,
  getRoadmapAverageConfidence,
  getRoadmapProblemLogs,
  getTelemetrySolvedTotal,
  getUniqueTrackedProblemCount,
} from "@/engines/problems/selectors";
import { buildTopicProgress } from "@/engines/topics/selectors";
import { getRevisionSummary } from "@/engines/revision/selectors";
import {
  getWeeklySolvedTrend,
  getPlanWeekMetrics,
  getPlanOverallMetrics,
} from "@/engines/telemetry/selectors";
import type { UserSnapshot } from "@/engines/core/types";
import type { ProblemLog } from "@/engines/problems/types";
import type { TaskStatus } from "@/types";

export function getPlannerAnalytics(dayStatuses: Record<number, TaskStatus>) {
  return {
    completion: getPlannerCompletionRate(dayStatuses),
    streak: computeStreak(dayStatuses),
    missionsCompleted: getCompletedMissionCount(dayStatuses),
  };
}

export function getTelemetryAnalytics(problemLog: ProblemLog[]) {
  const roadmapLogs = getRoadmapProblemLogs(problemLog);
  return {
    solved: getTelemetrySolvedTotal(problemLog),
    namedProblemsSolved: getNamedProblemsSolvedCount(problemLog),
    uniqueTracked: getUniqueTrackedProblemCount(problemLog),
    roadmapProblemsLogged: roadmapLogs.length,
    confidence: getAverageProblemConfidence(problemLog),
    roadmapConfidence: getRoadmapAverageConfidence(problemLog),
    revisionLoad: getRevisionLoad(problemLog),
    difficultyDistribution: getDifficultyDistribution(problemLog),
  };
}

export function getFullAnalyticsSnapshot(snapshot: UserSnapshot) {
  return {
    planner: getPlannerAnalytics(snapshot.dayStatuses),
    telemetry: getTelemetryAnalytics(snapshot.solvedProblems),
    dashboard: getDashboardStats(snapshot),
    topics: buildTopicProgress(snapshot),
    weeklyTrend: getWeeklySolvedTrend(snapshot),
    revision: getRevisionSummary(snapshot),
    planMetrics: getPlanOverallMetrics(),
    planWeekMetrics: getPlanWeekMetrics(),
  };
}
