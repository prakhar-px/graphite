"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getDashboardStats,
  buildTopicProgress,
  getPlanWithStatuses,
  type UserSnapshot,
} from "@/lib/computed-data";
import { dailyPlan, revisionTopics } from "@/lib/data";
import { getDataSeedId } from "@/lib/data-seed";
import { buildSolvedProblem } from "@/lib/leetcode/build-entry";
import { collectImportedSubmissionKeys } from "@/lib/leetcode/sync-keys";
import { submissionDedupeKey } from "@/lib/leetcode/submissions";
import {
  buildExportPayload,
  downloadJson,
  parseImportFile,
  type PersistedUserState,
} from "@/lib/user-state-io";
import type { TaskStatus } from "@/types";
import type { LeetCodeQuestionMeta, SolvedProblem } from "@/types/problem-log";

type AppNotification = {
  id: string;
  title: string;
  detail: string;
  level: "warning" | "info" | "success";
};

interface AppState extends PersistedUserState {
  seedMismatch: boolean;
  commandOpen: boolean;
  searchOpen: boolean;
  notificationOpen: boolean;
  streak: number;
  solvedProblems: number;
  toggleTask: (taskId: string) => void;
  setDayStatus: (day: number, status: TaskStatus) => void;
  syncDerivedMetrics: () => void;
  setActiveTopic: (topic: string) => void;
  toggleFocusMode: () => void;
  setFocusMode: (enabled: boolean) => void;
  setPlannerSelectedDay: (day: number) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (ids: string[]) => void;
  setCommandOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setNotificationOpen: (open: boolean) => void;
  exportProgress: () => void;
  importProgress: (file: File) => Promise<{ ok: boolean; message: string }>;
  resetProgress: () => void;
  acknowledgeSeed: () => void;
  setLeetcodeUsername: (username: string) => void;
  addSolvedProblem: (
    meta: LeetCodeQuestionMeta,
    options?: {
      plannerDay?: number;
      confidence?: number;
      notes?: string;
      timeMinutes?: number;
      solvedAt?: string;
      source?: SolvedProblem["source"];
    }
  ) => { ok: boolean; message: string };
  removeSolvedProblem: (id: string) => void;
  syncLeetCodeSubmissions: (limit?: number) => Promise<{ ok: boolean; message: string }>;
}

const initialDayStatuses = Object.fromEntries(
  dailyPlan.map((d) => [d.day, d.status])
) as Record<number, TaskStatus>;

const currentSeedId = getDataSeedId();

function snapshotFromState(
  state: Pick<AppState, "dayStatuses" | "completedTasks" | "problemLog">
): UserSnapshot {
  return {
    dayStatuses: state.dayStatuses,
    completedTasks: state.completedTasks,
    solvedProblems: state.problemLog,
  };
}

function deriveFromSnapshot(snapshot: UserSnapshot) {
  const stats = getDashboardStats(snapshot);
  return {
    streak: stats.streak,
    solvedProblems: stats.solved,
    activeTopic: stats.activeTopic,
  };
}

function createInitialState(): Omit<
  AppState,
  | "toggleTask"
  | "setDayStatus"
  | "syncDerivedMetrics"
  | "setActiveTopic"
  | "toggleFocusMode"
  | "setFocusMode"
  | "setPlannerSelectedDay"
  | "markNotificationRead"
  | "markAllNotificationsRead"
  | "setCommandOpen"
  | "setSearchOpen"
  | "setNotificationOpen"
  | "exportProgress"
  | "importProgress"
  | "resetProgress"
  | "acknowledgeSeed"
  | "setLeetcodeUsername"
  | "addSolvedProblem"
  | "removeSolvedProblem"
  | "syncLeetCodeSubmissions"
> {
  const snapshot = {
    dayStatuses: initialDayStatuses,
    completedTasks: [],
    solvedProblems: [],
  };
  const derived = deriveFromSnapshot(snapshot);

  return {
    ...derived,
    dayStatuses: initialDayStatuses,
    completedTasks: [],
    problemLog: [],
    leetcodeUsername: "",
    focusMode: false,
    plannerSelectedDay: 1,
    readNotifications: [],
    lastDataSeedId: currentSeedId,
    seedMismatch: false,
    commandOpen: false,
    searchOpen: false,
    notificationOpen: false,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      toggleTask: (taskId) =>
        set((state) => {
          const completedTasks = state.completedTasks.includes(taskId)
            ? state.completedTasks.filter((id) => id !== taskId)
            : [...state.completedTasks, taskId];
          const snapshot = snapshotFromState({ ...state, completedTasks });
          return { completedTasks, ...deriveFromSnapshot(snapshot) };
        }),

      setDayStatus: (day, status) =>
        set((state) => {
          const dayStatuses = { ...state.dayStatuses, [day]: status };
          const snapshot = snapshotFromState({ ...state, dayStatuses });
          return { dayStatuses, ...deriveFromSnapshot(snapshot) };
        }),

      syncDerivedMetrics: () => {
        const state = get();
        set(deriveFromSnapshot(snapshotFromState(state)));
      },

      setActiveTopic: (topic) => set({ activeTopic: topic }),

      toggleFocusMode: () =>
        set((state) => ({ focusMode: !state.focusMode })),

      setFocusMode: (enabled) => set({ focusMode: enabled }),

      setPlannerSelectedDay: (day) => set({ plannerSelectedDay: day }),

      markNotificationRead: (id) =>
        set((state) => ({
          readNotifications: state.readNotifications.includes(id)
            ? state.readNotifications
            : [...state.readNotifications, id],
        })),

      markAllNotificationsRead: (ids) =>
        set((state) => ({
          readNotifications: Array.from(
            new Set([...state.readNotifications, ...ids])
          ),
        })),

      setCommandOpen: (open) => set({ commandOpen: open }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      setNotificationOpen: (open) => set({ notificationOpen: open }),

      setLeetcodeUsername: (username) => set({ leetcodeUsername: username.trim() }),

      addSolvedProblem: (meta, options = {}) => {
        const state = get();
        if (state.problemLog.some((p) => p.titleSlug === meta.titleSlug)) {
          return { ok: false, message: `${meta.title} is already in your log.` };
        }
        const entry = buildSolvedProblem(meta, {
          plannerDay: options.plannerDay ?? state.plannerSelectedDay,
          confidence: options.confidence,
          notes: options.notes,
          timeMinutes: options.timeMinutes,
          solvedAt: options.solvedAt,
          source: options.source,
        });
        const problemLog = [entry, ...state.problemLog];
        const snapshot = snapshotFromState({ ...state, problemLog });
        set({ problemLog, ...deriveFromSnapshot(snapshot) });
        return { ok: true, message: `Logged ${meta.title}.` };
      },

      removeSolvedProblem: (id) =>
        set((state) => {
          const problemLog = state.problemLog.filter((p) => p.id !== id);
          const snapshot = snapshotFromState({ ...state, problemLog });
          return { problemLog, ...deriveFromSnapshot(snapshot) };
        }),

      syncLeetCodeSubmissions: async (limit = 20) => {
        const { leetcodeUsername, problemLog } = get();
        if (!leetcodeUsername) {
          return { ok: false, message: "Set your LeetCode username in Settings first." };
        }

        try {
          const response = await fetch(
            `/api/leetcode/sync?username=${encodeURIComponent(leetcodeUsername)}&limit=${limit}`
          );
          const data = (await response.json()) as {
            error?: string;
            items?: (LeetCodeQuestionMeta & {
              solvedAt: string;
              submissionId: string;
              lang?: string;
              source: "leetcode-sync";
            })[];
          };

          if (!response.ok) {
            return { ok: false, message: data.error ?? "Sync failed." };
          }

          const existing = collectImportedSubmissionKeys(problemLog);
          let added = 0;
          const next = [...problemLog];

          for (const item of data.items ?? []) {
            const key = submissionDedupeKey(item.submissionId);
            if (existing.has(key)) continue;
            existing.add(key);
            next.push(
              buildSolvedProblem(item, {
                solvedAt: item.solvedAt,
                source: "leetcode-sync",
                submissionId: item.submissionId,
                lang: item.lang,
              })
            );
            added += 1;
          }

          const snapshot = snapshotFromState({
            ...get(),
            problemLog: next,
          });
          set({ problemLog: next, ...deriveFromSnapshot(snapshot) });

          const total = data.items?.length ?? 0;
          return {
            ok: true,
            message:
              added > 0
                ? `Imported ${added} new accepted submission${added === 1 ? "" : "s"} (${total} found in last ${limit}).`
                : total > 0
                  ? `No new submissions to import (${total} already in your log).`
                  : "No accepted submissions found in your recent activity.",
          };
        } catch {
          return { ok: false, message: "Could not reach LeetCode sync." };
        }
      },

      exportProgress: () => {
        const state = get();
        const payload = buildExportPayload({
          dayStatuses: state.dayStatuses,
          completedTasks: state.completedTasks,
          problemLog: state.problemLog,
          leetcodeUsername: state.leetcodeUsername,
          activeTopic: state.activeTopic,
          plannerSelectedDay: state.plannerSelectedDay,
          readNotifications: state.readNotifications,
          focusMode: state.focusMode,
          lastDataSeedId: state.lastDataSeedId,
        });
        const date = new Date().toISOString().slice(0, 10);
        downloadJson(`graphite-progress-${date}.json`, payload);
      },

      importProgress: async (file) => {
        try {
          const text = await file.text();
          const parsed = parseImportFile(JSON.parse(text));
          if (!parsed) {
            return { ok: false, message: "Invalid backup file format." };
          }
          const snapshot = snapshotFromState(parsed);
          set({
            ...parsed,
            ...deriveFromSnapshot(snapshot),
            lastDataSeedId: currentSeedId,
            seedMismatch: parsed.lastDataSeedId !== currentSeedId,
          });
          return { ok: true, message: "Progress restored successfully." };
        } catch {
          return { ok: false, message: "Could not read the file." };
        }
      },

      resetProgress: () => {
        const fresh = createInitialState();
        set({ ...fresh, lastDataSeedId: currentSeedId });
      },

      acknowledgeSeed: () =>
        set({ seedMismatch: false, lastDataSeedId: currentSeedId }),
    }),
    {
      name: "graphite-dsa-store-v4",
      partialize: (state) => ({
        dayStatuses: state.dayStatuses,
        completedTasks: state.completedTasks,
        problemLog: state.problemLog,
        leetcodeUsername: state.leetcodeUsername,
        activeTopic: state.activeTopic,
        focusMode: state.focusMode,
        plannerSelectedDay: state.plannerSelectedDay,
        readNotifications: state.readNotifications,
        lastDataSeedId: state.lastDataSeedId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.problemLog) state.problemLog = [];
        if (!state.leetcodeUsername) state.leetcodeUsername = "";
        const seedId = getDataSeedId();
        if (state.lastDataSeedId && state.lastDataSeedId !== seedId) {
          state.seedMismatch = true;
        }
        state.syncDerivedMetrics();
      },
    }
  )
);

export function useUserSnapshot(): UserSnapshot {
  const dayStatuses = useAppStore((s) => s.dayStatuses);
  const completedTasks = useAppStore((s) => s.completedTasks);
  const problemLog = useAppStore((s) => s.problemLog);
  return { dayStatuses, completedTasks, solvedProblems: problemLog ?? [] };
}

export function useCompletionRate(): number {
  const snapshot = useUserSnapshot();
  const completed = Object.values(snapshot.dayStatuses).filter(
    (s) => s === "completed"
  ).length;
  return Math.round((completed / dailyPlan.length) * 100);
}

export function getComputedNotifications(snapshot: UserSnapshot): AppNotification[] {
  const plan = getPlanWithStatuses(snapshot);
  const weakTopics = buildTopicProgress(snapshot)
    .filter((topic) => topic.status === "weak")
    .slice(0, 2);
  const inProgress = plan.find((item) =>
    item.status.toLowerCase().includes("progress")
  );
  const pending = plan.filter((item) => item.status === "pending").length;

  const notifications: AppNotification[] = revisionTopics
    .filter((revision) => !revision.revision2)
    .slice(0, 3)
    .map((revision) => ({
      id: `rev-${revision.topic}`,
      title: `${revision.topic} revision due`,
      detail: "Second revision cycle is pending.",
      level: "warning" as const,
    }));

  for (const topic of weakTopics) {
    notifications.push({
      id: `weak-${topic.name}`,
      title: `${topic.name} flagged weak`,
      detail: "Run one targeted practice set today.",
      level: "info",
    });
  }

  if (inProgress) {
    notifications.push({
      id: "streak-risk",
      title: `Day ${inProgress.day} is active`,
      detail: `${pending} days remain in queue. Protect momentum with a completed block.`,
      level: "success",
    });
  }

  const revisionDue = revisionTopics.filter((r) => !r.revision1).length;
  if (revisionDue > 0) {
    notifications.push({
      id: "revision-backlog",
      title: `${revisionDue} topics need R1`,
      detail: "Open Revision to schedule first-pass reviews.",
      level: "warning",
    });
  }

  if (snapshot.solvedProblems.length > 0) {
    const latest = snapshot.solvedProblems[0];
    notifications.push({
      id: "latest-solve",
      title: `Logged: ${latest.title}`,
      detail: `${latest.difficulty} · ${latest.topicTags.slice(0, 2).join(", ") || "General"}`,
      level: "success",
    });
  }

  return notifications;
}
