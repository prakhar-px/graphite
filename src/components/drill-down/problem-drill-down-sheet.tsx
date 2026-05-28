"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { ProblemRevisionState } from "@/engines/revision/selectors";

interface ProblemDrillDownSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  problems: ProblemRevisionState[];
}

export function ProblemDrillDownSheet({
  open,
  onOpenChange,
  title,
  problems,
}: ProblemDrillDownSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{problems.length} problems</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-1.5">
            {problems.map((p) => (
              <div
                key={p.identityKey}
                className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-3 py-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-200">
                      {p.title}
                    </p>
                    <p className="text-xs text-zinc-500">{p.parentTopic}</p>
                  </div>
                  <span className="ml-3 font-mono text-sm text-zinc-100">
                    {p.recallStrength}%
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-zinc-800/60 px-1.5 py-0.5 text-[10px] text-zinc-400">
                    {p.solveCount} solve{p.solveCount === 1 ? "" : "s"}
                  </span>
                  <span className="rounded-md bg-zinc-800/60 px-1.5 py-0.5 text-[10px] text-zinc-400">
                    {p.daysSinceLastSolve}d ago
                  </span>
                  {p.isOverdue && (
                    <span className="rounded-md bg-rose-900/30 px-1.5 py-0.5 text-[10px] text-rose-400">
                      overdue
                    </span>
                  )}
                  {p.needsReinforcement && (
                    <span className="rounded-md bg-amber-900/30 px-1.5 py-0.5 text-[10px] text-amber-400">
                      reinforce
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
