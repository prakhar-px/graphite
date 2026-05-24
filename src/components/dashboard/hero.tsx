"use client";

import { Flame, Sparkles, Target } from "lucide-react";
import { getDashboardStats } from "@/lib/data";
import { PremiumCard } from "@/components/ui/premium-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { ToneBadge } from "@/components/ui/tone-badge";
import { useAppStore } from "@/store/app-store";

export function Hero() {
  const dayStatuses = useAppStore((s) => s.dayStatuses);
  const completedTasks = useAppStore((s) => s.completedTasks);
  const stats = getDashboardStats(dayStatuses, completedTasks);

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_320px] 2xl:grid-cols-[1fr_360px]">
      <PremiumCard
        glow
        className="overflow-hidden bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(59,130,246,0.06)_42%,rgba(24,24,27,0.8))]"
      >
        <div className="flex flex-wrap items-center gap-3">
          <ToneBadge tone="violet">Mission Control</ToneBadge>
          <ToneBadge tone="green">Day {stats.completedDays} active</ToneBadge>
        </div>
        <div className="mt-6 max-w-3xl md:mt-8">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-50 md:text-5xl">
            FAANG DSA cockpit
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
            Consistency compounds. Your current sprint is locked on{" "}
            <span className="text-zinc-200">{stats.activeTopic}</span>, with{" "}
            {stats.weeklySolved} problems solved this week.
          </p>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3 md:mt-8">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
            <Flame className="h-5 w-5 text-amber-400" />
            <div className="mt-3 font-mono text-2xl font-bold text-zinc-100 md:text-3xl">
              {stats.streak}
            </div>
            <div className="text-xs text-zinc-500">day streak</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
            <Target className="h-5 w-5 text-violet-400" />
            <div className="mt-3 font-mono text-2xl font-bold text-zinc-100 md:text-3xl">
              {stats.solved}
            </div>
            <div className="text-xs text-zinc-500">problems solved</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <div className="mt-3 font-mono text-2xl font-bold text-zinc-100 md:text-3xl">
              {stats.focusScore}
            </div>
            <div className="text-xs text-zinc-500">focus score</div>
          </div>
        </div>
      </PremiumCard>

      <PremiumCard className="flex flex-col items-center justify-center py-6">
        <ProgressRing
          value={stats.completion}
          size={168}
          stroke={12}
          label="roadmap"
        />
        <div className="mt-5 text-center">
          <div className="text-lg font-semibold text-zinc-100">Ahead of baseline</div>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-500">
            Graph mastery improving. Keep today small, complete, and visible.
          </p>
        </div>
      </PremiumCard>
    </section>
  );
}
