export type ParsedQuestionInput =
  | { kind: "slug"; slug: string }
  | { kind: "frontendId"; frontendId: number; titleGuess?: string }
  | { kind: "title"; title: string; slugGuess: string };

function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseQuestionInput(raw: string): ParsedQuestionInput | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(/leetcode\.com\/problems\/([^/?#\s]+)/i);
  if (urlMatch?.[1]) {
    return { kind: "slug", slug: urlMatch[1].toLowerCase() };
  }

  const numbered = trimmed.match(/^(\d+)\s*[.)]\s*(.+)$/);
  if (numbered) {
    const frontendId = Number(numbered[1]);
    const titleGuess = numbered[2].trim();
    if (frontendId > 0 && titleGuess) {
      return { kind: "frontendId", frontendId, titleGuess };
    }
  }

  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) {
    return { kind: "slug", slug: trimmed };
  }

  const slugGuess = slugifyTitle(trimmed);
  if (slugGuess) {
    return { kind: "title", title: trimmed, slugGuess };
  }

  return null;
}

export function parseBulkQuestionInput(raw: string): string[] {
  return raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}
