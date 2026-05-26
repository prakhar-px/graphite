/** @deprecated Import from `@/engines/*` — kept for backward-compatible re-exports */
export type { UserSnapshot } from "@/engines/core/types";

export {
  isDoneStatus,
  getPlanWithStatuses,
  computeStreak,
  getPlannerCompletionRate,
  getTodayPlan,
} from "@/engines/planner/selectors";

export {
  getWeeklyPlannerProgress as getWeeklyProgress,
  getWeeklySolvedTrend,
  getWeeklySolvedTotal,
} from "@/engines/telemetry/selectors";

export { buildTopicProgress, getTopicDistributionForChart } from "@/engines/topics/selectors";

export {
  computeSolvedProblems,
  getCompletionRate,
  getDashboardStats,
  getUpcomingDays,
  getCompaniesForDisplay,
  getActiveTopic,
} from "@/engines/dashboard/selectors";

export {
  getPlanOverallMetrics,
  getPlanWeekMetrics,
  getPlanWeekendMissions,
  getPlanWeekdayMissions,
  getPlanTopicMetrics,
} from "@/engines/telemetry/selectors";
