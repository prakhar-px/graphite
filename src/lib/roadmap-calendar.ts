import { addDays, format, getDay, parse, parseISO } from "date-fns";
import {
  FOUNDATION_SPRINT_DAYS,
  ROADMAP_DATE_FORMAT,
  ROADMAP_START_DATE,
} from "@/config/roadmap";
import type { DayType } from "@/types";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function getRoadmapStartDate(): Date {
  return parseISO(ROADMAP_START_DATE);
}

export function formatMissionDate(date: Date): string {
  return format(date, ROADMAP_DATE_FORMAT);
}

export function parseMissionDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parsed = parse(dateStr, ROADMAP_DATE_FORMAT, new Date());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function resolveMissionCalendar(sequence: number): {
  actualDate: string;
  dayName: string;
  dayType: DayType;
} {
  const start = getRoadmapStartDate();
  const date = addDays(start, Math.max(0, sequence - 1));
  const dayIndex = getDay(date);
  const dayType: DayType =
    dayIndex === 0 || dayIndex === 6 ? "weekend" : "weekday";

  return {
    actualDate: formatMissionDate(date),
    dayName: DAY_NAMES[dayIndex],
    dayType,
  };
}

export function getCalendarDayForToday(now = new Date()): string {
  return formatMissionDate(now);
}

export function isWithinSprint(sequence: number): boolean {
  return sequence >= 1 && sequence <= FOUNDATION_SPRINT_DAYS;
}
