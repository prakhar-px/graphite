import { NextResponse } from "next/server";
import { buildAiCoachContext } from "@/lib/ai/build-context";
import { AiServiceError } from "@/lib/ai/errors";
import { generateCoachReport } from "@/lib/ai/gemini-client";
import type { AiCoachMode, AiCoachRequest } from "@/types/ai-coach";

const MODES: AiCoachMode[] = ["full", "next-problems", "insights", "stats"];

export async function POST(request: Request) {
  const hasKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim()?.startsWith("AIza");

  if (!hasKey) {
    return NextResponse.json(
      {
        error:
          "AI Coach is not configured. Set GEMINI_API_KEY (or GOOGLE_API_KEY) as an environment variable and redeploy/restart.",
        code: "missing_api_key",
      },
      { status: 503 }
    );
  }

  let body: AiCoachRequest;
  try {
    body = (await request.json()) as AiCoachRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const mode = body.mode ?? "full";
  if (!MODES.includes(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  if (!body.snapshot?.dayStatuses) {
    return NextResponse.json({ error: "Missing snapshot" }, { status: 400 });
  }

  try {
    const contextJson = buildAiCoachContext({
      ...body.snapshot,
      leetcodeUsername: body.leetcodeUsername,
      activeTopic: body.activeTopic,
      plannerSelectedDay: body.plannerSelectedDay,
    });

    const report = await generateCoachReport(contextJson, mode);

    return NextResponse.json({
      mode,
      generatedAt: new Date().toISOString(),
      report,
    });
  } catch (error) {
    if (error instanceof AiServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.httpStatus }
      );
    }
    const message = error instanceof Error ? error.message : "AI request failed";
    return NextResponse.json({ error: message, code: "unknown" }, { status: 502 });
  }
}
