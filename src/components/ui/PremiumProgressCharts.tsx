import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';

export function PremiumRadialGradient({ value }: { value: number }) {
  return (
    <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-900/80 shadow-xl backdrop-blur w-56 h-56">
      <div className="w-32 h-32">
        <CircularProgressbar
          value={value}
          text={`${value}%`}
          strokeWidth={10}
          styles={buildStyles({
            pathColor: 'url(#gradient)',
            trailColor: '#23272f',
            textColor: '#fff',
            textSize: '1.5rem',
          })}
        />
        <svg style={{ height: 0 }}>
          <defs>
            <linearGradient id="gradient" gradientTransform="rotate(90)">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="mt-4 text-center">
        <div className="text-lg font-bold text-white">{value}% roadmap done</div>
        <div className="text-xs text-zinc-400">Radial Gradient</div>
      </div>
    </div>
  );
}

export function PremiumDonutAnimated({ value }: { value: number }) {
  return (
    <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-900/80 shadow-xl backdrop-blur w-56 h-56">
      <motion.div
        className="w-32 h-32"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <CircularProgressbar
          value={value}
          text={`${value}%`}
          strokeWidth={14}
          styles={buildStyles({
            pathColor: '#06b6d4',
            trailColor: '#23272f',
            textColor: '#fff',
            textSize: '1.5rem',
          })}
        />
      </motion.div>
      <div className="mt-4 text-center">
        <div className="text-lg font-bold text-white">{value}% roadmap done</div>
        <div className="text-xs text-zinc-400">Animated Donut</div>
      </div>
    </div>
  );
}

export function PremiumGlassmorphism({ value }: { value: number }) {
  return (
    <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-white/10 shadow-2xl backdrop-blur-lg w-56 h-56 border border-white/20">
      <div className="w-32 h-32">
        <CircularProgressbar
          value={value}
          text={`${value}%`}
          strokeWidth={12}
          styles={buildStyles({
            pathColor: '#7c3aed',
            trailColor: '#e0e7ef33',
            textColor: '#fff',
            textSize: '1.5rem',
          })}
        />
      </div>
      <div className="mt-4 text-center">
        <div className="text-lg font-bold text-white">{value}% roadmap done</div>
        <div className="text-xs text-zinc-400">Glassmorphism</div>
      </div>
    </div>
  );
}

export function PremiumGauge({ value }: { value: number }) {
  // Half-circle gauge using SVG
  const radius = 60;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = Math.PI * normalizedRadius;
  const progress = (value / 100) * circumference;
  return (
    <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-900/80 shadow-xl backdrop-blur w-56 h-56">
      <svg width={radius * 2} height={radius + 20}>
        <defs>
          <linearGradient id="gauge-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="#23272f"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={0}
        />
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="url(#gauge-gradient)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
        <text
          x={radius}
          y={radius + 10}
          textAnchor="middle"
          fill="#fff"
          fontSize="1.5rem"
          fontWeight="bold"
        >
          {value}%
        </text>
      </svg>
      <div className="mt-4 text-center">
        <div className="text-lg font-bold text-white">{value}% roadmap done</div>
        <div className="text-xs text-zinc-400">Futuristic Gauge</div>
      </div>
    </div>
  );
}
  