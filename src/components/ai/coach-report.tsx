"use client";

import { ExternalLink, Lightbulb, Target, TrendingUp } from "lucide-react";
import type { AiCoachResponse } from "@/types/ai-coach";
import { Badge } from "@/components/ui/badge";
import { PremiumCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";

const difficultyClass: Record<string, string> = {
  Easy: "border-green-500/40 text-green-600 dark:text-green-400",
  Medium: "border-amber-500/40 text-amber-600 dark:text-amber-400",
  Hard: "border-red-500/40 text-red-600 dark:text-red-400",
};

export function CoachReport({ report }: { report: AiCoachResponse }) {
  return (
    <div className="space-y-6">
      <PremiumCard glow className="bg-gradient-to-br from-violet-500/8 to-transparent dark:from-violet-950/30 dark:to-zinc-900/60">
        <p className="text-sm font-medium text-violet-600 dark:text-violet-300">Summary</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--gp-text-muted)]">{report.summary}</p>
        {report.studyPlanNote ? (
          <p className="mt-3 text-xs text-[var(--gp-text-faint)]">{report.studyPlanNote}</p>
        ) : null}
      </PremiumCard>

      {report.statsHighlights.length > 0 ? (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--gp-text)]">
            <TrendingUp className="h-4 w-4 text-violet-500 dark:text-violet-400" />
            Stats & insights
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {report.statsHighlights.map((stat) => (
              <PremiumCard key={stat.label} className="p-4">
                <p className="text-xs text-[var(--gp-text-faint)]">{stat.label}</p>
                <p className="mt-1 text-lg font-semibold text-[var(--gp-text)]">{stat.value}</p>
                <p className="mt-1 text-xs text-[var(--gp-text-muted)]">{stat.insight}</p>
              </PremiumCard>
            ))}
          </div>
        </section>
      ) : null}

      {report.insights.length > 0 ? (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--gp-text)]">
            <Lightbulb className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            Key insights
          </h3>
          <ul className="space-y-2">
            {report.insights.map((insight, i) => (
              <li
                key={i}
                className="rounded-lg border px-3 py-2 text-sm text-[var(--gp-text-muted)]"
                style={{
                  borderColor: "var(--gp-border)",
                  backgroundColor: "var(--gp-surface)",
                }}
              >
                {insight}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {report.nextProblems.length > 0 ? (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--gp-text)]">
            <Target className="h-4 w-4 text-green-500 dark:text-green-400" />
            Suggested next problems
          </h3>
          <div className="space-y-3">
            {report.nextProblems.map((problem) => (
              <PremiumCard key={`${problem.titleSlug}-${problem.title}`} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[var(--gp-text)]">{problem.title}</p>
                    <p className="mt-1 text-xs text-[var(--gp-text-faint)]">{problem.reason}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(difficultyClass[problem.difficulty] ?? "")}
                  >
                    {problem.difficulty}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {problem.topics.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <a
                  href={problem.leetcodeUrl ?? `https://leetcode.com/problems/${problem.titleSlug}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:underline"
                >
                  Open on LeetCode
                  <ExternalLink className="h-3 w-3" />
                </a>
              </PremiumCard>
            ))}
          </div>
        </section>
      ) : null}

      {report.focusAreas.length > 0 ? (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-[var(--gp-text)]">Focus next 48h</h3>
          <div className="flex flex-wrap gap-2">
            {report.focusAreas.map((area) => (
              <Badge key={area} className="bg-violet-500/15 text-violet-700 dark:text-violet-200">
                {area}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}

      {report.weeklyAdvice ? (
        <PremiumCard>
          <p className="text-xs text-[var(--gp-text-faint)]">Weekly advice</p>
          <p className="mt-2 text-sm text-[var(--gp-text-muted)]">{report.weeklyAdvice}</p>
        </PremiumCard>
      ) : null}
    </div>
  );
}
