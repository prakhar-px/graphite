import { dailyPlan } from "@/lib/data";
import { parseMissionDate } from "@/lib/roadmap-calendar";
import type { UserSnapshot } from "@/engines/core/types";
import {
  getPlanWithStatuses,
  isDoneStatus,
} from "@/engines/planner/selectors";
import {
  getProblemPlannerDay,
  getProblemSolvedCount,
} from "@/engines/problems/helpers";
import type { ProblemLog } from "@/engines/problems/types";
import type { WeeklyProgressPoint } from "@/types";
import {
  buildRevisionTopicGroups,
} from "@/engines/revision/selectors";

export {
  getAverageProblemConfidence,
  getDetailedProblemTotal,
  getDifficultyDistribution,
  getQuickSolvedTotal,
  getRecentTopicExposure,
  getRevisionLoad,
  getTelemetrySolvedTotal,
} from "@/engines/problems/selectors";

function weekIndexForDate(date: Date): number {
  const start = parseMissionDate(dailyPlan[0]?.actualDate ?? dailyPlan[0]?.date ?? "");
  if (!start) return 0;
  const diffMs = date.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.min(9, Math.floor(diffDays / 7)));
}

function weekIndexForProblem(problem: ProblemLog): number {
  const plannerDay = getProblemPlannerDay(problem);
  if (plannerDay) {
    return Math.max(0, Math.min(9, Math.floor((plannerDay - 1) / 7)));
  }
  return weekIndexForDate(new Date(problem.solvedAt));
}

function weeklyTargetFromPlan(
  plan: ReturnType<typeof getPlanWithStatuses>,
  weekIndex: number
): number {
  const slice = plan.slice(weekIndex * 7, (weekIndex + 1) * 7);
  const recommendedSolves = slice.reduce((sum, d) => sum + d.recommendedSolveCount, 0);
  const weekdayMissions = slice.filter((d) => d.dayType === "weekday").length;
  const weekendMissions = slice.filter((d) => d.dayType === "weekend").length;
  return Math.max(recommendedSolves, weekdayMissions + weekendMissions * 3, 7);
}

function progressiveWeeklyTarget(weekIndex: number): number {
  return 24 + weekIndex * 4;
}

function resolveWeeklyTargets(
  plan: ReturnType<typeof getPlanWithStatuses>,
  weekCount: number
): number[] {
  const fromPlan = Array.from({ length: weekCount }, (_, w) =>
    weeklyTargetFromPlan(plan, w)
  );
  const unique = new Set(fromPlan);
  if (unique.size > 1) return fromPlan;
  return Array.from({ length: weekCount }, (_, i) => progressiveWeeklyTarget(i));
}

function weeklySolvedFromLog(snapshot: UserSnapshot, weekCount: number) {
  const plan = getPlanWithStatuses(snapshot.dayStatuses);
  const targets = resolveWeeklyTargets(plan, weekCount);
  const counts = Array.from({ length: weekCount }, () => 0);

  for (const problem of snapshot.solvedProblems) {
    const index = weekIndexForProblem(problem);
    if (index < counts.length) counts[index] += getProblemSolvedCount(problem);
  }

  return counts.map((solved, index) => ({
    week: `W${index + 1}`,
    solved,
    target: targets[index] ?? progressiveWeeklyTarget(index),
  }));
}

/** Planner completion bars (roadmap adherence, not telemetry). */
export function getWeeklyPlannerProgress(
  snapshot: UserSnapshot
): WeeklyProgressPoint[] {
  const plan = getPlanWithStatuses(snapshot.dayStatuses);
  const weekCount = Math.ceil(plan.length / 7);
  const targets = resolveWeeklyTargets(plan, weekCount);
  const weeks: WeeklyProgressPoint[] = [];

  for (let w = 0; w < weekCount; w++) {
    const slice = plan.slice(w * 7, (w + 1) * 7);
    const completedMissions = slice.filter((d) => isDoneStatus(d.status)).length;
    const solved = slice
      .filter((d) => isDoneStatus(d.status))
      .reduce((sum, d) => sum + d.recommendedSolveCount, 0);
    weeks.push({
      week: `W${w + 1}`,
      solved: Math.max(completedMissions, solved),
      target: targets[w] ?? 7,
      missionsCompleted: completedMissions,
    });
  }

  return weeks.slice(0, 10);
}

export function getWeeklySolvedTrend(snapshot: UserSnapshot) {
  const labels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
  return weeklySolvedFromLog(snapshot, labels.length);
}

export function getWeeklySolvedTotal(snapshot: UserSnapshot, weeks = 1): number {
  return getWeeklySolvedTrend(snapshot)
    .slice(-weeks)
    .reduce((sum, week) => sum + week.solved, 0);
}

// ── Plan-sourced metrics (derived from daily plan data, not user telemetry) ──

export interface PlanWeekMetrics {
  weekIndex: number;
  weekdayMissions: number;
  weekendMissions: number;
  totalMissions: number;
  recommendedSolves: number;
  estimatedHours: string;
  sessionTypes: Record<string, number>;
  topics: string[];
}

export function getPlanWeekMetrics(): PlanWeekMetrics[] {
  const weekCount = Math.ceil(dailyPlan.length / 7);
  const weeks: PlanWeekMetrics[] = [];

  for (let w = 0; w < weekCount; w++) {
    const slice = dailyPlan.slice(w * 7, (w + 1) * 7);
    const weekdayMissions = slice.filter((d) => d.dayType === "weekday").length;
    const weekendMissions = slice.filter((d) => d.dayType === "weekend").length;
    const sessionTypes: Record<string, number> = {};
    const topics = new Set<string>();
    let totalHoursMin = 0;
    let totalHoursMax = 0;

    for (const d of slice) {
      topics.add(d.topic);
      sessionTypes[d.sessionType] = (sessionTypes[d.sessionType] ?? 0) + 1;
      const hrMatch = d.estimatedHours.match(/(\d+)(?:\s*-\s*(\d+))?\s*Hour/i);
      if (hrMatch) {
        totalHoursMin += Number(hrMatch[1]);
        totalHoursMax += Number(hrMatch[2] ?? hrMatch[1]);
      }
    }

    weeks.push({
      weekIndex: w + 1,
      weekdayMissions,
      weekendMissions,
      totalMissions: slice.length,
      recommendedSolves: slice.reduce((s, d) => s + d.recommendedSolveCount, 0),
      estimatedHours:
        totalHoursMin === totalHoursMax
          ? `${totalHoursMin}h`
          : `${totalHoursMin}-${totalHoursMax}h`,
      sessionTypes,
      topics: [...topics],
    });
  }

  return weeks;
}

export interface PlanOverallMetrics {
  totalDays: number;
  weekdayCount: number;
  weekendCount: number;
  totalRecommendedSolves: number;
  totalEstimatedHoursMin: number;
  totalEstimatedHoursMax: number;
  sessionTypeDistribution: Record<string, number>;
  topicDayCount: Record<string, number>;
}

export function getPlanOverallMetrics(): PlanOverallMetrics {
  const sessionTypeDistribution: Record<string, number> = {};
  const topicDayCount: Record<string, number> = {};
  let weekdayCount = 0;
  let weekendCount = 0;
  let totalHoursMin = 0;
  let totalHoursMax = 0;

  for (const d of dailyPlan) {
    if (d.dayType === "weekend") weekendCount++;
    else weekdayCount++;

    topicDayCount[d.topic] = (topicDayCount[d.topic] ?? 0) + 1;
    sessionTypeDistribution[d.sessionType] =
      (sessionTypeDistribution[d.sessionType] ?? 0) + 1;

    const hrMatch = d.estimatedHours.match(/(\d+)(?:\s*-\s*(\d+))?\s*Hour/i);
    if (hrMatch) {
      totalHoursMin += Number(hrMatch[1]);
      totalHoursMax += Number(hrMatch[2] ?? hrMatch[1]);
    }
  }

  return {
    totalDays: dailyPlan.length,
    weekdayCount,
    weekendCount,
    totalRecommendedSolves: dailyPlan.reduce((s, d) => s + d.recommendedSolveCount, 0),
    totalEstimatedHoursMin: totalHoursMin,
    totalEstimatedHoursMax: totalHoursMax,
    sessionTypeDistribution,
    topicDayCount,
  };
}

export function getPlanWeekendMissions(): number {
  return dailyPlan.filter((d) => d.dayType === "weekend").length;
}

export function getPlanWeekdayMissions(): number {
  return dailyPlan.filter((d) => d.dayType === "weekday").length;
}

export interface PlanTopicMetrics {
  topic: string;
  totalDays: number;
  weekdayDays: number;
  weekendDays: number;
  recommendedSolves: number;
  sessionTypes: Record<string, number>;
  difficulties: Record<string, number>;
}

export function getPlanTopicMetrics(): PlanTopicMetrics[] {
  const map = new Map<string, PlanTopicMetrics>();

  for (const d of dailyPlan) {
    if (!map.has(d.topic)) {
      map.set(d.topic, {
        topic: d.topic,
        totalDays: 0,
        weekdayDays: 0,
        weekendDays: 0,
        recommendedSolves: 0,
        sessionTypes: {},
        difficulties: {},
      });
    }
    const m = map.get(d.topic)!;
    m.totalDays++;
    if (d.dayType === "weekend") m.weekendDays++;
    else m.weekdayDays++;
    m.recommendedSolves += d.recommendedSolveCount;
    m.sessionTypes[d.sessionType] = (m.sessionTypes[d.sessionType] ?? 0) + 1;
    m.difficulties[d.difficulty] = (m.difficulties[d.difficulty] ?? 0) + 1;
  }

  return [...map.values()].sort((a, b) => b.totalDays - a.totalDays);
}

// ── Intelligence widgets (preparation intelligence, not raw telemetry) ──

export interface WeakRecallTopic {
  topic: string;
  recallPercent: number;
  problemCount: number;
  overdueCount: number;
}

export function getWeakRecallTopics(snapshot: UserSnapshot): WeakRecallTopic[] {
  const groups = buildRevisionTopicGroups(snapshot);
  return groups
    .filter((g) => g.confidence > 0 && g.confidence < 60)
    .map((g) => ({
      topic: g.topic,
      recallPercent: g.confidence,
      problemCount: g.uniqueProblems,
      overdueCount: g.overdueRevisions,
    }))
    .sort((a, b) => a.recallPercent - b.recallPercent)
    .slice(0, 5);
}

export interface TopicFreshness {
  topic: string;
  daysSinceLastSolve: number;
  problemCount: number;
  freshness: "fresh" | "fading" | "stale";
}

export function getTopicFreshness(snapshot: UserSnapshot): TopicFreshness[] {
  const groups = buildRevisionTopicGroups(snapshot);
  return groups
    .filter((g) => g.uniqueProblems > 0)
    .map((g) => ({
      topic: g.topic,
      daysSinceLastSolve: g.lastActivityDays,
      problemCount: g.uniqueProblems,
      freshness: g.lastActivityDays <= 7 ? "fresh" as const
        : g.lastActivityDays <= 21 ? "fading" as const
        : "stale" as const,
    }))
    .sort((a, b) => b.daysSinceLastSolve - a.daysSinceLastSolve);
}

export interface PreparationBalance {
  topic: string;
  planDays: number;
  solvedCount: number;
  ratio: number;
  imbalance: "overfocused" | "underprepared" | "on-track";
}

export function getPreparationBalance(snapshot: UserSnapshot): PreparationBalance[] {
  const planTopics = getPlanTopicMetrics();
  const topicCounts = new Map<string, number>();
  for (const p of snapshot.solvedProblems) {
    const tags = p.topics ?? p.topicTags ?? [];
    const count = typeof p.solvedCount === "number" ? p.solvedCount : 1;
    for (const t of tags) {
      const key = t.trim();
      if (key) topicCounts.set(key, (topicCounts.get(key) ?? 0) + count);
    }
  }

  return planTopics
    .map((pt) => {
      const solved = topicCounts.get(pt.topic) ?? 0;
      const planTarget = pt.recommendedSolves;
      const ratio = planTarget > 0 ? solved / planTarget : 0;
      return {
        topic: pt.topic,
        planDays: pt.totalDays,
        solvedCount: solved,
        ratio: Math.round(ratio * 100) / 100,
        imbalance: ratio > 1.5 ? "overfocused" as const
          : ratio < 0.5 ? "underprepared" as const
          : "on-track" as const,
      };
    })
    .filter((t) => t.solvedCount > 0 || t.ratio < 0.5)
    .sort((a, b) => a.ratio - b.ratio);
}
