"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Command, Link2, Plus, Zap } from "lucide-react";
import { LogProblemDialog } from "@/components/planner/log-problem-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/store/app-store";
import type { ProblemDifficulty, ProblemSource } from "@/types/problem-log";

type LogView = "menu" | "quick" | "manual" | "leetcode";

function DialogBackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="mb-2 flex items-center gap-1.5 text-xs text-[var(--gp-text-faint)] transition hover:text-[var(--gp-text)]"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Back
    </button>
  );
}

export function GlobalLogAction() {
  const selectedDay = useAppStore((state) => state.plannerSelectedDay);
  const quickLogProblemCount = useAppStore((state) => state.quickLogProblemCount);
  const addDetailedProblemLog = useAppStore((state) => state.addDetailedProblemLog);
  const [open, setOpen] = useState(false);
  const [leetcodeOpen, setLeetcodeOpen] = useState(false);
  const [view, setView] = useState<LogView>("menu");
  const [solvedCount, setSolvedCount] = useState("1");
  const [quickConfidence, setQuickConfidence] = useState("7");
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState("");
  const [source, setSource] = useState<ProblemSource>("manual");
  const [difficulty, setDifficulty] = useState<ProblemDifficulty>("medium");
  const [topics, setTopics] = useState("");
  const [confidence, setConfidence] = useState("7");
  const [timeSpentMinutes, setTimeSpentMinutes] = useState("");
  const [notes, setNotes] = useState("");
  const [revisionNeeded, setRevisionNeeded] = useState(false);

  const goMenu = () => setView("menu");

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setView("menu");
  };

  const saveQuick = () => {
    const count = Math.max(0, Math.round(Number(solvedCount) || 0));
    if (count <= 0) return;
    quickLogProblemCount({
      solvedCount: count,
      plannerDay: selectedDay,
      confidence: Number(quickConfidence) || undefined,
      title: `Quick capture · Day ${selectedDay}`,
    });
    setSaved(true);
    window.setTimeout(() => {
      setSaved(false);
      setOpen(false);
      setView("menu");
      setSolvedCount("1");
    }, 650);
  };

  const saveDetailed = () => {
    const result = addDetailedProblemLog({
      title,
      source,
      difficulty,
      topics: topics
        .split(",")
        .map((topic) => topic.trim())
        .filter(Boolean),
      confidence: Number(confidence) || undefined,
      timeSpentMinutes: timeSpentMinutes ? Number(timeSpentMinutes) : undefined,
      notes: notes.trim() || undefined,
      revisionNeeded,
      linkedPlannerDay: selectedDay,
    });
    if (!result.ok) return;
    setTitle("");
    setTopics("");
    setNotes("");
    setTimeSpentMinutes("");
    setRevisionNeeded(false);
    setOpen(false);
    setView("menu");
  };

  const activeClass = "border-violet-500 bg-violet-500/15 text-violet-700 dark:text-violet-200";
  const inactiveClass = "border-[var(--gp-border)] text-[var(--gp-text-faint)] hover:border-[var(--gp-text-faint)]";
  const menuItemClass =
    "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition hover:border-violet-500/50";

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger
          render={
            <motion.button
              type="button"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl border border-violet-400/30 bg-violet-600 px-4 py-3 text-sm font-medium text-white shadow-[0_18px_60px_rgba(124,58,237,0.35)] backdrop-blur transition hover:bg-violet-500"
            />
          }
        >
          <Plus className="h-4 w-4" />
          Log Problems
        </DialogTrigger>
        <DialogContent className="sm:max-w-md" showCloseButton>
          {view === "menu" ? (
            <>
              <DialogHeader>
                <DialogTitle>Quick capture</DialogTitle>
                <DialogDescription>
                  Log actual prep activity without turning it into paperwork.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setView("quick")}
                  className={menuItemClass}
                  style={{ borderColor: "var(--gp-border)", backgroundColor: "var(--gp-surface)" }}
                >
                  <Zap className="h-5 w-5 text-violet-500 dark:text-violet-400" />
                  <span>
                    <span className="block text-sm font-medium text-[var(--gp-text)]">
                      Fast count + confidence
                    </span>
                    <span className="text-xs text-[var(--gp-text-faint)]">
                      Day {selectedDay} · optional 1–10 confidence
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setView("manual")}
                  className={menuItemClass}
                  style={{ borderColor: "var(--gp-border)", backgroundColor: "var(--gp-surface)" }}
                >
                  <span>
                    <span className="block text-sm font-medium text-[var(--gp-text)]">
                      Detailed problem log
                    </span>
                    <span className="text-xs text-[var(--gp-text-faint)]">
                      Titles, topics, notes — re-logging same problem = revision
                    </span>
                  </span>
                  <Command className="ml-auto h-4 w-4 text-[var(--gp-text-faint)]" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setLeetcodeOpen(true);
                  }}
                  className={menuItemClass}
                  style={{ borderColor: "var(--gp-border)", backgroundColor: "var(--gp-surface)" }}
                >
                  <Link2 className="h-5 w-5 shrink-0 text-violet-500 dark:text-violet-400" />
                  <span>
                    <span className="block text-sm font-medium text-[var(--gp-text)]">
                      LeetCode metadata lookup
                    </span>
                    <span className="text-xs text-[var(--gp-text-faint)]">
                      Paste URL, slug, or title — auto-fills difficulty & tags
                    </span>
                  </span>
                </button>
              </div>
            </>
          ) : null}

          {view === "quick" ? (
            <>
              <DialogBackButton onBack={goMenu} />
              <DialogHeader>
                <DialogTitle>Fast telemetry</DialogTitle>
                <DialogDescription>
                  Count + light confidence for heatmap signals.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={solvedCount}
                    onChange={(event) => setSolvedCount(event.target.value)}
                    aria-label="Solved count"
                  />
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={quickConfidence}
                    onChange={(event) => setQuickConfidence(event.target.value)}
                    className="w-24"
                    aria-label="Confidence"
                    placeholder="Conf"
                  />
                </div>
                <Button type="button" className="w-full" onClick={saveQuick}>
                  {saved ? <Check className="h-4 w-4" /> : "Log count"}
                </Button>
                <p className="text-xs text-[var(--gp-text-faint)]">
                  Attaches to Day {selectedDay}. Same problem on another day can be
                  logged again as a revision.
                </p>
              </div>
            </>
          ) : null}

          {view === "manual" ? (
            <>
              <DialogBackButton onBack={goMenu} />
              <DialogHeader>
                <DialogTitle>Detailed telemetry</DialogTitle>
                <DialogDescription>
                  Exact problem data for mastery, revision, and confidence.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Problem title"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={topics}
                    onChange={(event) => setTopics(event.target.value)}
                    placeholder="Topics: arrays, hashing"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={timeSpentMinutes}
                    onChange={(event) => setTimeSpentMinutes(event.target.value)}
                    placeholder="Time min"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["manual", "leetcode", "gfg", "codeforces"] as ProblemSource[]).map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSource(item)}
                        className={`rounded-full border px-3 py-1 text-xs capitalize ${
                          source === item ? activeClass : inactiveClass
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "hard"] as ProblemDifficulty[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setDifficulty(item)}
                      className={`rounded-xl border px-3 py-2 text-xs capitalize ${
                        difficulty === item ? activeClass : inactiveClass
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={confidence}
                  onChange={(event) => setConfidence(event.target.value)}
                  placeholder="Confidence 1-10"
                />
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Notes / mistake pattern"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={() => setRevisionNeeded((value) => !value)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-xs transition ${
                    revisionNeeded
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-200"
                      : inactiveClass
                  }`}
                >
                  {revisionNeeded ? "Revision flagged" : "Flag for revision"}
                </button>
              </div>
              <DialogFooter>
                <Button type="button" disabled={!title.trim()} onClick={saveDetailed}>
                  Save detailed log
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <LogProblemDialog
        plannerDay={selectedDay}
        open={leetcodeOpen}
        onBack={() => {
          setLeetcodeOpen(false);
          setOpen(true);
          setView("menu");
        }}
        onOpenChange={(next) => {
          setLeetcodeOpen(next);
          if (!next) setView("menu");
        }}
      />
    </>
  );
}
