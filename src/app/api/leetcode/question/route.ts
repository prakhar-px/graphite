import { NextResponse } from "next/server";
import { fetchQuestionBySlug } from "@/lib/leetcode/graphql";
import { parseQuestionInput } from "@/lib/leetcode/parse-input";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ error: "Missing query parameter q" }, { status: 400 });
  }

  const parsed = parseQuestionInput(q);
  if (!parsed) {
    return NextResponse.json({ error: "Could not parse question input" }, { status: 400 });
  }

  const slug =
    parsed.kind === "slug"
      ? parsed.slug
      : parsed.kind === "title"
        ? parsed.slugGuess
        : parsed.titleGuess
          ? parsed.titleGuess
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "")
          : "";

  if (!slug) {
    return NextResponse.json({ error: "Could not resolve question slug" }, { status: 400 });
  }

  try {
    const meta = await fetchQuestionBySlug(slug);
    if (!meta) {
      return NextResponse.json(
        { error: `Question not found for slug: ${slug}` },
        { status: 404 }
      );
    }
    return NextResponse.json({ meta, parsed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
