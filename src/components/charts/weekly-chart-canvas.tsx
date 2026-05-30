"use client";

import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getWeeklySolvedTrend } from "@/engines/telemetry/selectors";
import { useUserSnapshot } from "@/store/app-store";
import { useTheme } from "@/components/theme/theme-provider";

export function WeeklyChartCanvas() {
  const snapshot = useUserSnapshot();
  const data = getWeeklySolvedTrend(snapshot);
  const { theme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 860, height: 320 });

  const isDark = theme === "dark";

  const gridColor = isDark ? "#27272A" : "#e4e2de";
  const tickColor = isDark ? "#71717A" : "#a1a1aa";
  const tooltipBg = isDark ? "#111113" : "#ffffff";
  const tooltipBorder = isDark ? "#27272A" : "#e4e2de";
  const tooltipText = isDark ? "#FAFAFA" : "#18181b";

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
          <AreaChart data={data}>
            <defs>
              <linearGradient id="graphiteSolved" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity={isDark ? 0.7 : 0.5} />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke={gridColor}
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="week"
              tick={{ fill: tickColor, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: tickColor, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: 12,
                color: tooltipText,
              }}
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="transparent"
            />
            <Area
              type="monotone"
              dataKey="solved"
              stroke="#7C3AED"
              strokeWidth={3}
              fill="url(#graphiteSolved)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
