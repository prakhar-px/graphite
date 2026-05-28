"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { buildTopicProgress } from "@/engines/topics/selectors";
import { useUserSnapshot } from "@/store/app-store";
import { PremiumCard } from "@/components/ui/premium-card";
import { useTheme } from "@/components/theme/theme-provider";

export function MasteryChart() {
  const snapshot = useUserSnapshot();
  const { theme } = useTheme();
  const topics = buildTopicProgress(snapshot).slice(0, 8);
  const data = topics.map((t) => ({
    topic: t.name.split(" ")[0],
    mastery: t.confidence,
  }));

  const isDark = theme === "dark";
  const gridColor = isDark ? "#27272A" : "#e4e2de";
  const axisColor = isDark ? "#71717A" : "#a1a1aa";

  return (
    <PremiumCard>
      <h3 className="mb-4 text-lg font-semibold text-[var(--gp-text)]">Mastery Radar</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke={gridColor} />
          <PolarAngleAxis dataKey="topic" stroke={axisColor} fontSize={11} />
          <Radar
            name="Mastery"
            dataKey="mastery"
            stroke="#7C3AED"
            fill="#7C3AED"
            fillOpacity={isDark ? 0.35 : 0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </PremiumCard>
  );
}
