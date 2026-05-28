"use client";

import { motion } from "framer-motion";
import type { CompanyPrep } from "@/types";
import { PremiumCard } from "@/components/ui/premium-card";
import { Progress } from "@/components/ui/progress";

interface CompanyCardProps {
  company: CompanyPrep;
}

const companyGradients: Record<string, string> = {
  Microsoft: "from-blue-500/10",
  Amazon: "from-amber-500/10",
  Google: "from-green-500/10",
  Meta: "from-indigo-500/10",
  Uber: "from-zinc-500/10",
};

export function CompanyCard({ company }: CompanyCardProps) {
  const score = company.readinessScore ?? 0;

  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <PremiumCard
        className={`bg-gradient-to-br ${companyGradients[company.company] ?? "from-violet-500/10"} to-transparent`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-[var(--gp-text)]">{company.company}</h3>
          <span className="font-mono text-2xl font-bold text-violet-600 dark:text-violet-400">
            {score}%
          </span>
        </div>
        <p className="mb-1 text-xs text-[var(--gp-text-faint)]">Readiness</p>
        <Progress value={score} className="mb-4 h-2" />
        <p className="text-sm text-[var(--gp-text-muted)]">{company.focusAreas}</p>
        <div className="mt-4 flex justify-between text-xs text-[var(--gp-text-faint)]">
          <span>{company.difficulty}</span>
          <span className="font-mono">{company.targetProblems} target</span>
        </div>
      </PremiumCard>
    </motion.div>
  );
}
