import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Flag, RotateCcw, ShieldAlert, Gavel, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CauseChip } from "@/components/common/Chip";
import { causeMeta, inr, num } from "@/lib/gridData";
import RollingNumber from "@/components/common/RollingNumber";

export default function SummaryRail({ consumer }) {
    const [decision, setDecision] = useState(null);
    const meta = causeMeta(consumer.cause);
    const recoverable = Math.max(0, (consumer.baseline_kwh - consumer.actual_kwh) * 8.4 * 3);

    const decide = (kind, message) => {
        setDecision(kind);
        toast.success(message, { description: `${consumer.consumer_id} · logged to the case activity.` });
    };

    return (
        <div className="panel overflow-hidden">
            <div className="border-b border-border/60 p-4">
                <p className="mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">Investigation</p>
                <h2 className="mono mt-1 break-all text-[17px] font-semibold leading-tight text-ink">{consumer.consumer_id}</h2>
                <p className="mt-0.5 text-[12px] text-ink-soft">
                    {consumer.name} · {consumer.category}
                </p>

                <div className="mt-3 flex items-center gap-3">
                    <div className="relative grid h-[72px] w-[72px] shrink-0 place-items-center">
                        <svg viewBox="0 0 72 72" className="absolute inset-0 -rotate-90">
                            <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                            <motion.circle
                                cx="36"
                                cy="36"
                                r="30"
                                fill="none"
                                stroke={meta.hex}
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 30}
                                initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 30 - (consumer.risk_score / 100) * 2 * Math.PI * 30 }}
                                transition={{ type: "spring", stiffness: 80, damping: 20 }}
                            />
                        </svg>
                        <div className="text-center">
                            <p className="mono text-[18px] font-semibold leading-none text-ink">
                                <RollingNumber value={consumer.risk_score} />
                            </p>
                            <p className="mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">risk</p>
                        </div>
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                        <CauseChip cause={consumer.cause} />
                        <p className="mono text-[10px] text-ink-faint">confidence {consumer.confidence}%</p>
                        <p className="mono text-[10px] text-ink-faint">last seen {consumer.last_seen}</p>
                    </div>
                </div>
            </div>

            <dl className="divide-y divide-border/50">
                {[
                    ["Feeder", consumer.feeder],
                    ["Transformer", consumer.transformer_id],
                    ["Area", consumer.area],
                    ["Baseline", `${num(consumer.baseline_kwh)} kWh`],
                    ["Last month", `${num(consumer.actual_kwh)} kWh`],
                    ["Recoverable", `${inr(recoverable)} / qtr`],
                ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-2 px-4 py-2">
                        <dt className="text-[11px] text-ink-faint">{k}</dt>
                        <dd className="mono truncate text-[11px] text-ink">{v}</dd>
                    </div>
                ))}
            </dl>

            <div className="space-y-2 border-t border-border/60 p-3">
                {decision ? (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-mint/30 bg-mint/8 p-3">
                        <div className="flex items-center gap-2">
                            <svg viewBox="0 0 24 24" className="h-5 w-5 text-mint" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <motion.path d="M4 12.5l5 5L20 6.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className="text-[12px] font-medium text-mint">
                                {decision === "approved" ? "Inspection approved" : decision === "false" ? "Marked false positive" : "Review requested"}
                            </p>
                        </div>
                        <p className="mt-1 text-[10px] leading-snug text-ink-soft">
                            {decision === "approved"
                                ? "Queued for A. Kulkarni · inspection slot today."
                                : decision === "false"
                                    ? "Consumer removed from the active queue and added to the model's feedback set."
                                    : "Sent to the analyst queue with this evidence attached."}
                        </p>
                        <button type="button" onClick={() => setDecision(null)} className="mono mt-2 flex items-center gap-1 text-[9px] uppercase tracking-[0.1em] text-ink-faint hover:text-ink">
                            <RotateCcw className="h-2.5 w-2.5" /> undo
                        </button>
                    </motion.div>
                ) : (
                    <>
                        <Button
                            onClick={() => decide("approved", "Inspection approved")}
                            className="h-9 w-full gap-1.5 rounded-full bg-gradient-to-r from-brand to-brand-2 text-[12px] text-white"
                        >
                            <UserCheck className="h-3.5 w-3.5" /> Approve inspection
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" onClick={() => decide("false", "Marked false positive")} className="h-8 gap-1 rounded-full border-border/80 text-[11px]">
                                <Flag className="h-3 w-3" /> False positive
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => decide("review", "Review requested")} className="h-8 gap-1 rounded-full border-border/80 text-[11px]">
                                <Gavel className="h-3 w-3" /> Request review
                            </Button>
                        </div>
                    </>
                )}
                <p className="mono flex items-center gap-1 text-[9px] uppercase tracking-[0.1em] text-ink-faint">
                    <Check className="h-2.5 w-2.5" /> every action is written to the case log
                </p>
            </div>

            <div className="flex items-center gap-2 border-t border-border/60 bg-foreground/[0.02] px-4 py-2">
                <ShieldAlert className="h-3 w-3 text-rose" />
                <p className="mono text-[9px] uppercase tracking-[0.1em] text-ink-faint">recommended: field inspection</p>
            </div>
        </div>
    );
}