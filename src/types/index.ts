export type TaskStatus = "pending" | "in-progress" | "completed";

export interface DailyPlanDay {
  day: number;
  date: string;
  topic: string;
  subtopic: string;
  tasks: string[];
  problemTarget: number;
  timeGoal: string;
  notes: string;
  status: TaskStatus;
}

export interface DashboardMetric {
  metric: string;
  target: number;
  current: number;
  status: string;
}

export interface MasterPlanPhase {
  phase: string;
  timeline: string;
  focus: string;
  goal: string;
}

export interface RevisionTopic {
  topic: string;
  revision1: string;
  revision2: string;
  revision3: string;
  confidence: number;
}

export interface CompanyPrep {
  company: string;
  focusAreas: string;
  difficulty: string;
  targetProblems: number;
  status: string;
  readinessScore?: number;
}

export interface MistakeEntry {
  date: string;
  problem: string;
  topic: string;
  mistakeType: string;
  learning: string;
  revised: boolean;
}

export interface WeeklyReview {
  week: string;
  problemsSolved: number;
  weakAreas: string;
  confidence: string;
  nextGoals: string;
}

export interface TopicProgress {
  name: string;
  solved: number;
  total: number;
  revisionCount: number;
  confidence: number;
  status: "weak" | "in-progress" | "completed" | "revision-pending";
  recentActivity: string;
}

export interface WeeklyProgressPoint {
  week: string;
  solved: number;
  target: number;
}

export interface TopicDistribution {
  topic: string;
  count: number;
}
