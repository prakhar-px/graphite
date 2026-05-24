import {
  companies,
  dailyPlan,
  dashboardMetrics,
  revisionTopics,
} from "@/lib/data";
import { parse } from "date-fns";
import type {
  CompanyPrep,
  DailyPlanDay,
  TaskStatus,
  TopicProgress,
  WeeklyProgressPoint,
} from "@/types";
import type { SolvedProblem } from "@/types/problem-log";

/** Runtime progress merged with seed JSON — single source for charts & stats */
export type UserSnapshot = {
  dayStatuses: Record<number, TaskStatus>;
  completedTasks: string[];
  solvedProblems: SolvedProblem[];
};

function parsePlanDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parsed = parse(dateStr, "dd-MMM-yyyy", new Date());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function weekIndexForDate(date: Date): number {
  const start = parsePlanDate(dailyPlan[0]?.date ?? "");
  if (!start) return 0;
  const diffMs = date.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.min(9, Math.floor(diffDays / 7)));
}

function weekIndexForProblem(problem: SolvedProblem): number {
  if (problem.plannerDay) {
    return Math.max(0, Math.min(9, Math.floor((problem.plannerDay - 1) / 7)));
  }
  const solvedDate = new Date(problem.solvedAt);
  return weekIndexForDate(solvedDate);
}

export function isDoneStatus(status: TaskStatus | string): boolean {
  const s = String(status).toLowerCase();
  return s.includes("complete") || s === "completed";
}

export function getPlanWithStatuses(snapshot: UserSnapshot) {
  return dailyPlan.map((day) => ({
    ...day,
    status: snapshot.dayStatuses[day.day] ?? day.status,
  }));
}

export function computeStreak(dayStatuses: Record<number, TaskStatus>): number {
  let streak = 0;
  for (const day of dailyPlan) {
    if (dayStatuses[day.day] === "completed") streak++;
    else break;
  }
  return streak;
}

export function computeSolvedProblems(snapshot: UserSnapshot): number {
  if (snapshot.solvedProblems.length > 0) {
    return new Set(snapshot.solvedProblems.map((p) => p.titleSlug)).size;
  }
  const fromPlan = getPlanWithStatuses(snapshot)
    .filter((d) => d.status === "completed")
    .reduce((sum, d) => sum + d.problemTarget, 0);
  return Math.max(fromPlan, snapshot.completedTasks.length);
}

function weeklySolvedFromLog(snapshot: UserSnapshot, weekCount: number) {
  const plan = getPlanWithStatuses(snapshot);
  const targets = resolveWeeklyTargets(plan, weekCount);
  const counts = Array.from({ length: weekCount }, () => 0);

  for (const problem of snapshot.solvedProblems) {
    const index = weekIndexForProblem(problem);
    if (index < counts.length) counts[index] += 1;
  }

  return counts.map((solved, index) => ({
    week: `W${index + 1}`,
    solved,
    target: targets[index] ?? progressiveWeeklyTarget(index),
  }));
}

/** Weekly goal from daily plan (sum of problemTarget for that week's days). */
function weeklyTargetFromPlan(
  plan: ReturnType<typeof getPlanWithStatuses>,
  weekIndex: number
): number {
  const slice = plan.slice(weekIndex * 7, (weekIndex + 1) * 7);
  return slice.reduce((sum, d) => sum + d.problemTarget, 0) || 35;
}

/** Ramp when Excel repeats the same weekly load every week (e.g. 26+26+…). */
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

export function getWeeklyProgress(snapshot: UserSnapshot): WeeklyProgressPoint[] {
  const plan = getPlanWithStatuses(snapshot);
  const weekCount = Math.ceil(plan.length / 7);
  const targets = resolveWeeklyTargets(plan, weekCount);
  const weeks: WeeklyProgressPoint[] = [];

  for (let w = 0; w < weekCount; w++) {
    const slice = plan.slice(w * 7, (w + 1) * 7);
    const solved = slice
      .filter((d) => d.status === "completed")
      .reduce((sum, d) => sum + d.problemTarget, 0);
    weeks.push({ week: `W${w + 1}`, solved, target: targets[w] ?? 35 });
  }

  return weeks.slice(0, 10);
}

export function getWeeklySolvedTrend(snapshot: UserSnapshot) {
  const labels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];

  if (snapshot.solvedProblems.length > 0) {
    return weeklySolvedFromLog(snapshot, labels.length);
  }

  const progress = getWeeklyProgress(snapshot);
  return labels.map((week, index) => ({
    week,
    solved: Math.max(0, progress[index]?.solved ?? 0),
    target: progress[index]?.target ?? progressiveWeeklyTarget(index),
  }));
}

export function getWeeklySolvedTotal(snapshot: UserSnapshot, weeks = 1): number {
  return getWeeklySolvedTrend(snapshot)
    .slice(-weeks)
    .reduce((sum, week) => sum + week.solved, 0);
}

export function buildTopicProgress(snapshot: UserSnapshot): TopicProgress[] {
  const plan = getPlanWithStatuses(snapshot);
  const topics = [...new Set(plan.map((d) => d.topic))];

  return topics.map((name, i) => {
    const days = plan.filter((d) => d.topic === name);
    const completed = days.filter((d) => d.status === "completed").length;
    const total = days.length;
    const topicKey = name.split("+")[0]?.trim().toLowerCase() ?? name.toLowerCase();
    const logSolved = snapshot.solvedProblems.filter((p) =>
      p.topicTags.some(
        (tag) =>
          name.toLowerCase().includes(tag.toLowerCase()) ||
          tag.toLowerCase().includes(topicKey)
      )
    ).length;
    const rev = revisionTopics.find(
      (r) => r.topic.toLowerCase() === name.toLowerCase()
    );
    const confidence = rev?.confidence ?? 30 + (i * 7) % 60;
    const status: TopicProgress["status"] =
      confidence < 40
        ? "weak"
        : completed === total && total > 0
          ? "completed"
          : completed > 0
            ? "in-progress"
            : "revision-pending";

    return {
      name,
      solved:
        logSolved > 0
          ? logSolved
          : days
              .filter((d) => d.status === "completed")
              .reduce((sum, d) => sum + d.problemTarget, 0),
      total: days.reduce((sum, d) => sum + d.problemTarget, 0) || total * 10,
      revisionCount: [rev?.revision1, rev?.revision2, rev?.revision3].filter(
        Boolean
      ).length,
      confidence,
      status,
      recentActivity: days[days.length - 1]?.subtopic || "—",
    };
  });
}

export function getTopicDistributionForChart(snapshot: UserSnapshot) {
  return buildTopicProgress(snapshot)
    .slice(0, 8)
    .map((topic) => ({
      topic: topic.name.replace(" + ", " / "),
      target: topic.total,
    }));
}

export function getCompletionRate(snapshot: UserSnapshot): number {
  const plan = getPlanWithStatuses(snapshot);
  const completed = plan.filter((d) => d.status === "completed").length;
  return Math.round((completed / plan.length) * 100);
}

export function getDashboardStats(snapshot: UserSnapshot) {
  const plan = getPlanWithStatuses(snapshot);
  const completedDays = plan.filter((d) => isDoneStatus(d.status)).length;
  const inProgress = plan.find((d) => d.status === "in-progress");
  const active = inProgress || plan[completedDays] || plan[0];
  const solved = computeSolvedProblems(snapshot);
  const revisionCount = revisionTopics.reduce(
    (sum, item) =>
      sum + [item.revision1, item.revision2, item.revision3].filter(Boolean).length,
    0
  );
  const weeklySolved = getWeeklySolvedTotal(snapshot, 2);
  const averageConfidence = Math.round(
    revisionTopics.reduce((sum, item) => sum + item.confidence, 0) /
      Math.max(1, revisionTopics.length)
  );
  const completion = getCompletionRate(snapshot);
  const streak = computeStreak(snapshot.dayStatuses);
  const focusScore = Math.min(
    99,
    Math.round(completedDays * 3 + revisionCount * 2 + averageConfidence * 0.15)
  );

  const problemsTarget =
    dashboardMetrics.find((m) =>
      m.metric.toLowerCase().includes("problems solved")
    )?.target ?? 300;

  return {
    solved,
    completedDays,
    completion,
    streak,
    weeklySolved,
    revisionCount,
    focusScore,
    problemsTarget,
    activeTopic: active?.topic ?? "Roadmap",
    activeSubtopic: active?.subtopic ?? "Foundation",
    today: active,
  };
}

export function getTodayPlan(snapshot: UserSnapshot): DailyPlanDay {
  const plan = getPlanWithStatuses(snapshot);
  const inProgress = plan.find((d) => d.status === "in-progress");
  const next = plan.find((d) => d.status === "pending");
  return inProgress || next || plan[0];
}

export function getUpcomingDays(
  count: number,
  snapshot: UserSnapshot
): DailyPlanDay[] {
  const plan = getPlanWithStatuses(snapshot);
  const today = getTodayPlan(snapshot);
  const index = plan.findIndex((day) => day.day === today.day);
  return plan.slice(index + 1, index + 1 + count);
}

function readinessFromExcelStatus(status: string, target: number): number | null {
  const match = status.match(/(\d+)\s*completed/i);
  if (match && target > 0) {
    return Math.min(100, Math.round((Number(match[1]) / target) * 100));
  }
  return null;
}

/** Company cards: Excel status if set, else roadmap completion % (resets with progress). */
export function getCompaniesForDisplay(snapshot: UserSnapshot): CompanyPrep[] {
  const completion = getCompletionRate(snapshot);
  return companies.map((company) => {
    const fromExcel = readinessFromExcelStatus(
      company.status,
      company.targetProblems
    );
    return {
      ...company,
      readinessScore: fromExcel ?? completion,
    };
  });
}

export function getActiveTopic(snapshot: UserSnapshot): string {
  const plan = getPlanWithStatuses(snapshot);
  const inProgress = plan.find((d) => d.status === "in-progress");
  if (inProgress) return inProgress.topic;
  const next = plan.find((d) => d.status === "pending");
  return next?.topic ?? plan[0]?.topic ?? "STL + Hashing";
}
