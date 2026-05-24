"use client";

import { PremiumCard } from "@/components/ui/premium-card";

export function AiSettingsPanel() {
  return (
    <PremiumCard>
      <h3 className="font-semibold text-zinc-100">AI Coach (Google Gemini)</h3>
      <p className="mt-2 text-sm text-zinc-400">
        The API key stays on the server only. Get a key from{" "}
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="text-violet-400 hover:underline"
        >
          Google AI Studio
        </a>
        , add it to <code className="rounded bg-zinc-800 px-1 text-xs">.env.local</code>{" "}
        as <code className="rounded bg-zinc-800 px-1 text-xs">GEMINI_API_KEY</code>, then
        restart <code className="rounded bg-zinc-800 px-1 text-xs">npm run dev</code>.
      </p>
      <p className="mt-2 text-xs text-zinc-500">
        Optional: <code className="text-zinc-400">GEMINI_MODEL</code> (default{" "}
        <code className="text-zinc-400">gemini-2.5-flash</code>). Test:{" "}
        <code className="text-zinc-400">/api/ai/health</code>
      </p>
    </PremiumCard>
  );
}
