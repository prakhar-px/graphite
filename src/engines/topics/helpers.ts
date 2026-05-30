import { dailyPlan } from "@/lib/data";
import {
  getProblemPlannerDay,
  getProblemTopics,
} from "@/engines/problems/helpers";
import type { ProblemLog } from "@/engines/problems/types";

export function plannerTopicKey(name: string): string {
  return name.split("+")[0]?.trim().toLowerCase() ?? name.toLowerCase();
}

export function problemMatchesPlannerTopic(
  problem: ProblemLog,
  plannerTopic: string
): boolean {
  const name = plannerTopic.toLowerCase();
  const key = plannerTopicKey(plannerTopic);
  const tags = getProblemTopics(problem);

  if (tags.length === 0) {
    const day = getProblemPlannerDay(problem);
    if (!day) return false;
    const planDay = dailyPlan.find((d) => d.day === day);
    return planDay?.topic === plannerTopic;
  }

  return tags.some((tag) => {
    const normalized = tag.toLowerCase();
    return (
      name.includes(normalized) ||
      normalized.includes(key) ||
      key.includes(normalized)
    );
  });
}

export function getLogsForTopic(
  problemLog: ProblemLog[],
  topicName: string
): ProblemLog[] {
  const isPlannerTopic = dailyPlan.some((d) => d.topic === topicName);

  if (isPlannerTopic) {
    return problemLog.filter((problem) =>
      problemMatchesPlannerTopic(problem, topicName)
    );
  }

  const key = topicName.toLowerCase();
  return problemLog.filter((problem) =>
    getProblemTopics(problem).some((tag) => tag.toLowerCase() === key)
  );
}

export function getTrackedTopicNames(problemLog: ProblemLog[]): string[] {
  const fromPlan = [...new Set(dailyPlan.map((d) => d.topic))];
  const extras = new Set<string>();

  for (const problem of problemLog) {
    const tags = getProblemTopics(problem);
    if (tags.length > 0) {
      for (const tag of tags) {
        const normalized = tag.toLowerCase();
        const alreadyCovered = fromPlan.some((name) => {
          const key = plannerTopicKey(name);
          const topicName = name.toLowerCase();
          return (
            topicName.includes(normalized) ||
            normalized.includes(key) ||
            key.includes(normalized)
          );
        });
        if (!alreadyCovered) extras.add(tag);
      }
      continue;
    }

    const day = getProblemPlannerDay(problem);
    const planDay = dailyPlan.find((d) => d.day === day);
    if (planDay && !fromPlan.includes(planDay.topic)) {
      extras.add(planDay.topic);
    }
  }

  return [...fromPlan, ...extras];
}
