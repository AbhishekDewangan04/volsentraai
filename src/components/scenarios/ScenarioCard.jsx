import { motion } from "framer-motion";
import { Check, Loader2, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/common/Chip";

const TONE = {
    Normal: "mint",
    "Theft/Tampering": "rose",
    "Meter Fault": "violet",
    "Communication Failure": "sky",
    "Legit Abnormal": "volt",
    "Requires Review": "amber",
};

export default function ScenarioCard({ scenario, result, running, onRun, index }) {
    const pass = result?.pass ?? null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.04, type: "spring", stiffness: 260, damping: 24 }}
            className="group relative overflow-hidden rounded-2xl border border-border/70 bg-surface/80 p-3.5 transition-shadow hover:shadow-glow-brand"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="mono text-[8px] uppercase tracking-[0.14em] text-ink-faint">scenario {String(index + 1).padStart(2, "0")}</p>
                    <h3 className="mt-0.5 truncate text-[12.5px] font-medium text-ink">{scenario.name}</h3>
                </div>
                {pass !== null && (
                    <span
                        className={`mono flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] ${pass ? "bg-mint/12 text-mint" : "bg-rose/12 text-rose"
                            }`}
                    >
                        {pass ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                        {pass ? "pass" : "fail"}
                    </span>
                )}
            </div>

            <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-ink-faint">{scenario.detail}</p>

            <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                    <span className="mono text-[9px] uppercase tracking-[0.1em] text-ink-faint">expected</span>
                    <Pill tone={TONE[scenario.expected] ?? "neutral"}>{scenario.expected}</Pill>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <span className="mono text-[9px] uppercase tracking-[0.1em] text-ink-faint">actual</span>
                    {running ? (
                        <span className="mono flex items-center gap-1 text-[9px] text-ink-faint">
                            <Loader2 className="h-2.5 w-2.5 animate-spin" /> scoring…
                        </span>
                    ) : result ? (
                        <Pill tone={TONE[result.actual] ?? "neutral"}>{result.actual}</Pill>
                    ) : (
                        <span className="mono text-[9px] text-ink-faint">not run</span>
                    )}
                </div>
            </div>

            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-foreground/[0.06]">
                <motion.div
                    animate={{ width: running ? "70%" : result ? "100%" : "0%" }}
                    transition={{ duration: running ? 0.9 : 0.4 }}
                    className={`h-full rounded-full ${pass === false ? "bg-rose" : "bg-gradient-to-r from-brand to-mint"}`}
                />
            </div>

            <Button
                size="sm"
                variant="outline"
                disabled={running}
                onClick={() => onRun(scenario)}
                className="mt-2.5 h-7 w-full gap-1 rounded-lg border-border/80 bg-foreground/[0.02] text-[10px]"
            >
                <Play className="h-2.5 w-2.5" /> {result ? "Run again" : "Run scenario"}
            </Button>
        </motion.div>
    );
}