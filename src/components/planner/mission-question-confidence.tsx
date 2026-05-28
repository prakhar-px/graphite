"use client";

import type { MissionQuestionEntry } from "@/types/mission-completion";
import { ConfidenceChips } from "@/components/planner/confidence-chips";
import { cn } from "@/lib/utils";

interface MissionQuestionConfidenceProps {
  questions: string[];
  entries: MissionQuestionEntry[];
  onChange: (entries: MissionQuestionEntry[]) => void;
  selectable?: boolean;
  selectedTitles?: Set<string>;
  onToggleSelect?: (title: string) => void;
  defaultConfidence?: number;
}

export function initQuestionEntries(
  questions: string[],
  defaultConfidence: number
): MissionQuestionEntry[] {
  return questions.map((title) => ({ title, confidence: defaultConfidence }));
}

export function MissionQuestionConfidence({
  questions,
  entries,
  onChange,
  selectable = false,
  selectedTitles,
  onToggleSelect,
  defaultConfidence = 7,
}: MissionQuestionConfidenceProps) {
  if (questions.length === 0) {
    return (
      <p className="text-sm text-[var(--gp-text-muted)]">
        No suggested problems for this mission — completion will mark the session only.
      </p>
    );
  }

  const updateConfidence = (title: string, confidence: number) => {
    const next = questions.map((q) => {
      const existing = entries.find((e) => e.title === q);
      if (q === title) return { title, confidence };
      return existing ?? { title: q, confidence: defaultConfidence };
    });
    onChange(next);
  };

  const getConfidence = (title: string) =>
    entries.find((e) => e.title === title)?.confidence ?? defaultConfidence;

  return (
    <ul className="space-y-3">
      {questions.map((title) => {
        const selected = !selectable || selectedTitles?.has(title);
        return (
          <li
            key={title}
            className={cn(
              "rounded-xl border p-3 transition",
              selectable && !selected
                ? "opacity-60"
                : ""
            )}
            style={{
              borderColor: selected ? "var(--gp-border)" : "var(--gp-border-subtle)",
              backgroundColor: selected ? "var(--gp-surface)" : "transparent",
            }}
          >
            <div className="mb-2 flex items-center gap-2">
              {selectable ? (
                <input
                  type="checkbox"
                  checked={selectedTitles?.has(title) ?? false}
                  onChange={() => onToggleSelect?.(title)}
                  className="accent-violet-500"
                  aria-label={`Include ${title}`}
                />
              ) : null}
              <span className="text-sm font-medium text-[var(--gp-text)]">{title}</span>
            </div>
            {(!selectable || selected) && (
              <ConfidenceChips
                value={getConfidence(title)}
                onChange={(v) => updateConfidence(title, v)}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
