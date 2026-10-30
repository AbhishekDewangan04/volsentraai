import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pause, Play } from "lucide-react";
import { getAlerts } from "@/lib/gridService";
import { causeMeta } from "@/lib/gridData";
import { useGrid } from "@/lib/GridContext";
import LiveDot from "@/components/common/LiveDot";

export default function Ticker() {
    const [paused, setPaused] = useState(false);
    const { liveAlerts } = useGrid();
    const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: () => getAlerts(14) });

    const items = [...liveAlerts, ...alerts].slice(0, 14);
    const row = items.length ? [...items, ...items] : [];

    return (
        <div
            className="group relative flex h-9 items-center overflow-hidden border-b border-border/70 bg-surface/50"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="z-10 flex h-full shrink-0 items-center gap-1.5 border-r border-border/70 bg-surface/90 px-3">
                <LiveDot tone="rose" size="h-1.5 w-1.5" />
                <span className="mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">Live</span>
                <span className="hidden text-ink-faint sm:inline">
                    {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                </span>
            </div>

            {row.length === 0 ? (
                <p className="px-3 text-[11px] text-ink-faint">Listening for meter events…</p>
            ) : (
                <div className="flex min-w-0 flex-1 overflow-hidden">
                    <div
                        className="flex w-max shrink-0 items-center gap-6 whitespace-nowrap px-4"
                        style={{ animation: "gg-marquee 60s linear infinite", animationPlayState: paused ? "paused" : "running" }}
                    >
                        {row.map((a, i) => {
                            const meta = causeMeta(a.cause);
                            return (
                                <span key={`${a.id ?? a.title}-${i}`} className="flex items-center gap-2 text-[11px]">
                                    <span className={`mono text-[10px] uppercase tracking-[0.12em] ${meta.text}`}>{meta.short}</span>
                                    <span className="mono text-ink-soft">{a.consumer_id}</span>
                                    <span className="max-w-[280px] truncate text-ink-faint">{a.detail ?? a.title}</span>
                                    <span className="h-1 w-1 rounded-full bg-border" />
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}