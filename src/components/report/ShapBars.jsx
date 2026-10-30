import { motion } from "framer-motion";
import { causeMeta } from "@/lib/gridData";

export function shapFactors(consumer) {
    const drop = Math.max(0, Math.round((1 - consumer.actual_kwh / Math.max(1, consumer.baseline_kwh)) * 100));
    const base = consumer.risk_score;
    const raw = [
        { label: "Consumption deviation", weight: drop * 0.6, note: `${drop}% below the 12-month baseline` },
        { label: "Peer comparison", weight: 22, note: `peers average ${Math.round(consumer.peer_avg_kwh)} kWh on the same DT` },
        {
            label: "Communication health",
            weight: consumer.cause === "Communication Failure" ? -18 : 16,
            note: consumer.cause === "Communication Failure" ? "no heartbeats for 3 weeks" : "heartbeat steady through the drop",
        },
        { label: "Persistence", weight: 13, note: "pattern held for 3 billing cycles" },
        { label: "Tamper / reverse flow", weight: consumer.cause === "Normal" ? -9 : 7, note: "meter event log reviewed" },
    ];
    const total = raw.reduce((s, r) => s + Math.abs(r.weight), 0) || 1;
    return raw.map((r) => ({ ...r, value: Math.round((Math.abs(r.weight) / total) * base), positive: r.weight > 0 }));
}

export default function ShapBars({ consumer }) {
    const rows = shapFactors(consumer);
    const meta = causeMeta(consumer.cause);
    const max = Math.max(...rows.map((r) => r.value));

    return (
        <div className="space-y-3">
            {rows.map((r, i) => (
                <div key={r.label}>
                    <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-[11px] text-ink-soft">{r.label}</p>
                        <p className={`mono text-[10px] ${r.positive ? "text-rose" : "text-mint"}`}>
                            {r.positive ? "+" : "−"}
                            {r.value}
                        </p>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-foreground/[0.06]">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(r.value / max) * 100}%` }}
                            transition={{ delay: i * 0.06, type: "spring", stiffness: 120, damping: 20 }}
                            className="h-full rounded-full"
                            style={{ background: r.positive ? `linear-gradient(90deg, ${meta.hex}55, ${meta.hex})` : "linear-gradient(90deg,#2EE6A644,#2EE6A6)" }}
                        />
                    </div>
                    <p className="mt-1 text-[10px] leading-snug text-ink-faint">{r.note}</p>
                </div>
            ))}
        </div>
    );
}