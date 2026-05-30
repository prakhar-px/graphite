import type {
  ConfidenceHistoryEntry,
  LeetCodeProblemDifficulty,
  ProblemDifficulty,
  ProblemLog,
  ProblemSource,
  ProblemSourceType,
} from "@/types/problem-log";

export function normalizeDifficulty(
  difficulty?: ProblemDifficulty | LeetCodeProblemDifficulty | string
): ProblemDifficulty | undefined {
  const value = difficulty?.toLowerCase();
  if (value === "easy" || value === "medium" || value === "hard") return value;
  return undefined;
}

export function formatDifficulty(difficulty?: ProblemDifficulty | string): string {
  if (!difficulty) return "Mixed";
  return `${difficulty.charAt(0).toUpperCase()}${difficulty.slice(1).toLowerCase()}`;
}

export function getProblemTopics(problem: ProblemLog): string[] {
  if (problem.topic) return [problem.topic, ...(problem.topics ?? [])];
  return problem.topics ?? problem.topicTags ?? [];
}

export function getProblemPlannerDay(problem: ProblemLog): number | undefined {
  return problem.linkedPlannerDay ?? problem.plannerDay ?? problem.roadmapDay;
}

export function getProblemTimeMinutes(problem: ProblemLog): number | undefined {
  return problem.timeSpentMinutes ?? problem.timeMinutes;
}

export function getProblemSolvedCount(problem: ProblemLog): number {
  if (problem.loggingMode === "quick") return Math.max(0, problem.solvedCount ?? 0);
  return Math.max(problem.solveCount ?? 0, problem.solvedCount ?? 1);
}

export function getProblemSourceType(problem: ProblemLog): ProblemSourceType {
  if (problem.sourceType) return problem.sourceType;
  if (problem.manuallyAdded) return "manual";
  if (problem.loggingMode === "quick") return "manual";
  return "roadmap";
}

/** Bulk day/count capture — not a named problem identity */
export function isBulkQuickLog(problem: ProblemLog): boolean {
  if (problem.loggingMode !== "quick") return false;
  const title = problem.title?.toLowerCase() ?? "";
  return (
    title.includes("quick capture") ||
    title.includes("telemetry") ||
    title.includes("extra solves") ||
    title.startsWith("day ")
  );
}

/** Stable key for repeat-solve / revision tracking (detailed + LeetCode) */
export function getProblemIdentityKey(problem: ProblemLog): string | null {
  if (isBulkQuickLog(problem)) return null;
  if (problem.loggingMode === "quick") return null;
  if (problem.titleSlug) return `slug:${problem.titleSlug}`;
  const title = problem.title?.trim().toLowerCase();
  if (!title) return null;
  return `title:${title}`;
}

export function normalizeSource(source?: ProblemSource | string): ProblemSource {
  if (
    source === "leetcode" ||
    source === "gfg" ||
    source === "codeforces" ||
    source === "leetcode-sync"
  ) {
    return source;
  }
  return "manual";
}

function appendConfidenceHistory(
  existing: ConfidenceHistoryEntry[] | undefined,
  confidence: number | undefined,
  solvedAt: string
): ConfidenceHistoryEntry[] | undefined {
  if (typeof confidence !== "number" || confidence <= 0) return existing;
  const entry = { confidence, recordedAt: solvedAt };
  return [...(existing ?? []), entry];
}

export function buildQuickProblemLog(input: {
  solvedCount: number;
  linkedPlannerDay?: number;
  title?: string;
  topics?: string[];
  topic?: string;
  solvedAt?: string;
  confidence?: number;
  sourceType?: ProblemSourceType;
}): ProblemLog {
  const solvedAt = input.solvedAt ?? new Date().toISOString();
  const daySuffix = input.linkedPlannerDay ? `day-${input.linkedPlannerDay}` : "global";
  const sourceType = input.sourceType ?? "manual";

  return {
    id: `quick-${daySuffix}-${solvedAt}`,
    title: input.title ?? "Quick logged problems",
    source: "manual",
    sourceType,
    topic: input.topic ?? input.topics?.[0],
    topics: input.topics,
    solvedAt,
    lastSolvedAt: solvedAt,
    linkedPlannerDay: input.linkedPlannerDay,
    plannerDay: input.linkedPlannerDay,
    roadmapDay: input.linkedPlannerDay,
    manuallyAdded: sourceType === "manual",
    loggingMode: "quick",
    solvedCount: Math.max(0, Math.round(input.solvedCount)),
    solveCount: Math.max(0, Math.round(input.solvedCount)),
    confidence: input.confidence,
    confidenceHistory: appendConfidenceHistory(undefined, input.confidence, solvedAt),
  };
}

export function buildDetailedProblemLog(input: {
  title: string;
  source?: ProblemSource;
  sourceType?: ProblemSourceType;
  difficulty?: ProblemDifficulty | LeetCodeProblemDifficulty | string;
  topics?: string[];
  topic?: string;
  confidence?: number;
  timeSpentMinutes?: number;
  notes?: string;
  revisionNeeded?: boolean;
  linkedPlannerDay?: number;
  manuallyAdded?: boolean;
  solvedAt?: string;
  titleSlug?: string;
  url?: string;
  questionId?: string;
  questionFrontendId?: number;
  submissionId?: string;
  lang?: string;
}): ProblemLog {
  const solvedAt = input.solvedAt ?? new Date().toISOString();
  const source = normalizeSource(input.source);
  const topics = input.topics?.filter(Boolean) ?? [];
  const sourceType =
    input.sourceType ?? (input.manuallyAdded ? "manual" : "roadmap");
  const slugKey = input.titleSlug ?? input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    id: input.submissionId
      ? `lc-sub-${input.submissionId}`
      : `${sourceType}-${slugKey}-day-${input.linkedPlannerDay ?? "x"}-${solvedAt}`,
    title: input.title,
    source,
    sourceType,
    topic: input.topic ?? topics[0],
    difficulty: normalizeDifficulty(input.difficulty),
    topics,
    topicTags: topics,
    solvedAt,
    lastSolvedAt: solvedAt,
    confidence: input.confidence,
    confidenceHistory: appendConfidenceHistory(undefined, input.confidence, solvedAt),
    timeSpentMinutes: input.timeSpentMinutes,
    timeMinutes: input.timeSpentMinutes,
    notes: input.notes,
    revisionNeeded: input.revisionNeeded,
    linkedPlannerDay: input.linkedPlannerDay,
    plannerDay: input.linkedPlannerDay,
    roadmapDay: input.linkedPlannerDay,
    manuallyAdded: input.manuallyAdded ?? sourceType === "manual",
    loggingMode: "detailed",
    solvedCount: 1,
    solveCount: 1,
    revisionCount: 0,
    questionId: input.questionId,
    questionFrontendId: input.questionFrontendId,
    titleSlug: input.titleSlug,
    url: input.url,
    platform: source === "leetcode" || source === "leetcode-sync" ? "LeetCode" : undefined,
    submissionId: input.submissionId,
    lang: input.lang,
  };
}

/** Re-log same identity — increments solve/revision counts */
export function reSolveProblemLog(
  previous: ProblemLog,
  patch?: Partial<Pick<ProblemLog, "confidence" | "notes" | "revisionNeeded" | "linkedPlannerDay">>
): ProblemLog {
  const solvedAt = new Date().toISOString();
  const solveCount = (previous.solveCount ?? 1) + 1;
  const confidence = patch?.confidence ?? previous.confidence;

  return {
    ...previous,
    ...patch,
    id: `${previous.id}-rev-${solvedAt}`,
    solvedAt,
    lastSolvedAt: solvedAt,
    solveCount,
    revisionCount: Math.max(0, solveCount - 1),
    confidence,
    confidenceHistory: appendConfidenceHistory(
      previous.confidenceHistory,
      confidence,
      solvedAt
    ),
  };
}
