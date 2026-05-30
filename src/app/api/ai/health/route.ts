import { NextResponse } from "next/server";
import { AiServiceError } from "@/lib/ai/errors";
import { pingGemini } from "@/lib/ai/gemini-client";

export async function GET() {
  const hasKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim()?.startsWith("AIza");

  if (!hasKey) {
    return NextResponse.json(
      {
        ok: false,
        code: "missing_api_key",
        error: "GEMINI_API_KEY is not set",
      },
      { status: 503 }
    );
  }

  try {
    const result = await pingGemini();
    return NextResponse.json({ ok: true, provider: "gemini", model: result.model });
  } catch (error) {
    if (error instanceof AiServiceError) {
      return NextResponse.json(
        { ok: false, code: error.code, error: error.message },
        { status: error.httpStatus }
      );
    }
    return NextResponse.json(
      { ok: false, code: "unknown", error: "Health check failed" },
      { status: 502 }
    );
  }
}
