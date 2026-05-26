import dailyPlanRaw from "@/data/daily-plan.json";
import dashboardRaw from "@/data/dashboard.json";
import masterPlanRaw from "@/data/master-plan.json";
import revisionRaw from "@/data/revision-tracker.json";
import companyRaw from "@/data/company-prep.json";
import mistakeRaw from "@/data/mistake-log.json";
import weeklyRaw from "@/data/weekly-review.json";
import type { UserSnapshot } from "@/lib/computed-data";
import { getRevisionCycleCount } from "@/engines/revision/selectors";
import { getRevisionLoad } from "@/engines/problems/selectors";
import {
  buildTopicProgress as buildTopicProgressMerged,
  getWeeklyProgress as getWeeklyProgressMerged,
  getWeeklySolvedTrend as getWeeklySolvedTrendMerged,
  getTopicDistributionForChart as getTopicDistributionForChartMerged,
  getDashboardStats as getDashboardStatsMerged,
  getWeeklySolvedTotal as getWeeklySolvedTotalMerged,
  getUpcomingDays as getUpcomingDaysMerged,
} from "@/lib/computed-data";
import {
  getPlanWithStatuses as getPlanWithStatusesEngine,
  getTodayPlan as getTodayPlanEngine,
  getCompletedMissionCount as getCompletedMissionCountEngine,
  getPlannerCompletionRate,
} from "@/engines/planner/selectors";
import {
  getPlanOverallMetrics,
  getPlanWeekMetrics,
  getPlanWeekendMissions,
  getPlanWeekdayMissions,
  getPlanTopicMetrics,
} from "@/engines/telemetry/selectors";
import type {
  CompanyPrep,
  DailyPlanDay,
  DashboardMetric,
  MasterPlanPhase,
  MistakeEntry,
  RevisionTopic,
  TopicDistribution,
  TopicProgress,
  WeeklyProgressPoint,
  WeeklyReview,
} from "@/types";

export const dailyPlan = dailyPlanRaw as DailyPlanDay[];

function normalizeConfidence(value: number): number {
  if (value <= 0) return 0;
  if (value <= 10) return Math.round(value * 10);
  return Math.min(100, Math.round(value));
}

function parseCompanyReadiness(status: string, target: number): number {
  const match = status.match(/(\d+)\s*completed/i);
  if (match && target > 0) {
    return Math.min(100, Math.round((Number(match[1]) / target) * 100));
  }
  return 0;
}

function parseDashboard(rows: Record<string, unknown>[]): DashboardMetric[] {
  return rows
    .slice(1)
    .filter((r) => r["FAANG / MICROSOFT DSA DASHBOARD"])
    .map((r) => ({
      metric: String(r["FAANG / MICROSOFT DSA DASHBOARD"]),
      target: Number(r.__EMPTY) || 0,
      current: Number(r.__EMPTY_1) || 0,
      status: String(r.__EMPTY_2 || ""),
    }));
}

export const dashboardMetrics = parseDashboard(
  dashboardRaw as Record<string, unknown>[]
);

export const masterPlan = (masterPlanRaw as Record<string, string>[]).map(
  (r) => ({
    phase: r.Phase,
    timeline: r.Timeline,
    focus: r.Focus,
    goal: r.Goal,
  })
) satisfies MasterPlanPhase[];

export const revisionTopics: RevisionTopic[] = (
  revisionRaw as Record<string, string | number>[]
).map((r, i) => ({
  topic: String(r.Topic),
  revision1: String(r["Revision 1"] || ""),
  revision2: String(r["Revision 2"] || ""),
  revision3: String(r["Revision 3"] || ""),
  confidence: normalizeConfidence(
    r.Confidence ? Number(r.Confidence) : 4 + (i % 5)
  ),
}));

export const companies: CompanyPrep[] = (
  companyRaw as Record<string, string | number>[]
).map((r) => {
  const targetProblems = Number(r["Target Problems"]) || 50;
  const status = String(r.Status || "");
  return {
    company: String(r.Company),
    focusAreas: String(r["Focus Areas"]),
    difficulty: String(r["Question Difficulty"]),
    targetProblems,
    status: status || "in-progress",
    readinessScore: parseCompanyReadiness(status, targetProblems),
  };
});

export const mistakes: MistakeEntry[] = (
  mistakeRaw as Record<string, string>[]
)
  .filter((r) => r.Problem || r.Topic || r["Mistake Type"])
  .map((r) => ({
    date: r.Date || "",
    problem: r.Problem || "—",
    topic: r.Topic || "General",
    mistakeType: r["Mistake Type"] || "Logic Error",
    learning: r.Learning || "",
    revised: (r["Revised?"] || "").toLowerCase().includes("yes"),
  }));

export const weeklyReviews: WeeklyReview[] = (
  weeklyRaw as Record<string, unknown>[]
)
  .filter((r) => Object.values(r).some((v) => v !== ""))
  .slice(0, 12)
  .map((r, i) => ({
    week: String(r.Week || r.week || `Week ${i + 1}`),
    problemsSolved: Number(r["Problems Solved"] || r.solved || 0),
    weakAreas: String(r["Weak Areas"] || r.weak || ""),
    confidence: String(r.Confidence || "Medium"),
    nextGoals: String(r["Next Goals"] || r.goals || ""),
  }));

export function getUniqueTopics(): string[] {
  return [...new Set(dailyPlan.map((d) => d.topic))];
}

function seedSnapshot(): UserSnapshot {
  return {
    dayStatuses: Object.fromEntries(
      dailyPlan.map((d) => [d.day, d.status])
    ) as Record<number, import("@/types").TaskStatus>,
    completedTasks: [],
    solvedProblems: [],
  };
}

export function buildTopicProgress(snapshot?: UserSnapshot): TopicProgress[] {
  return buildTopicProgressMerged(snapshot ?? seedSnapshot());
}

export function getWeeklyProgress(snapshot?: UserSnapshot): WeeklyProgressPoint[] {
  return getWeeklyProgressMerged(snapshot ?? seedSnapshot());
}

export function getDashboardSolvedCount(): number {
  const metric = dashboardMetrics.find((m) =>
    m.metric.toLowerCase().includes("problems solved")
  );
  return metric?.current ?? 0;
}

export function getCompletedDayCount(
  dayStatuses?: Record<number, import("@/types").TaskStatus>
): number {
  const statuses =
    dayStatuses ??
    (Object.fromEntries(dailyPlan.map((d) => [d.day, d.status])) as Record<
      number,
      import("@/types").TaskStatus
    >);
  return getCompletedMissionCountEngine(statuses);
}

export function getMistakeCategoryStats(): { type: string; count: number }[] {
  const map = new Map<string, number>();
  for (const m of mistakes) {
    const type = m.mistakeType.trim() || "Other";
    map.set(type, (map.get(type) || 0) + 1);
  }
  return [...map.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

export function getTopicDistribution(): TopicDistribution[] {
  const map = new Map<string, number>();
  for (const day of dailyPlan) {
    map.set(day.topic, (map.get(day.topic) || 0) + 1);
  }
  return [...map.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function getWeeklySolvedTrend(snapshot?: UserSnapshot) {
  return getWeeklySolvedTrendMerged(snapshot ?? seedSnapshot());
}

export function getTopicDistributionForChart(snapshot?: UserSnapshot) {
  return getTopicDistributionForChartMerged(snapshot ?? seedSnapshot());
}

function defaultDayStatuses(): Record<number, import("@/types").TaskStatus> {
  return Object.fromEntries(dailyPlan.map((d) => [d.day, d.status])) as Record<
    number,
    import("@/types").TaskStatus
  >;
}

export function getTodayPlan(
  dayStatuses?: Record<number, import("@/types").TaskStatus>
): DailyPlanDay {
  return getTodayPlanEngine(dayStatuses ?? defaultDayStatuses());
}

export function getUpcomingDays(
  count = 5,
  dayStatuses?: Record<number, import("@/types").TaskStatus>
): DailyPlanDay[] {
  const snapshot: UserSnapshot = {
    dayStatuses:
      dayStatuses ??
      (Object.fromEntries(dailyPlan.map((d) => [d.day, d.status])) as Record<
        number,
        import("@/types").TaskStatus
      >),
    completedTasks: [],
    solvedProblems: [],
  };
  return getUpcomingDaysMerged(count, snapshot);
}

export function getOverallCompletion(
  dayStatuses?: Record<number, import("@/types").TaskStatus>
): number {
  const statuses =
    dayStatuses ??
    (Object.fromEntries(dailyPlan.map((d) => [d.day, d.status])) as Record<
      number,
      import("@/types").TaskStatus
    >);
  return getPlannerCompletionRate(statuses);
}

export function computeFocusScore(
  streak: number,
  completionRate: number,
  revisionRate: number
): number {
  return Math.min(
    100,
    Math.round(streak * 4 + completionRate * 0.4 + revisionRate * 0.3)
  );
}

export function getPlanWithStatuses(
  dayStatuses?: Record<number, import("@/types").TaskStatus>
) {
  return getPlanWithStatusesEngine(dayStatuses ?? defaultDayStatuses());
}

export function getTopicStatsForSearch(snapshot?: UserSnapshot) {
  return buildTopicProgress(snapshot);
}

export function getRevisionCount(snapshot?: UserSnapshot): number {
  const log = snapshot?.solvedProblems ?? [];
  return getRevisionLoad(log) + getRevisionCycleCount(log);
}

export function getWeeklySolvedTotal(weeks = 2, snapshot?: UserSnapshot): number {
  return getWeeklySolvedTotalMerged(snapshot ?? seedSnapshot(), weeks);
}

export function getDashboardStats(
  dayStatuses?: Record<number, import("@/types").TaskStatus>,
  completedTasks: string[] = [],
  solvedProblems: import("@/types/problem-log").SolvedProblem[] = []
) {
  const snapshot: UserSnapshot = {
    dayStatuses:
      dayStatuses ??
      (Object.fromEntries(dailyPlan.map((d) => [d.day, d.status])) as Record<
        number,
        import("@/types").TaskStatus
      >),
    completedTasks,
    solvedProblems,
  };
  return getDashboardStatsMerged(snapshot);
}

export {
  getPlanOverallMetrics,
  getPlanWeekMetrics,
  getPlanWeekendMissions,
  getPlanWeekdayMissions,
  getPlanTopicMetrics,
};
