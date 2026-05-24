"use client";

import { ExternalLink, Lightbulb, Target, TrendingUp } from "lucide-react";
import type { AiCoachResponse } from "@/types/ai-coach";
import { Badge } from "@/components/ui/badge";
import { PremiumCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";

const difficultyClass: Record<string, string> = {
  Easy: "border-green-500/40 text-green-400",
  Medium: "border-amber-500/40 text-amber-400",
  Hard: "border-red-500/40 text-red-400",
};

export function CoachReport({ report }: { report: AiCoachResponse }) {
  return (
    <div className="space-y-6">
      <PremiumCard glow className="bg-gradient-to-br from-violet-950/30 to-zinc-900/60">
        <p className="text-sm font-medium text-violet-300">Summary</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">{report.summary}</p>
        {report.studyPlanNote ? (
          <p className="mt-3 text-xs text-zinc-500">{report.studyPlanNote}</p>
        ) : null}
      </PremiumCard>

      {report.statsHighlights.length > 0 ? (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <TrendingUp className="h-4 w-4 text-violet-400" />
            Stats & insights
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {report.statsHighlights.map((stat) => (
              <PremiumCard key={stat.label} className="p-4">
                <p className="text-xs text-zinc-500">{stat.label}</p>
                <p className="mt-1 text-lg font-semibold text-zinc-100">{stat.value}</p>
                <p className="mt-1 text-xs text-zinc-400">{stat.insight}</p>
              </PremiumCard>
            ))}
          </div>
        </section>
      ) : null}

      {report.insights.length > 0 ? (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            Key insights
          </h3>
          <ul className="space-y-2">
            {report.insights.map((insight, i) => (
              <li
                key={i}
                className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-300"
              >
                {insight}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {report.nextProblems.length > 0 ? (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <Target className="h-4 w-4 text-green-400" />
            Suggested next problems
          </h3>
          <div className="space-y-3">
            {report.nextProblems.map((problem) => (
              <PremiumCard key={`${problem.titleSlug}-${problem.title}`} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-zinc-100">{problem.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">{problem.reason}</p>
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
                  className="mt-3 inline-flex items-center gap-1 text-xs text-violet-400 hover:underline"
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
          <h3 className="mb-2 text-sm font-semibold text-zinc-200">Focus next 48h</h3>
          <div className="flex flex-wrap gap-2">
            {report.focusAreas.map((area) => (
              <Badge key={area} className="bg-violet-600/20 text-violet-200">
                {area}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}

      {report.weeklyAdvice ? (
        <PremiumCard>
          <p className="text-sm font-medium text-zinc-200">Weekly pacing</p>
          <p className="mt-2 text-sm text-zinc-400">{report.weeklyAdvice}</p>
        </PremiumCard>
      ) : null}
    </div>
  );
}
