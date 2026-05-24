import { Shell } from "@/components/layout/shell";
import { revisionTopics } from "@/lib/data";
import { PremiumCard } from "@/components/ui/premium-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function RevisionPage() {
  const overdue = revisionTopics.filter((t) => t.confidence < 50);
  const strong = revisionTopics.filter((t) => t.confidence >= 60);

  return (
    <Shell title="Revision Tracker" subtitle="Spaced repetition intelligence">
      <div className="space-y-6 p-4 lg:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <PremiumCard glow>
            <p className="text-xs text-zinc-500">Revision Queue</p>
            <p className="font-mono text-3xl font-bold text-zinc-100">
              {revisionTopics.length}
            </p>
            <p className="text-sm text-zinc-500">topics tracked</p>
          </PremiumCard>
          <PremiumCard>
            <p className="text-xs text-zinc-500">Overdue</p>
            <p className="font-mono text-3xl font-bold text-red-400">
              {overdue.length}
            </p>
            <p className="text-sm text-zinc-500">needs attention</p>
          </PremiumCard>
          <PremiumCard>
            <p className="text-xs text-zinc-500">Strong Concepts</p>
            <p className="font-mono text-3xl font-bold text-green-400">
              {strong.length}
            </p>
            <p className="text-sm text-zinc-500">confidence ≥ 60%</p>
          </PremiumCard>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {revisionTopics.map((t) => (
            <PremiumCard key={t.topic}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-zinc-100">{t.topic}</h3>
                <Badge variant="outline" className="border-zinc-700">
                  Cycle 1–3
                </Badge>
              </div>
              <Progress value={t.confidence} className="mb-3 h-2" />
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div
                  className={`rounded-lg border p-2 ${t.revision1 ? "border-green-500/40 bg-green-500/10" : "border-zinc-800"}`}
                >
                  R1
                </div>
                <div
                  className={`rounded-lg border p-2 ${t.revision2 ? "border-green-500/40 bg-green-500/10" : "border-zinc-800"}`}
                >
                  R2
                </div>
                <div
                  className={`rounded-lg border p-2 ${t.revision3 ? "border-green-500/40 bg-green-500/10" : "border-zinc-800"}`}
                >
                  R3
                </div>
              </div>
              <p className="mt-2 font-mono text-sm text-zinc-400">
                Confidence: {t.confidence}%
              </p>
            </PremiumCard>
          ))}
        </div>
      </div>
    </Shell>
  );
}
