"use client";

import { Shell } from "@/components/layout/shell";
import { CompanyCard } from "@/components/companies/company-card";
import { getCompaniesForDisplay } from "@/lib/computed-data";
import { masterPlan } from "@/lib/data";
import { useUserSnapshot } from "@/store/app-store";
import { PremiumCard } from "@/components/ui/premium-card";

export default function CompaniesPage() {
  const snapshot = useUserSnapshot();
  const companies = getCompaniesForDisplay(snapshot);

  return (
    <Shell title="Company Prep" subtitle="FAANG readiness engine">
      <div className="space-y-8 p-4 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <CompanyCard key={c.company} company={c} />
          ))}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            Master Plan Phases
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {masterPlan.map((phase) => (
              <PremiumCard key={phase.phase} glow>
                <p className="text-sm font-medium text-violet-400">
                  {phase.phase}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{phase.timeline}</p>
                <h3 className="mt-2 font-semibold text-zinc-100">
                  {phase.focus}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">{phase.goal}</p>
              </PremiumCard>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
