"use client";

import { PremiumCard } from "@/components/ui/premium-card";

export function AiSettingsPanel() {
  return (
    <PremiumCard>
      <h3 className="font-semibold text-[var(--gp-text)]">AI Coach (Google Gemini)</h3>
      <p className="mt-2 text-sm text-[var(--gp-text-muted)]">
        The API key stays on the server only. Get a key from{" "}
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="text-violet-600 dark:text-violet-400 hover:underline"
        >
          Google AI Studio
        </a>
        , add it to{" "}
        <code
          className="rounded px-1 text-xs text-[var(--gp-text)]"
          style={{ backgroundColor: "var(--gp-surface-raised)" }}
        >
          .env.local
        </code>{" "}
        as{" "}
        <code
          className="rounded px-1 text-xs text-[var(--gp-text)]"
          style={{ backgroundColor: "var(--gp-surface-raised)" }}
        >
          GEMINI_API_KEY
        </code>
        , then restart{" "}
        <code
          className="rounded px-1 text-xs text-[var(--gp-text)]"
          style={{ backgroundColor: "var(--gp-surface-raised)" }}
        >
          npm run dev
        </code>
        .
      </p>
      <p className="mt-2 text-xs text-[var(--gp-text-faint)]">
        Optional:{" "}
        <code
          className="rounded px-1 text-[var(--gp-text-muted)]"
          style={{ backgroundColor: "var(--gp-surface-raised)" }}
        >
          GEMINI_MODEL
        </code>{" "}
        (default{" "}
        <code
          className="rounded px-1 text-[var(--gp-text-muted)]"
          style={{ backgroundColor: "var(--gp-surface-raised)" }}
        >
          gemini-2.5-flash
        </code>
        ). Test:{" "}
        <code
          className="rounded px-1 text-[var(--gp-text-muted)]"
          style={{ backgroundColor: "var(--gp-surface-raised)" }}
        >
          /api/ai/health
        </code>
      </p>
    </PremiumCard>
  );
}
