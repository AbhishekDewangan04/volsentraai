import { motion } from "framer-motion";
import { Check, Clock } from "lucide-react";
import { causeMeta } from "@/lib/gridData";

export default function ReasoningTimeline({ consumer }) {
    const meta = causeMeta(consumer.cause);
    const steps = [
        `Consumption dropped ${Math.round((1 - consumer.actual_kwh / Math.max(1, consumer.baseline_kwh)) * 100)}% against baseline`,
        consumer.cause === "Communication Failure" ? "Communication failed — readings went silent" : "Communication remained normal throughout",
        `Pattern persisted for ${consumer.cause === "Meter Fault" ? "9 intermittent days" : "3 billing cycles"}`,
        `Peer meters on ${consumer.transformer_id} unaffected`,
        `Probable cause: ${meta.label} · ${consumer.confidence}% confidence`,
    ];

    return (
        <ol className="relative space-y-3.5 pl-1">
            <span aria-hidden="true" className="absolute left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-brand/60 via-border to-rose/40" />
            {steps.map((s, i) => {
                const last = i === steps.length - 1;
                return (
                    <motion.li
                        key={s}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.18 }}
                        className="relative flex gap-3"
                    >
                        <span
                            className={`relative z-10 mt-0.5 grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full border ${last ? "border-rose/50 bg-rose/15 text-rose" : "border-border bg-surface text-ink-faint"
                                }`}
                        >
                            {last ? <Check className="h-2.5 w-2.5" /> : <span className="h-1 w-1 rounded-full bg-current" />}
                        </span>
                        <div className="min-w-0">
                            <p className={`text-[12px] leading-snug ${last ? "font-medium text-ink" : "text-ink-soft"}`}>{s}</p>
                            <p className="mono mt-0.5 flex items-center gap-1 text-[9px] uppercase tracking-[0.1em] text-ink-faint">
                                <Clock className="h-2.5 w-2.5" /> step {i + 1} · {(0.4 + i * 0.3).toFixed(1)}s
                            </p>
                        </div>
                    </motion.li>
                );
            })}
        </ol>
    );
}