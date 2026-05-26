import type { TaskStatus } from "@/types";
import type { ProblemLog } from "@/engines/problems/types";

/** Runtime user state passed into engines for derived metrics */
export type UserSnapshot = {
  dayStatuses: Record<number, TaskStatus>;
  completedTasks: string[];
  solvedProblems: ProblemLog[];
};
