import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHead from "@/components/common/PageHead";
import Panel from "@/components/common/Panel";
import TransformerFlow from "@/components/transformers/TransformerFlow";
import LossGauge from "@/components/transformers/LossGauge";
import LossBarChart from "@/components/transformers/LossBarChart";
import ClusterScatter from "@/components/transformers/ClusterScatter";
import ClusterCards from "@/components/transformers/ClusterCards";
import { getConsumers, getTransformers, transformerClusters } from "@/lib/gridService";
import { inr, num } from "@/lib/gridData";
import { useGrid } from "@/lib/GridContext";

export const Route = createFileRoute("/dashboard/transformers")({
    ssr: false,
    head: () => ({ meta: [{ title: "Transformer Analysis · Volsentra AI" }] }),
    component: TransformerPage,
});

function TransformerPage() {
    const navigate = useNavigate();
    const { setFocusTransformer } = useGrid();
    const { data: consumers = [] } = useQuery({ queryKey: ["consumers"], queryFn: getConsumers });
    const { data: transformers = [] } = useQuery({ queryKey: ["transformers"], queryFn: getTransformers });

    // Bar / bubble click → remember the DT and open it inside the 3D explorer.
    const openIn3D = (transformerId) => {
        if (!transformerId) return;
        setFocusTransformer(transformerId);
        navigate({ to: "/dashboard/grid" });
    };

    const clusters = transformerClusters(consumers, transformers);
    const worst = clusters[0] ?? { loss_pct: 0, input_kwh: 0, billed_kwh: 0 };
    const totalLoss = clusters.reduce((s, t) => s + Math.max(0, t.input_kwh - t.billed_kwh), 0);
    const critical = clusters.filter((t) => t.loss_pct >= 12);

    return (
        <>
            <PageHead
                eyebrow="Loss accounting"
                title="Transformer"
                titleKey="page.transformers"
                highlight="analysis"
                sub="Where energy enters the distribution transformer and never reaches an invoice. Clusters above the 10% threshold are the ones worth a field visit."
                actions={
                    <Button asChild size="sm" className="h-8 gap-1.5 rounded-full bg-gradient-to-r from-brand to-brand-2 text-[12px] text-white">
                        <Link to="/dashboard/grid">
                            Open 3D cluster <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                }
            />

            <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr]">
                <Panel eyebrow="30-day ledger" title="Energy in → billed → loss">
                    <TransformerFlow transformers={transformers} />
                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 sm:grid-cols-3">
                        {[
                            ["Unaccounted", `${num(totalLoss)} kWh`, "text-rose"],
                            ["At ₹8.40/kWh", inr(totalLoss * 8.4), "text-amber"],
                            ["Critical DTs", `${critical.length} of ${clusters.length}`, "text-ink"],
                        ].map(([k, v, tone]) => (
                            <div key={k}>
                                <p className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">{k}</p>
                                <p className={`mono mt-0.5 text-[14px] ${tone}`}>{v}</p>
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel eyebrow="Worst transformer" title={worst.transformer_id ?? "—"}>
                    <LossGauge value={worst.loss_pct} threshold={10} />
                    <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">
                        {worst.name} ({worst.feeder}) is losing {worst.loss_pct}% of {num(worst.input_kwh)} kWh. That is the
                        single largest recoverable pool on the grid this month.
                    </p>
                </Panel>
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-2">
                <Panel eyebrow="Loss by transformer" title="Against the 10% threshold">
                    <LossBarChart rows={clusters} onSelect={openIn3D} />
                    <p className="mono mt-1 text-[9px] uppercase tracking-[0.1em] text-ink-faint">click a bar to open that cluster in the 3D explorer</p>
                </Panel>
                <Panel eyebrow="Cluster detection" title="Loss vs suspicious meters">
                    <ClusterScatter rows={clusters} onSelect={openIn3D} />
                    <p className="mono mt-1 text-[9px] uppercase tracking-[0.1em] text-ink-faint">
                        bubble size = meters on the DT · right of the dashed line = above threshold
                    </p>
                </Panel>
            </div>

            <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                    <p className="mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">Suspicious clusters · {clusters.length}</p>
                    <p className="mono text-[10px] text-ink-faint">sorted by loss</p>
                </div>
                <ClusterCards rows={clusters} />
            </div>
        </>
    );
}