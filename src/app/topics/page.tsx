"use client";

import { useState } from "react";
import { Shell } from "@/components/layout/shell";
import { TopicCard } from "@/components/topics/topic-card";
import { MasteryChart } from "@/components/topics/mastery-chart";
import { buildTopicProgress } from "@/engines/topics/selectors";
import { useUserSnapshot } from "@/store/app-store";
import { cn } from "@/lib/utils";

const filters = [
  "all",
  "weak",
  "in-progress",
  "completed",
  "revision-pending",
] as const;

export default function TopicsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const snapshot = useUserSnapshot();
  const topics = buildTopicProgress(snapshot);
  const filtered =
    filter === "all" ? topics : topics.filter((t) => t.status === filter);

  return (
    <Shell title="Topics" subtitle="Mastery & confidence tracking">
      <div className="space-y-6 p-4 lg:p-8">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-sm capitalize transition-colors",
                filter === f
                  ? "border-violet-500 bg-violet-500/15 text-violet-700 dark:text-violet-300"
                  : "border-[var(--gp-border)] text-[var(--gp-text-muted)] hover:border-[var(--gp-text-faint)]"
              )}
            >
              {f.replace("-", " ")}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="grid gap-4 sm:grid-cols-2 xl:col-span-2">
            {filtered.map((topic) => (
              <TopicCard key={topic.name} topic={topic} />
            ))}
          </div>
          <div className="self-start"><MasteryChart /></div>
        </div>
      </div>
    </Shell>
  );
}
