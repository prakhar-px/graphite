import type { LeetCodeQuestionMeta, SolvedProblem } from "@/types/problem-log";
import { buildDetailedProblemLog } from "@/engines/problems/helpers";

export function buildSolvedProblem(
  meta: LeetCodeQuestionMeta,
  options: {
    plannerDay?: number;
    confidence?: number;
    notes?: string;
    timeMinutes?: number;
    revisionNeeded?: boolean;
    source?: SolvedProblem["source"];
    solvedAt?: string;
    submissionId?: string;
    lang?: string;
  } = {}
): SolvedProblem {
  return buildDetailedProblemLog({
    title: meta.title,
    source: options.source === "leetcode-sync" ? "leetcode-sync" : "leetcode",
    difficulty: meta.difficulty,
    topics: meta.topicTags,
    confidence: options.confidence,
    notes: options.notes,
    timeSpentMinutes: options.timeMinutes,
    revisionNeeded: options.revisionNeeded,
    linkedPlannerDay: options.plannerDay,
    solvedAt: options.solvedAt,
    titleSlug: meta.titleSlug,
    url: meta.url,
    questionId: meta.questionId,
    questionFrontendId: meta.questionFrontendId,
    submissionId: options.submissionId,
    lang: options.lang,
  });
}
