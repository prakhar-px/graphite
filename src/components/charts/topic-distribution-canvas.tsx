"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getTopicDistributionForChart } from "@/engines/topics/selectors";
import { useUserSnapshot } from "@/store/app-store";

export function TopicDistributionCanvas() {
  const snapshot = useUserSnapshot();
  const data = getTopicDistributionForChart(snapshot);
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 720, height: 320 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-full w-full min-w-0">
      <div style={{ width: size.width, height: size.height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              stroke="#27272A"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="topic"
              tick={{ fill: "#71717A", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#71717A", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#111113",
                border: "1px solid #27272A",
                borderRadius: 12,
                color: "#FAFAFA",
              }}
            />
            <Bar dataKey="solved" fill="#22C55E" radius={[6, 6, 0, 0]} name="solved" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
