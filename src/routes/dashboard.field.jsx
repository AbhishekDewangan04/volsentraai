import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, Navigation, Route as RouteIcon } from "lucide-react";
import { toast } from "sonner";
import PageHead from "@/components/common/PageHead";
import Panel from "@/components/common/Panel";
import { CauseChip, SeverityChip } from "@/components/common/Chip";
import InspectionMap from "@/components/field/InspectionMap";
import InspectionSheet from "@/components/field/InspectionSheet";
import { getCases, getConsumers, resolveInspection } from "@/lib/gridService";
import { buildQueue, DEPOT, withCumulative } from "@/lib/fieldOps";
import { useI18n } from "@/lib/i18n";
import { inrCompact } from "@/lib/gridData";

export const Route = createFileRoute("/dashboard/field")({
    ssr: false,
    head: () => ({ meta: [{ title: "Field Inspector · Volsentra AI" }] }),
    component: FieldInspector,
});

const OUTCOME_LABEL = {
    confirmed: "field.confirmed",
    false_positive: "field.falsePositive",
    revisit: "field.revisit",
};

function FieldInspector() {
    const { t } = useI18n();
    const queryClient = useQueryClient();
    const { data: cases = [], isLoading } = useQuery({ queryKey: ["cases"], queryFn: getCases });
    const { data: consumers = [] } = useQuery({ queryKey: ["consumers"], queryFn: getConsumers });

    const [openId, setOpenId] = useState(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const { stops, totalKm, totalMin } = useMemo(() => {
        const queue = buildQueue(cases, consumers);
        return { ...queue, stops: withCumulative(queue.stops) };
    }, [cases, consumers]);

    const active = stops.find((s) => s.consumer.consumer_id === openId) ?? null;

    const mutation = useMutation({
        mutationFn: resolveInspection,
        onSuccess: (res, vars) => {
            queryClient.invalidateQueries({ queryKey: ["cases"] });
            queryClient.invalidateQueries({ queryKey: ["consumers"] });
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
            queryClient.invalidateQueries({ queryKey: ["model-feedback"] });
            setSheetOpen(false);
            setOpenId(null);
            toast.success(t("field.recorded"), {
                description: `${vars.consumer.consumer_id} · ${t(OUTCOME_LABEL[vars.outcome])} · risk ${res.score}`,
            });
            if (vars.outcome !== "revisit") {
                toast.success(t("field.modelUpdated"), {
                    description: `${vars.consumer.consumer_id} folded into the training set.`,
                });
            }
        },
    });

    return (
        <>
            <PageHead
                eyebrow="Field operations · Marathwada circle"
                title="Field"
                titleKey="page.field"
                highlight="inspector"
                sub={t("field.sub")}
            />

            <div className="grid grid-cols-3 gap-2">
                {[
                    [t("field.stops"), String(stops.length), <MapPin key="a" className="h-3.5 w-3.5" />, "text-ink"],
                    [t("field.distance"), `${totalKm} km`, <RouteIcon key="b" className="h-3.5 w-3.5" />, "text-brand"],
                    [t("field.eta"), `${Math.round(totalMin / 60)}h ${totalMin % 60}${t("field.min")}`, <Clock key="c" className="h-3.5 w-3.5" />, "text-amber"],
                ].map(([label, value, icon, tone]) => (
                    <div key={label} className="rounded-xl border border-border/70 bg-surface/60 px-3 py-2.5">
                        <p className="mono flex items-center gap-1 text-[8px] uppercase tracking-[0.12em] text-ink-faint">
                            {icon} {label}
                        </p>
                        <p className={`mono mt-1 text-[15px] font-semibold leading-none ${tone}`}>{value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.15fr]">
                <Panel eyebrow="Route" title={`${stops.length} ${t("field.stops")}`} bodyClassName="p-2 sm:p-3">
                    <InspectionMap
                        stops={stops}
                        depot={DEPOT}
                        selectedId={openId}
                        onSelect={(s) => { setOpenId(s.consumer.consumer_id); setSheetOpen(true); }}
                        className="aspect-[4/3] w-full lg:aspect-auto lg:h-[360px]"
                    />
                    <div className="mono mt-2 flex flex-wrap items-center justify-between gap-1 px-1 text-[9px] uppercase tracking-[0.1em] text-ink-faint">
                        <span className="flex items-center gap-1"><Navigation className="h-2.5 w-2.5" /> depot → {stops.length} stops</span>
                        <span>{totalKm} km · {Math.round(totalMin)} {t("field.min")}</span>
                    </div>
                </Panel>

                <Panel noBody eyebrow="Today" title="Inspection queue">
                    {isLoading && (
                        <p className="px-4 py-6 text-center text-[12px] text-ink-faint">{t("field.loading")}</p>
                    )}
                    {!isLoading && stops.length === 0 && (
                        <p className="px-4 py-6 text-center text-[12px] text-ink-faint">{t("field.none")}</p>
                    )}
                    <ul>
                        {stops.map((s) => (
                            <li key={s.consumer.consumer_id}>
                                <button
                                    type="button"
                                    onClick={() => { setOpenId(s.consumer.consumer_id); setSheetOpen(true); }}
                                    className="flex w-full items-center gap-3 border-b border-border/50 px-3 py-2.5 text-left last:border-0 hover:bg-foreground/[0.03]"
                                >
                                    <span className="mono grid h-6 w-6 shrink-0 place-items-center rounded-full border border-brand/40 bg-brand/12 text-[10px] font-semibold text-brand">
                                        {s.visit}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-center justify-between gap-2">
                                            <span className="truncate text-[12px] font-medium text-ink">{s.consumer.name}</span>
                                            <span className="mono shrink-0 text-[9px] text-ink-faint">{s.km} km</span>
                                        </span>
                                        <span className="mono mt-0.5 flex items-center gap-1.5 truncate text-[9px] uppercase tracking-[0.08em] text-ink-faint">
                                            {s.consumer.consumer_id} · {s.legKm} km leg · {s.etaMin} {t("field.min")} · {inrCompact(s.recoverable)}
                                        </span>
                                    </span>
                                    <span className="hidden shrink-0 items-center gap-1 sm:flex">
                                        <CauseChip cause={s.consumer.cause} short />
                                        <SeverityChip severity={s.priority} />
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </Panel>
            </div>

            <InspectionSheet
                key={active?.consumer.consumer_id ?? "empty"}
                stop={active}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                busy={mutation.isPending}
                onOutcome={(payload) => mutation.mutate(payload)}
            />
        </>
    );
}