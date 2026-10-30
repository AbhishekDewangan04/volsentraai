import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHead from "@/components/common/PageHead";
import Panel from "@/components/common/Panel";
import { Pill } from "@/components/common/Chip";
import RollingNumber from "@/components/common/RollingNumber";
import { PrCurve, RocCurve } from "@/components/model/Curves";
import ConfusionHeatmap from "@/components/model/ConfusionHeatmap";
import ModelTable from "@/components/model/ModelTable";
import ImpactCalculator from "@/components/dashboard/ImpactCalculator";
import { getModelFeedback } from "@/lib/gridService";
import { modelPerformance } from "@/lib/modelMetrics";

export const Route = createFileRoute("/dashboard/model")({
    ssr: false,
    head: () => ({ meta: [{ title: "Model Performance · Volsentra AI" }] }),
    component: ModelPage,
});

const LATENCY = [
    { stage: "fetch", ms: 62 },
    { stage: "features", ms: 88 },
    { stage: "model", ms: 190 },
    { stage: "explain", ms: 42 },
    { stage: "persist", ms: 30 },
];

const ROBUST = [
    { label: "20% missing reads", f1: 88.4, drop: 4.4 },
    { label: "Noisy readings (±15%)", f1: 89.9, drop: 2.9 },
    { label: "New consumer, no history", f1: 85.1, drop: 7.7 },
    { label: "Transformer outage", f1: 87.2, drop: 5.6 },
];

function ModelPage() {
    const { data: feedback = [] } = useQuery({ queryKey: ["model-feedback"], queryFn: getModelFeedback });
    const { metrics, confusion, learned } = useMemo(() => modelPerformance(feedback), [feedback]);

    return (
        <>
            <PageHead
                eyebrow="Model health"
                title="Model"
                titleKey="page.model"
                highlight="performance"
                sub="Held-out evaluation of the hybrid ensemble on 1,400 meter-months with confirmed field outcomes, plus how it degrades when the data gets ugly."
                actions={
                    <Pill tone="brand" dot>
                        hybrid ensemble · v2.4
                    </Pill>
                }
            />

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
                {metrics.map((m) => (
                    <div key={m.label} className="rounded-xl border border-border/70 bg-surface/70 px-3 py-2.5">
                        <p className="mono text-[8px] uppercase tracking-[0.12em] text-ink-faint">{m.label}</p>
                        <p className={`mono mt-1 text-[19px] font-semibold leading-none ${m.tone}`}>
                            <RollingNumber value={m.value} suffix={m.suffix} format={(v) => v.toFixed(1)} />
                        </p>
                    </div>
                ))}
            </div>

            <p className="mono mt-2 flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[0.1em] text-ink-faint">
                <span className="rounded-full border border-mint/25 bg-mint/10 px-2 py-[3px] text-mint">
                    {learned} field outcome{learned === 1 ? "" : "s"} learned
                </span>
                every confirmed theft and false positive from the field app updates this matrix
            </p>

            <div className="mt-3 grid gap-3 xl:grid-cols-2">
                <Panel eyebrow="Discrimination" title="ROC curve">
                    <RocCurve />
                    <p className="mono mt-1 text-[9px] uppercase tracking-[0.1em] text-ink-faint">AUC 0.972 · dashed = random</p>
                </Panel>
                <Panel eyebrow="Precision / recall" title="PR curve">
                    <PrCurve />
                    <p className="mono mt-1 text-[9px] uppercase tracking-[0.1em] text-ink-faint">AP 0.941 · threshold tuned for inspections</p>
                </Panel>
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-3">
                <Panel eyebrow="Error analysis" title="Confusion matrix">
                    <ConfusionHeatmap counts={confusion} />
                </Panel>

                <Panel eyebrow="Inference" title="Stage latency">
                    <div className="h-[190px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={LATENCY} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="2 6" stroke="rgba(148,163,184,0.13)" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 8, fill: "#8A90A8", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="stage" tick={{ fontSize: 9, fill: "#A3A9C7", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} width={60} />
                                <Tooltip
                                    cursor={{ fill: "rgba(124,92,255,0.06)" }}
                                    contentStyle={{ background: "rgba(11,14,28,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 11, fontFamily: "var(--font-mono)" }}
                                    itemStyle={{ color: "#F4F6FF" }}
                                />
                                <Bar dataKey="ms" radius={[0, 4, 4, 0]}>
                                    {LATENCY.map((l) => (
                                        <Cell key={l.stage} fill={l.ms > 150 ? "#A78BFA" : "#7C5CFF"} fillOpacity={0.85} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Panel>

                <Panel eyebrow="Stress tests" title="Robustness">
                    <div className="space-y-2">
                        {ROBUST.map((r) => (
                            <div key={r.label}>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="truncate text-[10px] text-ink-soft">{r.label}</span>
                                    <span className="mono shrink-0 text-[10px] text-ink">{r.f1}</span>
                                </div>
                                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-foreground/[0.06]">
                                    <div className="h-full rounded-full bg-gradient-to-r from-brand to-violet" style={{ width: `${r.f1}%` }} />
                                </div>
                                <p className="mono mt-0.5 text-[8px] text-rose">−{r.drop} F1</p>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>

            <div className="mt-3">
                <Panel eyebrow="Benchmark" title="Model comparison" bodyClassName="p-2 sm:p-3">
                    <ModelTable />
                </Panel>
            </div>

            <div className="mt-3">
                <ImpactCalculator variant="section" />
            </div>
        </>
    );
}