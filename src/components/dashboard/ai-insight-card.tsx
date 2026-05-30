"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { AiCoachPanel } from "@/components/ai/ai-coach-panel";
import { PremiumCard } from "@/components/ui/premium-card";

export function AiInsightCard() {
  return (
    <PremiumCard
      glow
      className="bg-gradient-to-br from-violet-500/8 to-transparent dark:from-violet-950/40 dark:to-zinc-900/60"
    >
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b pb-4"
        style={{ borderColor: "var(--gp-border)" }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-500 dark:text-violet-400" />
          <p className="font-semibold text-[var(--gp-text)]">AI Coach</p>
        </div>
        <Link
          href="/coach"
          className="inline-flex h-7 items-center rounded-lg border px-2.5 text-[0.8rem] font-medium text-[var(--gp-text)] hover:bg-[var(--gp-surface)] transition-colors"
          style={{ borderColor: "var(--gp-border)" }}
        >
          Full coach
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="mt-4">
        <AiCoachPanel defaultMode="insights" compact />
      </div>
    </PremiumCard>
  );
}
