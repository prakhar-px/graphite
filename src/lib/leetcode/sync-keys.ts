import type { SolvedProblem } from "@/types/problem-log";
import { submissionDedupeKey } from "@/lib/leetcode/submissions";

/** Keys used to skip already-imported sync submissions. */
export function collectImportedSubmissionKeys(problemLog: SolvedProblem[]): Set<string> {
  const keys = new Set<string>();

  for (const problem of problemLog) {
    if (problem.submissionId) {
      keys.add(submissionDedupeKey(problem.submissionId));
      continue;
    }
    if (problem.id.startsWith("lc-sub-")) {
      keys.add(submissionDedupeKey(problem.id.slice("lc-sub-".length)));
      continue;
    }
    if (problem.source === "leetcode-sync") {
      keys.add(`slug-time:${problem.titleSlug}:${problem.solvedAt}`);
    }
  }

  return keys;
}
