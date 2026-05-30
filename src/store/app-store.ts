"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  GRAPHITE_STORAGE_KEY,
  createGraphiteStorage,
} from "@/engines/storage/local-persistence";
import {
  buildDetailedProblemLog,
  buildQuickProblemLog,
  formatDifficulty,
  getProblemTopics,
  normalizeDifficulty,
  normalizeSource,
} from "@/engines/problems/helpers";
import type { UserSnapshot } from "@/engines/core/types";
import { getDashboardStats } from "@/engines/dashboard/selectors";
import { buildMissionCompletionLogs, mergeMissionLogs } from "@/engines/planner/mission";
import type { MissionQuestionEntry } from "@/types/mission-completion";
import { getMissionByDay, getPlanWithStatuses } from "@/engines/planner/selectors";
import { buildTopicProgress } from "@/engines/topics/selectors";
import { dailyPlan } from "@/lib/data";
import {
  buildProblemRevisionIndex,
  getRevisionSummary,
} from "@/engines/revision/selectors";
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
import type {
  LeetCodeQuestionMeta,
  ProblemDifficulty,
  ProblemLog,
  ProblemSource,
  SolvedProblem,
} from "@/types/problem-log";
import { syncQueue } from "@/lib/sync/sync-queue";
import {
  pullFromCloud as fetchCloudState,
  pushFullState as uploadFullState,
  setSyncStatus,
} from "@/lib/sync/sync-engine";
import { mergeStates } from "@/lib/sync/conflict-resolver";
import type { SyncStatus } from "@/lib/sync/sync-engine";

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
  addProblemLog: (entry: ProblemLog) => void;
  quickLogProblemCount: (options: {
    solvedCount: number;
    plannerDay?: number;
    title?: string;
    topics?: string[];
    confidence?: number;
  }) => void;
  addDetailedProblemLog: (input: {
    title: string;
    source?: ProblemSource;
    difficulty?: ProblemDifficulty;
    topics?: string[];
    confidence?: number;
    notes?: string;
    timeSpentMinutes?: number;
    revisionNeeded?: boolean;
    linkedPlannerDay?: number;
  }) => { ok: boolean; message: string };
      roughlyCompleteMission: (
        day: number,
        entries: MissionQuestionEntry[]
      ) => void;
      completeMissionWithQuestions: (
        day: number,
        entries: MissionQuestionEntry[]
      ) => void;
      /** @deprecated Use roughlyCompleteMission / completeMissionWithQuestions */
      completePlannerDay: (
        day: number,
        solvedCount: number,
        confidence?: number
      ) => void;
  addSolvedProblem: (
    meta: LeetCodeQuestionMeta,
    options?: {
      plannerDay?: number;
      confidence?: number;
      notes?: string;
      timeMinutes?: number;
      revisionNeeded?: boolean;
      solvedAt?: string;
      source?: SolvedProblem["source"];
    }
  ) => { ok: boolean; message: string };
  removeSolvedProblem: (id: string) => void;
  syncLeetCodeSubmissions: (limit?: number) => Promise<{ ok: boolean; message: string }>;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  pullFromCloud: () => Promise<boolean>;
  pushFullState: () => Promise<void>;
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
  | "addProblemLog"
  | "quickLogProblemCount"
  | "addDetailedProblemLog"
  | "roughlyCompleteMission"
  | "completeMissionWithQuestions"
  | "completePlannerDay"
  | "addSolvedProblem"
  | "removeSolvedProblem"
  | "syncLeetCodeSubmissions"
  | "pullFromCloud"
  | "pushFullState"
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
    syncStatus: "idle",
    lastSyncedAt: null,
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
          syncQueue.enqueue({ type: "update_profile", patch: { completedTasks } });
          return { completedTasks, ...deriveFromSnapshot(snapshot) };
        }),

      setDayStatus: (day, status) =>
        set((state) => {
          const dayStatuses = { ...state.dayStatuses, [day]: status };
          const snapshot = snapshotFromState({ ...state, dayStatuses });
          syncQueue.enqueue({ type: "upsert_day", day, status });
          return { dayStatuses, ...deriveFromSnapshot(snapshot) };
        }),

      syncDerivedMetrics: () => {
        const state = get();
        set(deriveFromSnapshot(snapshotFromState(state)));
      },

      setActiveTopic: (topic) => {
        set({ activeTopic: topic });
        syncQueue.enqueue({ type: "update_profile", patch: { activeTopic: topic } });
      },

      toggleFocusMode: () =>
        set((state) => {
          const focusMode = !state.focusMode;
          syncQueue.enqueue({ type: "update_profile", patch: { focusMode } });
          return { focusMode };
        }),

      setFocusMode: (enabled) => {
        set({ focusMode: enabled });
        syncQueue.enqueue({ type: "update_profile", patch: { focusMode: enabled } });
      },

      setPlannerSelectedDay: (day) => {
        set({ plannerSelectedDay: day });
        syncQueue.enqueue({ type: "update_profile", patch: { plannerSelectedDay: day } });
      },

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

      setLeetcodeUsername: (username) => {
        const leetcodeUsername = username.trim();
        set({ leetcodeUsername });
        syncQueue.enqueue({ type: "update_profile", patch: { leetcodeUsername } });
      },

      addProblemLog: (entry) =>
        set((state) => {
          const problemLog = [entry, ...state.problemLog];
          const snapshot = snapshotFromState({ ...state, problemLog });
          syncQueue.enqueue({ type: "upsert_problem", problem: entry });
          return { problemLog, ...deriveFromSnapshot(snapshot) };
        }),

      quickLogProblemCount: ({
        solvedCount,
        plannerDay,
        title,
        topics,
        confidence,
      }) =>
        set((state) => {
          const entry = buildQuickProblemLog({
            solvedCount,
            linkedPlannerDay: plannerDay ?? state.plannerSelectedDay,
            title,
            topics,
            confidence,
          });
          const problemLog = [entry, ...state.problemLog];
          const snapshot = snapshotFromState({ ...state, problemLog });
          syncQueue.enqueue({ type: "upsert_problem", problem: entry });
          return { problemLog, ...deriveFromSnapshot(snapshot) };
        }),

      addDetailedProblemLog: (input) => {
        const state = get();
        const title = input.title.trim();
        if (!title) return { ok: false, message: "Add a problem title." };
        const entry = buildDetailedProblemLog({
          ...input,
          title,
          linkedPlannerDay: input.linkedPlannerDay ?? state.plannerSelectedDay,
          sourceType: "manual",
          manuallyAdded: true,
        });
        const problemLog = [entry, ...state.problemLog];
        const snapshot = snapshotFromState({ ...state, problemLog });
        set({ problemLog, ...deriveFromSnapshot(snapshot) });
        syncQueue.enqueue({ type: "upsert_problem", problem: entry });
        return { ok: true, message: `Logged ${title}.` };
      },

      roughlyCompleteMission: (day, entries) =>
        set((state) => {
          const planDay = getMissionByDay(day);
          if (!planDay) return state;
          const dayStatuses = { ...state.dayStatuses, [day]: "completed" as TaskStatus };
          const logs = buildMissionCompletionLogs(planDay, entries);
          const problemLog = mergeMissionLogs(state.problemLog, day, logs);
          const snapshot = snapshotFromState({ ...state, dayStatuses, problemLog });
          syncQueue.enqueue({ type: "upsert_day", day, status: "completed" });
          for (const log of logs) syncQueue.enqueue({ type: "upsert_problem", problem: log });
          return { dayStatuses, problemLog, ...deriveFromSnapshot(snapshot) };
        }),

      completeMissionWithQuestions: (day, entries) =>
        set((state) => {
          const planDay = getMissionByDay(day);
          if (!planDay) return state;
          const dayStatuses = { ...state.dayStatuses, [day]: "completed" as TaskStatus };
          const logs = buildMissionCompletionLogs(planDay, entries);
          const problemLog = mergeMissionLogs(state.problemLog, day, logs);
          const snapshot = snapshotFromState({ ...state, dayStatuses, problemLog });
          syncQueue.enqueue({ type: "upsert_day", day, status: "completed" });
          for (const log of logs) syncQueue.enqueue({ type: "upsert_problem", problem: log });
          return { dayStatuses, problemLog, ...deriveFromSnapshot(snapshot) };
        }),

      completePlannerDay: (day, solvedCount, confidence) => {
        const planDay = getMissionByDay(day);
        if (!planDay) return;
        const defaultConf = confidence ?? planDay.defaultConfidence;
        const entries = planDay.suggestedQuestions
          .slice(0, Math.max(0, Math.round(solvedCount)))
          .map((title) => ({ title, confidence: defaultConf }));
        if (entries.length >= planDay.suggestedQuestions.length) {
          get().roughlyCompleteMission(day, entries);
        } else {
          get().completeMissionWithQuestions(day, entries);
        }
      },

      addSolvedProblem: (meta, options = {}) => {
        const state = get();
        const entry = buildSolvedProblem(meta, {
          plannerDay: options.plannerDay ?? state.plannerSelectedDay,
          confidence: options.confidence,
          notes: options.notes,
          timeMinutes: options.timeMinutes,
          revisionNeeded: options.revisionNeeded,
          solvedAt: options.solvedAt,
          source: options.source,
        });
        const problemLog = [entry, ...state.problemLog];
        const snapshot = snapshotFromState({ ...state, problemLog });
        set({ problemLog, ...deriveFromSnapshot(snapshot) });
        syncQueue.enqueue({ type: "upsert_problem", problem: entry });
        return { ok: true, message: `Logged ${meta.title}.` };
      },

      removeSolvedProblem: (id) =>
        set((state) => {
          const problemLog = state.problemLog.filter((p) => p.id !== id);
          const snapshot = snapshotFromState({ ...state, problemLog });
          syncQueue.enqueue({ type: "delete_problem", id });
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
          get().pushFullState();
          return { ok: true, message: "Progress restored successfully." };
        } catch {
          return { ok: false, message: "Could not read the file." };
        }
      },

      resetProgress: () => {
        const fresh = createInitialState();
        set({ ...fresh, lastDataSeedId: currentSeedId });
        get().pushFullState();
      },

      acknowledgeSeed: () => {
        set({ seedMismatch: false, lastDataSeedId: currentSeedId });
        syncQueue.enqueue({ type: "update_profile", patch: { lastDataSeedId: currentSeedId } });
      },

      pullFromCloud: async () => {
        const supabase = (await import("@/lib/supabase/client")).getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        setSyncStatus("syncing");
        set({ syncStatus: "syncing" });

        const cloudState = await fetchCloudState(user.id);
        if (!cloudState) {
          setSyncStatus("idle");
          set({ syncStatus: "idle" });
          return false;
        }

        const current = get();
        const local: PersistedUserState = {
          dayStatuses: current.dayStatuses,
          completedTasks: current.completedTasks,
          problemLog: current.problemLog,
          leetcodeUsername: current.leetcodeUsername,
          activeTopic: current.activeTopic,
          focusMode: current.focusMode,
          plannerSelectedDay: current.plannerSelectedDay,
          readNotifications: current.readNotifications,
          lastDataSeedId: current.lastDataSeedId,
        };

        const merged = mergeStates(local, cloudState);
        const snapshot = snapshotFromState(merged);
        setSyncStatus("idle");
        set({
          ...merged,
          ...deriveFromSnapshot(snapshot),
          lastSyncedAt: new Date().toISOString(),
          syncStatus: "idle",
        });
        return true;
      },

      pushFullState: async () => {
        const current = get();
        const state: PersistedUserState = {
          dayStatuses: current.dayStatuses,
          completedTasks: current.completedTasks,
          problemLog: current.problemLog,
          leetcodeUsername: current.leetcodeUsername,
          activeTopic: current.activeTopic,
          focusMode: current.focusMode,
          plannerSelectedDay: current.plannerSelectedDay,
          readNotifications: current.readNotifications,
          lastDataSeedId: current.lastDataSeedId,
        };
        setSyncStatus("syncing");
        set({ syncStatus: "syncing" });
        await uploadFullState(state);
        setSyncStatus("idle");
        set({ syncStatus: "idle", lastSyncedAt: new Date().toISOString() });
      },
    }),
    {
      name: GRAPHITE_STORAGE_KEY,
      storage: createGraphiteStorage(),
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
        state.problemLog = state.problemLog.map((problem) => {
          const topics = problem.topics ?? problem.topicTags ?? [];
          const linkedPlannerDay = problem.linkedPlannerDay ?? problem.plannerDay;
          const timeSpentMinutes = problem.timeSpentMinutes ?? problem.timeMinutes;
          return {
            ...problem,
            source: normalizeSource(problem.source),
            difficulty: normalizeDifficulty(problem.difficulty),
            topics,
            topicTags: topics,
            linkedPlannerDay,
            plannerDay: linkedPlannerDay,
            timeSpentMinutes,
            timeMinutes: timeSpentMinutes,
            loggingMode: problem.loggingMode ?? "detailed",
            solvedCount:
              typeof problem.solvedCount === "number"
                ? problem.solvedCount
                : problem.loggingMode === "quick"
                  ? 0
                  : 1,
          };
        });
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

  const revisionProblems = buildProblemRevisionIndex(snapshot.solvedProblems);
  const revisionSummary = getRevisionSummary(snapshot);

  const notifications: AppNotification[] = revisionProblems
    .filter(
      (problem) =>
        problem.revisionPending ||
        problem.revisionCount > 0 ||
        (problem.confidence > 0 && problem.confidence < 50)
    )
    .slice(0, 3)
    .map((problem) => ({
      id: `rev-${problem.identityKey}`,
      title:
        problem.revisionCount > 0
          ? `${problem.title} · ${problem.revisionCount} revision${problem.revisionCount === 1 ? "" : "s"}`
          : `${problem.title} needs review`,
      detail: problem.revisionPending
        ? "Flagged from problem telemetry."
        : `Last solved ${problem.lastSolvedAt.slice(0, 10)}`,
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

  if (revisionSummary.totalRevisions > 0) {
    notifications.push({
      id: "revision-repeats",
      title: `${revisionSummary.totalRevisions} repeat solves tracked`,
      detail: "Re-solving the same problem counts as revision.",
      level: "info",
    });
  }

  if (revisionSummary.pending > 0) {
    notifications.push({
      id: "revision-flagged",
      title: `${revisionSummary.pending} problems flagged`,
      detail: "Review flagged items in your problem log.",
      level: "warning",
    });
  }

  if (snapshot.solvedProblems.length > 0) {
    const latest = snapshot.solvedProblems[0];
    notifications.push({
      id: "latest-solve",
      title: `Logged: ${latest.title ?? "Quick telemetry"}`,
      detail: `${formatDifficulty(latest.difficulty)} · ${getProblemTopics(latest).slice(0, 2).join(", ") || "General"}`,
      level: "success",
    });
  }

  return notifications;
}

