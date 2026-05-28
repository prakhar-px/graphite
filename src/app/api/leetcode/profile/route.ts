import { NextResponse } from "next/server";

const GRAPHQL_URL = "https://leetcode.com/graphql";

const MATCHED_USER = `
  query matchedUser($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        reputation
        starRating
      }
      submitStats {
        acSubmissionNum {
          difficulty
          count
        }
      }
      submissionCalendar
    }
  }
`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();

  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
        Origin: "https://leetcode.com",
        "User-Agent":
          "Mozilla/5.0 (compatible; Graphite/1.0; +https://leetcode.com)",
      },
      body: JSON.stringify({
        query: MATCHED_USER,
        variables: { username },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: `LeetCode API error (${response.status})` }, { status: 502 });
    }

    const json = await response.json();
    if (json.errors?.length) {
      return NextResponse.json({ error: json.errors[0].message }, { status: 502 });
    }

    const data = json.data?.matchedUser;
    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const acCounts: Record<string, number> = {};
    let totalSolved = 0;
    for (const item of data.submitStats?.acSubmissionNum ?? []) {
      acCounts[item.difficulty.toLowerCase()] = item.count;
      totalSolved += item.count;
    }

    let calendar: Record<string, number> = {};
    try {
      calendar = JSON.parse(data.submissionCalendar ?? "{}");
    } catch { /* ignore */ }

    return NextResponse.json({
      username: data.username,
      ranking: data.profile?.ranking ?? null,
      reputation: data.profile?.reputation ?? null,
      totalSolved,
      easySolved: acCounts.easy ?? 0,
      mediumSolved: acCounts.medium ?? 0,
      hardSolved: acCounts.hard ?? 0,
      submissionCalendar: calendar,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
