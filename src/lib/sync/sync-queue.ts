import type { TaskStatus } from "@/types";
import type { ProblemLog } from "@/types/problem-log";
import type { PersistedUserState } from "@/lib/user-state-io";

export type SyncOp =
  | { type: "upsert_day"; day: number; status: TaskStatus }
  | { type: "upsert_problem"; problem: ProblemLog }
  | { type: "delete_problem"; id: string }
  | { type: "update_profile"; patch: Partial<Pick<PersistedUserState, "leetcodeUsername" | "activeTopic" | "focusMode" | "plannerSelectedDay" | "lastDataSeedId" | "completedTasks">> };

type BatchMap = {
  days: Map<number, TaskStatus>;
  problems: Map<string, ProblemLog>;
  problemDeletes: Set<string>;
  profile: Record<string, any>;
};

const FLUSH_IMMEDIATE = new Set(["upsert_problem", "upsert_day", "delete_problem"]);
const FLUSH_DEBOUNCED_1500 = new Set(["update_profile"]);

class SyncQueue {
  private ops: SyncOp[] = [];
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private pendingFlush: boolean = false;

  enqueue(op: SyncOp) {
    this.ops.push(op);
    this.scheduleFlush(op.type);
  }

  private scheduleFlush(type: SyncOp["type"]) {
    if (this.pendingFlush) return;

    if (FLUSH_IMMEDIATE.has(type as any)) {
      this.flush();
      return;
    }

    const delay = FLUSH_DEBOUNCED_1500.has(type as any) ? 1500 : 800;
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.flush(), delay);
  }

  private drain(): SyncOp[] {
    const batch = this.ops;
    this.ops = [];
    return batch;
  }

  private toBatch(ops: SyncOp[]): BatchMap {
    const days = new Map<number, TaskStatus>();
    const problems = new Map<string, ProblemLog>();
    const problemDeletes = new Set<string>();
    const profile: any = {};

    for (const op of ops) {
      switch (op.type) {
        case "upsert_day":
          days.set(op.day, op.status);
          break;
        case "upsert_problem":
          problems.set(op.problem.id, op.problem);
          break;
        case "delete_problem":
          problemDeletes.add(op.id);
          problems.delete(op.id);
          break;
        case "update_profile":
          Object.assign(profile, op.patch);
          break;
      }
    }

    return { days, problems, problemDeletes, profile };
  }

  private async flush() {
    if (this.pendingFlush) return;
    this.pendingFlush = true;

    const ops = this.drain();
    if (ops.length === 0) {
      this.pendingFlush = false;
      return;
    }

    const batch = this.toBatch(ops);

    try {
      const { pushToCloud } = await import("./sync-engine");
      await pushToCloud(batch);
    } catch {
      // Re-enqueue on failure
      this.ops = [...ops, ...this.ops];
    } finally {
      this.pendingFlush = false;
    }
  }

  async flushImmediate() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    await this.flush();
  }
}

export const syncQueue = new SyncQueue();
