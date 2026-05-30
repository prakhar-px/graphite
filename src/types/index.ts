export type TaskStatus = "pending" | "in-progress" | "completed";

export type DayType = "weekday" | "weekend";

export type SessionType =
  | "concept"
  | "practice"
  | "revision"
  | "contest"
  | "mixed";

export interface DailyPlanDay {
  /** Fixed sequence 1–70 (alias: day). */
  sequence: number;
  day: number;
  actualDate: string;
  dayName: string;
  dayType: DayType;
  topic: string;
  subtopic: string;
  suggestedQuestions: string[];
  optionalQuestions: string[];
  difficulty: "easy" | "medium" | "hard";
  learningGoal: string;
  resourceFocus: string;
  estimatedHours: string;
  recommendedSolveCount: number;
  sessionType: SessionType;
  defaultConfidence: number;
  revisionFocus: string;
  status: TaskStatus;
  notes: string;
  /** @deprecated Use actualDate */
  date: string;
  /** @deprecated Mission uses suggestedQuestions */
  tasks: string[];
  /** @deprecated Use recommendedSolveCount */
  problemTarget: number;
  /** @deprecated Use estimatedHours */
  timeGoal: string;
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
  recentActivity: string | null;
  missionsCompleted?: number;
}

export interface WeeklyProgressPoint {
  week: string;
  solved: number;
  target: number;
  missionsCompleted?: number;
}

export interface TopicDistribution {
  topic: string;
  count: number;
}
