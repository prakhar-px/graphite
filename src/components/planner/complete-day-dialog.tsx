"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Edit3, ListPlus } from "lucide-react";
import type { DailyPlanDay } from "@/types";
import type { MissionQuestionEntry } from "@/types/mission-completion";
import { LogProblemDialog } from "@/components/planner/log-problem-dialog";
import {
  MissionQuestionConfidence,
  initQuestionEntries,
} from "@/components/planner/mission-question-confidence";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppStore } from "@/store/app-store";

interface CompleteDayDialogProps {
  day: DailyPlanDay;
  disabled?: boolean;
}

type Step = "menu" | "rough" | "actual";

export function CompleteDayDialog({ day, disabled }: CompleteDayDialogProps) {
  const roughlyCompleteMission = useAppStore((s) => s.roughlyCompleteMission);
  const completeMissionWithQuestions = useAppStore(
    (s) => s.completeMissionWithQuestions
  );
  const setDayStatus = useAppStore((s) => s.setDayStatus);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("menu");
  const [detailedOpen, setDetailedOpen] = useState(false);
  const [roughEntries, setRoughEntries] = useState<MissionQuestionEntry[]>(() =>
    initQuestionEntries(day.suggestedQuestions, day.defaultConfidence)
  );
  const [actualSelected, setActualSelected] = useState<Set<string>>(
    () => new Set(day.suggestedQuestions)
  );
  const [actualEntries, setActualEntries] = useState<MissionQuestionEntry[]>(() =>
    initQuestionEntries(day.suggestedQuestions, day.defaultConfidence)
  );

  const resetFlow = () => {
    setStep("menu");
    setRoughEntries(initQuestionEntries(day.suggestedQuestions, day.defaultConfidence));
    setActualSelected(new Set(day.suggestedQuestions));
    setActualEntries(initQuestionEntries(day.suggestedQuestions, day.defaultConfidence));
  };

  const actualEntriesToSubmit = useMemo(
    () => actualEntries.filter((e) => actualSelected.has(e.title)),
    [actualEntries, actualSelected]
  );

  const toggleActual = (title: string) => {
    setActualSelected((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const finishRough = () => {
    roughlyCompleteMission(day.day, roughEntries);
    setOpen(false);
    resetFlow();
  };

  const finishActual = () => {
    completeMissionWithQuestions(day.day, actualEntriesToSubmit);
    setOpen(false);
    resetFlow();
  };

  const openDetailed = () => {
    setDayStatus(day.day, "completed");
    setOpen(false);
    setDetailedOpen(true);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) resetFlow();
        }}
      >
        <DialogTrigger
          render={
            <Button
              size="sm"
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50"
              disabled={disabled}
            />
          }
        >
          {disabled ? "Completed" : "Complete Mission"}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md" showCloseButton>
          {step === "menu" ? (
            <>
              <DialogHeader>
                <DialogTitle>Complete today&apos;s mission?</DialogTitle>
                <DialogDescription>
                  Log confidence per suggested problem, or open detailed LeetCode
                  logging.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setStep("rough")}
                  className="flex w-full items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-left transition hover:border-emerald-400/50"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    <span className="block text-sm font-medium text-[var(--gp-text)]">
                      Roughly completed
                    </span>
                    <span className="text-xs text-[var(--gp-text-faint)]">
                      Rate confidence for each suggested problem you did.
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep("actual")}
                  className="flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition hover:border-violet-500/50"
                  style={{ borderColor: "var(--gp-border)", backgroundColor: "var(--gp-surface)" }}
                >
                  <Edit3 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  <span>
                    <span className="block text-sm font-medium text-[var(--gp-text)]">
                      Actual count
                    </span>
                    <span className="text-xs text-[var(--gp-text-faint)]">
                      Select which problems you solved and set confidence each.
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={openDetailed}
                  className="flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition hover:border-blue-500/50"
                  style={{ borderColor: "var(--gp-border)", backgroundColor: "var(--gp-surface)" }}
                >
                  <ListPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>
                    <span className="block text-sm font-medium text-[var(--gp-text)]">
                      Log detailed problems
                    </span>
                    <span className="text-xs text-[var(--gp-text-faint)]">
                      LeetCode lookup with notes and revision flags.
                    </span>
                  </span>
                </button>
              </div>
            </>
          ) : null}

          {step === "rough" ? (
            <>
              <DialogHeader>
                <DialogTitle>Roughly completed</DialogTitle>
                <DialogDescription>
                  {day.suggestedQuestions.length === 1
                    ? "Set your confidence for today's problem."
                    : "Set confidence for each suggested problem."}
                </DialogDescription>
              </DialogHeader>
              <MissionQuestionConfidence
                questions={day.suggestedQuestions}
                entries={roughEntries}
                onChange={setRoughEntries}
                defaultConfidence={day.defaultConfidence}
              />
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setStep("menu")}>
                  Back
                </Button>
                <Button type="button" className="flex-1" onClick={finishRough}>
                  Complete mission
                </Button>
              </div>
            </>
          ) : null}

          {step === "actual" ? (
            <>
              <DialogHeader>
                <DialogTitle>What did you solve?</DialogTitle>
                <DialogDescription>
                  Check each problem you completed and rate confidence individually.
                </DialogDescription>
              </DialogHeader>
              <MissionQuestionConfidence
                questions={day.suggestedQuestions}
                entries={actualEntries}
                onChange={setActualEntries}
                selectable
                selectedTitles={actualSelected}
                onToggleSelect={toggleActual}
                defaultConfidence={day.defaultConfidence}
              />
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setStep("menu")}>
                  Back
                </Button>
                <Button type="button" className="flex-1" onClick={finishActual}>
                  Save ({actualEntriesToSubmit.length} problem
                  {actualEntriesToSubmit.length === 1 ? "" : "s"})
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <LogProblemDialog
        plannerDay={day.day}
        open={detailedOpen}
        onOpenChange={setDetailedOpen}
        onBack={() => {
          setDetailedOpen(false);
          setOpen(true);
          setStep("menu");
        }}
      />
    </>
  );
}
