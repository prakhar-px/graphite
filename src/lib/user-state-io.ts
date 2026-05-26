import { dailyPlan } from "@/lib/data";
import { normalizeDifficulty, normalizeSource } from "@/engines/problems/helpers";
import type { TaskStatus } from "@/types";
import type { SolvedProblem } from "@/types/problem-log";

export const USER_STATE_EXPORT_VERSION = 2;

export type PersistedUserState = {
  dayStatuses: Record<number, TaskStatus>;
  completedTasks: string[];
  problemLog: SolvedProblem[];
  leetcodeUsername: string;
  activeTopic: string;
  plannerSelectedDay: number;
  readNotifications: string[];
  focusMode: boolean;
  lastDataSeedId: string;
};

export type UserStateExportFile = {
  version: number;
  exportedAt: string;
  dataSeedId: string;
  app: "graphite";
  state: PersistedUserState;
};

function parseProblemLog(raw: unknown): SolvedProblem[] {
  if (!Array.isArray(raw)) return [];
  const entries: SolvedProblem[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const p = item as Partial<SolvedProblem>;
    if (typeof p.solvedAt !== "string" && typeof p.title !== "string") {
      continue;
    }
    const topics = Array.isArray(p.topics)
      ? p.topics.filter((t): t is string => typeof t === "string")
      : Array.isArray(p.topicTags)
        ? p.topicTags.filter((t): t is string => typeof t === "string")
        : [];
    const linkedPlannerDay =
      typeof p.linkedPlannerDay === "number"
        ? p.linkedPlannerDay
        : typeof p.plannerDay === "number"
          ? p.plannerDay
          : undefined;
    const timeSpentMinutes =
      typeof p.timeSpentMinutes === "number"
        ? p.timeSpentMinutes
        : typeof p.timeMinutes === "number"
          ? p.timeMinutes
          : undefined;
    const loggingMode = p.loggingMode === "quick" ? "quick" : "detailed";

    entries.push({
      id:
        typeof p.id === "string"
          ? p.id
          : `${loggingMode}-${p.titleSlug ?? p.title ?? Date.now()}`,
      questionId: typeof p.questionId === "string" ? p.questionId : undefined,
      questionFrontendId:
        typeof p.questionFrontendId === "number" ? p.questionFrontendId : undefined,
      title: typeof p.title === "string" ? p.title : undefined,
      titleSlug: typeof p.titleSlug === "string" ? p.titleSlug : undefined,
      difficulty: normalizeDifficulty(p.difficulty),
      topics,
      topicTags: topics,
      url: typeof p.url === "string" ? p.url : undefined,
      platform: p.platform === "LeetCode" ? "LeetCode" : undefined,
      solvedAt: typeof p.solvedAt === "string" ? p.solvedAt : new Date().toISOString(),
      linkedPlannerDay,
      plannerDay: linkedPlannerDay,
      confidence: typeof p.confidence === "number" ? p.confidence : undefined,
      notes: typeof p.notes === "string" ? p.notes : undefined,
      timeSpentMinutes,
      timeMinutes: timeSpentMinutes,
      revisionNeeded: Boolean(p.revisionNeeded),
      loggingMode,
      solvedCount:
        typeof p.solvedCount === "number" ? Math.max(0, Math.round(p.solvedCount)) : 1,
      source: normalizeSource(p.source),
      submissionId:
        typeof p.submissionId === "string" ? p.submissionId : undefined,
      lang: typeof p.lang === "string" ? p.lang : undefined,
    });
  }

  return entries;
}

export function buildExportPayload(state: PersistedUserState): UserStateExportFile {
  return {
    version: USER_STATE_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    dataSeedId: state.lastDataSeedId,
    app: "graphite",
    state,
  };
}

export function parseImportFile(raw: unknown): PersistedUserState | null {
  if (!raw || typeof raw !== "object") return null;

  const file = raw as Partial<UserStateExportFile>;
  const state = (file.state ?? file) as Partial<PersistedUserState>;

  if (!state.dayStatuses || typeof state.dayStatuses !== "object") return null;

  const validDays = new Set(dailyPlan.map((d) => d.day));
  const dayStatuses: Record<number, TaskStatus> = {};

  for (const [key, value] of Object.entries(state.dayStatuses)) {
    const day = Number(key);
    if (!validDays.has(day)) continue;
    if (value === "pending" || value === "in-progress" || value === "completed") {
      dayStatuses[day] = value;
    }
  }

  for (const day of dailyPlan) {
    if (dayStatuses[day.day] === undefined) {
      dayStatuses[day.day] = day.status;
    }
  }

  const completedTasks = Array.isArray(state.completedTasks)
    ? state.completedTasks.filter((id) => typeof id === "string")
    : [];

  const problemLog = parseProblemLog(
    state.problemLog ?? (state as { solvedProblems?: unknown }).solvedProblems
  );

  return {
    dayStatuses,
    completedTasks,
    problemLog,
    leetcodeUsername:
      typeof state.leetcodeUsername === "string" ? state.leetcodeUsername : "",
    activeTopic:
      typeof state.activeTopic === "string" ? state.activeTopic : dailyPlan[0]?.topic ?? "",
    plannerSelectedDay:
      typeof state.plannerSelectedDay === "number" ? state.plannerSelectedDay : 1,
    readNotifications: Array.isArray(state.readNotifications)
      ? state.readNotifications.filter((id) => typeof id === "string")
      : [],
    focusMode: Boolean(state.focusMode),
    lastDataSeedId:
      typeof state.lastDataSeedId === "string" ? state.lastDataSeedId : "",
  };
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
