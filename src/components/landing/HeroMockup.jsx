import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, TriangleAlert } from "lucide-react";
import RollingNumber from "@/components/common/RollingNumber";
import LiveDot from "@/components/common/LiveDot";
import { Pill } from "@/components/common/Chip";

const START = [38, 42, 40, 47, 44, 52, 49, 58, 54, 62, 59, 66, 61, 70, 64, 73];

function pathFor(values, w = 100, h = 100) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - 6 - ((v - min) / span) * (h - 14);
      return `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function HeroMockup() {
  const [values, setValues] = useState(START);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setValues((prev) => {
        const last = prev[prev.length - 1];
        const next = Math.max(30, Math.min(94, last + (Math.random() - 0.42) * 9));
        return [...prev.slice(1), Number(next.toFixed(1))];
      });
      setTick((t) => t + 1);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const line = pathFor(values);

  return (
    <div className="relative mx-auto mt-14 w-full max-w-5xl px-1" style={{ perspective: 1400 }}>
      <motion.div
        initial={{ opacity: 0, y: 44, rotateX: 12 }}
        animate={{ opacity: 1, y: 0, rotateX: 6 }}
        transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.15 }}
        className="relative rounded-3xl border border-border/80 bg-surface/85 p-2 shadow-panel backdrop-blur-xl sm:p-3"
      >
        <div className="rounded-[18px] border border-border/60 bg-raised/60">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose/70" />
              <span className="h-2 w-2 rounded-full bg-amber/70" />
              <span className="h-2 w-2 rounded-full bg-mint/70" />
              <span className="mono ml-2 hidden text-[10px] uppercase tracking-[0.16em] text-ink-faint sm:inline">
                volsentra / command center
              </span>
            </div>
            <span className="mono flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-mint">
              <LiveDot tone="mint" size="h-1.5 w-1.5" /> live
            </span>
          </div>

          <div className="grid gap-3 p-3 sm:grid-cols-[1.55fr_1fr] sm:p-4">
            <div className="relative overflow-hidden rounded-xl border border-border/60 bg-[hsl(var(--canvas))]/70 p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">Grid load · 24h</p>
                  <p className="mono mt-1 text-xl font-semibold text-ink">
                    <RollingNumber value={68.4 + tick * 0.1} format={(v) => v.toFixed(1)} />
                    <span className="ml-1 text-[11px] text-ink-faint">MW</span>
                  </p>
                </div>
                <Pill tone="rose" dot className="shrink-0">
                  theft · 91%
                </Pill>
              </div>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-2 h-[112px] w-full sm:h-[132px]" aria-hidden="true">
                <defs>
                  <linearGradient id="hero-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C5CFF" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#FF3D9A" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="hero-stroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7C5CFF" />
                    <stop offset="100%" stopColor="#FF3D9A" />
                  </linearGradient>
                </defs>
                {[20, 40, 60, 80].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
                ))}
                <path d={`${line} L100,100 L0,100 Z`} fill="url(#hero-area)" />
                <path d={line} fill="none" stroke="url(#hero-stroke)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
              </svg>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-ink-faint">
                <span className="mono">00:00</span>
                <span className="h-px flex-1 bg-border" />
                <span className="mono">12:00</span>
                <span className="h-px flex-1 bg-border" />
                <span className="mono">23:00</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-1">
              {[
                { label: "Meters", value: 200, tone: "text-ink" },
                { label: "High risk", value: 61, tone: "text-rose" },
                { label: "Est. loss", value: 48.2, tone: "text-amber", prefix: "₹", suffix: "L" },
              ].map((k) => (
                <div key={k.label} className="rounded-xl border border-border/60 bg-surface/70 px-3 py-2.5">
                  <p className="mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">{k.label}</p>
                  <p className={`mono mt-0.5 text-lg font-semibold ${k.tone}`}>
                    <RollingNumber
                      value={k.value}
                      prefix={k.prefix}
                      suffix={k.suffix}
                      format={(v) => (k.label === "Est. loss" ? v.toFixed(1) : String(Math.round(v)))}
                    />
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-3 py-2.5 sm:px-4">
            <div className="flex items-center gap-2">
              <Pill tone="mint" dot>
                comms ok
              </Pill>
              <Pill tone="amber" dot className="hidden sm:inline-flex">
                transformer loss 18%
              </Pill>
            </div>
            <span className="mono flex items-center gap-1 text-[10px] text-ink-faint">
              3 feeders · 10 DTs <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="absolute -left-2 top-[26%] hidden rounded-xl border border-rose/30 bg-surface/90 px-3 py-2 shadow-glow-rose backdrop-blur md:block"
      >
        <p className="mono flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-rose">
          <TriangleAlert className="h-3 w-3" /> theft · 91%
        </p>
        <p className="mono mt-0.5 text-[10px] text-ink-faint">IN-MH-240204</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        className="absolute -right-1 bottom-[18%] hidden rounded-xl border border-sky/30 bg-surface/90 px-3 py-2 shadow-glow-sky backdrop-blur md:block"
      >
        <p className="mono text-[10px] uppercase tracking-[0.14em] text-sky">latency 412ms</p>
        <p className="mono mt-0.5 text-[10px] text-ink-faint">stream healthy</p>
      </motion.div>
    </div>
  );
}