import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Boxes } from "lucide-react";
import TiltCard from "@/components/common/TiltCard";

export default function ClusterCards({ rows }) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((t) => {
                const critical = t.loss_pct >= 14;
                return (
                    <TiltCard key={t.transformer_id} glow={critical ? "rose" : "brand"} className="p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="mono whitespace-nowrap text-[12px] text-ink">{t.transformer_id}</p>
                                <p className="truncate text-[11px] text-ink-faint">
                                    {t.name} · {t.feeder}
                                </p>
                            </div>
                            <span className={`mono shrink-0 text-[16px] font-semibold ${critical ? "text-rose" : "text-ink"}`}>{t.loss_pct}%</span>
                        </div>

                        <div className="mt-2 flex gap-1">
                            {Array.from({ length: 24 }).map((_, i) => (
                                <span key={i} className={`h-3 flex-1 rounded-[1px] ${i < Math.round((t.loss_pct / 26) * 24) ? (critical ? "bg-rose/80" : "bg-brand/60") : "bg-foreground/[0.06]"}`} />
                            ))}
                        </div>

                        <div className="mono mt-2 flex items-center gap-2 text-[10px] text-ink-faint">
                            <Boxes className="h-3 w-3" /> {t.suspiciousCount} suspicious · {t.consumers} meters
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1">
                            {t.sample.slice(0, 3).map((c) => (
                                <span key={c.consumer_id} className="mono rounded border border-border/70 bg-foreground/[0.03] px-1.5 py-0.5 text-[9px] text-ink-soft">
                                    {c.consumer_id}
                                </span>
                            ))}
                        </div>

                        <Link
                            to="/dashboard/grid"
                            className="mono mt-3 flex items-center gap-1 border-t border-border/60 pt-2 text-[10px] uppercase tracking-[0.12em] text-brand hover:opacity-80"
                        >
                            View cluster on grid <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </TiltCard>
                );
            })}
        </div>
    );
}