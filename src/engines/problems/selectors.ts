import {
  getProblemIdentityKey,
  getProblemPlannerDay,
  getProblemSolvedCount,
  getProblemSourceType,
  getProblemTopics,
  isBulkQuickLog,
  normalizeDifficulty,
} from "@/engines/problems/helpers";
import type { ProblemDifficulty, ProblemLog } from "@/engines/problems/types";

export function getNamedProblemLogs(problemLog: ProblemLog[]): ProblemLog[] {
  return problemLog.filter((p) => !isBulkQuickLog(p) && Boolean(p.title?.trim()));
}

export function getRoadmapProblemLogs(problemLog: ProblemLog[]): ProblemLog[] {
  return getNamedProblemLogs(problemLog).filter(
    (p) => getProblemSourceType(p) === "roadmap"
  );
}

export function getTelemetrySolvedTotal(problemLog: ProblemLog[]): number {
  return problemLog.reduce((sum, problem) => sum + getProblemSolvedCount(problem), 0);
}

/** Count of individually tracked problems (excludes bulk quick captures). */
export function getNamedProblemsSolvedCount(problemLog: ProblemLog[]): number {
  return getNamedProblemLogs(problemLog).reduce(
    (sum, problem) => sum + getProblemSolvedCount(problem),
    0
  );
}

export function getDetailedProblemTotal(problemLog: ProblemLog[]): number {
  return getNamedProblemLogs(problemLog).filter(
    (problem) => problem.loggingMode === "detailed"
  ).length;
}

export function getQuickSolvedTotal(problemLog: ProblemLog[]): number {
  return problemLog
    .filter((problem) => problem.loggingMode === "quick")
    .reduce((sum, problem) => sum + getProblemSolvedCount(problem), 0);
}

export function getProblemLogsForPlannerDay(
  problemLog: ProblemLog[],
  plannerDay?: number
): ProblemLog[] {
  if (!plannerDay) return problemLog;
  return problemLog.filter((problem) => getProblemPlannerDay(problem) === plannerDay);
}

export function getDifficultyDistribution(problemLog: ProblemLog[]) {
  const distribution: Record<ProblemDifficulty, number> = {
    easy: 0,
    medium: 0,
    hard: 0,
  };

  for (const problem of getNamedProblemLogs(problemLog)) {
    const difficulty = normalizeDifficulty(problem.difficulty);
    if (!difficulty) continue;
    distribution[difficulty] += getProblemSolvedCount(problem);
  }

  return distribution;
}

export function getRevisionLoad(problemLog: ProblemLog[]): number {
  return getNamedProblemLogs(problemLog).filter((problem) => problem.revisionNeeded)
    .length;
}

export function getAverageProblemConfidence(problemLog: ProblemLog[]): number {
  const confidenceValues = getNamedProblemLogs(problemLog)
    .map((problem) => problem.confidence)
    .filter((value): value is number => typeof value === "number" && value > 0);

  if (confidenceValues.length === 0) return 0;
  return Math.round(
    (confidenceValues.reduce((sum, value) => sum + value, 0) /
      confidenceValues.length) *
      10
  );
}

export function getRoadmapAverageConfidence(problemLog: ProblemLog[]): number {
  const values = getRoadmapProblemLogs(problemLog)
    .map((p) => p.confidence)
    .filter((v): v is number => typeof v === "number" && v > 0);
  if (values.length === 0) return 0;
  return Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10);
}

export function getRecentTopicExposure(problemLog: ProblemLog[], limit = 5): string[] {
  const topics = new Set<string>();
  for (const problem of getNamedProblemLogs(problemLog).slice(0, limit)) {
    for (const topic of getProblemTopics(problem)) topics.add(topic);
  }
  return [...topics];
}

export function getUniqueTrackedProblemCount(problemLog: ProblemLog[]): number {
  const keys = new Set<string>();
  for (const problem of getNamedProblemLogs(problemLog)) {
    const key = getProblemIdentityKey(problem);
    if (key) keys.add(key);
  }
  return keys.size;
}
