import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Radio, ShieldAlert, X } from "lucide-react";
import ChartCard from "@/components/charts/ChartCard";
import { causeMeta } from "@/lib/gridData";
import { Button } from "@/components/ui/button";
import PageHead from "@/components/common/PageHead";
import Panel from "@/components/common/Panel";
import LiveDot from "@/components/common/LiveDot";
import TiltCard from "@/components/common/TiltCard";
import HealthRing from "@/components/dashboard/HealthRing";
import KpiRow from "@/components/dashboard/KpiRow";
import LoadChart from "@/components/dashboard/LoadChart";
import CauseDonut from "@/components/dashboard/CauseDonut";
import CauseBars from "@/components/dashboard/CauseBars";
import PriorityList from "@/components/dashboard/PriorityList";
import AlertFeed from "@/components/dashboard/AlertFeed";
import ImpactCalculator from "@/components/dashboard/ImpactCalculator";
import { useI18n } from "@/lib/i18n";
import SignalsList from "@/components/dashboard/SignalsList";
import Globe from "@/components/landing/Globe";
import { getAlerts, getCases, getConsumers, getTransformers, causeBreakdown, kpis, loadSeries, priorityList, riskByFeeder } from "@/lib/gridService";
import { compact, inrCompact } from "@/lib/gridData";

export const Route = createFileRoute("/dashboard/")({
    ssr: false,
    head: () => ({ meta: [{ title: "Command Center · Volsentra AI" }] }),
    component: CommandCenter,
});

function Skeleton() {
    return (
        <div className="space-y-4">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-foreground/[0.06]" />
            <div className="grid gap-4 lg:grid-cols-3">
                <div className="h-[190px] animate-pulse rounded-2xl bg-foreground/[0.04]" />
                <div className="h-[190px] animate-pulse rounded-2xl bg-foreground/[0.04] lg:col-span-2" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-[128px] animate-pulse rounded-2xl bg-foreground/[0.04]" />
                ))}
            </div>
        </div>
    );
}

function CommandCenter() {
    const [causeFilter, setCauseFilter] = useState(null);
    const { t } = useI18n();
    const { data: consumers = [], isLoading } = useQuery({ queryKey: ["consumers"], queryFn: getConsumers });
    const { data: transformers = [] } = useQuery({ queryKey: ["transformers"], queryFn: getTransformers });
    const { data: cases = [] } = useQuery({ queryKey: ["cases"], queryFn: getCases });
    const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: () => getAlerts(24) });

    if (isLoading && consumers.length === 0) return <Skeleton />;

    const k = kpis(consumers, transformers, cases, alerts);
    const load = loadSeries(consumers);
    const breakdown = causeBreakdown(consumers);
    const priority = priorityList(causeFilter ? consumers.filter((c) => c.cause === causeFilter) : consumers, 10);
    const feeders = riskByFeeder(consumers);
    const health = Math.round(100 - (k.highRisk / Math.max(1, k.consumers)) * 100 * 0.9);
    const sparks = [0, 5, 9, 13].map((o) => load.slice(o, o + 12).map((d) => d.mw));

    const cards = [
        { label: t("kpi.consumers"), value: k.consumers, note: "3 feeders · 10 transformers", tone: "brand", spark: sparks[0] },
        { label: t("kpi.highRisk"), value: k.highRisk, note: "risk score ≥ 55", tone: "rose", glow: "rose", spark: sparks[1], delta: k.highRisk },
        { label: t("kpi.openCases"), value: k.openCases, note: "field queue", tone: "violet", glow: "violet", spark: sparks[2] },
        { label: t("kpi.loss"), value: k.lossKwh, suffix: " kWh", note: `${inrCompact(k.lossRs)} recoverable`, tone: "amber", glow: "amber", spark: sparks[3], format: compact },
        { label: t("kpi.alerts"), value: k.activeAlerts, note: "streaming now", tone: "sky", glow: "sky", spark: sparks[1].map((v) => v * 0.7) },
        { label: t("kpi.latency"), value: 412, suffix: " ms", note: "meter → alert", tone: "mint", glow: "mint", spark: sparks[2].map((v) => v * 0.4) },
    ];

    return (
        <>
            <PageHead
                eyebrow="Mission control · Marathwada circle"
                title="Grid"
                titleKey="page.command"
                highlight="command center"
                sub="Live risk posture across every feeder. Scores refresh nightly; the meter stream and alerts refresh continuously."
                actions={
                    <>
                        <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 rounded-full border-border/80 bg-foreground/[0.03] text-[12px]">
                            <Link to="/dashboard/scenarios">
                                <ShieldAlert className="h-3.5 w-3.5" /> Run scenario
                            </Link>
                        </Button>
                        <Button asChild size="sm" className="h-8 gap-1.5 rounded-full bg-gradient-to-r from-brand to-brand-2 text-[12px] text-white">
                            <Link to="/dashboard/live">
                                <Radio className="h-3.5 w-3.5" /> Live stream
                            </Link>
                        </Button>
                    </>
                }
            />

            <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr]">
                <TiltCard glow="brand" className="p-4" interactive={false}>
                    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
                        <HealthRing score={health} />
                        <div className="min-w-0 flex-1">
                            <p className="mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">Grid health score</p>
                            <h2 className="mt-1 font-heading text-[19px] font-semibold leading-tight text-ink">
                                {health >= 75 ? "Loss contained" : health >= 55 ? "Loss concentrated in 3 DTs" : "Immediate action needed"}
                            </h2>
                            <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">
                                {k.highRisk} of {k.consumers} meters sit above the review threshold. Theft clusters on
                                Central Industrial account for most of the unaccounted units.
                            </p>
                            <div className="mt-3 space-y-1.5">
                                {feeders.map((f) => (
                                    <div key={f.feeder} className="flex items-center gap-2">
                                        <span className="mono w-[128px] shrink-0 truncate text-[10px] text-ink-soft">{f.feeder}</span>
                                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-foreground/[0.06]">
                                            <div
                                                className={`h-full rounded-full ${f.avgRisk >= 60 ? "bg-rose" : f.avgRisk >= 40 ? "bg-amber" : "bg-mint"}`}
                                                style={{ width: `${f.avgRisk}%` }}
                                            />
                                        </div>
                                        <span className="mono w-6 text-right text-[10px] text-ink-faint">{f.avgRisk}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </TiltCard>

                <Panel
                    noBody
                    eyebrow="Network"
                    title="Latest signals"
                    actions={
                        <span className="mono flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-mint">
                            <LiveDot tone="mint" size="h-1.5 w-1.5" /> live
                        </span>
                    }
                >
                    <div className="flex items-center gap-3 px-4 pb-1 pt-3">
                        <div className="hidden shrink-0 sm:block xl:hidden 2xl:block">
                            <Globe size={116} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <SignalsList alerts={alerts} />
                        </div>
                    </div>
                    <Link
                        to="/dashboard/grid"
                        className="mono flex items-center justify-center gap-1 border-t border-border/60 py-2 text-[10px] uppercase tracking-[0.14em] text-brand"
                    >
                        Open 3D grid <ArrowUpRight className="h-3 w-3" />
                    </Link>
                </Panel>
            </div>

            <div className="mt-3">
                <KpiRow items={cards} />
            </div>

            <div className="mt-3">
                <ImpactCalculator variant="card" />
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-3">
                <LoadChart consumers={consumers} className="xl:col-span-2" />

                <ChartCard
                    eyebrow="Cause mix"
                    title="Why meters were flagged"
                    exportName="volsentra-cause-mix"
                    rows={breakdown}
                    columns={[
                        { label: "cause", value: (r) => r.cause },
                        { label: "count", value: (r) => r.count },
                    ]}
                    actions={
                        causeFilter && (
                            <button
                                type="button"
                                onClick={() => setCauseFilter(null)}
                                className="mono flex items-center gap-1 rounded-full border border-brand/40 bg-brand/12 px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-brand"
                            >
                                {causeMeta(causeFilter).label} <X className="h-2.5 w-2.5" />
                            </button>
                        )
                    }
                >
                    <CauseDonut rows={breakdown} active={causeFilter} onSelect={(c) => setCauseFilter((prev) => (prev === c ? null : c))} />
                    <div className="mt-2 border-t border-border/60 pt-3">
                        <CauseBars rows={breakdown} active={causeFilter} onSelect={(c) => setCauseFilter(c)} />
                    </div>
                </ChartCard>
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-[1.55fr_1fr]">
                <Panel
                    noBody
                    eyebrow="Field queue"
                    title="Top 10 inspection priority"
                    actions={
                        <>
                            {causeFilter && (
                                <button
                                    type="button"
                                    onClick={() => setCauseFilter(null)}
                                    className="mono flex items-center gap-1 rounded-full border border-border/80 bg-foreground/[0.04] px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-ink-soft hover:text-ink"
                                >
                                    {causeMeta(causeFilter).label} <X className="h-2.5 w-2.5" />
                                </button>
                            )}
                            <Button asChild variant="ghost" size="sm" className="h-7 rounded-full px-2 text-[10px] text-ink-soft">
                                <Link to="/dashboard/consumers" search={causeFilter ? { cause: causeFilter } : {}}>
                                    View all
                                </Link>
                            </Button>
                        </>
                    }
                >
                    <PriorityList rows={priority} />
                </Panel>

                <Panel noBody eyebrow="Alerts" title="Live alert feed">
                    <AlertFeed alerts={alerts} consumers={consumers} />
                </Panel>
            </div>
        </>
    );
}