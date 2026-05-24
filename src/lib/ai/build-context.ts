import {
  buildTopicProgress,
  getDashboardStats,
  getTodayPlan,
  getUpcomingDays,
  getWeeklySolvedTrend,
} from "@/lib/computed-data";
import { revisionTopics } from "@/lib/data";
import type { UserSnapshot } from "@/lib/computed-data";

export type AiCoachContextInput = UserSnapshot & {
  leetcodeUsername?: string;
  activeTopic?: string;
  plannerSelectedDay?: number;
};

export function buildAiCoachContext(input: AiCoachContextInput): string {
  const snapshot: UserSnapshot = {
    dayStatuses: input.dayStatuses,
    completedTasks: input.completedTasks,
    solvedProblems: input.solvedProblems,
  };

  const stats = getDashboardStats(snapshot);
  const today = getTodayPlan(snapshot);
  const upcoming = getUpcomingDays(3, snapshot);
  const topics = buildTopicProgress(snapshot);
  const weekly = getWeeklySolvedTrend(snapshot);
  const weak = topics.filter((t) => t.status === "weak").slice(0, 5);
  const lowConfidence = revisionTopics
    .filter((r) => r.confidence < 50)
    .slice(0, 6)
    .map((r) => ({
      topic: r.topic,
      confidence: r.confidence,
      revision1: r.revision1,
      revision2: r.revision2,
    }));

  const recentSolves = [...snapshot.solvedProblems]
    .sort(
      (a, b) =>
        new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime()
    )
    .slice(0, 20)
    .map((p) => ({
      title: p.title,
      slug: p.titleSlug,
      difficulty: p.difficulty,
      tags: p.topicTags.slice(0, 4),
      confidence: p.confidence,
      notes: p.notes?.slice(0, 120),
      solvedAt: p.solvedAt.slice(0, 10),
      source: p.source,
    }));

  const slugSet = new Set(snapshot.solvedProblems.map((p) => p.titleSlug));

  const payload = {
    leetcodeUsername: input.leetcodeUsername || null,
    plannerDay: input.plannerSelectedDay ?? today.day,
    stats: {
      uniqueProblemsSolved: stats.solved,
      targetProblems: stats.problemsTarget,
      completionPercent: stats.completion,
      streakDays: stats.streak,
      weeklySolvedLast2Weeks: stats.weeklySolved,
      focusScore: stats.focusScore,
      activeTopic: stats.activeTopic,
      activeSubtopic: stats.activeSubtopic,
    },
    today: {
      day: today.day,
      date: today.date,
      topic: today.topic,
      subtopic: today.subtopic,
      problemTarget: today.problemTarget,
      tasks: today.tasks,
      status: snapshot.dayStatuses[today.day] ?? today.status,
    },
    upcomingDays: upcoming.map((d) => ({
      day: d.day,
      topic: d.topic,
      subtopic: d.subtopic,
      problemTarget: d.problemTarget,
    })),
    weeklyTrend: weekly.slice(-6),
    weakTopics: weak.map((t) => ({
      name: t.name,
      confidence: t.confidence,
      solved: t.solved,
      total: t.total,
    })),
    revisionGaps: lowConfidence,
    alreadySolvedSlugs: [...slugSet].slice(0, 80),
    recentSolves,
    totalLogged: snapshot.solvedProblems.length,
  };

  return JSON.stringify(payload, null, 2);
}
