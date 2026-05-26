import type { RecallTrend } from "@/engines/revision/selectors";
import { cn } from "@/lib/utils";

const LABELS: Record<RecallTrend, string> = {
  improving: "Recall improving",
  stable: "Recall stable",
  declining: "Recall fading",
  unknown: "Recall unknown",
};

export function RecallTrendLabel({
  trend,
  className,
}: {
  trend: RecallTrend;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-xs font-medium",
        trend === "improving" && "text-green-400",
        trend === "stable" && "text-zinc-400",
        trend === "declining" && "text-amber-400",
        trend === "unknown" && "text-zinc-600",
        className
      )}
    >
      {LABELS[trend]}
      {trend === "improving" ? " ↗" : trend === "declining" ? " ↘" : ""}
    </span>
  );
}
