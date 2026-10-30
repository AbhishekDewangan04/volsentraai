import { motion } from "framer-motion";
import RollingNumber from "@/components/common/RollingNumber";
import Marquee from "@/components/fx/Marquee";

const STATS = [
    { label: "Meters scored nightly", value: 200, suffix: "", note: "3 feeders · 10 DTs" },
    { label: "Model precision", value: 94.2, suffix: "%", note: "held-out 12-month window", decimals: true },
    { label: "Monthly recovery", value: 12.4, prefix: "₹", suffix: "L", note: "at ₹8.40 / kWh", decimals: true },
    { label: "Detection latency", value: 412, suffix: "ms", note: "meter → alert" },
];

const STACK = ["Isolation Forest", "XGBoost", "LightGBM", "LSTM Autoencoder", "MQTT", "ESP32"];

export default function StatStrip() {
    return (
        /* Section spacing token: pb-24 mobile / pb-32 desktop — identical to every other section. */
        <section className="relative" style={{ paddingBottom: "var(--landing-rhythm)" }}>
            <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-y-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
                {STATS.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ delay: i * 0.06, type: "spring", stiffness: 260, damping: 24 }}
                        className="relative px-1 lg:px-6"
                    >
                        {i > 0 && <span aria-hidden="true" className="absolute -left-0 top-1 hidden h-full w-px bg-border/70 lg:block" />}
                        <p className="font-heading text-[28px] font-semibold tracking-[-0.03em] text-ink sm:text-[32px]">
                            <RollingNumber
                                value={s.value}
                                prefix={s.prefix}
                                suffix={s.suffix}
                                format={(v) => (s.decimals ? v.toFixed(1) : Math.round(v).toLocaleString("en-US"))}
                            />
                        </p>
                        <p className="mt-1 text-[13px] font-medium text-ink">{s.label}</p>
                        <p className="mono mt-0.5 text-[10px] uppercase tracking-[0.12em] text-ink-faint">{s.note}</p>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 border-y border-border/60 bg-foreground/[0.02] py-3">
                <Marquee items={STACK} />
            </div>
        </section>
    );
}
