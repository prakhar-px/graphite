export type ProblemDifficulty = "easy" | "medium" | "hard";
export type LeetCodeProblemDifficulty = "Easy" | "Medium" | "Hard";

export type ProblemSource =
  | "leetcode"
  | "gfg"
  | "codeforces"
  | "manual"
  | "leetcode-sync";

/** Roadmap-suggested vs user-added telemetry. */
export type ProblemSourceType = "roadmap" | "manual";

export type ProblemLoggingMode = "quick" | "detailed";

export interface ConfidenceHistoryEntry {
  confidence: number;
  recordedAt: string;
}

export interface ProblemLog {
  id: string;
  title?: string;
  topic?: string;
  source?: ProblemSource;
  sourceType?: ProblemSourceType;
  difficulty?: ProblemDifficulty;
  topics?: string[];
  solvedAt: string;
  confidence?: number;
  confidenceHistory?: ConfidenceHistoryEntry[];
  solveCount?: number;
  revisionCount?: number;
  lastSolvedAt?: string;
  timeSpentMinutes?: number;
  notes?: string;
  revisionNeeded?: boolean;
  linkedPlannerDay?: number;
  roadmapDay?: number;
  manuallyAdded?: boolean;
  loggingMode: ProblemLoggingMode;
  solvedCount?: number;

  questionId?: string;
  questionFrontendId?: number;
  titleSlug?: string;
  topicTags?: string[];
  url?: string;
  platform?: "LeetCode";
  plannerDay?: number;
  timeMinutes?: number;
  submissionId?: string;
  lang?: string;
}

export type SolvedProblem = ProblemLog;

export type LeetCodeQuestionMeta = {
  questionId: string;
  questionFrontendId?: number;
  title: string;
  titleSlug: string;
  difficulty: LeetCodeProblemDifficulty;
  topicTags: string[];
  url: string;
};
