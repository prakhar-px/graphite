import { dailyPlan } from "@/lib/data";
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
    if (
      typeof p.titleSlug !== "string" ||
      typeof p.title !== "string" ||
      typeof p.questionId !== "string"
    ) {
      continue;
    }
    entries.push({
      id: typeof p.id === "string" ? p.id : `lc-${p.titleSlug}`,
      questionId: p.questionId,
      questionFrontendId:
        typeof p.questionFrontendId === "number" ? p.questionFrontendId : undefined,
      title: p.title,
      titleSlug: p.titleSlug,
      difficulty:
        p.difficulty === "Easy" || p.difficulty === "Hard" ? p.difficulty : "Medium",
      topicTags: Array.isArray(p.topicTags)
        ? p.topicTags.filter((t): t is string => typeof t === "string")
        : [],
      url:
        typeof p.url === "string"
          ? p.url
          : `https://leetcode.com/problems/${p.titleSlug}/`,
      platform: "LeetCode",
      solvedAt: typeof p.solvedAt === "string" ? p.solvedAt : new Date().toISOString(),
      plannerDay: typeof p.plannerDay === "number" ? p.plannerDay : undefined,
      confidence: typeof p.confidence === "number" ? p.confidence : undefined,
      notes: typeof p.notes === "string" ? p.notes : undefined,
      timeMinutes: typeof p.timeMinutes === "number" ? p.timeMinutes : undefined,
      source: p.source === "leetcode-sync" ? "leetcode-sync" : "manual",
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
