import { dailyPlan } from "@/lib/data";
import {
  getCalendarDayForToday,
  parseMissionDate,
} from "@/lib/roadmap-calendar";
import type { DailyPlanDay, TaskStatus } from "@/types";

export function isDoneStatus(status: TaskStatus | string): boolean {
  const value = String(status).toLowerCase();
  return value.includes("complete") || value === "completed";
}

export function getPlanWithStatuses(dayStatuses: Record<number, TaskStatus>) {
  return dailyPlan.map((day) => ({
    ...day,
    status: dayStatuses[day.day] ?? day.status,
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

export function getPlannerCompletionRate(
  dayStatuses: Record<number, TaskStatus>
): number {
  const plan = getPlanWithStatuses(dayStatuses);
  const completed = plan.filter((day) => isDoneStatus(day.status)).length;
  return Math.round((completed / plan.length) * 100);
}

export function getCompletedMissionCount(
  dayStatuses: Record<number, TaskStatus>
): number {
  return getPlanWithStatuses(dayStatuses).filter((d) => isDoneStatus(d.status))
    .length;
}

/** Calendar-aware: mission for today's date, else first incomplete by sequence. */
export function getTodayPlan(dayStatuses: Record<number, TaskStatus>): DailyPlanDay {
  const plan = getPlanWithStatuses(dayStatuses);
  const todayKey = getCalendarDayForToday();
  const onCalendar = plan.find((d) => d.actualDate === todayKey);
  if (onCalendar) return onCalendar;

  const inProgress = plan.find((day) => day.status === "in-progress");
  const nextPending = plan.find((day) => day.status === "pending");
  return inProgress || nextPending || plan[0];
}

export function getMissionByDay(day: number): DailyPlanDay | undefined {
  return dailyPlan.find((d) => d.day === day);
}

export function isMissionPastDue(
  mission: DailyPlanDay,
  dayStatuses: Record<number, TaskStatus>,
  now = new Date()
): boolean {
  if (isDoneStatus(dayStatuses[mission.day] ?? mission.status)) return false;
  const missionDate = parseMissionDate(mission.actualDate);
  if (!missionDate) return false;
  return missionDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getWeekendMissions(
  dayStatuses?: Record<number, TaskStatus>
): DailyPlanDay[] {
  const plan = dayStatuses ? getPlanWithStatuses(dayStatuses) : dailyPlan;
  return plan.filter((d) => d.dayType === "weekend");
}
