import type { DailyPlanDay } from "@/types";
import type { MissionQuestionEntry } from "@/types/mission-completion";
import type { ProblemLog } from "@/types/problem-log";
import { buildDetailedProblemLog } from "@/engines/problems/helpers";
import type { ProblemDifficulty } from "@/engines/problems/types";

export function getMissionTitle(day: DailyPlanDay): string {
  return day.subtopic || day.topic;
}

export function getMissionWorkloadLabel(day: DailyPlanDay): string {
  if (day.dayType === "weekend") {
    return `${day.recommendedSolveCount} suggested · deeper`;
  }
  return `${day.recommendedSolveCount} core · ~${day.estimatedHours}`;
}

export function getAllSuggestedTitles(day: DailyPlanDay): string[] {
  return [...day.suggestedQuestions, ...day.optionalQuestions].filter(Boolean);
}

export function buildRoadmapQuestionLogs(
  day: DailyPlanDay,
  entries: MissionQuestionEntry[]
): ProblemLog[] {
  const topics = [day.topic, day.subtopic].filter(Boolean);

  return entries.map((entry, index) =>
    buildDetailedProblemLog({
      title: entry.title,
      topics,
      topic: day.topic,
      difficulty: day.difficulty as ProblemDifficulty,
      confidence: entry.confidence,
      linkedPlannerDay: day.sequence,
      sourceType: "roadmap",
      solvedAt: new Date(Date.now() + index).toISOString(),
    })
  );
}

export function buildMissionCompletionLogs(
  day: DailyPlanDay,
  entries: MissionQuestionEntry[]
): ProblemLog[] {
  if (entries.length === 0) return [];
  return buildRoadmapQuestionLogs(day, entries);
}

export function mergeMissionLogs(
  existing: ProblemLog[],
  day: number,
  incoming: ProblemLog[]
): ProblemLog[] {
  const withoutDay = existing.filter(
    (p) => (p.linkedPlannerDay ?? p.plannerDay ?? p.roadmapDay) !== day
  );
  return [...incoming, ...withoutDay];
}
