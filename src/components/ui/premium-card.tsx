"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function PremiumCard({ children, className, glow }: PremiumCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "rounded-[28px] border p-6 backdrop-blur-xl",
        "bg-[var(--gp-card-bg)] border-[var(--gp-border)]",
        glow && "shadow-[0_0_40px_rgba(124,58,237,0.10)]",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
