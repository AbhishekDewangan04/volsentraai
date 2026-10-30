import { motion } from "framer-motion";
import { Cpu, Database, Gauge, LayoutDashboard, Radio, Server } from "lucide-react";

const NODES = [
    { icon: Gauge, label: "Smart meter", sub: "secure DLMS", latency: 8 },
    { icon: Radio, label: "MQTT / WebSocket", sub: "broker", latency: 34 },
    { icon: Server, label: "Backend", sub: "ingest + validate", latency: 62 },
    { icon: Cpu, label: "ML engine", sub: "score + cause", latency: 210 },
    { icon: Database, label: "Database", sub: "time series", latency: 48 },
    { icon: LayoutDashboard, label: "Dashboard", sub: "you are here", latency: 50 },
];

export default function Pipeline({ live = true }) {
    const total = NODES.reduce((s, n) => s + n.latency, 0);

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">End-to-end pipeline</p>
                <p className="mono text-[10px] text-mint">{total} ms total</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {NODES.map((n, i) => (
                    <motion.div
                        key={n.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="relative rounded-xl border border-border/70 bg-foreground/[0.03] px-2.5 py-2.5"
                    >
                        <div className="flex items-center gap-1.5">
                            <n.icon className="h-3.5 w-3.5 text-brand" />
                            <span className="mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">0{i + 1}</span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium leading-tight text-ink">{n.label}</p>
                        <p className="mono truncate text-[9px] text-ink-faint">{n.sub}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                            <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-foreground/[0.08]">
                                <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-2" style={{ width: `${Math.min(100, n.latency / 2.2)}%` }} />
                            </div>
                            <span className="mono text-[9px] text-ink-soft">{n.latency}ms</span>
                        </div>
                        {i < NODES.length - 1 && (
                            <span aria-hidden="true" className="absolute -right-[7px] top-1/2 hidden h-px w-3.5 -translate-y-1/2 bg-[repeating-linear-gradient(90deg,rgba(124,92,255,0.9)_0_3px,transparent_3px_7px)] lg:block" />
                        )}
                    </motion.div>
                ))}
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-foreground/[0.06]">
                <div
                    className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-brand to-transparent"
                    style={{ animation: live ? "gg-marquee 3.2s linear infinite" : "none" }}
                />
            </div>
        </div>
    );
}