export type ProblemDifficulty = "Easy" | "Medium" | "Hard";

export type SolvedProblem = {
  id: string;
  questionId: string;
  questionFrontendId?: number;
  title: string;
  titleSlug: string;
  difficulty: ProblemDifficulty;
  topicTags: string[];
  url: string;
  platform: "LeetCode";
  solvedAt: string;
  plannerDay?: number;
  confidence?: number;
  notes?: string;
  timeMinutes?: number;
  source: "manual" | "leetcode-sync";
  /** LeetCode submission id when imported via sync */
  submissionId?: string;
  lang?: string;
};

export type LeetCodeQuestionMeta = {
  questionId: string;
  questionFrontendId?: number;
  title: string;
  titleSlug: string;
  difficulty: ProblemDifficulty;
  topicTags: string[];
  url: string;
};
