import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHead from "@/components/common/PageHead";
import Panel from "@/components/common/Panel";
import LiveDot from "@/components/common/LiveDot";
import RollingNumber from "@/components/common/RollingNumber";
import KpiRow from "@/components/dashboard/KpiRow";
import Pipeline from "@/components/live/Pipeline";
import StreamChart from "@/components/live/StreamChart";
import ReadingsTable from "@/components/live/ReadingsTable";
import ScenarioInjector from "@/components/live/ScenarioInjector";
import { getAlerts, getConsumers } from "@/lib/gridService";
import { causeMeta, timeAgo } from "@/lib/gridData";
import { useGrid } from "@/lib/GridContext";

export const Route = createFileRoute("/dashboard/live")({
    ssr: false,
    head: () => ({ meta: [{ title: "Live IoT Monitor · Volsentra AI" }] }),
    component: LivePage,
});

const SEED = [118, 121, 117, 124, 129, 126, 131, 128, 135, 141, 138, 134, 92, 88, 96, 102, 108, 111, 115, 119, 122, 118, 124, 130, 127, 133, 129, 136, 132, 138];

function LivePage() {
    const { data: consumers = [] } = useQuery({ queryKey: ["consumers"], queryFn: getConsumers });
    const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: () => getAlerts(6) });
    const { injectScenario, liveAlerts } = useGrid();

    const [paused, setPaused] = useState(false);
    const [tick, setTick] = useState(0);
    const [spike, setSpike] = useState(0);
    const [events, setEvents] = useState([]);

    const [series, setSeries] = useState(() => {
        const base = Date.now();
        return SEED.map((kw, i) => ({
            t: new Date(base - (SEED.length - i) * 2000).toTimeString().slice(0, 8),
            kw,
            anomaly: i === 12 || i === 13,
        }));
    });

    useEffect(() => {
        if (paused) return;
        const id = setInterval(() => {
            setTick((t) => t + 1);
            setSpike((s) => (s > 0 ? s - 1 : 0));
            setSeries((prev) => {
                const last = prev[prev.length - 1]?.kw ?? 120;
                const noise = (Math.random() - 0.5) * 9;
                const kw = Math.max(48, Math.round(last + noise + (spike > 0 ? 42 : 0)));
                return [...prev.slice(1), { t: new Date().toTimeString().slice(0, 8), kw, anomaly: spike > 0 || kw > 165 || kw < 60 }];
            });
        }, 2000);
        return () => clearInterval(id);
    }, [paused, spike]);

    const readings = useMemo(() => {
        if (consumers.length === 0) return [];
        return Array.from({ length: 9 }).map((_, i) => {
            const c = consumers[(tick * 3 + i * 5) % consumers.length];
            const kw = Number((c.actual_kwh / 720 + ((tick + i) % 5) * 0.06).toFixed(2));
            return {
                seq: `${tick}-${i}`,
                consumer_id: c.consumer_id,
                cause: c.cause,
                kw,
                delta: Math.round((((tick + i * 3) % 11) - 5) * 1.7),
            };
        });
    }, [consumers, tick]);

    const feed = [...events, ...liveAlerts, ...alerts].slice(0, 8);

    const handleInject = (consumer, type) => {
        injectScenario(consumer, type);
        setSpike(3);
        setEvents((prev) =>
            [
                {
                    id: `ev-${Date.now()}`,
                    consumer_id: consumer.consumer_id,
                    cause: type === "theft" ? "Theft/Tampering" : type === "meter" ? "Meter Fault" : type === "comms" ? "Communication Failure" : type === "legit" ? "Legit Abnormal" : "Normal",
                    title: `${type === "reset" ? "Signal restored" : "Scenario injected"} · ${consumer.consumer_id}`,
                    detail: `${consumer.feeder} · ${consumer.transformer_id} · live stream updated`,
                    at: new Date().toISOString(),
                    severity: type === "theft" ? "critical" : "high",
                },
                ...prev,
            ].slice(0, 10),
        );
    };

    const kpis = [
        { label: "Meters streaming", value: 50, note: "sampled from 200", tone: "sky", glow: "sky", spark: SEED.slice(0, 12) },
        { label: "Messages / min", value: 1500 + tick * 3, note: "MQTT QoS 1", tone: "brand", spark: SEED.slice(6, 18) },
        { label: "Avg pipeline latency", value: 412, suffix: " ms", note: "meter → dashboard", tone: "violet", glow: "violet", spark: SEED.slice(12, 24) },
        { label: "Anomalies · 5 min", value: 3 + spike, note: "flagged by the ML engine", tone: "rose", glow: "rose", spark: SEED.slice(18, 30) },
    ];

    return (
        <>
            <PageHead
                eyebrow="Streaming telemetry"
                title="Live IoT"
                titleKey="page.live"
                highlight="monitor"
                sub="Fifty meters replaying two-second reads through the full pipeline. Inject a scenario and watch the score, the alert and the 3D grid react together."
                actions={
                    <>
                        <span className="mono hidden items-center gap-1.5 rounded-full border border-mint/25 bg-mint/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-mint sm:flex">
                            <LiveDot tone="mint" size="h-1.5 w-1.5" /> {paused ? "paused" : "streaming"}
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPaused((p) => !p)}
                            className="h-8 gap-1.5 rounded-full border-border/80 bg-foreground/[0.03] text-[12px]"
                        >
                            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                            {paused ? "Resume" : "Pause"}
                        </Button>
                    </>
                }
            />

            <KpiRow items={kpis} />

            <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_300px]">
                <div className="space-y-3">
                    <Panel eyebrow="Data path" title="Smart meter → dashboard">
                        <Pipeline live={!paused} />
                    </Panel>

                    <StreamChart data={series} paused={paused} onTogglePause={() => setPaused((p) => !p)} />
                    <p className="mono mt-1 text-[9px] uppercase tracking-[0.12em] text-ink-faint">
                        red markers = anomaly flagged by the engine
                    </p>

                    <Panel eyebrow="Readings" title="Latest meter frames">
                        {readings.length ? <ReadingsTable rows={readings} /> : <div className="h-32 animate-pulse rounded-lg bg-foreground/[0.04]" />}
                    </Panel>
                </div>

                <div className="space-y-3">
                    <Panel eyebrow="Controls" title="Inject a scenario">
                        <ScenarioInjector consumers={[...consumers].sort((a, b) => b.risk_score - a.risk_score)} onInject={handleInject} />
                    </Panel>

                    <Panel eyebrow="Event feed" title="Last events" bodyClassName="p-0">
                        <div className="max-h-[360px] overflow-y-auto scroll-thin">
                            {feed.map((e, i) => {
                                const meta = causeMeta(e.cause);
                                return (
                                    <div key={e.id ?? `${e.consumer_id}-${i}`} className="border-b border-border/50 px-4 py-2.5 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} />
                                            <p className="mono min-w-0 flex-1 truncate text-[11px] text-ink">{e.title}</p>
                                            <span className="mono shrink-0 text-[9px] text-ink-faint">{timeAgo(e.at ?? e.raised_at)}</span>
                                        </div>
                                        <p className="mt-0.5 truncate pl-3.5 text-[10px] text-ink-faint">{e.detail}</p>
                                    </div>
                                );
                            })}
                            {feed.length === 0 && <p className="px-4 py-8 text-center text-[12px] text-ink-faint">Waiting for events…</p>}
                        </div>
                    </Panel>

                    <div className="rounded-xl border border-border/70 bg-foreground/[0.02] p-3">
                        <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">Note</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
                            This stream is simulated in the browser. Swap the simulator for an ESP32 energy sensor publishing to MQTT
                            and the same pipeline carries real reads.
                        </p>
                        <p className="mono mt-2 text-[10px] text-ink-faint">
                            frames <RollingNumber value={tick * 50} />
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}