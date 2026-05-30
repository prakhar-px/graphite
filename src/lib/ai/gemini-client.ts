import type { AiCoachMode, AiCoachResponse } from "@/types/ai-coach";
import { AiServiceError, toAiServiceError } from "@/lib/ai/errors";
import { getCoachSystemPrompt, getCoachUserPrompt } from "@/lib/ai/prompts";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

/** Supports old .env.local that used OPENAI_API_KEY for a Google AI Studio key. */
function legacyGeminiKeyFromOpenAiEnv(): string | undefined {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (key?.startsWith("AIza")) return key;
  return undefined;
}

function getApiKey(): string {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    legacyGeminiKeyFromOpenAiEnv();
  if (!apiKey) {
    throw new AiServiceError(
      "GEMINI_API_KEY is not configured. Set it as an environment variable and redeploy/restart.",
      "missing_api_key",
      503
    );
  }
  return apiKey;
}

function getModel(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
}

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  error?: { code?: number; message?: string; status?: string };
};

function parseGeminiError(status: number, body: GeminiGenerateResponse): AiServiceError {
  const message = body.error?.message ?? "Gemini API error";

  if (status === 400 && message.toLowerCase().includes("api key")) {
    return new AiServiceError(
      "Invalid Gemini API key. Check GEMINI_API_KEY in .env.local (Google AI Studio).",
      "invalid_api_key",
      401
    );
  }

  if (status === 403) {
    return new AiServiceError(
      "Gemini API access denied. Enable the Generative Language API for your key.",
      "forbidden",
      403
    );
  }

  if (status === 429) {
    return new AiServiceError(
      "Gemini rate limit or quota exceeded. Wait a moment or check usage in Google AI Studio.",
      "rate_limit",
      429
    );
  }

  return new AiServiceError(message, "gemini_error", status);
}

async function geminiGenerateContent(
  systemPrompt: string,
  userPrompt: string,
  options?: { maxOutputTokens?: number; json?: boolean }
): Promise<string> {
  const apiKey = getApiKey();
  const model = getModel();
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.6,
        ...(options?.maxOutputTokens
          ? { maxOutputTokens: options.maxOutputTokens }
          : {}),
        ...(options?.json !== false ? { responseMimeType: "application/json" } : {}),
      },
    }),
  });

  const body = (await response.json()) as GeminiGenerateResponse;

  if (!response.ok) {
    throw parseGeminiError(response.status, body);
  }

  const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new AiServiceError("Empty response from Gemini", "empty_response", 502);
  }

  return text;
}

function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced?.[1] ?? raw).trim();
}

function parseCoachJson(raw: string): AiCoachResponse {
  const parsed = JSON.parse(extractJson(raw)) as AiCoachResponse;

  if (!parsed.summary || !Array.isArray(parsed.insights)) {
    throw new Error("Invalid AI response shape");
  }

  parsed.nextProblems = (parsed.nextProblems ?? []).map((p) => ({
    ...p,
    leetcodeUrl:
      p.leetcodeUrl ?? `https://leetcode.com/problems/${p.titleSlug}/`,
  }));

  return parsed;
}

export async function generateCoachReport(
  contextJson: string,
  mode: AiCoachMode
): Promise<AiCoachResponse> {
  try {
    const text = await geminiGenerateContent(
      getCoachSystemPrompt(mode),
      getCoachUserPrompt(contextJson, mode)
    );
    return parseCoachJson(text);
  } catch (error) {
    throw toAiServiceError(error);
  }
}

export async function pingGemini(): Promise<{ ok: true; model: string }> {
  try {
    await geminiGenerateContent(
      "Reply with the single word OK.",
      "Say OK",
      { maxOutputTokens: 16, json: false }
    );
    return { ok: true, model: getModel() };
  } catch (error) {
    throw toAiServiceError(error);
  }
}
