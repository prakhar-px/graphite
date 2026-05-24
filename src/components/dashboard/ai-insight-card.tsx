"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { AiCoachPanel } from "@/components/ai/ai-coach-panel";
import { PremiumCard } from "@/components/ui/premium-card";

export function AiInsightCard() {
  return (
    <PremiumCard
      glow
      className="bg-gradient-to-br from-violet-950/40 to-zinc-900/60"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-400" />
          <p className="font-semibold text-zinc-100">AI Coach</p>
        </div>
        <Link
          href="/coach"
          className="inline-flex h-7 items-center rounded-lg border border-zinc-700 bg-zinc-900/50 px-2.5 text-[0.8rem] font-medium text-zinc-200 hover:bg-zinc-800"
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
