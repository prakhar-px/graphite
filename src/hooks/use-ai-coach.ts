"use client";

import { useCallback, useState } from "react";
import type { AiCoachMode, AiCoachResponse } from "@/types/ai-coach";
import type { AiCoachContextInput } from "@/lib/ai/build-context";

type CoachState = {
  loading: boolean;
  error: string | null;
  errorCode: string | null;
  report: AiCoachResponse | null;
  generatedAt: string | null;
  mode: AiCoachMode | null;
};

export function useAiCoach() {
  const [state, setState] = useState<CoachState>({
    loading: false,
    error: null,
    errorCode: null,
    report: null,
    generatedAt: null,
    mode: null,
  });

  const fetchCoach = useCallback(async (input: AiCoachContextInput, mode: AiCoachMode) => {
    setState((s) => ({ ...s, loading: true, error: null, errorCode: null }));

    try {
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          snapshot: {
            dayStatuses: input.dayStatuses,
            completedTasks: input.completedTasks,
            solvedProblems: input.solvedProblems,
          },
          leetcodeUsername: input.leetcodeUsername,
          activeTopic: input.activeTopic,
          plannerSelectedDay: input.plannerSelectedDay,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        code?: string;
        report?: AiCoachResponse;
        generatedAt?: string;
        mode?: AiCoachMode;
      };

      if (!response.ok) {
        const err = new Error(data.error ?? "AI Coach request failed") as Error & {
          code?: string;
        };
        err.code = data.code;
        throw err;
      }

      setState({
        loading: false,
        error: null,
        errorCode: null,
        report: data.report ?? null,
        generatedAt: data.generatedAt ?? null,
        mode: data.mode ?? mode,
      });
    } catch (error) {
      const err = error as Error & { code?: string };
      setState({
        loading: false,
        error: err.message ?? "AI Coach request failed",
        errorCode: err.code ?? null,
        report: null,
        generatedAt: null,
        mode: null,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      errorCode: null,
      report: null,
      generatedAt: null,
      mode: null,
    });
  }, []);

  return { ...state, fetchCoach, reset };
}
