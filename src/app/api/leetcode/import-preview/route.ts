import { NextResponse } from "next/server";

const ALFA_API_BASE = process.env.LEETCODE_ALFA_API_URL ?? "https://alfa-leetcode-api.onrender.com";

async function fetchAlfa<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${ALFA_API_BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function parseTimestamp(ts: string | number): number {
  if (typeof ts === "string") return parseInt(ts, 10);
  return ts;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();

  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  const encoded = encodeURIComponent(username);

  // Fetch all 5 Tier 1 endpoints in parallel
  const [acData, progressData, skillData, calData, profileData] = await Promise.all([
    fetchAlfa<{ count?: number; submission?: Array<{ title: string; titleSlug: string; timestamp: string; statusDisplay: string; lang: string; id: string }> }>(`/${encoded}/acSubmission`),
    fetchAlfa<{ easy?: number; medium?: number; hard?: number; total?: number }>(`/${encoded}/progress`),
    fetchAlfa<Array<{ tag: string; count: number }>>(`/${encoded}/skill`),
    fetchAlfa<{ submissionCalendar?: string }>(`/${encoded}/calendar`),
    fetchAlfa<{ username?: string; ranking?: number; totalSolved?: number }>(`/${encoded}/profile`),
  ]);

  // Process accepted submissions into grouped solve events
  const submissions = acData?.submission ?? [];
  const solveMap = new Map<string, Array<{ timestamp: number; lang: string; id: string }>>();

  for (const sub of submissions) {
    if (sub.statusDisplay !== "Accepted") continue;
    const existing = solveMap.get(sub.titleSlug) ?? [];
    existing.push({ timestamp: parseTimestamp(sub.timestamp), lang: sub.lang, id: sub.id });
    solveMap.set(sub.titleSlug, existing);
  }

  // Detect repeated solves and revision gaps
  const repeated: Array<{
    titleSlug: string;
    title: string;
    solveCount: number;
    timestamps: number[];
    maxGapDays: number;
    languages: string[];
  }> = [];

  for (const [titleSlug, solves] of solveMap) {
    if (solves.length < 2) continue;
    const sorted = solves.sort((a, b) => a.timestamp - b.timestamp);
    const timestamps = sorted.map((s) => s.timestamp);
    const maxGapDays = timestamps.reduce((max, t, i) => {
      if (i === 0) return max;
      const gap = (t - timestamps[i - 1]) / 86400;
      return Math.max(max, gap);
    }, 0);
    repeated.push({
      titleSlug,
      title: submissions.find((s) => s.titleSlug === titleSlug)?.title ?? titleSlug,
      solveCount: solves.length,
      timestamps,
      maxGapDays: Math.round(maxGapDays),
      languages: [...new Set(solves.map((s) => s.lang))],
    });
  }

  // Parse calendar
  let calendar: Record<string, number> = {};
  try {
    if (calData?.submissionCalendar) {
      calendar = JSON.parse(calData.submissionCalendar);
    }
  } catch { /* ignore */ }

  // Derive activity streak from calendar
  const activeDays = Object.keys(calendar).length;

  const allProblems = Array.from(solveMap.entries())
    .map(([titleSlug, solves]) => ({
      titleSlug,
      title: submissions.find((s) => s.titleSlug === titleSlug)?.title ?? titleSlug,
      solveCount: solves.length,
      timestamps: solves.map((s) => s.timestamp),
      languages: [...new Set(solves.map((s) => s.lang))],
    }))
    .sort((a, b) => b.solveCount - a.solveCount);

  return NextResponse.json({
    username: profileData?.username ?? username,
    totalAccepted: solveMap.size,
    totalSubmissions: submissions.length,
    allProblems,
    repeated,
    repeatedCount: repeated.length,
    revisionTimeGaps: repeated.filter((r) => r.maxGapDays >= 90).length,
    activeDays,
    topics: skillData ?? [],
    difficultyBreakdown: {
      easy: progressData?.easy ?? 0,
      medium: progressData?.medium ?? 0,
      hard: progressData?.hard ?? 0,
      total: progressData?.total ?? solveMap.size,
    },
    ranking: profileData?.ranking ?? null,
  });
}
