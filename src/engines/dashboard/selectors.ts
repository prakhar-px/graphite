import { companies, dailyPlan, dashboardMetrics } from "@/lib/data";
import type { UserSnapshot } from "@/engines/core/types";
import { getGlobalConfidencePercent } from "@/engines/confidence/selectors";
import {
  computeStreak,
  getPlanWithStatuses,
  getCompletedMissionCount,
  getPlannerCompletionRate,
  getTodayPlan,
  isDoneStatus,
} from "@/engines/planner/selectors";
import {
  getDetailedProblemTotal,
  getNamedProblemsSolvedCount,
  getQuickSolvedTotal,
  getRevisionLoad,
  getRoadmapProblemLogs,
  getUniqueTrackedProblemCount,
} from "@/engines/problems/selectors";
import { getRevisionCycleCount } from "@/engines/revision/selectors";
import { getWeeklySolvedTotal } from "@/engines/telemetry/selectors";
import type { CompanyPrep, DailyPlanDay } from "@/types";

export function computeSolvedProblems(snapshot: UserSnapshot): number {
  return getNamedProblemsSolvedCount(snapshot.solvedProblems);
}

export function getCompletionRate(snapshot: UserSnapshot): number {
  return getPlannerCompletionRate(snapshot.dayStatuses);
}

export function getDashboardStats(snapshot: UserSnapshot) {
  const plan = getPlanWithStatuses(snapshot.dayStatuses);
  const completedDays = getCompletedMissionCount(snapshot.dayStatuses);
  const inProgress = plan.find((d) => d.status === "in-progress");
  const active = inProgress || plan[completedDays] || plan[0];
  const solved = computeSolvedProblems(snapshot);
  const uniqueTracked = getUniqueTrackedProblemCount(snapshot.solvedProblems);
  const roadmapLogged = getRoadmapProblemLogs(snapshot.solvedProblems).length;
  const revisionFlagged = getRevisionLoad(snapshot.solvedProblems);
  const revisionCycles = getRevisionCycleCount(snapshot.solvedProblems);
  const revisionCount = revisionFlagged + revisionCycles;
  const weeklySolved = getWeeklySolvedTotal(snapshot, 2);
  const averageConfidence = getGlobalConfidencePercent(snapshot.solvedProblems);
  const completion = getCompletionRate(snapshot);
  const streak = computeStreak(snapshot.dayStatuses);
  const focusScore = Math.min(
    99,
    Math.round(
      (completion / 100) * 30 +
        (averageConfidence / 100) * 25 +
        Math.min(streak / 10, 1) * 20 +
        Math.min(weeklySolved / 20, 1) * 15 +
        Math.min(averageConfidence > 50 ? 1 : averageConfidence / 100, 1) * 10
    )
  );

  const problemsTarget =
    dashboardMetrics.find((m) =>
      m.metric.toLowerCase().includes("problems solved")
    )?.target ?? 300;

  return {
    solved,
    uniqueTracked,
    roadmapLogged,
    missionsCompleted: completedDays,
    completedDays,
    completion,
    streak,
    weeklySolved,
    revisionCount,
    revisionFlagged,
    revisionCycles,
    detailedLogged: getDetailedProblemTotal(snapshot.solvedProblems),
    quickLogged: getQuickSolvedTotal(snapshot.solvedProblems),
    averageConfidence,
    focusScore,
    problemsTarget,
    activeTopic: active?.topic ?? "Roadmap",
    activeSubtopic: active?.subtopic ?? "Foundation",
    activeLearningGoal: active?.learningGoal ?? "",
    activeDayType: active?.dayType ?? "weekday",
    today: active,
  };
}

export function getUpcomingDays(
  count: number,
  snapshot: UserSnapshot
): DailyPlanDay[] {
  const plan = getPlanWithStatuses(snapshot.dayStatuses);
  const today = getTodayPlan(snapshot.dayStatuses);
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
  const plan = getPlanWithStatuses(snapshot.dayStatuses);
  const inProgress = plan.find((d) => d.status === "in-progress");
  if (inProgress) return inProgress.topic;
  const next = plan.find((d) => d.status === "pending");
  return next?.topic ?? plan[0]?.topic ?? "STL + Hashing";
}
