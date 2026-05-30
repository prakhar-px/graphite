import type { TaskStatus } from "@/types";
import type { ProblemLog } from "@/types/problem-log";
import type { PersistedUserState } from "@/lib/user-state-io";
import { getSupabaseClient } from "@/lib/supabase/client";

const LAST_SYNCED_KEY = "graphite-last-synced-at";

export type SyncStatus = "idle" | "syncing" | "error" | "offline";

const statusListeners = new Set<(status: SyncStatus) => void>();

export function onSyncStatusChange(cb: (status: SyncStatus) => void): () => void {
  statusListeners.add(cb);
  return () => { statusListeners.delete(cb); };
}

export function setSyncStatus(status: SyncStatus) {
  statusListeners.forEach((cb) => cb(status));
}

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export type PushBatch = {
  days: Map<number, TaskStatus>;
  problems: Map<string, ProblemLog>;
  problemDeletes: Set<string>;
  profile: Partial<PersistedUserState>;
};

export async function pushToCloud(batch: PushBatch) {
  if (!isOnline()) throw new Error("offline");
  const supabase = getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("no user");

  setSyncStatus("syncing");

  try {
    const promises: Promise<any>[] = [];

    if (batch.days.size > 0) {
      const dayRows = Array.from(batch.days.entries()).map(([day, status]) => ({
        user_id: user.id,
        day,
        status,
      }));
      for (const row of dayRows) {
        promises.push(
          supabase.from("planner_day_status").upsert(row as never, {
            onConflict: "user_id, day",
            ignoreDuplicates: false,
          }) as unknown as Promise<any>
        );
      }
    }

    if (batch.problems.size > 0 || batch.problemDeletes.size > 0) {
      for (const problem of batch.problems.values()) {
        const problemRow: Record<string, any> = {
          id: problem.id,
          user_id: user.id,
          title: problem.title ?? null,
          title_slug: problem.titleSlug ?? null,
          question_id: problem.questionId ?? null,
          question_frontend_id: problem.questionFrontendId ?? null,
          url: problem.url ?? null,
          platform: problem.platform ?? null,
          difficulty: problem.difficulty ?? null,
          topics: problem.topics ?? [],
          source: problem.source ?? null,
          source_type: problem.sourceType ?? null,
          logging_mode: problem.loggingMode ?? "detailed",
          solved_at: problem.solvedAt,
          solved_count: problem.solvedCount ?? 1,
          confidence: problem.confidence ?? null,
          time_spent_minutes: problem.timeSpentMinutes ?? null,
          notes: problem.notes ?? null,
          revision_needed: problem.revisionNeeded ?? false,
          linked_planner_day: problem.linkedPlannerDay ?? null,
          submission_id: problem.submissionId ?? null,
          lang: problem.lang ?? null,
        };
        promises.push(
          supabase.from("problem_log").upsert(problemRow as never, {
            onConflict: "id",
            ignoreDuplicates: false,
          }) as unknown as Promise<any>
        );
      }
      for (const id of batch.problemDeletes) {
        promises.push(
          (supabase
            .from("problem_log")
            .update({ deleted_at: new Date().toISOString() } as never)
            .eq("id", id)
            .eq("user_id", user.id) as unknown as Promise<any>)
        );
      }
    }

    if (Object.keys(batch.profile).length > 0) {
      const profileUpdate: Record<string, any> = {};
      if (batch.profile.leetcodeUsername !== undefined) profileUpdate.leetcode_username = batch.profile.leetcodeUsername;
      if (batch.profile.activeTopic !== undefined) profileUpdate.active_topic = batch.profile.activeTopic;
      if (batch.profile.focusMode !== undefined) profileUpdate.focus_mode = batch.profile.focusMode;
      if (batch.profile.plannerSelectedDay !== undefined) profileUpdate.planner_selected_day = batch.profile.plannerSelectedDay;
      if (batch.profile.lastDataSeedId !== undefined) profileUpdate.last_data_seed_id = batch.profile.lastDataSeedId;
      if (batch.profile.completedTasks !== undefined) profileUpdate.completed_tasks = batch.profile.completedTasks;
      if (Object.keys(profileUpdate).length > 0) {
        promises.push(
          (supabase
            .from("profiles")
            .update(profileUpdate as never)
            .eq("id", user.id) as unknown as Promise<any>)
        );
      }
    }

    await Promise.all(promises);
    localStorage.setItem(LAST_SYNCED_KEY, new Date().toISOString());
    setSyncStatus("idle");
  } catch {
    setSyncStatus("error");
  }
}

export async function pullFromCloud(
  userId: string
): Promise<Partial<PersistedUserState> | null> {
  const supabase = getSupabaseClient();
  setSyncStatus("syncing");

  try {
    const [profileRes, dayRes, problemRes]: [any, any, any] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("planner_day_status").select("*").eq("user_id", userId),
      supabase
        .from("problem_log")
        .select("*")
        .eq("user_id", userId)
        .is("deleted_at", null),
    ]);

    if (profileRes.error && profileRes.error.code !== "PGRST116") throw profileRes.error;

    const cloudState: Partial<PersistedUserState> = {};

    if (profileRes.data) {
      cloudState.leetcodeUsername = profileRes.data.leetcode_username ?? "";
      cloudState.activeTopic = profileRes.data.active_topic ?? "";
      cloudState.focusMode = profileRes.data.focus_mode ?? false;
      cloudState.plannerSelectedDay = profileRes.data.planner_selected_day ?? 1;
      cloudState.lastDataSeedId = profileRes.data.last_data_seed_id ?? "";
      cloudState.completedTasks = Array.isArray(profileRes.data.completed_tasks)
        ? profileRes.data.completed_tasks
        : [];
    }

    if (dayRes.data) {
      cloudState.dayStatuses = Object.fromEntries(
        dayRes.data.map((r: any) => [r.day, r.status])
      );
    }

    if (problemRes.data) {
      cloudState.problemLog = problemRes.data.map(mapDbRowToProblemLog);
    }

    localStorage.setItem(LAST_SYNCED_KEY, new Date().toISOString());
    setSyncStatus("idle");
    return cloudState;
  } catch {
    setSyncStatus("error");
    return null;
  }
}

export async function pushFullState(state: PersistedUserState) {
  const supabase = getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  setSyncStatus("syncing");

  try {
    const profileUpdate: Record<string, any> = {
      leetcode_username: state.leetcodeUsername,
      active_topic: state.activeTopic,
      focus_mode: state.focusMode,
      planner_selected_day: state.plannerSelectedDay,
      last_data_seed_id: state.lastDataSeedId,
      completed_tasks: state.completedTasks,
    };

    await (supabase.from("profiles").upsert({ id: user.id, ...profileUpdate } as never) as unknown as Promise<any>);

    if (Object.keys(state.dayStatuses).length > 0) {
      const rows = Object.entries(state.dayStatuses).map(([day, status]) => ({
        user_id: user.id,
        day: Number(day),
        status,
      }));
      for (const row of rows) {
        await (supabase.from("planner_day_status").upsert(row as never, {
          onConflict: "user_id, day",
        }) as unknown as Promise<any>);
      }
    }

    if (state.problemLog.length > 0) {
      for (const problem of state.problemLog) {
        const problemRow: Record<string, any> = {
          id: problem.id,
          user_id: user.id,
          title: problem.title ?? null,
          title_slug: problem.titleSlug ?? null,
          question_id: problem.questionId ?? null,
          question_frontend_id: problem.questionFrontendId ?? null,
          url: problem.url ?? null,
          platform: problem.platform ?? null,
          difficulty: problem.difficulty ?? null,
          topics: problem.topics ?? [],
          source: problem.source ?? null,
          source_type: problem.sourceType ?? null,
          logging_mode: problem.loggingMode ?? "detailed",
          solved_at: problem.solvedAt,
          solved_count: problem.solvedCount ?? 1,
          confidence: problem.confidence ?? null,
          time_spent_minutes: problem.timeSpentMinutes ?? null,
          notes: problem.notes ?? null,
          revision_needed: problem.revisionNeeded ?? false,
          linked_planner_day: problem.linkedPlannerDay ?? null,
          submission_id: problem.submissionId ?? null,
          lang: problem.lang ?? null,
        };
        await (supabase.from("problem_log").upsert(problemRow as never, { onConflict: "id" }) as unknown as Promise<any>);
      }
    }

    localStorage.setItem(LAST_SYNCED_KEY, new Date().toISOString());
    setSyncStatus("idle");
  } catch {
    setSyncStatus("error");
  }
}

export function getLastSyncedAt(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_SYNCED_KEY);
}

function mapDbRowToProblemLog(row: any): any {
  return {
    id: row.id,
    title: row.title ?? undefined,
    titleSlug: row.title_slug ?? undefined,
    questionId: row.question_id ?? undefined,
    questionFrontendId: row.question_frontend_id ?? undefined,
    url: row.url ?? undefined,
    platform: row.platform ?? undefined,
    difficulty: row.difficulty ?? undefined,
    topics: row.topics ?? [],
    source: row.source ?? undefined,
    sourceType: row.source_type ?? undefined,
    loggingMode: row.logging_mode ?? "detailed",
    solvedAt: row.solved_at,
    solvedCount: row.solved_count ?? 1,
    confidence: row.confidence ?? undefined,
    timeSpentMinutes: row.time_spent_minutes ?? undefined,
    notes: row.notes ?? undefined,
    revisionNeeded: row.revision_needed ?? false,
    linkedPlannerDay: row.linked_planner_day ?? undefined,
    submissionId: row.submission_id ?? undefined,
    lang: row.lang ?? undefined,
  };
}
