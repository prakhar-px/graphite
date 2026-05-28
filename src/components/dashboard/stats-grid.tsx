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
import { useState } from "react";
import { getDashboardStats } from "@/engines/dashboard/selectors";
import { getWeeklySolvedTotal } from "@/engines/telemetry/selectors";
import { ProblemLogDialog } from "@/components/problems/problem-log-dialog";
import { useUserSnapshot } from "@/store/app-store";
import { PremiumCard } from "@/components/ui/premium-card";

export function StatsGrid() {
  const snapshot = useUserSnapshot();
  const stats = getDashboardStats(snapshot);
  const [logOpen, setLogOpen] = useState(false);

  const ctx = {
    solved: stats.solved,
    streak: stats.streak,
    topic: stats.activeTopic,
    focusScore: stats.focusScore,
    weeklySolved: stats.weeklySolved,
    revisionCount: stats.revisionCount,
    problemsTarget: stats.problemsTarget,
    detailedLogged: stats.detailedLogged,
    quickLogged: stats.quickLogged,
    averageConfidence: stats.averageConfidence,
  };

  const statConfig = [
    {
      key: "problems",
      label: "Problems Solved",
      icon: Target,
      color: "text-violet-400",
      value: ctx.solved,
      sub: `${stats.uniqueTracked} unique tracked`,
    },
    {
      key: "weekly",
      label: "Weekly Progress",
      icon: TrendingUp,
      color: "text-blue-400",
      value: getWeeklySolvedTotal(snapshot, 1),
      sub: `2-wk: ${getWeeklySolvedTotal(snapshot, 2)}`,
    },
    {
      key: "revision",
      label: "Revision Count",
      icon: RefreshCw,
      color: "text-green-400",
      value: stats.revisionCount,
      sub: "From problem telemetry",
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
      value: stats.focusScore,
      sub: `${stats.missionsCompleted}/70 missions · ${stats.averageConfidence}% conf`,
      suffix: "/99",
    },
  ] as const;

  return (
    <>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {statConfig.map((stat, i) => {
        const Icon = stat.icon;
        const clickable = stat.key === "problems";

        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {clickable ? (
              <button
                type="button"
                onClick={() => setLogOpen(true)}
                className="block h-full w-full text-left"
              >
                <PremiumCard className="h-full transition hover:border-violet-500/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">{stat.label}</p>
                      <p className="mt-2 font-mono text-2xl font-bold text-zinc-100">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">{stat.sub}</p>
                    </div>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </PremiumCard>
              </button>
            ) : (
              <PremiumCard className="h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-zinc-500">{stat.label}</p>
                    <p
                      className={`mt-2 text-2xl font-bold text-zinc-100 ${stat.key === "topic" ? "" : "font-mono"}`}
                      title={stat.key === "focus" ? "Based on mission completion, average confidence, and revision consistency." : undefined}
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
            )}
          </motion.div>
        );
      })}
    </div>
    <ProblemLogDialog open={logOpen} onOpenChange={setLogOpen} />
    </>
  );
}
