import type { PersistedUserState } from "@/lib/user-state-io";
import type { TaskStatus } from "@/types";

export function mergeStates(
  local: PersistedUserState,
  remote: Partial<PersistedUserState>
): PersistedUserState {
  return {
    ...local,
    dayStatuses: mergeDayStatuses(local.dayStatuses, remote.dayStatuses ?? {}),
    completedTasks: mergeCompletedTasks(local.completedTasks, remote.completedTasks ?? []),
    problemLog: mergeProblemLogs(local.problemLog, remote.problemLog ?? []),
    leetcodeUsername: remote.leetcodeUsername ?? local.leetcodeUsername,
    activeTopic: remote.activeTopic ?? local.activeTopic,
    focusMode: remote.focusMode ?? local.focusMode,
    plannerSelectedDay: remote.plannerSelectedDay ?? local.plannerSelectedDay,
    lastDataSeedId: remote.lastDataSeedId ?? local.lastDataSeedId,
  };
}

export function mergeDayStatuses(
  local: Record<number, TaskStatus>,
  remote: Record<number, TaskStatus>
): Record<number, TaskStatus> {
  const merged = { ...local };
  for (const [dayStr, status] of Object.entries(remote)) {
    const day = Number(dayStr);
    const localStatus = merged[day];
    if (!localStatus || status === "completed" || (status === "in-progress" && localStatus === "pending")) {
      merged[day] = status;
    }
  }
  return merged;
}

export function mergeCompletedTasks(local: string[], remote: string[]): string[] {
  return Array.from(new Set([...local, ...remote]));
}

export function mergeProblemLogs(local: any[], remote: any[]): any[] {
  const map = new Map<string, any>();
  for (const p of local) map.set(p.id, p);
  for (const p of remote) {
    const existing = map.get(p.id);
    if (!existing) {
      map.set(p.id, p);
    }
  }
  return Array.from(map.values());
}
