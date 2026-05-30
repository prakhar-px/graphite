import { getLogsForTopic } from "@/engines/topics/helpers";
import { isBulkQuickLog } from "@/engines/problems/helpers";
import type { ProblemLog } from "@/engines/problems/types";

function confidenceValuesFromLog(problemLog: ProblemLog[]): number[] {
  return problemLog
    .filter((problem) => !isBulkQuickLog(problem))
    .map((problem) => problem.confidence)
    .filter((value): value is number => typeof value === "number" && value > 0);
}

/** Average confidence for a topic from telemetry (1–10 → 0–100%). Returns 0 if no data. */
export function getTopicConfidencePercent(
  problemLog: ProblemLog[],
  topicName: string
): number {
  const values = confidenceValuesFromLog(getLogsForTopic(problemLog, topicName));

  if (values.length === 0) return 0;

  return Math.round(
    (values.reduce((sum, value) => sum + value, 0) / values.length) * 10
  );
}

export function getGlobalConfidencePercent(problemLog: ProblemLog[]): number {
  const values = confidenceValuesFromLog(problemLog);

  if (values.length === 0) return 0;

  return Math.round(
    (values.reduce((sum, value) => sum + value, 0) / values.length) * 10
  );
}

export interface ConfidenceHeatmapCell {
  topic: string;
  confidence: number;
  exposure: number;
}

export function getConfidenceHeatmap(
  problemLog: ProblemLog[],
  topicNames: string[]
): ConfidenceHeatmapCell[] {
  return topicNames
    .map((topic) => {
      const logs = getLogsForTopic(problemLog, topic).filter(
        (p) => !isBulkQuickLog(p)
      );
      const exposure = logs.length;
      return {
        topic,
        confidence: getTopicConfidencePercent(problemLog, topic),
        exposure,
      };
    })
    .filter((cell) => cell.exposure > 0 || cell.confidence > 0)
    .sort((a, b) => b.exposure - a.exposure);
}
