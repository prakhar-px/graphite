import type { UserSnapshot } from "@/lib/computed-data";

export type AiCoachMode = "full" | "next-problems" | "insights" | "stats";

export type AiCoachRequest = {
  mode: AiCoachMode;
  snapshot: UserSnapshot;
  leetcodeUsername?: string;
  activeTopic?: string;
  plannerSelectedDay?: number;
};

export type AiNextProblem = {
  title: string;
  titleSlug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reason: string;
  topics: string[];
  leetcodeUrl?: string;
};

export type AiStatHighlight = {
  label: string;
  value: string;
  insight: string;
};

export type AiCoachResponse = {
  summary: string;
  insights: string[];
  statsHighlights: AiStatHighlight[];
  nextProblems: AiNextProblem[];
  focusAreas: string[];
  weeklyAdvice: string;
  studyPlanNote?: string;
};
