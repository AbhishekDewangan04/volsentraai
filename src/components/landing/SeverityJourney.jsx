import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Eye, Gauge, ShieldAlert } from "lucide-react";
import SectionHeader from "@/components/common/SectionHeader";
import { useMotionOff } from "@/lib/useMotionPref";

const BANDS = [
    {
        key: "Low",
        range: "< 40",
        tone: "mint",
        icon: Eye,
        title: "Monitor",
        body: "The meter sits inside its peer band. Volsentra refreshes the baseline and spends no human time on it.",
        points: ["Auto-baseline refresh", "No case created"],
        footer: "70% of the grid",
        text: "text-mint",
        border: "border-mint/25",
        glow: "shadow-glow-mint",
        bar: "from-mint/30 to-mint",
        width: 38,
    },
    {
        key: "Medium",
        range: "40 – 79",
        tone: "amber",
        icon: Gauge,
        title: "Review",
        body: "Something moved but the evidence is thin. It lands in the analyst queue with its reasons and peer radar attached.",
        points: ["Analyst queue in 48h", "Second signal requested"],
        footer: "24% of the grid",
        text: "text-amber",
        border: "border-amber/25",
        glow: "shadow-glow-amber",
        bar: "from-amber/30 to-amber",
        width: 68,
    },
    {
        key: "Critical",
        range: "≥ 80",
        tone: "rose",
        icon: ShieldAlert,
        title: "Act",
        body: "Multiple independent signals agree. A case is opened, an inspection slot is offered for today, and the DT is tagged.",
        points: ["Inspection scheduled today", "DT loss tagged"],
        footer: "6% of the grid",
        text: "text-rose",
        border: "border-rose/25",
        glow: "shadow-glow-rose",
        bar: "from-rose/30 to-rose",
        width: 96,
    },
];

/* Track geometry: (bands × 70vh) + 100vh = 310vh, identical to “How Volsentra thinks”. */
const BAND_VH = 70;
const TRACK_VH = BANDS.length * BAND_VH;

function BandCard({ band, className = "", style }) {
    return (
        <div
            style={style}
            className={`relative overflow-hidden rounded-2xl border ${band.border} bg-surface/85 p-5 backdrop-blur transition-shadow duration-500 ${band.glow} ${className}`}
        >
            <div className="flex items-center justify-between">
                <div className={`grid h-10 w-10 place-items-center rounded-xl border ${band.border} bg-foreground/[0.04] ${band.text}`}>
                    <band.icon className="h-4 w-4" />
                </div>
                <span className={`mono text-[11px] uppercase tracking-[0.16em] ${band.text}`}>{band.key}</span>
            </div>

            <p className={`mono mt-5 text-2xl font-semibold ${band.text}`}>{band.range}</p>
            <h3 className="mt-1 font-heading text-lg font-semibold text-ink">{band.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{band.body}</p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-foreground/[0.06]">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${band.width}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${band.bar}`}
                />
            </div>

            <ul className="mt-4 space-y-1.5">
                {band.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-[12px] text-ink-soft">
                        <ArrowUpRight className={`h-3 w-3 ${band.text}`} /> {p}
                    </li>
                ))}
            </ul>
            <p className="mono mt-4 border-t border-border/60 pt-3 text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                {band.footer}
            </p>
        </div>
    );
}

const DOT_COLORS = {
    mint: "hsl(var(--mint))",
    amber: "hsl(var(--amber))",
    rose: "hsl(var(--rose))",
};

/** Progress rail driven by the same scrollYProgress as the cards. */
function ProgressDot({ index, progress, color }) {
    const seg = 1 / BANDS.length;
    const from = index === 0 ? 0 : (index - 0.06) * seg;
    const to = (index + 0.06) * seg;
    const opacity = useTransform(progress, [from, to], [0.22, 1]);
    const scaleX = useTransform(progress, [from, to], [0.8, 1.5]);
    return <motion.span style={{ opacity, scaleX, background: color }} className="h-1 w-8 rounded-full" />;
}

function StackedCard({ band, index, progress }) {
    const seg = 1 / BANDS.length;
    const last = index === BANDS.length - 1;
    const a = index === 0 ? 0 : (index - 0.06) * seg;
    const b = (index + 0.06) * seg;
    const c = (index + 0.94) * seg;
    const d = (index + 1.16) * seg;

    const inputs = last ? [a, b, c] : [a, b, c, d];
    const opacity = useTransform(progress, inputs, last ? [0, 1, 1] : [0, 1, 1, 0]);
    // Incoming card rises from below; outgoing card lifts and shrinks into the deck.
    const y = useTransform(progress, inputs, last ? [70, 0, 0] : [70, 0, 0, -34]);
    const scale = useTransform(progress, inputs, last ? [0.96, 1, 1] : [0.96, 1, 1, 0.95]);

    return (
        <motion.div style={{ opacity, y, scale }} className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-1">
            <BandCard band={band} />
        </motion.div>
    );
}

export default function SeverityJourney() {
    const ref = useRef(null);
    const motionOff = useMotionOff();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

    return (
        <section className="relative" style={{ paddingBottom: "var(--landing-rhythm)" }}>
            {/* Section spacing: pb-24 lg:pb-32 — matches every other landing section. */}
            <div className="mx-auto w-full max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
                <SectionHeader
                    feature="02"
                    eyebrow="Severity journey"
                    title="From a quiet meter to"
                    highlight="a knock on the door."
                />
            </div>

            {motionOff ? (
                <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
                    {BANDS.map((b) => (
                        <BandCard key={b.key} band={b} />
                    ))}
                </div>
            ) : (
                /* Track container height: 310vh = 3 × 70vh + 100vh. Releases flush into the CTA band. */
                <div ref={ref} className="relative" style={{ height: `${TRACK_VH}vh` }}>
                    {/* Pins below the 4rem sticky nav, same as “How Volsentra thinks”. */}
                    <div className="sticky top-24 h-auto">
                        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-5 flex items-center justify-center gap-1.5">
                                {BANDS.map((b, i) => (
                                    <ProgressDot key={b.key} index={i} progress={scrollYProgress} color={DOT_COLORS[b.tone]} />
                                ))}
                            </div>
                            <div className="relative mx-auto h-[480px] w-full max-w-xl sm:h-[430px]">
                                {BANDS.map((b, i) => (
                                    <StackedCard key={b.key} band={b} index={i} progress={scrollYProgress} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
