import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Pause, Play, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import PageHead from "@/components/common/PageHead";
import GridScene from "@/components/grid3d/GridScene";
import SceneControls from "@/components/grid3d/SceneControls";
import DetailDrawer from "@/components/grid3d/DetailDrawer";
import { getConsumers, getTransformers } from "@/lib/gridService";
import { CAUSES, MONTHS, causeMeta } from "@/lib/gridData";
import { useGrid } from "@/lib/GridContext";

export const Route = createFileRoute("/dashboard/grid")({
    ssr: false,
    head: () => ({ meta: [{ title: "3D Grid Explorer · Volsentra AI" }] }),
    component: GridPage,
});

function GridPage() {
    const { data: consumers = [] } = useQuery({ queryKey: ["consumers"], queryFn: getConsumers });
    const { data: transformers = [] } = useQuery({ queryKey: ["transformers"], queryFn: getTransformers });
    const { overrides, focusTransformer, setFocusTransformer } = useGrid();

    const [filters, setFilters] = useState({ risk: "all", feeder: "all", transformer: "all", category: "all", cause: "all" });
    const [heatmap, setHeatmap] = useState(false);
    const [onlySuspicious, setOnlySuspicious] = useState(false);
    const [month, setMonth] = useState(11);
    const [playing, setPlaying] = useState(false);
    const [spin, setSpin] = useState(0);
    const [selection, setSelection] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        if (!playing) return;
        const id = setInterval(() => setMonth((m) => (m + 1) % 12), 950);
        return () => clearInterval(id);
    }, [playing]);

    // Arriving from Transformer Analysis: open that DT's cluster straight away.
    useEffect(() => {
        if (!focusTransformer || transformers.length === 0) return;
        const t = transformers.find((x) => x.transformer_id === focusTransformer);
        if (t) {
            setSelection({ transformer: t });
            setDrawerOpen(true);
            setFilters((f) => ({ ...f, transformer: "all", risk: "all" }));
        }
        setFocusTransformer(null);
    }, [focusTransformer, transformers, setFocusTransformer]);

    const feeders = useMemo(() => [...new Set(consumers.map((c) => c.feeder))], [consumers]);

    const visible = useMemo(
        () =>
            consumers
                .map((c) =>
                    overrides[c.consumer_id]
                        ? { ...c, cause: overrides[c.consumer_id], risk_score: overrides[c.consumer_id] === "Normal" ? 18 : Math.max(c.risk_score, 84) }
                        : c,
                )
                .filter((c) => {
                    if (filters.feeder !== "all" && c.feeder !== filters.feeder) return false;
                    if (filters.transformer !== "all" && c.transformer_id !== filters.transformer) return false;
                    if (filters.category !== "all" && c.category !== filters.category) return false;
                    if (filters.cause !== "all" && c.cause !== filters.cause) return false;
                    if (filters.risk === "critical" && c.risk_score < 80) return false;
                    if (filters.risk === "high" && c.risk_score < 60) return false;
                    if (filters.risk === "medium" && (c.risk_score < 40 || c.risk_score >= 60)) return false;
                    if (filters.risk === "low" && c.risk_score >= 40) return false;
                    return true;
                }),
        [consumers, filters, overrides],
    );

    const handleSelect = (payload) => {
        if (payload?.transformer) setSelection({ transformer: payload.transformer });
        else setSelection({ consumer: payload });
        setDrawerOpen(true);
    };

    const flagged = visible.filter((c) => c.risk_score >= 55).length;

    return (
        <>
            <PageHead
                eyebrow="Spatial intelligence"
                title="3D grid"
                titleKey="page.grid"
                highlight="explorer"
                sub="Every meter is a node on its distribution transformer. Drag to orbit, click a node to fly in, and scrub the last twelve months to watch the losses emerge."
                actions={
                    <>
                        <span className="mono hidden items-center gap-1.5 rounded-full border border-border/70 bg-foreground/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-ink-soft sm:flex">
                            {visible.length} nodes · {flagged} flagged
                        </span>
                        <Button asChild size="sm" className="h-8 gap-1.5 rounded-full bg-gradient-to-r from-brand to-brand-2 text-[12px] text-white">
                            <Link to="/dashboard/live">
                                <Radio className="h-3.5 w-3.5" /> Live monitor
                            </Link>
                        </Button>
                    </>
                }
            />

            <div className="grid gap-3 xl:grid-cols-[1fr_248px]">
                <GridScene
                    consumers={visible}
                    transformers={transformers}
                    month={month}
                    onSelect={handleSelect}
                    selectedId={selection?.consumer?.consumer_id}
                    heatmap={heatmap}
                    showOnlySuspicious={onlySuspicious}
                    spin={spin}
                    onSpin={setSpin}
                >
                    <div className="pointer-events-none absolute right-3 top-3 z-20 hidden rounded-xl border border-border/70 bg-surface/85 p-2.5 backdrop-blur-xl md:block">
                        <p className="mono mb-1.5 text-[9px] uppercase tracking-[0.14em] text-ink-faint">{heatmap ? "Risk heat" : "Cause"}</p>
                        {heatmap ? (
                            <div className="space-y-1">
                                <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-mint via-amber to-rose" />
                                <div className="mono flex justify-between text-[8px] text-ink-faint">
                                    <span>low</span>
                                    <span>critical</span>
                                </div>
                            </div>
                        ) : (
                            <ul className="space-y-1">
                                {CAUSES.filter((c) => c !== "Legit Abnormal").map((c) => (
                                    <li key={c} className="mono flex items-center gap-1.5 text-[9px] text-ink-soft">
                                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: causeMeta(c).hex }} />
                                        {causeMeta(c).short}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="pointer-events-none absolute right-3 bottom-[86px] z-20 hidden h-[92px] w-[124px] overflow-hidden rounded-xl border border-border/70 bg-surface/85 backdrop-blur-xl lg:block">
                        <svg viewBox="0 0 100 70" className="h-full w-full">
                            <rect width="100" height="70" fill="rgba(124,92,255,0.05)" />
                            {visible.map((c) => (
                                <circle key={c.consumer_id} cx={c.x} cy={c.z * 0.7} r="1" fill={causeMeta(c.cause).hex} fillOpacity={c.risk_score >= 55 ? 0.95 : 0.35} />
                            ))}
                            <rect x="12" y="8" width="76" height="56" rx="2" fill="none" stroke="rgba(124,92,255,0.5)" strokeDasharray="2 2" />
                        </svg>
                        <span className="mono absolute left-1.5 top-1 text-[7px] uppercase tracking-[0.1em] text-ink-faint">minimap</span>
                    </div>

                    <div className="absolute inset-x-3 bottom-3 z-20 rounded-xl border border-border/70 bg-surface/85 p-2.5 backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setPlaying((p) => !p)}
                                aria-label={playing ? "Pause time-lapse" : "Play time-lapse"}
                                className="h-7 w-7 shrink-0 rounded-full border border-brand/30 bg-brand/12 text-brand hover:bg-brand/20"
                            >
                                {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                            </Button>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">12-month time-lapse</p>
                                    <p className="mono text-[10px] text-ink">
                                        {MONTHS[month]} <span className="text-ink-faint">· {String(month + 1).padStart(2, "0")}/12</span>
                                    </p>
                                </div>
                                <Slider value={[month]} min={0} max={11} step={1} onValueChange={(v) => setMonth(v[0])} className="mt-1.5" />
                            </div>
                        </div>
                    </div>
                </GridScene>

                <div className="xl:sticky xl:top-[104px] xl:self-start">
                    <SceneControls
                        filters={filters}
                        setFilters={setFilters}
                        transformers={transformers}
                        feeders={feeders}
                        heatmap={heatmap}
                        setHeatmap={setHeatmap}
                        onlySuspicious={onlySuspicious}
                        setOnlySuspicious={setOnlySuspicious}
                    />
                    <div className="mt-2 rounded-xl border border-border/70 bg-surface/70 p-3">
                        <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">Legend</p>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">
                            Diamonds are meters, cubes are distribution transformers, and the yellow node is the 132/33 kV substation.
                            Pulsing halos mark meters scoring above 70.
                        </p>
                    </div>
                </div>
            </div>

            <DetailDrawer open={drawerOpen} onOpenChange={setDrawerOpen} consumer={selection?.consumer} transformer={selection?.transformer} />
        </>
    );
}