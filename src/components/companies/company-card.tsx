"use client";

import { motion } from "framer-motion";
import type { CompanyPrep } from "@/types";
import { PremiumCard } from "@/components/ui/premium-card";
import { Progress } from "@/components/ui/progress";

interface CompanyCardProps {
  company: CompanyPrep;
}

const companyColors: Record<string, string> = {
  Microsoft: "from-blue-600/20",
  Amazon: "from-amber-600/20",
  Google: "from-green-600/20",
  Meta: "from-indigo-600/20",
  Uber: "from-zinc-600/20",
};

export function CompanyCard({ company }: CompanyCardProps) {
  const score = company.readinessScore ?? 0;

  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <PremiumCard
        className={`bg-gradient-to-br ${companyColors[company.company] ?? "from-violet-600/20"} to-zinc-900/60`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-zinc-100">{company.company}</h3>
          <span className="font-mono text-2xl font-bold text-violet-400">
            {score}%
          </span>
        </div>
        <p className="mb-1 text-xs text-zinc-500">Readiness</p>
        <Progress value={score} className="mb-4 h-2" />
        <p className="text-sm text-zinc-400">{company.focusAreas}</p>
        <div className="mt-4 flex justify-between text-xs text-zinc-500">
          <span>{company.difficulty}</span>
          <span className="font-mono">{company.targetProblems} target</span>
        </div>
      </PremiumCard>
    </motion.div>
  );
}
