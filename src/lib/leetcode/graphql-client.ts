const GRAPHQL_URL = "https://leetcode.com/graphql";

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

export async function leetcodeGraphQL<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
      Origin: "https://leetcode.com",
      "User-Agent":
        "Mozilla/5.0 (compatible; Graphite/1.0; +https://leetcode.com)",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`LeetCode API error (${response.status})`);
  }

  const json = (await response.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? "LeetCode GraphQL error");
  }
  if (!json.data) {
    throw new Error("Empty LeetCode response");
  }

  return json.data;
}
