"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Shell } from "@/components/layout/shell";
import { PremiumCard } from "@/components/ui/premium-card";
import { useAppStore } from "@/store/app-store";
import { formatDifficulty } from "@/engines/problems/helpers";

function deriveMistakes(problemLog: ReturnType<typeof useAppStore.getState>["problemLog"]) {
  const flagged = problemLog.filter(
    (p) => p.revisionNeeded || (typeof p.confidence === "number" && p.confidence > 0 && p.confidence < 5)
  );
  return flagged.map((p) => ({
    date: p.solvedAt.slice(0, 10),
    problem: p.title ?? "Quick log",
    topic: (p.topics ?? p.topicTags ?? [])[0] ?? "General",
    mistakeType: p.revisionNeeded
      ? "Needs review"
      : `Low confidence (${p.confidence}/10)`,
    learning: "",
    revised: !p.revisionNeeded,
  }));
}

export default function MistakesPage() {
  const problemLog = useAppStore((s) => s.problemLog);

  const entries = useMemo(() => {
    const derived = deriveMistakes(problemLog);
    return derived.length > 0
      ? derived
      : [
          {
            date: "—",
            problem: "Log your first problem needing review",
            topic: "—",
            mistakeType: "—",
            learning: "Flag problems with low confidence or mark them for revision",
            revised: false,
          },
        ];
  }, [problemLog]);

  const categoryStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) {
      if (e.mistakeType !== "—") {
        map.set(e.mistakeType, (map.get(e.mistakeType) ?? 0) + 1);
      }
    }
    return [...map.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [entries]);

  return (
    <Shell title="Mistake Analytics" subtitle="Improvement intelligence">
      <div className="space-y-6 p-4 lg:p-8">
        <PremiumCard className="xl:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">
            Error Frequency
          </h3>
          {categoryStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                <XAxis dataKey="type" stroke="#71717A" fontSize={11} />
                <YAxis stroke="#71717A" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#18181B",
                    border: "1px solid #27272A",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="count" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-sm text-zinc-500">
              No flagged problems yet. Mark problems as needing revision or log
              low confidence to see patterns here.
            </p>
          )}
        </PremiumCard>

        <PremiumCard>
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">
            Recent Learnings
          </h3>
          <div className="space-y-3">
            {entries.slice(0, 8).map((m, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-800/80 p-4"
              >
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-300">{m.problem}</span>
                  <span className="text-zinc-500">{m.topic}</span>
                </div>
                <p className="mt-1 text-xs text-red-400/80">{m.mistakeType}</p>
                {m.learning && (
                  <p className="mt-2 text-sm text-zinc-500">{m.learning}</p>
                )}
              </div>
            ))}
          </div>
        </PremiumCard>
      </div>
    </Shell>
  );
}
