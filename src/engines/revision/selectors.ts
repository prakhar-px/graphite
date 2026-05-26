import { differenceInCalendarDays } from "date-fns";
import { dailyPlan } from "@/lib/data";
import { getTopicConfidencePercent } from "@/engines/confidence/selectors";
import {
  getProblemIdentityKey,
  getProblemPlannerDay,
  getProblemTopics,
  isBulkQuickLog,
  normalizeDifficulty,
} from "@/engines/problems/helpers";
import type { UserSnapshot } from "@/engines/core/types";
import type { ProblemDifficulty, ProblemLog } from "@/engines/problems/types";

export type RecallTrend = "improving" | "stable" | "declining" | "unknown";

export interface ProblemSolveEvent {
  id: string;
  solvedAt: string;
  plannerDay?: number;
  confidence?: number;
  revisionNeeded?: boolean;
}

export interface ProblemRevisionState {
  identityKey: string;
  title: string;
  titleSlug?: string;
  url?: string;
  parentTopic: string;
  topics: string[];
  difficulty?: ProblemDifficulty;
  solveCount: number;
  /** Derived: totalSolveEvents - 1 */
  revisionCount: number;
  firstSolvedAt: string;
  lastSolvedAt: string;
  daysSinceLastSolve: number;
  confidence: number;
  recallStrength: number;
  recallTrend: RecallTrend;
  revisionPending: boolean;
  needsReinforcement: boolean;
  isOverdue: boolean;
  solves: ProblemSolveEvent[];
}

const OVERDUE_DAYS = 21;
const STALE_SINGLE_SOLVE_DAYS = 14;

export function computeDaysSinceLastSolve(iso: string): number {
  return Math.max(0, differenceInCalendarDays(new Date(), new Date(iso)));
}

export function confidenceToPercent(value?: number): number {
  if (typeof value !== "number" || value <= 0) return 0;
  return value <= 10 ? Math.round(value * 10) : Math.round(value);
}

/** Priority score for revision queue (higher = revisit sooner). */
export function computeRevisionScore(state: {
  confidence: number;
  daysSinceLastSolve: number;
  revisionCount: number;
  difficulty?: ProblemDifficulty;
}): number {
  const lowConfidenceWeight = state.confidence > 0 ? (100 - state.confidence) * 0.4 : 30;
  const recencyWeight = Math.min(40, state.daysSinceLastSolve * 1.5);
  const revisionDecay = Math.max(0, 12 - state.revisionCount * 3);
  const hardMultiplier =
    state.difficulty === "hard" ? 1.25 : state.difficulty === "medium" ? 1.1 : 1;
  return Math.round(
    (lowConfidenceWeight + recencyWeight + revisionDecay) * hardMultiplier
  );
}

export function computeRecallStrength(state: {
  confidence: number;
  revisionCount: number;
  solveCount: number;
  daysSinceLastSolve: number;
}): number {
  let score = 0;
  if (state.confidence > 0) {
    score += Math.min(40, state.confidence * 0.4);
  }
  score += Math.min(30, state.revisionCount * 8);
  if (state.solveCount <= 1) {
    score += state.daysSinceLastSolve <= 7 ? 12 : 0;
  } else if (state.daysSinceLastSolve <= 7) {
    score += 30;
  } else if (state.daysSinceLastSolve <= 14) {
    score += 20;
  } else if (state.daysSinceLastSolve <= 30) {
    score += 10;
  }
  return Math.round(Math.min(100, score));
}

export function computeRecallTrend(solves: ProblemSolveEvent[]): RecallTrend {
  const percents = solves
    .map((s) => confidenceToPercent(s.confidence))
    .filter((v) => v > 0);
  if (percents.length < 2) return "unknown";
  const prev = percents[percents.length - 2];
  const last = percents[percents.length - 1];
  if (last - prev >= 8) return "improving";
  if (prev - last >= 8) return "declining";
  return "stable";
}

function enrichProblemRevisionState(
  state: Omit<
    ProblemRevisionState,
    | "daysSinceLastSolve"
    | "recallStrength"
    | "recallTrend"
    | "needsReinforcement"
    | "isOverdue"
  >
): ProblemRevisionState {
  const daysSinceLastSolve = computeDaysSinceLastSolve(state.lastSolvedAt);
  const recallStrength = computeRecallStrength({
    confidence: state.confidence,
    revisionCount: state.revisionCount,
    solveCount: state.solveCount,
    daysSinceLastSolve,
  });
  const recallTrend = computeRecallTrend(state.solves);
  const needsReinforcement =
    state.revisionPending ||
    recallStrength < 50 ||
    (state.solveCount === 1 && daysSinceLastSolve >= STALE_SINGLE_SOLVE_DAYS) ||
    (state.confidence > 0 &&
      state.confidence < 50 &&
      daysSinceLastSolve >= 7);
  const isOverdue =
    state.revisionPending ||
    (state.solveCount === 1 && daysSinceLastSolve >= OVERDUE_DAYS) ||
    (recallStrength < 40 && daysSinceLastSolve >= OVERDUE_DAYS);

  return {
    ...state,
    daysSinceLastSolve,
    recallStrength,
    recallTrend,
    needsReinforcement,
    isOverdue,
  };
}

export interface RevisionTopicGroup {
  topic: string;
  confidence: number;
  problems: ProblemRevisionState[];
  uniqueProblems: number;
  totalRevisions: number;
  revisionPending: number;
}

function resolveParentTopic(problem: ProblemLog): string {
  const tags = getProblemTopics(problem);
  if (tags.length > 0) return tags[0];
  const day = getProblemPlannerDay(problem);
  const planDay = dailyPlan.find((d) => d.day === day);
  if (planDay) return planDay.topic.split("+")[0]?.trim() ?? planDay.topic;
  return "General";
}

export function buildProblemRevisionIndex(
  problemLog: ProblemLog[]
): ProblemRevisionState[] {
  const groups = new Map<string, ProblemLog[]>();

  for (const problem of problemLog) {
    const key = getProblemIdentityKey(problem);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(problem);
    groups.set(key, list);
  }

  const states: ProblemRevisionState[] = [];

  for (const [identityKey, logs] of groups) {
    const sorted = [...logs].sort(
      (a, b) =>
        new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime()
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const topics = [
      ...new Set(sorted.flatMap((p) => getProblemTopics(p)).filter(Boolean)),
    ];
    const confidenceValues = sorted
      .map((p) => confidenceToPercent(p.confidence))
      .filter((v) => v > 0);

    states.push(
      enrichProblemRevisionState({
        identityKey,
        title: first.title ?? "Unknown",
        titleSlug: first.titleSlug,
        url: first.url,
        parentTopic: resolveParentTopic(first),
        topics,
        difficulty: normalizeDifficulty(first.difficulty),
        solveCount: sorted.length,
        revisionCount: Math.max(0, sorted.length - 1),
        firstSolvedAt: first.solvedAt,
        lastSolvedAt: last.solvedAt,
        confidence:
          confidenceValues.length > 0
            ? Math.round(
                confidenceValues.reduce((s, v) => s + v, 0) /
                  confidenceValues.length
              )
            : 0,
        revisionPending: sorted.some((p) => p.revisionNeeded),
        solves: sorted.map((p) => ({
          id: p.id,
          solvedAt: p.solvedAt,
          plannerDay: getProblemPlannerDay(p),
          confidence: p.confidence,
          revisionNeeded: p.revisionNeeded,
        })),
      })
    );
  }

  return states.sort((a, b) => {
    const scoreA = computeRevisionScore({
      confidence: a.confidence,
      daysSinceLastSolve: computeDaysSinceLastSolve(a.lastSolvedAt),
      revisionCount: a.revisionCount,
      difficulty: a.difficulty,
    });
    const scoreB = computeRevisionScore({
      confidence: b.confidence,
      daysSinceLastSolve: computeDaysSinceLastSolve(b.lastSolvedAt),
      revisionCount: b.revisionCount,
      difficulty: b.difficulty,
    });
    if (scoreB !== scoreA) return scoreB - scoreA;
    return new Date(b.lastSolvedAt).getTime() - new Date(a.lastSolvedAt).getTime();
  });
}

export function buildRevisionTopicGroups(
  snapshot: UserSnapshot
): RevisionTopicGroup[] {
  const problems = buildProblemRevisionIndex(snapshot.solvedProblems);
  const map = new Map<string, ProblemRevisionState[]>();

  for (const problem of problems) {
    const list = map.get(problem.parentTopic) ?? [];
    list.push(problem);
    map.set(problem.parentTopic, list);
  }

  return [...map.entries()]
    .map(([topic, items]) => ({
      topic,
      confidence: getTopicConfidencePercent(snapshot.solvedProblems, topic),
      problems: items.sort((a, b) => b.revisionCount - a.revisionCount),
      uniqueProblems: items.length,
      totalRevisions: items.reduce((sum, p) => sum + p.revisionCount, 0),
      revisionPending: items.filter((p) => p.revisionPending).length,
    }))
    .sort((a, b) => b.totalRevisions - a.totalRevisions);
}

export function getRevisionQueue(problemLog: ProblemLog[]): ProblemLog[] {
  return problemLog.filter((problem) => problem.revisionNeeded);
}

/** Problems that should be revisited soon — derived from solve telemetry */
export function getNeedsReinforcementQueue(
  problemLog: ProblemLog[],
  limit?: number
): ProblemRevisionState[] {
  const queue = buildProblemRevisionIndex(problemLog)
    .filter((p) => p.needsReinforcement)
    .sort((a, b) => {
      if (a.revisionPending !== b.revisionPending) {
        return a.revisionPending ? -1 : 1;
      }
      const scoreA = computeRevisionScore({
        confidence: a.confidence,
        daysSinceLastSolve: a.daysSinceLastSolve,
        revisionCount: a.revisionCount,
        difficulty: a.difficulty,
      });
      const scoreB = computeRevisionScore({
        confidence: b.confidence,
        daysSinceLastSolve: b.daysSinceLastSolve,
        revisionCount: b.revisionCount,
        difficulty: b.difficulty,
      });
      if (scoreB !== scoreA) return scoreB - scoreA;
      return a.recallStrength - b.recallStrength;
    });
  return typeof limit === "number" ? queue.slice(0, limit) : queue;
}

export function getOverdueRevisions(
  problemLog: ProblemLog[],
  limit?: number
): ProblemRevisionState[] {
  const overdue = buildProblemRevisionIndex(problemLog)
    .filter((p) => p.isOverdue)
    .sort((a, b) => b.daysSinceLastSolve - a.daysSinceLastSolve);
  return typeof limit === "number" ? overdue.slice(0, limit) : overdue;
}

export function getRevisionSummary(snapshot: UserSnapshot) {
  const problems = buildProblemRevisionIndex(snapshot.solvedProblems);
  const bulkQuick = snapshot.solvedProblems.filter(isBulkQuickLog).length;
  const uniqueProblems = problems.length;
  const repeatSolves = problems.reduce((sum, p) => sum + p.revisionCount, 0);
  const totalSolveEvents = problems.reduce((sum, p) => sum + p.solveCount, 0);
  const withRepeats = problems.filter((p) => p.revisionCount > 0).length;
  const revisionRatePercent =
    uniqueProblems > 0
      ? Math.round((withRepeats / uniqueProblems) * 100)
      : 0;
  const needsReinforcement = problems.filter((p) => p.needsReinforcement).length;
  const strongRecall = problems.filter((p) => p.recallStrength >= 60).length;
  const weakRecall = problems.filter(
    (p) => p.recallStrength > 0 && p.recallStrength < 50
  ).length;
  const overdueRevisions = problems.filter((p) => p.isOverdue).length;
  const lowConfidence = problems.filter(
    (p) => p.confidence > 0 && p.confidence < 50
  ).length;
  const avgRecallStrength =
    problems.length > 0
      ? Math.round(
          problems.reduce((sum, p) => sum + p.recallStrength, 0) /
            problems.length
        )
      : 0;

  return {
    uniqueProblems,
    repeatSolves,
    totalSolveEvents,
    revisionRatePercent,
    needsReinforcement,
    strongRecall,
    weakRecall,
    overdueRevisions,
    avgRecallStrength,
    bulkQuickCaptures: bulkQuick,
    lowConfidence,
    topicGroups: buildRevisionTopicGroups(snapshot).length,
    /** @deprecated use uniqueProblems */
    queueSize: uniqueProblems,
    /** @deprecated use repeatSolves */
    totalRevisions: repeatSolves,
    /** @deprecated use needsReinforcement */
    pending: needsReinforcement,
    /** @deprecated use strongRecall */
    strong: strongRecall,
    /** @deprecated use overdueRevisions */
    overdue: overdueRevisions,
    trackedWithActivity: uniqueProblems,
  };
}

export function getRevisionCycleCount(problemLog: ProblemLog[]): number {
  return buildProblemRevisionIndex(problemLog).reduce(
    (sum, p) => sum + p.revisionCount,
    0
  );
}

export function getLowConfidenceRevisionGaps(
  snapshot: UserSnapshot,
  limit = 6
) {
  return getNeedsReinforcementQueue(snapshot.solvedProblems, limit).map((p) => ({
    topic: p.title,
    parentTopic: p.parentTopic,
    confidence: p.confidence,
    recallStrength: p.recallStrength,
    revisionCount: p.revisionCount,
    revisionPending: p.revisionPending,
    daysSinceLastSolve: p.daysSinceLastSolve,
  }));
}

/** @deprecated Use buildRevisionTopicGroups — kept for type-compat during migration */
export function buildRevisionTopics(snapshot: UserSnapshot) {
  return buildRevisionTopicGroups(snapshot).map((g) => ({
    topic: g.topic,
    confidence: g.confidence,
    revision1: g.uniqueProblems > 0,
    revision2: g.totalRevisions >= 1,
    revision3: g.totalRevisions >= 2,
    exposureCount: g.problems.reduce((s, p) => s + p.solveCount, 0),
    logCount: g.uniqueProblems,
    revisionPending: g.revisionPending > 0,
  }));
}
