"use client";

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
import { getMistakeCategoryStats, mistakes } from "@/lib/data";
import { PremiumCard } from "@/components/ui/premium-card";

export default function MistakesPage() {
  const mistakeCategories = getMistakeCategoryStats();
  const entries =
    mistakes.length > 0
      ? mistakes
      : [
          {
            date: "—",
            problem: "Log your first mistake",
            topic: "—",
            mistakeType: "—",
            learning: "Track patterns to improve faster",
            revised: false,
          },
        ];

  return (
    <Shell title="Mistake Analytics" subtitle="Improvement intelligence">
      <div className="space-y-6 p-4 lg:p-8">
        <PremiumCard className="xl:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">
            Error Frequency
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={mistakeCategories}>
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
