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

export function MasteryChart() {
  const snapshot = useUserSnapshot();
  const topics = buildTopicProgress(snapshot).slice(0, 8);
  const data = topics.map((t) => ({
    topic: t.name.split(" ")[0],
    mastery: t.confidence,
  }));

  return (
    <PremiumCard>
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Mastery Radar</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#27272A" />
          <PolarAngleAxis dataKey="topic" stroke="#71717A" fontSize={11} />
          <Radar
            name="Mastery"
            dataKey="mastery"
            stroke="#7C3AED"
            fill="#7C3AED"
            fillOpacity={0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
    </PremiumCard>
  );
}
