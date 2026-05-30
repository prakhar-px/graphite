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
        trend === "improving" && "text-green-600 dark:text-green-400",
        trend === "stable" && "text-[var(--gp-text-muted)]",
        trend === "declining" && "text-amber-600 dark:text-amber-400",
        trend === "unknown" && "text-[var(--gp-text-faint)]",
        className
      )}
    >
      {LABELS[trend]}
      {trend === "improving" ? " ↗" : trend === "declining" ? " ↘" : ""}
    </span>
  );
}
