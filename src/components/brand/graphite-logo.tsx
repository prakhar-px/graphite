export type LogoType = "g" | "hex-faceted" | "hex-solid" | "compass" | "progress-arrow";

interface GraphiteLogoProps {
  className?: string;
  size?: number;
  type?: LogoType;
}

const S = 80;

function GIcon() {
  return (
    <svg viewBox={`0 0 ${S} ${S}`} fill="none" aria-label="Graphite" role="img" className="h-full w-full">
      <text x="44" y="60" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="70" className="fill-violet-500 dark:fill-violet-400" letterSpacing="-0.04em">g</text>
      <rect x="58" y="6" width="7" height="7" rx="1" className="fill-violet-500 dark:fill-violet-400" opacity="0.8" transform="rotate(45 58 6)"/>
    </svg>
  );
}

function HexFacetedIcon() {
  return (
    <svg viewBox={`0 0 ${S} ${S}`} fill="none" aria-label="Graphite" role="img" className="h-full w-full">
      <polygon points="40,6 68,22 40,40" className="fill-violet-500 dark:fill-violet-400" opacity="0.35" />
      <polygon points="68,22 68,58 40,40" className="fill-violet-500 dark:fill-violet-400" opacity="0.15" />
      <polygon points="68,58 40,74 40,40" className="fill-violet-500 dark:fill-violet-400" opacity="0.30" />
      <polygon points="40,74 12,58 40,40" className="fill-violet-500 dark:fill-violet-400" opacity="0.10" />
      <polygon points="12,58 12,22 40,40" className="fill-violet-500 dark:fill-violet-400" opacity="0.25" />
      <polygon points="12,22 40,6 40,40" className="fill-violet-500 dark:fill-violet-400" opacity="0.20" />
      <circle cx="40" cy="40" r="5" className="fill-violet-500 dark:fill-violet-400" />
    </svg>
  );
}

function HexSolidIcon() {
  return (
    <svg viewBox="-6 0 80 80" fill="none" aria-label="Graphite" role="img" className="h-full w-full">
      <polygon points="40,6 68,22 68,58 40,74 12,58 12,22" fill="var(--gp-text, #18181b)" opacity="0.95"/>
      <circle cx="40" cy="40" r="5" fill="var(--gp-bg, #f4f5f8)" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg viewBox={`0 0 ${S} ${S}`} fill="none" aria-label="Graphite" role="img" className="h-full w-full">
      <path d="M40 6 L44 36 L74 40 L44 44 L40 74 L36 44 L6 40 L36 36 Z" className="fill-violet-500 dark:fill-violet-400" opacity="0.85"/>
      <circle cx="40" cy="40" r="6" className="fill-[var(--gp-bg,#0f0f13)] dark:fill-[var(--gp-bg,#0f0f13)]" />
    </svg>
  );
}

function ProgressArrowIcon() {
  return (
    <svg viewBox={`0 0 ${S} ${S}`} fill="none" aria-label="Graphite" role="img" className="h-full w-full">
      <polygon points="12,60 48,60 48,50 20,50" className="fill-violet-500 dark:fill-violet-400" opacity="0.95"/>
      <polygon points="24,44 56,44 56,34 30,34" className="fill-violet-500 dark:fill-violet-400" opacity="0.75"/>
      <polygon points="36,28 64,28 64,18 40,18" className="fill-violet-500 dark:fill-violet-400" opacity="0.55"/>
      <polygon points="64,10 72,22 56,22" className="fill-violet-500 dark:fill-violet-400" opacity="0.95"/>
    </svg>
  );
}

const icons = {
  "g": GIcon,
  "hex-faceted": HexFacetedIcon,
  "hex-solid": HexSolidIcon,
  "compass": CompassIcon,
  "progress-arrow": ProgressArrowIcon,
};

export function GraphiteLogo({ className, size = 28, type = "hex-solid" }: GraphiteLogoProps) {
  const Icon = icons[type] ?? HexFacetedIcon;
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Icon />
    </div>
  );
}
