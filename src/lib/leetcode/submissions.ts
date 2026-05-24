import { leetcodeGraphQL } from "@/lib/leetcode/graphql-client";

export type SubmissionItem = {
  id: string;
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
};

const RECENT_SUBMISSIONS = `
  query getRecentSubmissions($username: String!, $limit: Int) {
    recentSubmissionList(username: $username, limit: $limit) {
      id
      title
      titleSlug
      timestamp
      statusDisplay
      lang
    }
  }
`;

const ALFA_API_BASE =
  process.env.LEETCODE_ALFA_API_URL ?? "https://alfa-leetcode-api.onrender.com";

export function submissionTimestampToIso(timestamp: string): string {
  return new Date(Number(timestamp) * 1000).toISOString();
}

export function submissionDedupeKey(submissionId: string): string {
  return `id:${submissionId}`;
}

async function fetchRecentSubmissionsGraphQL(
  username: string,
  limit: number
): Promise<SubmissionItem[]> {
  const data = await leetcodeGraphQL<{
    recentSubmissionList: SubmissionItem[];
  }>(RECENT_SUBMISSIONS, { username, limit });

  return data.recentSubmissionList ?? [];
}

async function fetchRecentSubmissionsAlfa(
  username: string,
  limit: number
): Promise<SubmissionItem[]> {
  const response = await fetch(
    `${ALFA_API_BASE}/${encodeURIComponent(username)}/submission?limit=${limit}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Alfa LeetCode API error (${response.status})`);
  }

  const json = (await response.json()) as {
    submission?: Array<{
      title: string;
      titleSlug: string;
      timestamp: string;
      statusDisplay: string;
      lang: string;
    }>;
  };

  return (json.submission ?? []).map((item) => ({
    id: `${item.titleSlug}-${item.timestamp}`,
    title: item.title,
    titleSlug: item.titleSlug,
    timestamp: item.timestamp,
    statusDisplay: item.statusDisplay,
    lang: item.lang,
  }));
}

/** Last N submissions (max 20 on LeetCode), filtered to Accepted, newest first. */
export async function fetchRecentAcceptedSubmissions(
  username: string,
  limit = 20
): Promise<SubmissionItem[]> {
  const capped = Math.min(20, Math.max(1, limit));
  let submissions: SubmissionItem[];

  try {
    submissions = await fetchRecentSubmissionsGraphQL(username, capped);
  } catch {
    submissions = await fetchRecentSubmissionsAlfa(username, capped);
  }

  return submissions
    .filter((s) => s.statusDisplay === "Accepted")
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
}
