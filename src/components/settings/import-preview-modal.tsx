"use client";

import { useState } from "react";
import { BarChart3, Clock, Loader2, Repeat, Trophy } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";

type ProblemBrief = {
  titleSlug: string;
  title: string;
  solveCount: number;
  timestamps: number[];
  languages: string[];
};

type RepeatedProblem = ProblemBrief & { maxGapDays: number };

type TelemetryData = {
  username: string;
  totalAccepted: number;
  totalSubmissions: number;
  allProblems: ProblemBrief[];
  repeated: RepeatedProblem[];
  repeatedCount: number;
  revisionTimeGaps: number;
  activeDays: number;
  topics: Array<{ tag: string; count: number }>;
  difficultyBreakdown: { easy: number; medium: number; hard: number; total: number };
  ranking: number | null;
};

interface ImportPreviewModalProps {
  data: TelemetryData;
  onClose: () => void;
}

export function ImportPreviewModal({ data, onClose }: ImportPreviewModalProps) {
  const addSolvedProblem = useAppStore((s) => s.addSolvedProblem);
  const problemLog = useAppStore((s) => s.problemLog);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [mode, setMode] = useState<"all" | "revisions">("all");

  const existingSlugs = new Set(problemLog.map((p) => p.titleSlug).filter(Boolean));

  const fetchMeta = async (slug: string) => {
    const res = await fetch(`/api/leetcode/question?q=${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    const body = await res.json();
    return body.meta ?? null;
  };

  const handleImport = async () => {
    setImporting(true);
    setResult(null);

    const batch = mode === "revisions" ? data.repeated : data.allProblems;
    let added = 0;
    let skipped = 0;

    for (const problem of batch) {
      if (existingSlugs.has(problem.titleSlug) && problem.solveCount === 1) {
        skipped++;
        continue;
      }

      const meta = await fetchMeta(problem.titleSlug);
      if (!meta) { skipped++; continue; }

      const timestamps = mode === "revisions"
        ? problem.timestamps.filter((_, i) => i > 0)
        : problem.timestamps;

      for (const ts of timestamps) {
        addSolvedProblem(meta, {
          solvedAt: new Date(ts * 1000).toISOString(),
          source: "leetcode-sync",
        });
        added++;
      }
    }

    setResult(`Imported ${added} solve${added === 1 ? "" : "s"}. ${skipped > 0 ? `${skipped} skipped.` : ""}`);
    setImporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090B]/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-zinc-100">Preparation Intelligence Preview</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Found <span className="text-zinc-200 font-medium">{data.totalAccepted}</span> unique problems across{" "}
            <span className="text-zinc-200 font-medium">{data.totalSubmissions}</span> submissions.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <Repeat className="h-4 w-4 text-violet-400 mb-1" />
            <p className="font-mono text-lg font-bold text-zinc-100">{data.repeatedCount}</p>
            <p className="text-xs text-zinc-500">Repeated solves</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <Clock className="h-4 w-4 text-amber-400 mb-1" />
            <p className="font-mono text-lg font-bold text-zinc-100">{data.revisionTimeGaps}</p>
            <p className="text-xs text-zinc-500">Long-term revisions</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <BarChart3 className="h-4 w-4 text-blue-400 mb-1" />
            <p className="font-mono text-lg font-bold text-zinc-100">{data.activeDays}</p>
            <p className="text-xs text-zinc-500">Active days</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <Trophy className="h-4 w-4 text-emerald-400 mb-1" />
            <p className="font-mono text-lg font-bold text-zinc-100">
              {data.difficultyBreakdown.easy}/{data.difficultyBreakdown.medium}/{data.difficultyBreakdown.hard}
            </p>
            <p className="text-xs text-zinc-500">E / M / H</p>
          </div>
        </div>

        {data.repeated.length > 0 ? (
          <div className="mb-4 max-h-32 overflow-y-auto space-y-1 rounded-xl border border-zinc-800 bg-zinc-900/30 p-2">
            {data.repeated.slice(0, 8).map((r) => (
              <div key={r.titleSlug} className="flex items-center justify-between px-2 py-1">
                <span className="text-xs text-zinc-300 truncate">{r.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-violet-400 font-mono">{r.solveCount}x</span>
                  {r.maxGapDays >= 90 ? (
                    <span className="text-[10px] text-amber-400 font-mono">{r.maxGapDays}d gap</span>
                  ) : null}
                </div>
              </div>
            ))}
            {data.repeated.length > 8 ? (
              <p className="px-2 text-[10px] text-zinc-500">+{data.repeated.length - 8} more</p>
            ) : null}
          </div>
        ) : null}

        {result ? (
          <p className="mb-4 text-sm text-violet-300">{result}</p>
        ) : (
          <div className="flex items-center gap-2 mb-4">
            <Button type="button" size="sm" disabled={importing} onClick={() => setMode("all")} variant={mode === "all" ? "default" : "outline"}>
              Import all
            </Button>
            <Button type="button" size="sm" disabled={importing} onClick={() => setMode("revisions")} variant={mode === "revisions" ? "default" : "outline"}>
              Revisions only
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          {result ? (
            <Button type="button" size="sm" onClick={onClose}>
              Done
            </Button>
          ) : (
            <>
              <Button type="button" size="sm" disabled={importing} onClick={handleImport}>
                {importing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</> : "Confirm import"}
              </Button>
              <Button type="button" size="sm" variant="outline" disabled={importing} onClick={onClose}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
