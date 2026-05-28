"use client";

import { isValidElement, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Link2 } from "lucide-react";
import { parseBulkQuestionInput, parseQuestionInput } from "@/lib/leetcode/parse-input";
import { useAppStore } from "@/store/app-store";
import type { LeetCodeQuestionMeta } from "@/types/problem-log";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

type FetchState = "idle" | "loading" | "error";

interface LogProblemDialogProps {
  plannerDay?: number;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onBack?: () => void;
}

export function LogProblemDialog({
  plannerDay,
  trigger,
  open: controlledOpen,
  onOpenChange,
  onBack,
}: LogProblemDialogProps) {
  const addSolvedProblem = useAppStore((s) => s.addSolvedProblem);
  const selectedDay = useAppStore((s) => s.plannerSelectedDay);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [input, setInput] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [preview, setPreview] = useState<LeetCodeQuestionMeta | null>(null);
  const [confidence, setConfidence] = useState("7");
  const [notes, setNotes] = useState("");
  const [timeMinutes, setTimeMinutes] = useState("");
  const [revisionNeeded, setRevisionNeeded] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const lookupRequestRef = useRef(0);

  const day = plannerDay ?? selectedDay;
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const resetForm = useCallback(() => {
    lookupRequestRef.current += 1;
    setInput("");
    setPreview(null);
    setFetchState("idle");
    setFetchError(null);
    setConfidence("7");
    setNotes("");
    setTimeMinutes("");
    setRevisionNeeded(false);
    setBulkStatus(null);
  }, []);

  const fetchMeta = async (query: string): Promise<LeetCodeQuestionMeta | null> => {
    const response = await fetch(`/api/leetcode/question?q=${encodeURIComponent(query)}`);
    const data = (await response.json()) as {
      error?: string;
      meta?: LeetCodeQuestionMeta;
    };
    if (!response.ok || !data.meta) {
      throw new Error(data.error ?? "Could not fetch question");
    }
    return data.meta;
  };

  const handleLookup = useCallback(
    async (query?: string) => {
      const trimmed = (query ?? input).trim();
      if (!trimmed || !parseQuestionInput(trimmed)) return;

      const requestId = ++lookupRequestRef.current;
      setFetchState("loading");
      setFetchError(null);
      setPreview(null);
      setBulkStatus(null);

      try {
        const meta = await fetchMeta(trimmed);
        if (requestId !== lookupRequestRef.current) return;
        setPreview(meta);
        setFetchState("idle");
      } catch (error) {
        if (requestId !== lookupRequestRef.current) return;
        setFetchState("error");
        setFetchError(error instanceof Error ? error.message : "Lookup failed");
      }
    },
    [input]
  );

  useEffect(() => {
    if (!open || bulkMode) return;

    const trimmed = input.trim();
    if (!trimmed || !parseQuestionInput(trimmed)) {
      return;
    }

    const timer = window.setTimeout(() => {
      void handleLookup(trimmed);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [open, bulkMode, input, handleLookup]);

  const handleBulkImport = async () => {
    const lines = parseBulkQuestionInput(input);
    if (lines.length === 0) return;

    setSaving(true);
    setBulkStatus(null);
    let added = 0;
    let skipped = 0;
    let failed = 0;

    for (const line of lines) {
      try {
        const meta = await fetchMeta(line);
        if (!meta) {
          failed += 1;
          continue;
        }
        const result = addSolvedProblem(meta, {
          plannerDay: day,
          confidence: Number(confidence) || undefined,
        });
        if (result.ok) added += 1;
        else skipped += 1;
      } catch {
        failed += 1;
      }
    }

    setBulkStatus(`Added ${added}, skipped ${skipped}, failed ${failed}.`);
    setSaving(false);
    if (added > 0) {
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 1200);
    }
  };

  const handleSave = () => {
    if (!preview) return;
    const result = addSolvedProblem(preview, {
      plannerDay: day,
      confidence: Number(confidence) || undefined,
      notes: notes.trim() || undefined,
      timeMinutes: timeMinutes ? Number(timeMinutes) : undefined,
      revisionNeeded,
    });
    if (result.ok) {
      setOpen(false);
      resetForm();
    } else {
      setFetchError(result.message);
    }
  };

  const difficultyClass =
    preview?.difficulty === "Easy"
      ? "border-green-500/40 text-green-600 dark:text-green-400"
      : preview?.difficulty === "Hard"
        ? "border-red-500/40 text-red-600 dark:text-red-400"
        : "border-amber-500/40 text-amber-600 dark:text-amber-400";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      {trigger && isValidElement(trigger) ? (
        <DialogTrigger render={trigger} />
      ) : trigger ? (
        <DialogTrigger>{trigger}</DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-md" showCloseButton>
        {onBack ? (
          <button
            type="button"
            onClick={() => {
              resetForm();
              onBack();
            }}
            className="mb-2 flex items-center gap-1.5 text-xs text-[var(--gp-text-faint)] transition hover:text-[var(--gp-text-muted)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        ) : null}
        <DialogHeader>
          <DialogTitle>Log LeetCode problem</DialogTitle>
          <DialogDescription>
            Paste a URL, slug, or title — metadata is fetched from LeetCode. You
            only add confidence, notes, and time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[var(--gp-text-faint)]">Day {day}</span>
            <button
              type="button"
              className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
              onClick={() => {
                setBulkMode(!bulkMode);
                setPreview(null);
                setFetchError(null);
              }}
            >
              {bulkMode ? "Single problem" : "Bulk paste"}
            </button>
          </div>

          {bulkMode ? (
            <Textarea
              placeholder={"1. Two Sum\n53. Maximum Subarray\nhttps://leetcode.com/problems/..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={5}
            />
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="https://leetcode.com/problems/two-sum/"
                value={input}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setInput(nextValue);
                  setFetchError(null);
                  if (!nextValue.trim()) setPreview(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleLookup();
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0"
                disabled={
                  !input.trim() ||
                  fetchState === "loading" ||
                  !parseQuestionInput(input.trim())
                }
                onClick={() => void handleLookup()}
                title="Fetch problem metadata"
              >
                {fetchState === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}

          {fetchError ? (
            <p className="text-xs text-red-600 dark:text-red-400">{fetchError}</p>
          ) : null}
          {!bulkMode &&
          input.trim() &&
          !preview &&
          fetchState === "loading" ? (
            <p className="text-xs text-[var(--gp-text-faint)]">Loading problem from LeetCode…</p>
          ) : null}
          {bulkStatus ? (
            <p className="text-xs text-green-600 dark:text-green-400">{bulkStatus}</p>
          ) : null}

          {preview && !bulkMode ? (
            <div
              className="rounded-lg border p-3"
              style={{ borderColor: "var(--gp-border)", backgroundColor: "var(--gp-surface)" }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-[var(--gp-text)]">{preview.title}</p>
                  <a
                    href={preview.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    {preview.titleSlug}
                  </a>
                </div>
                <Badge variant="outline" className={cn(difficultyClass)}>
                  {preview.difficulty}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {preview.topicTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[10px] font-normal"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          {!bulkMode ? (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="mb-1 block text-xs text-[var(--gp-text-faint)]">Confidence</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={confidence}
                  onChange={(e) => setConfidence(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[var(--gp-text-faint)]">Time (min)</label>
                <Input
                  type="number"
                  min={1}
                  placeholder="—"
                  value={timeMinutes}
                  onChange={(e) => setTimeMinutes(e.target.value)}
                />
              </div>
              <div className="col-span-1" />
              <div className="col-span-3">
                <label className="mb-1 block text-xs text-[var(--gp-text-faint)]">Notes / mistakes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Optional"
                />
              </div>
              <button
                type="button"
                onClick={() => setRevisionNeeded((value) => !value)}
                className={cn(
                  "col-span-3 rounded-xl border px-3 py-2 text-left text-xs transition",
                  revisionNeeded
                    ? "border-amber-500/40 bg-amber-500/8 text-amber-700 dark:text-amber-200"
                    : "text-[var(--gp-text-faint)] hover:border-[var(--gp-text-faint)]"
                )}
                style={!revisionNeeded ? { borderColor: "var(--gp-border)" } : undefined}
              >
                {revisionNeeded
                  ? "Revision flagged for this problem"
                  : "Flag for revision if this felt shaky"}
              </button>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          {bulkMode ? (
            <Button
              type="button"
              disabled={!input.trim() || saving}
              onClick={() => void handleBulkImport()}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing…
                </>
              ) : (
                "Import all"
              )}
            </Button>
          ) : (
            <Button
              type="button"
              disabled={!preview || fetchState === "loading"}
              onClick={handleSave}
            >
              {fetchState === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading…
                </>
              ) : (
                "Save to log"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
