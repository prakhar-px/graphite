"use client";

import { useEffect } from "react";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import type { AiCoachMode } from "@/types/ai-coach";
import { useAiCoach } from "@/hooks/use-ai-coach";
import { useAppStore, useUserSnapshot } from "@/store/app-store";
import { CoachReport } from "@/components/ai/coach-report";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";

const MODES: { id: AiCoachMode; label: string; description: string }[] = [
  { id: "full", label: "Full report", description: "Insights, stats, and problem picks" },
  { id: "next-problems", label: "Next problems", description: "5 LeetCode suggestions" },
  { id: "insights", label: "Insights", description: "Gaps, patterns, focus areas" },
  { id: "stats", label: "Stats", description: "Performance highlights" },
];

type AiCoachPanelProps = {
  defaultMode?: AiCoachMode;
  autoRun?: boolean;
  compact?: boolean;
};

export function AiCoachPanel({
  defaultMode = "full",
  autoRun = false,
  compact = false,
}: AiCoachPanelProps) {
  const snapshot = useUserSnapshot();
  const leetcodeUsername = useAppStore((s) => s.leetcodeUsername);
  const activeTopic = useAppStore((s) => s.activeTopic);
  const plannerSelectedDay = useAppStore((s) => s.plannerSelectedDay);
  const { loading, error, errorCode, report, generatedAt, mode, fetchCoach } =
    useAiCoach();

  const run = (selectedMode: AiCoachMode = defaultMode) => {
    void fetchCoach(
      {
        ...snapshot,
        leetcodeUsername,
        activeTopic,
        plannerSelectedDay,
      },
      selectedMode
    );
  };

  useEffect(() => {
    if (autoRun && !report && !loading && !error) {
      run(defaultMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun]);

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-500 dark:text-violet-400" />
          <div>
            <p className="font-semibold text-[var(--gp-text)]">AI Coach</p>
            {!compact ? (
              <p className="text-xs text-[var(--gp-text-faint)]">
                Personalized from your planner, log, and revision data
              </p>
            ) : null}
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={loading}
          onClick={() => run(mode ?? defaultMode)}
          className="bg-violet-600 hover:bg-violet-500"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              {report ? "Refresh" : "Generate"}
            </>
          )}
        </Button>
      </div>

      {!compact ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              disabled={loading}
              onClick={() => run(m.id)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left transition-colors",
                (mode ?? defaultMode) === m.id
                  ? "border-violet-500/50 bg-violet-500/10"
                  : "border-[var(--gp-border)] hover:border-[var(--gp-text-faint)]"
              )}
              style={
                (mode ?? defaultMode) !== m.id
                  ? { backgroundColor: "var(--gp-surface)" }
                  : undefined
              }
            >
              <p className="text-sm font-medium text-[var(--gp-text)]">{m.label}</p>
              <p className="text-xs text-[var(--gp-text-faint)]">{m.description}</p>
            </button>
          ))}
        </div>
      ) : null}

      {error ? (
        <PremiumCard className="border-red-500/40 bg-red-500/8">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          {errorCode === "rate_limit" ? (
            <p className="mt-2 text-xs text-[var(--gp-text-faint)]">
              Gemini quota or rate limit — wait a minute or check{" "}
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-violet-600 dark:text-violet-400 hover:underline"
              >
                Google AI Studio
              </a>
              .
            </p>
          ) : errorCode === "invalid_api_key" || errorCode === "missing_api_key" ? (
            <p className="mt-2 text-xs text-[var(--gp-text-faint)]">
              Set GEMINI_API_KEY in `.env.local` and restart `npm run dev`.
            </p>
          ) : (
            <p className="mt-2 text-xs text-[var(--gp-text-faint)]">
              Test setup: open{" "}
              <a href="/api/ai/health" className="text-violet-600 dark:text-violet-400 hover:underline">
                /api/ai/health
              </a>{" "}
              in the browser after restarting the dev server.
            </p>
          )}
        </PremiumCard>
      ) : null}

      {!report && !loading && !error ? (
        <PremiumCard className="text-center">
          <p className="text-sm text-[var(--gp-text-muted)]">
            Generate a coaching report based on your current progress.
          </p>
        </PremiumCard>
      ) : null}

      {loading && !report ? (
        <PremiumCard className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500 dark:text-violet-400" />
        </PremiumCard>
      ) : null}

      {report ? (
        <>
          {generatedAt ? (
            <p className="text-xs text-[var(--gp-text-faint)]">
              Generated {new Date(generatedAt).toLocaleString()}
              {mode ? ` · ${mode}` : ""}
            </p>
          ) : null}
          <CoachReport report={report} />
        </>
      ) : null}
    </div>
  );
}
