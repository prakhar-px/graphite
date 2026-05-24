import type { LeetCodeQuestionMeta, SolvedProblem } from "@/types/problem-log";

export function buildSolvedProblem(
  meta: LeetCodeQuestionMeta,
  options: {
    plannerDay?: number;
    confidence?: number;
    notes?: string;
    timeMinutes?: number;
    source?: SolvedProblem["source"];
    solvedAt?: string;
    submissionId?: string;
    lang?: string;
  } = {}
): SolvedProblem {
  const solvedAt = options.solvedAt ?? new Date().toISOString();
  return {
    id: options.submissionId
      ? `lc-sub-${options.submissionId}`
      : `lc-${meta.titleSlug}-${solvedAt}`,
    questionId: meta.questionId,
    questionFrontendId: meta.questionFrontendId,
    title: meta.title,
    titleSlug: meta.titleSlug,
    difficulty: meta.difficulty,
    topicTags: meta.topicTags,
    url: meta.url,
    platform: "LeetCode",
    solvedAt,
    plannerDay: options.plannerDay,
    confidence: options.confidence,
    notes: options.notes,
    timeMinutes: options.timeMinutes,
    source: options.source ?? "manual",
    submissionId: options.submissionId,
    lang: options.lang,
  };
}
