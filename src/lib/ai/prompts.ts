import type { AiCoachMode } from "@/types/ai-coach";

const SYSTEM_BASE = `You are Graphite AI Coach — an expert FAANG DSA mentor embedded in a 70-day preparation dashboard.
Use ONLY the JSON context provided. Be specific, actionable, and honest about gaps.
Prefer LeetCode problems with real titleSlug values (kebab-case). Do not invent fake problem names.
Avoid repeating problems already in alreadySolvedSlugs unless recommending a spaced revision with a clear reason.
Output valid JSON only — no markdown fences.`;

const RESPONSE_SCHEMA = `{
  "summary": "2-3 sentence executive summary",
  "insights": ["3-6 bullet insights about patterns, gaps, momentum"],
  "statsHighlights": [
    { "label": "string", "value": "string", "insight": "one line interpretation" }
  ],
  "nextProblems": [
    {
      "title": "Problem Title",
      "titleSlug": "kebab-slug",
      "difficulty": "Easy|Medium|Hard",
      "reason": "why this problem now",
      "topics": ["tag1","tag2"],
      "leetcodeUrl": "https://leetcode.com/problems/slug/"
    }
  ],
  "focusAreas": ["2-4 focus areas for next 48 hours"],
  "weeklyAdvice": "paragraph on weekly pacing",
  "studyPlanNote": "optional alignment with today's planner topic"
}`;

export function getCoachSystemPrompt(mode: AiCoachMode): string {
  const modeHint =
    mode === "next-problems"
      ? "Emphasize nextProblems (5 items). Keep other fields brief."
      : mode === "insights"
        ? "Emphasize insights and focusAreas. nextProblems: 2-3 only."
        : mode === "stats"
          ? "Emphasize statsHighlights (5-7) and weeklyAdvice."
          : "Balanced full report: 5 nextProblems, rich insights.";

  return `${SYSTEM_BASE}\n${modeHint}\n\nRespond with this JSON shape:\n${RESPONSE_SCHEMA}`;
}

export function getCoachUserPrompt(contextJson: string, mode: AiCoachMode): string {
  return `Mode: ${mode}\n\nUser context:\n${contextJson}`;
}
