import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Panel from "@/components/common/Panel";
import PageHead from "@/components/common/PageHead";
import { CauseChip } from "@/components/common/Chip";
import SummaryRail from "@/components/report/SummaryRail";
import RecommendedAction from "@/components/report/RecommendedAction";
import BaselineChart from "@/components/report/BaselineChart";
import ShapBars from "@/components/report/ShapBars";
import PeerRadar from "@/components/report/PeerRadar";
import ReasoningTimeline from "@/components/report/ReasoningTimeline";
import AiExplanation from "@/components/report/AiExplanation";
import { getConsumers } from "@/lib/gridService";
import { exportPDF } from "@/lib/exporters";
import { MONTHS, num } from "@/lib/gridData";

export const Route = createFileRoute("/dashboard/consumers_/$consumerId")({
    ssr: false,
    head: () => ({ meta: [{ title: "Investigation report · Volsentra AI" }] }),
    component: ReportPage,
});

function ReportPage() {
    const { consumerId } = Route.useParams();
    const { data: consumers = [], isLoading } = useQuery({ queryKey: ["consumers"], queryFn: getConsumers });
    const consumer = consumers.find((c) => c.consumer_id === consumerId || c.id === consumerId);

    if (isLoading && !consumer) {
        return (
            <div className="space-y-3">
                <div className="h-8 w-56 animate-pulse rounded-lg bg-foreground/[0.06]" />
                <div className="grid gap-3 xl:grid-cols-[320px_1fr]">
                    <div className="h-[420px] animate-pulse rounded-2xl bg-foreground/[0.04]" />
                    <div className="h-[420px] animate-pulse rounded-2xl bg-foreground/[0.04]" />
                </div>
            </div>
        );
    }

    if (!consumer) {
        return (
            <div className="panel grid place-items-center px-6 py-20 text-center">
                <p className="text-[15px] font-medium text-ink">No meter found for {consumerId}</p>
                <p className="mt-1 text-[12px] text-ink-faint">It may have been removed from the demo grid.</p>
                <Button asChild variant="outline" size="sm" className="mt-4 rounded-full">
                    <Link to="/dashboard/consumers">
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to consumers
                    </Link>
                </Button>
            </div>
        );
    }

    const download = async () => {
        await exportPDF(
            `Investigation · ${consumer.consumer_id}`,
            [
                `${consumer.name} · ${consumer.category} · ${consumer.area}`,
                `Feeder ${consumer.feeder} · Transformer ${consumer.transformer_id}`,
                `Cause: ${consumer.cause}  |  risk ${consumer.risk_score}/100  |  confidence ${consumer.confidence}%`,
                `Baseline ${num(consumer.baseline_kwh)} kWh · last month ${num(consumer.actual_kwh)} kWh`,
                "",
                "Evidence:",
                ...consumer.reasons.map((r) => `- ${r}`),
                "",
                "12-month series:",
                consumer.monthly.map((v, i) => `${MONTHS[i]} ${v}`).join("  "),
            ],
            `volsentra-${consumer.consumer_id}`,
        );
        toast.success("Report downloaded");
    };

    return (
        <>
            <PageHead
                eyebrow="Investigation report"
                title={consumer.consumer_id}
                sub={`${consumer.name} · ${consumer.category} · ${consumer.area} · ${consumer.feeder}`}
                actions={
                    <>
                        <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 rounded-full text-[12px] text-ink-soft">
                            <Link to="/dashboard/consumers">
                                <ArrowLeft className="h-3.5 w-3.5" /> Queue
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={download} className="h-8 gap-1.5 rounded-full border-border/80 bg-foreground/[0.03] text-[12px]">
                            <Download className="h-3.5 w-3.5" /> Download PDF
                        </Button>
                    </>
                }
            />

            <div className="grid gap-3 xl:grid-cols-[320px_1fr]">
                <div className="space-y-3 xl:sticky xl:top-[104px] xl:self-start">
                    <SummaryRail consumer={consumer} />
                    <RecommendedAction consumer={consumer} />
                </div>

                <div className="space-y-3">
                    <Panel
                        eyebrow="Baseline vs actual"
                        title="Consumption signal"
                        actions={<CauseChip cause={consumer.cause} />}
                    >
                        <BaselineChart consumer={consumer} />
                        <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-border/60 pt-2">
                            {[
                                ["baseline", "#A78BFA"],
                                ["peer average", "#38BDF8"],
                                ["actual", "#FF4D6D"],
                                ["anomaly window", "rgba(255,77,109,0.35)"],
                            ].map(([label, color]) => (
                                <span key={label} className="mono flex items-center gap-1.5 text-[9px] uppercase tracking-[0.1em] text-ink-faint">
                                    <span className="h-1.5 w-3 rounded-full" style={{ background: color }} /> {label}
                                </span>
                            ))}
                        </div>
                    </Panel>

                    <div className="grid gap-3 lg:grid-cols-2">
                        <Panel eyebrow="SHAP attribution" title="What moved the score">
                            <ShapBars consumer={consumer} />
                        </Panel>
                        <Panel eyebrow="Peer comparison" title={`Against ${consumer.transformer_id}`}>
                            <PeerRadar consumer={consumer} />
                            <p className="mt-1 text-[11px] leading-snug text-ink-faint">
                                The consumer reads well below its peers on every time-of-day band except stability, where the
                                variance flags a metering issue.
                            </p>
                        </Panel>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                        <Panel eyebrow="Reasoning" title="How the verdict was reached">
                            <ReasoningTimeline consumer={consumer} />
                        </Panel>
                        <div className="space-y-3">
                            <AiExplanation consumer={consumer} />
                            <Panel eyebrow="Data quality" title="Reads used in this score">
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        ["Reads", "12 / 12"],
                                        ["Gaps", consumer.cause === "Communication Failure" ? "9 days" : "0"],
                                        ["Peer meters", "11"],
                                    ].map(([k, v]) => (
                                        <div key={k} className="rounded-lg border border-border/60 bg-foreground/[0.02] px-2 py-1.5">
                                            <p className="mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">{k}</p>
                                            <p className="mono mt-0.5 text-[12px] text-ink">{v}</p>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}