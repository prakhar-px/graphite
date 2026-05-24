import { leetcodeGraphQL } from "@/lib/leetcode/graphql-client";
import type { LeetCodeQuestionMeta, ProblemDifficulty } from "@/types/problem-log";

const QUESTION_BY_SLUG = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      questionFrontendId
      title
      titleSlug
      difficulty
      topicTags {
        name
        slug
      }
    }
  }
`;

function normalizeDifficulty(value: string): ProblemDifficulty {
  const d = value.toLowerCase();
  if (d === "easy") return "Easy";
  if (d === "hard") return "Hard";
  return "Medium";
}

export async function fetchQuestionBySlug(
  titleSlug: string
): Promise<LeetCodeQuestionMeta | null> {
  const data = await leetcodeGraphQL<{
    question: {
      questionId: string;
      questionFrontendId: number;
      title: string;
      titleSlug: string;
      difficulty: string;
      topicTags: { name: string; slug: string }[];
    } | null;
  }>(QUESTION_BY_SLUG, { titleSlug });

  const q = data.question;
  if (!q) return null;

  return {
    questionId: q.questionId,
    questionFrontendId: q.questionFrontendId,
    title: q.title,
    titleSlug: q.titleSlug,
    difficulty: normalizeDifficulty(q.difficulty),
    topicTags: q.topicTags?.map((t) => t.name) ?? [],
    url: `https://leetcode.com/problems/${q.titleSlug}/`,
  };
}
