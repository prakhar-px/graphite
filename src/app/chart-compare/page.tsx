"use client";

import { PremiumCard } from "@/components/ui/premium-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { GlowArcRing } from "@/components/charts/GlowArcRing";
import { OrbCore } from "@/components/charts/OrbCore";
import { SegmentedBeadArc } from "@/components/charts/SegmentedBeadArc";
import { OvalBeadArc } from "@/components/charts/OvalBeadArc";
import { HeatIntensityRing } from "@/components/charts/HeatIntensityRing";
import { GlassmorphismRing } from "@/components/charts/GlassmorphismRing";
import { MemoryPulse } from "@/components/charts/MemoryPulse";
import { AppleWatchRing } from "@/components/charts/AppleWatchRing";

export default function ChartComparePage() {
  const roadmap = 74;
  const memory = 49;

  const beadColorSchemes = [
    { name: "violet → blue → green", scheme: "violet" as const, desc: "Current — multi-stop gradient" },
    { name: "cyan → teal", scheme: "cyan" as const, desc: "Matches Orb Core energy — electric" },
    { name: "graphite → icy blue", scheme: "graphite" as const, desc: "Premium, restrained, calm" },
    { name: "amber → gold", scheme: "amber" as const, desc: "Warm, premium, sophisticated" },
    { name: "electric cyan → green", scheme: "electric" as const, desc: "Vibrant, modern, fresh" },
    { name: "teal mono", scheme: "teal" as const, desc: "Deep teal → light — very refined" },
    { name: "rose → violet", scheme: "rose" as const, desc: "Sunset-inspired, bold" },
    { name: "⭐ green trio — dull → brighter → brightest", scheme: "green" as const, desc: "Same green palette from Orb Core, three intensities" },
  ];

  const roadmapVariants = [
    {
      name: "ORIGINAL — ProgressRing",
      desc: "Current production ring (smooth SVG gradient)",
      comp: (v: number) => <ProgressRing value={v} size={168} stroke={12} label="roadmap" />,
    },
    {
      name: "OPTION 1 — Glow Arc Ring",
      desc: "Thin 270° partial arc + subtle neon glow + gradient",
      comp: (v: number) => <GlowArcRing value={v} size={168} label="roadmap" />,
    },
    {
      name: "OPTION 2 — Orb Core",
      desc: "Glowing central orb with state-based color (green/amber/red)",
      comp: (v: number) => <OrbCore value={v} size={168} label="roadmap" />,
    },
    {
      name: "OPTION 3 — Segmented Bead Arc (circular)",
      desc: "270° partial arc with circular micro beads",
      comp: (v: number) => <SegmentedBeadArc value={v} size={168} segments={24} label="roadmap" />,
    },
    {
      name: "OPTION 4 — Segmented Bead Arc (oval)",
      desc: "270° partial arc with oval micro beads",
      comp: (v: number) => <OvalBeadArc value={v} size={168} segments={24} label="roadmap" />,
    },
    {
      name: "OPTION 5 — Heat Intensity Ring",
      desc: "Full ring with Duolingo-style heat — brightest near active edge",
      comp: (v: number) => <HeatIntensityRing value={v} size={168} segments={36} label="roadmap" />,
    },
    {
      name: "OPTION 6 — Glassmorphism Ring",
      desc: "Frosted glass ring with blurred ambient glow + vibrant arc",
      comp: (v: number) => <GlassmorphismRing value={v} size={168} label="roadmap" />,
    },
    {
      name: "⭐ OPTION 7 — Memory Pulse",
      desc: "Dynamic segments: bright=strong, glow=stable, dim=fading, dark=untouched. Intelligent state labels.",
      comp: (v: number) => <MemoryPulse value={v} size={168} segments={36} label="roadmap" />,
    },
    {
      name: "OPTION 8 — Apple Watch Ring",
      desc: "Rainbow cycle (red → orange → green → blue → violet), filled segments, subtle glow per color",
      comp: (v: number) => <AppleWatchRing value={v} size={168} segments={28} label="roadmap" />,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-12 p-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--gp-text)]">Chart Comparison</h1>
        <p className="mt-1 text-sm text-[var(--gp-text-muted)]">
          Roadmap = <span className="text-[var(--gp-text)]">74%</span> · Memory Strength ={" "}
          <span className="text-[var(--gp-text)]">49%</span>
        </p>
      </div>

      {roadmapVariants.map((v) => (
        <PremiumCard key={v.name} className="overflow-hidden">
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-[var(--gp-text)]">{v.name}</h2>
            <p className="text-sm text-[var(--gp-text-muted)]">{v.desc}</p>
          </div>
          <div className="flex items-center justify-center py-8">
            {v.comp(roadmap)}
          </div>
        </PremiumCard>
      ))}

      {/* ── Bead Arc color options ── */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-[var(--gp-text)]">
          Segmented Bead Arc — color comparison for roadmap
        </h2>
        <p className="-mt-4 text-sm text-[var(--gp-text-muted)]">
          Same chart shape, different palettes. All at 74%.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {beadColorSchemes.map((s) => (
            <PremiumCard key={s.scheme}>
              <p className="mb-1 text-xs text-[var(--gp-text-muted)]">{s.name}</p>
              <p className="mb-2 text-[10px] text-[var(--gp-text-faint)]">{s.desc}</p>
              <div className="flex justify-center py-4">
                <SegmentedBeadArc
                  value={roadmap}
                  size={120}
                  segments={24}
                  colorScheme={s.scheme}
                />
              </div>
            </PremiumCard>
          ))}
        </div>
      </section>

      {/* ── Memory Strength variants ── */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-[var(--gp-text)]">
          Memory Strength widget (49%)
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <PremiumCard>
            <p className="mb-1 text-xs text-[var(--gp-text-muted)]">Original</p>
            <div className="flex justify-center py-4">
              <ProgressRing value={49} size={120} stroke={10} label="recall" />
            </div>
          </PremiumCard>
          <PremiumCard className="ring-2 ring-green-500/40">
            <p className="mb-1 text-xs text-green-600 dark:text-green-400">✓ Orb Core — selected</p>
            <div className="flex justify-center py-4">
              <OrbCore value={49} size={120} label="recall" />
            </div>
          </PremiumCard>
          <PremiumCard>
            <p className="mb-1 text-xs text-[var(--gp-text-muted)]">Glow Arc</p>
            <div className="flex justify-center py-4">
              <GlowArcRing value={49} size={120} label="recall" />
            </div>
          </PremiumCard>
          <PremiumCard>
            <p className="mb-1 text-xs text-[var(--gp-text-muted)]">Bead Arc (circular)</p>
            <div className="flex justify-center py-4">
              <SegmentedBeadArc value={49} size={120} segments={20} label="recall" />
            </div>
          </PremiumCard>
          <PremiumCard>
            <p className="mb-1 text-xs text-[var(--gp-text-muted)]">Bead Arc (oval)</p>
            <div className="flex justify-center py-4">
              <OvalBeadArc value={49} size={120} segments={20} label="recall" />
            </div>
          </PremiumCard>
          <PremiumCard>
            <p className="mb-1 text-xs text-[var(--gp-text-muted)]">Heat Intensity</p>
            <div className="flex justify-center py-4">
              <HeatIntensityRing value={49} size={120} segments={30} label="recall" />
            </div>
          </PremiumCard>
          <PremiumCard>
            <p className="mb-1 text-xs text-[var(--gp-text-muted)]">Glassmorphism</p>
            <div className="flex justify-center py-4">
              <GlassmorphismRing value={49} size={120} label="recall" />
            </div>
          </PremiumCard>
          <PremiumCard>
            <p className="mb-1 text-xs text-[var(--gp-text-muted)]">Memory Pulse</p>
            <div className="flex justify-center py-4">
              <MemoryPulse value={49} size={120} segments={30} label="recall" />
            </div>
          </PremiumCard>
          <PremiumCard>
            <p className="mb-1 text-xs text-[var(--gp-text-muted)]">Apple Watch</p>
            <div className="flex justify-center py-4">
              <AppleWatchRing value={49} size={120} segments={24} label="recall" />
            </div>
          </PremiumCard>
        </div>
      </section>

      {/* ── State label demo ── */}
      <section className="space-y-4 rounded-2xl border p-6" style={{ borderColor: "var(--gp-border)", backgroundColor: "color-mix(in srgb, var(--gp-surface) 60%, transparent)" }}>
        <h2 className="text-lg font-semibold text-[var(--gp-text)]">
          State labels (Memory Pulse)
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { v: 85, s: "Strong Recall", sub: "Consistent reinforcement" },
            { v: 65, s: "Memory Stable", sub: "Retention is solid" },
            { v: 45, s: "Momentum Building", sub: "Freshness trending up" },
            { v: 25, s: "Recall Improving", sub: "Building consistency" },
            { v: 10, s: "Preparation Active", sub: "Early stage progress" },
          ].map((item) => (
            <PremiumCard key={item.s}>
              <div className="flex justify-center py-4">
                <MemoryPulse value={item.v} size={100} segments={24} />
              </div>
            </PremiumCard>
          ))}
        </div>
      </section>
    </div>
  );
}
