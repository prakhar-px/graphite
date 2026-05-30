import { NextResponse } from "next/server";
import { fetchQuestionBySlug } from "@/lib/leetcode/graphql";
import {
  fetchRecentAcceptedSubmissions,
  submissionTimestampToIso,
} from "@/lib/leetcode/submissions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();
  const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  try {
    const accepted = await fetchRecentAcceptedSubmissions(username, limit);
    const enriched = [];

    for (const item of accepted) {
      const solvedAt = submissionTimestampToIso(item.timestamp);

      try {
        const meta = await fetchQuestionBySlug(item.titleSlug);
        if (meta) {
          enriched.push({
            ...meta,
            solvedAt,
            submissionId: item.id,
            lang: item.lang,
            source: "leetcode-sync" as const,
          });
          continue;
        }
      } catch {
        // fall through to minimal payload
      }

      enriched.push({
        questionId: item.id,
        title: item.title,
        titleSlug: item.titleSlug,
        difficulty: "Medium" as const,
        topicTags: [],
        url: `https://leetcode.com/problems/${item.titleSlug}/`,
        solvedAt,
        submissionId: item.id,
        lang: item.lang,
        source: "leetcode-sync" as const,
      });
    }

    return NextResponse.json({ username, items: enriched });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
