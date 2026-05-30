"use client";

import { useState } from "react";
import { Flame, Sparkles, Target } from "lucide-react";
import { getDashboardStats } from "@/engines/dashboard/selectors";
import { ProblemLogDialog } from "@/components/problems/problem-log-dialog";
import { PremiumCard } from "@/components/ui/premium-card";
import { PulseRing } from "@/components/charts/PulseRing";
import { ToneBadge } from "@/components/ui/tone-badge";
import { useUserSnapshot } from "@/store/app-store";
import { cn } from "@/lib/utils";

export function Hero() {
  const snapshot = useUserSnapshot();
  const stats = getDashboardStats(snapshot);
  const [logOpen, setLogOpen] = useState(false);

  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[1fr_320px] 2xl:grid-cols-[1fr_360px]">
        <PremiumCard
          glow
          className="overflow-hidden bg-[linear-gradient(135deg,rgba(124,58,237,0.14),rgba(59,130,246,0.05)_42%,transparent)]"
        >
          <div className="flex flex-wrap items-center gap-3">
            <ToneBadge tone="violet">Mission Control</ToneBadge>
            <ToneBadge tone="green">Day {stats.completedDays} active</ToneBadge>
          </div>
          <div className="mt-6 max-w-3xl md:mt-8">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--gp-text)] md:text-5xl">
              FAANG DSA cockpit
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--gp-text-muted)] md:text-base">
              Consistency compounds. Your current sprint is locked on{" "}
              <span className="text-[var(--gp-text)]">{stats.activeTopic}</span>, with{" "}
              {stats.weeklySolved} problems solved this week.
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 md:mt-8">
            <div
              className="rounded-2xl border p-4"
              style={{
                backgroundColor: "var(--gp-surface)",
                borderColor: "var(--gp-border)",
              }}
            >
              <Flame className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              <div className="mt-3 font-mono text-2xl font-bold text-[var(--gp-text)] md:text-3xl">
                {stats.streak}
              </div>
              <div className="text-xs text-[var(--gp-text-faint)]">day streak</div>
            </div>
            <button
              type="button"
              onClick={() => setLogOpen(true)}
              className={cn(
                "rounded-2xl border p-4 text-left transition",
                "hover:border-violet-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
              )}
              style={{
                backgroundColor: "var(--gp-surface)",
                borderColor: "var(--gp-border)",
              }}
            >
              <Target className="h-5 w-5 text-violet-500 dark:text-violet-400" />
              <div className="mt-3 font-mono text-2xl font-bold text-[var(--gp-text)] md:text-3xl">
                {stats.solved}
              </div>
              <div className="text-xs text-[var(--gp-text-faint)]">
                problems solved · view log
              </div>
            </button>
            <div
              className="rounded-2xl border p-4"
              title="Based on mission completion, average confidence, and revision consistency."
              style={{
                backgroundColor: "var(--gp-surface)",
                borderColor: "var(--gp-border)",
              }}
            >
              <Sparkles className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              <div className="mt-3 font-mono text-2xl font-bold text-[var(--gp-text)] md:text-3xl">
                {stats.focusScore}
              </div>
              <div className="text-xs text-[var(--gp-text-faint)]">focus score</div>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="flex flex-col items-center justify-center overflow-hidden py-6">
          <PulseRing
            value={stats.completion}
            size={168}
            label="roadmap"
          />
          <div className="mt-5 text-center">
            <div className="text-lg font-semibold text-[var(--gp-text)]">
              {stats.completion >= stats.streak
                ? `${stats.completion}% roadmap done`
                : `${stats.streak}-day streak`}
            </div>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--gp-text-muted)]">
              {stats.completion >= 80
                ? "Final stretch — maintain momentum."
                : stats.streak >= 5
                  ? `${stats.streak} days strong — keep the chain alive.`
                  : `Day ${stats.completedDays} · ${stats.uniqueTracked} unique problems tracked.`}
            </p>
          </div>
        </PremiumCard>
      </section>

      <ProblemLogDialog open={logOpen} onOpenChange={setLogOpen} />
    </>
  );
}
