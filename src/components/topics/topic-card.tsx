"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle } from "lucide-react";
import type { TopicProgress } from "@/types";
import { PremiumCard } from "@/components/ui/premium-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TopicCardProps {
  topic: TopicProgress;
}

const statusColors = {
  weak: "text-red-400 border-red-500/30",
  "in-progress": "text-blue-400 border-blue-500/30",
  completed: "text-green-400 border-green-500/30",
  "revision-pending": "text-amber-400 border-amber-500/30",
};

export function TopicCard({ topic }: TopicCardProps) {
  const pct = Math.round((topic.solved / topic.total) * 100);

  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <PremiumCard>
        <div className="mb-3 flex items-start justify-between">
          <h3 className="font-semibold text-zinc-100">{topic.name}</h3>
          {topic.status === "weak" ? (
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          ) : topic.status === "completed" ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : null}
        </div>
        <Progress value={pct} className="mb-3 h-2" />
        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500">
          <span>
            <span className="font-mono text-zinc-300">
              {topic.solved}/{topic.total}
            </span>{" "}
            solved
          </span>
          <span>{topic.revisionCount} revisions</span>
          <span className="font-mono text-zinc-300">{topic.confidence}%</span>
          <span className="truncate">Recent: {topic.recentActivity}</span>
        </div>
        <Badge
          variant="outline"
          className={cn("mt-3 capitalize", statusColors[topic.status])}
        >
          {topic.status.replace("-", " ")}
        </Badge>
      </PremiumCard>
    </motion.div>
  );
}
