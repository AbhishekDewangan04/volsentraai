import { motion } from "framer-motion";
import RollingNumber from "@/components/common/RollingNumber";
import Orb from "@/components/fx/Orb";

export default function HealthRing({ score = 73, size = 168, label = "Grid health" }) {
  const R = 70;
  const C = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(100, score));
  const tone = pct >= 75 ? "#2EE6A6" : pct >= 55 ? "#FFB020" : "#FF4D6D";

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 168 168" className="h-full w-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C5CFF" />
            <stop offset="100%" stopColor={tone} />
          </linearGradient>
        </defs>
        <circle cx="84" cy="84" r={R} fill="none" stroke="url(#ring-grad)" strokeWidth="18" opacity="0.12" />
        <circle cx="84" cy="84" r={R} fill="none" stroke="currentColor" strokeWidth="1" className="text-border" strokeDasharray="2 6" />
        <motion.circle
          cx="84"
          cy="84"
          r={R}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C - (pct / 100) * C }}
          transition={{ type: "spring", stiffness: 90, damping: 22, delay: 0.15 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <p className="mono text-[34px] font-semibold leading-none text-ink">
          <RollingNumber value={pct} />
        </p>
        <p className="mono mt-1 text-[9px] uppercase tracking-[0.16em] text-ink-faint">{label}</p>
        <p className="mono mt-1 flex items-center justify-center gap-1.5 text-[10px]" style={{ color: tone }}>
          <Orb tone={pct >= 75 ? "mint" : pct >= 55 ? "amber" : "rose"} size="h-1.5 w-1.5" />
          {pct >= 75 ? "healthy" : pct >= 55 ? "strained" : "critical"}
        </p>
      </div>
    </div>
  );
}