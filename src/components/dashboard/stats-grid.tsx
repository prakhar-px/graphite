"use client";

import {
  Brain,
  Flame,
  RefreshCw,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  getDashboardStats,
  getRevisionCount,
  getWeeklySolvedTotal,
} from "@/lib/data";
import { useUserSnapshot } from "@/store/app-store";
import { PremiumCard } from "@/components/ui/premium-card";

export function StatsGrid() {
  const snapshot = useUserSnapshot();
  const stats = getDashboardStats(
    snapshot.dayStatuses,
    snapshot.completedTasks,
    snapshot.solvedProblems
  );

  const ctx = {
    solved: stats.solved,
    streak: stats.streak,
    topic: stats.activeTopic,
    focusScore: stats.focusScore,
    weeklySolved: stats.weeklySolved,
    revisionCount: stats.revisionCount,
    problemsTarget: stats.problemsTarget,
  };

  const statConfig = [
    {
      key: "problems",
      label: "Problems Solved",
      icon: Target,
      color: "text-violet-400",
      value: ctx.solved,
      sub: `Target: ${ctx.problemsTarget}`,
    },
    {
      key: "weekly",
      label: "Weekly Progress",
      icon: TrendingUp,
      color: "text-blue-400",
      value: getWeeklySolvedTotal(1, snapshot),
      sub: `2-wk: ${getWeeklySolvedTotal(2, snapshot)}`,
    },
    {
      key: "revision",
      label: "Revision Count",
      icon: RefreshCw,
      color: "text-green-400",
      value: getRevisionCount(),
      sub: "Across R1/R2/R3",
    },
    {
      key: "streak",
      label: "Current Streak",
      icon: Flame,
      color: "text-amber-400",
      value: ctx.streak,
      sub: "Keep the momentum",
    },
    {
      key: "topic",
      label: "Active Topic",
      icon: Brain,
      color: "text-violet-400",
      value: ctx.topic.split("+")[0]?.trim() ?? ctx.topic,
      sub: "Today's focus",
      mono: false,
    },
    {
      key: "focus",
      label: "Focus Score",
      icon: Zap,
      color: "text-emerald-400",
      value: ctx.focusScore,
      sub: "Elite consistency",
      suffix: "/100",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {statConfig.map((stat, i) => {
        const Icon = stat.icon;

        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <PremiumCard className="h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-zinc-500">{stat.label}</p>
                  <p
                    className={`mt-2 text-2xl font-bold text-zinc-100 ${stat.key === "topic" ? "" : "font-mono"}`}
                  >
                    {stat.value}
                    {"suffix" in stat && stat.suffix ? (
                      <span className="text-sm font-normal text-zinc-500">
                        {stat.suffix}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{stat.sub}</p>
                </div>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </PremiumCard>
          </motion.div>
        );
      })}
    </div>
  );
}
