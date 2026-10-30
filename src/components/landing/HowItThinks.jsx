import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import SectionHeader from "@/components/common/SectionHeader";
import { CauseChip, Pill } from "@/components/common/Chip";
import { useMotionOff } from "@/lib/useMotionPref";

const STAGES = [
  {
    key: "detect",
    n: "01",
    tag: "Detect",
    title: "Every meter, scored nightly",
    body: "Twelve months of consumption, peer behaviour on the same transformer and tamper signals feed an ensemble that ranks all 200 meters before sunrise.",
    stat: "200 meters · 12-month window",
    accent: "rose",
    ring: "ring-rose/25",
  },
  {
    key: "explain",
    n: "02",
    tag: "Explain",
    title: "A reason, not a black box",
    body: "Each flag ships with the evidence that moved the score — a 78% drop, healthy comms, quiet peer meters — so an inspector can argue with it in the field.",
    stat: "4 ranked signals per consumer",
    accent: "violet",
    ring: "ring-violet/25",
  },
  {
    key: "act",
    n: "03",
    tag: "Act",
    title: "Inspections sent where the money is",
    body: "Risk score × recoverable units × distance gives a daily inspection queue. Confirm the theft, resolve the case, watch loss fall on the same transformer.",
    stat: "Top 10 queue refreshed daily",
    accent: "mint",
    ring: "ring-mint/25",
  },
];

const BARS = [62, 58, 65, 61, 70, 66, 74, 71, 77, 34, 31, 29];
const SHAP = [
  { label: "Consumption drop", value: 42, tone: "bg-rose" },
  { label: "Comms healthy", value: 24, tone: "bg-violet" },
  { label: "Peer variance", value: 18, tone: "bg-sky" },
  { label: "Persistence", value: 11, tone: "bg-amber" },
];

/* Track geometry: (stages × 70vh) + 100vh. For 3 stages that is 310vh —
   the sticky panel spends 70vh of scroll on each stage plus one viewport of runway. */
const STAGE_VH = 70;
const TRACK_VH = STAGES.length * STAGE_VH;

function StageVisual({ stage }) {
  if (stage === "detect") {
    return (
      <div className="flex h-[136px] items-end gap-1.5">
        {BARS.map((b, i) => (
          <motion.span
            key={i}
            initial={{ height: 4 }}
            animate={{ height: `${b}%` }}
            transition={{ delay: i * 0.03, type: "spring", stiffness: 200, damping: 22 }}
            className={`flex-1 rounded-t-[3px] ${i >= 9 ? "bg-gradient-to-t from-rose/30 to-rose" : "bg-gradient-to-t from-brand/20 to-brand/60"}`}
          />
        ))}
      </div>
    );
  }
  if (stage === "explain") {
    return (
      <div className="space-y-3">
        {SHAP.map((s, i) => (
          <div key={s.label}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] text-ink-soft">{s.label}</span>
              <span className="mono text-[10px] text-ink-faint">+{s.value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-foreground/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.value * 2}%` }}
                transition={{ delay: i * 0.07, type: "spring", stiffness: 120, damping: 20 }}
                className={`h-full rounded-full ${s.tone}`}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {[
        ["01", "IN-MH-240204", "Theft/Tampering", "96"],
        ["02", "IN-MH-240231", "Theft/Tampering", "96"],
        ["03", "IN-MH-240210", "Requires Review", "94"],
      ].map(([rank, id, cause, score]) => (
        <div key={id} className="flex items-center gap-2 rounded-lg border border-border/60 bg-foreground/[0.03] px-2.5 py-2">
          <span className="mono text-[10px] text-ink-faint">{rank}</span>
          <span className="mono text-[11px] text-ink">{id}</span>
          <CauseChip cause={cause} className="ml-auto hidden sm:inline-flex" />
          <span className="mono text-[11px] text-rose">{score}</span>
        </div>
      ))}
    </div>
  );
}

/** One stage: absolutely stacked, cross-faded with overlapping scroll ranges. */
function StagePanel({ stage, index, progress }) {
  const seg = 1 / STAGES.length;
  const last = index === STAGES.length - 1;

  // Overlap: the incoming stage is fully opaque at (i + 1.06)·seg while the
  // outgoing one only reaches 0 at (i + 1.16)·seg — never both invisible.
  const a = index === 0 ? 0 : (index - 0.06) * seg;
  const b = (index + 0.06) * seg;
  const c = (index + 0.94) * seg;
  const d = (index + 1.16) * seg;

  const inputs = last ? [a, b, c] : [a, b, c, d];
  const outputs = last ? [0, 1, 1] : [0, 1, 1, 0];
  const opacity = useTransform(progress, inputs, outputs);
  const y = useTransform(progress, inputs, last ? [18, 0, 0] : [18, 0, 0, -14]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 grid content-center gap-6 lg:grid-cols-2 lg:items-center lg:gap-10"
      aria-hidden={false}
    >
      <div>
        <Pill tone={stage.accent}>{stage.tag}</Pill>
        <h3 className="mt-4 font-heading text-[28px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[34px]">
          {stage.title}
        </h3>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">{stage.body}</p>
        <p className="mono mt-4 text-[11px] uppercase tracking-[0.14em] text-ink-faint">{stage.stat}</p>
      </div>

      <div className="relative" style={{ perspective: 1200 }}>
        <motion.div
          animate={{ rotateY: -7, rotateX: 5 }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className={`relative rounded-2xl border border-border/70 bg-surface/80 p-5 shadow-panel ring-1 ${stage.ring}`}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">{stage.tag} output</span>
            <span className="mono text-[10px] text-ink-faint">{stage.n}/03</span>
          </div>
          <StageVisual stage={stage.key} />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function HowItThinks() {
  const ref = useRef(null);
  const motionOff = useMotionOff();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });
  const [index, setIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(STAGES.length - 1, Math.max(0, Math.floor(v * STAGES.length)));
    setIndex((prev) => (prev === next ? prev : next));
  });

  const stage = STAGES[index];

  return (
    <section id="detection" className="relative" style={{ paddingBottom: "var(--landing-rhythm)" }}>
      {/* Section spacing: pb-24 lg:pb-32 on the section — identical everywhere. */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
        <SectionHeader
          feature="01"
          eyebrow="AI Detection"
          title="How Volsentra"
          highlight="thinks."
          sub="Three steps, one loop: score the grid, explain the score, then spend inspection hours where the recovered rupees are."
        />
      </div>

      {motionOff ? (
        /* Static fallback: same content, no sticky track, no scroll animation. */
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {STAGES.map((s) => (
            <div key={s.key} className="rounded-2xl border border-border/70 bg-surface/80 p-5">
              <Pill tone={s.accent}>
                {s.n} · {s.tag}
              </Pill>
              <h4 className="mt-3 font-heading text-lg font-semibold text-ink">{s.title}</h4>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{s.body}</p>
              <div className="mt-4">
                <StageVisual stage={s.key} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Exactly three stage intervals; the pinned panel releases at the final stage. */
        <div ref={ref} className="relative" style={{ height: `${TRACK_VH}vh` }}>
          <div className="sticky top-24 h-auto">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-baseline gap-3">
                <span className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Stage</span>
                <span className="mono text-[13px] text-ink">
                  {stage.n} / 03
                </span>
              </div>
              <div className="mt-3 h-1 w-full max-w-sm overflow-hidden rounded-full bg-foreground/[0.07]">
                <motion.div
                  style={{ scaleX: bar, transformOrigin: "left" }}
                  className="h-full w-full rounded-full bg-gradient-to-r from-brand to-brand-2"
                />
              </div>

              {/* Fixed stage viewport: tall enough for the text + card stack on a 360px phone. */}
              <div className="relative mt-4 h-[470px] sm:h-[430px] lg:h-[320px]">
                {STAGES.map((s, i) => (
                  <StagePanel key={s.key} stage={s} index={i} progress={scrollYProgress} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
