import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { Download, Filter, Search, SlidersHorizontal, Table2, LayoutGrid, Map as MapIcon, Upload, X, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PageHead from "@/components/common/PageHead";
import Panel from "@/components/common/Panel";
import LiveDot from "@/components/common/LiveDot";
import { CauseChip } from "@/components/common/Chip";
import ConsumersTable from "@/components/consumers/ConsumersTable";
import ConsumerCards from "@/components/consumers/ConsumerCards";
import ConsumerMap from "@/components/consumers/ConsumerMap";
import RiskHeatStrip from "@/components/consumers/RiskHeatStrip";
import ImportDataDialog from "@/components/consumers/ImportDataDialog";
import { useI18n } from "@/lib/i18n";
import { CAUSES, causeMeta, inrCompact, num } from "@/lib/gridData";
import { createCase, getConsumers, getTransformers, riskByFeeder } from "@/lib/gridService";
import { exportCSV, exportJSON, exportPDF } from "@/lib/exporters";

export const Route = createFileRoute("/dashboard/consumers")({
    ssr: false,
    validateSearch: (search) => ({ cause: typeof search.cause === "string" ? search.cause : undefined }),
    head: () => ({ meta: [{ title: "Consumers & Risk · Volsentra AI" }] }),
    component: ConsumersPage,
});

const SAVED_VIEWS = [
    { key: "all", label: "All meters" },
    { key: "theft", label: "Theft focus" },
    { key: "comms", label: "Comms gap" },
    { key: "critical", label: "Critical only" },
];

function Stat({ label, value, tone = "text-ink", note }) {
    return (
        <div className="rounded-xl border border-border/70 bg-surface/60 px-3 py-2.5">
            <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">{label}</p>
            <p className={`mono mt-1 text-[18px] font-semibold leading-none ${tone}`}>{value}</p>
            {note && <p className="mono mt-1 truncate text-[9px] text-ink-faint">{note}</p>}
        </div>
    );
}

function ConsumersPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { t } = useI18n();
    const [importOpen, setImportOpen] = useState(false);
    const searchRef = useRef(null);
    const { cause: causeParam } = Route.useSearch();

    const { data: consumers = [], isLoading } = useQuery({ queryKey: ["consumers"], queryFn: getConsumers });
    const { data: transformers = [] } = useQuery({ queryKey: ["transformers"], queryFn: getTransformers });

    const [view, setView] = useState("table");
    const [search, setSearch] = useState("");
    const [feeder, setFeeder] = useState("all");
    const [cause, setCause] = useState("all");
    const [minRisk, setMinRisk] = useState(0);
    const [savedView, setSavedView] = useState("all");
    const [selected, setSelected] = useState([]);
    const [expanded, setExpanded] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [flashId, setFlashId] = useState(null);

    // Drill-through from the command-center cause chart lands here pre-filtered.
    useEffect(() => {
        if (causeParam) setCause(causeParam);
    }, [causeParam]);

    useEffect(() => {
        const id = setInterval(() => {
            setFlashId(null);
            setTimeout(() => {
                setFlashId(consumers[Math.floor(Math.random() * Math.max(1, consumers.length))]?.consumer_id ?? null);
            }, 60);
        }, 11000);
        return () => clearInterval(id);
    }, [consumers]);

    const feeders = useMemo(() => riskByFeeder(consumers), [consumers]);

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        return consumers.filter((c) => {
            if (feeder !== "all" && c.feeder !== feeder) return false;
            if (cause !== "all" && c.cause !== cause) return false;
            if (c.risk_score < minRisk) return false;
            if (q && !`${c.consumer_id} ${c.name} ${c.area} ${c.feeder}`.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [consumers, feeder, cause, minRisk, search]);

    const applySaved = (key) => {
        setSavedView(key);
        setSelected([]);
        setExpanded(null);
        setActiveIndex(0);
        if (key === "all") {
            setCause("all");
            setMinRisk(0);
            setFeeder("all");
        } else if (key === "theft") {
            setCause("Theft/Tampering");
            setMinRisk(55);
            setFeeder("all");
        } else if (key === "comms") {
            setCause("Communication Failure");
            setMinRisk(0);
            setFeeder("all");
        } else {
            setCause("all");
            setMinRisk(80);
            setFeeder("all");
        }
    };

    const activeFilters = [
        feeder !== "all" && { key: "feeder", label: feeder, clear: () => setFeeder("all") },
        cause !== "all" && { key: "cause", label: causeMeta(cause).label, clear: () => setCause("all") },
        minRisk > 0 && { key: "risk", label: `risk ≥ ${minRisk}`, clear: () => setMinRisk(0) },
        search && { key: "search", label: `“${search}”`, clear: () => setSearch("") },
    ].filter(Boolean);

    const toggle = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.consumer_id));

    useEffect(() => {
        const onKey = (e) => {
            const tag = document.activeElement?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA") {
                if (e.key === "Escape") document.activeElement.blur();
                return;
            }
            if (e.key === "/") {
                e.preventDefault();
                searchRef.current?.focus();
                return;
            }
            if (e.key === "j") {
                e.preventDefault();
                setActiveIndex((i) => Math.min(rows.length - 1, i + 1));
            }
            if (e.key === "k") {
                e.preventDefault();
                setActiveIndex((i) => Math.max(0, i - 1));
            }
            if (e.key === "x") {
                const row = rows[activeIndex];
                if (row) toggle(row.consumer_id);
            }
            if (e.key === "Enter") {
                const row = rows[activeIndex];
                if (row) navigate({ to: "/dashboard/consumers/$consumerId", params: { consumerId: row.consumer_id } });
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [rows, activeIndex, navigate]);

    const assign = useMutation({
        mutationFn: async () => {
            const picks = consumers.filter((c) => selected.includes(c.consumer_id)).slice(0, 12);
            await Promise.all(
                picks.map((c) =>
                    createCase({
                        consumer_id: c.consumer_id,
                        consumer_name: c.name,
                        feeder: c.feeder,
                        title: `${c.cause} investigation`,
                        status: "Inspection Scheduled",
                        cause: c.cause,
                        risk_score: c.risk_score,
                        assignee: "A. Kulkarni",
                        due_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
                        priority: c.risk_score >= 80 ? "critical" : c.risk_score >= 60 ? "high" : "medium",
                        order: 0,
                        notes: [],
                        activity: [{ author: "You", text: "Assigned from the risk queue", at: new Date().toISOString() }],
                    }),
                ),
            );
            return picks.length;
        },
        onSuccess: (n) => {
            queryClient.invalidateQueries({ queryKey: ["cases"] });
            toast.success(`${n} inspection${n === 1 ? "" : "s"} assigned`, { description: "Assigned to A. Kulkarni · due in 3 days." });
            setSelected([]);
        },
    });

    const columns = [
        { label: "Consumer ID", value: (r) => r.consumer_id },
        { label: "Name", value: (r) => r.name },
        { label: "Feeder", value: (r) => r.feeder },
        { label: "Transformer", value: (r) => r.transformer_id },
        { label: "Cause", value: (r) => r.cause },
        { label: "Risk", value: (r) => r.risk_score },
        { label: "Confidence", value: (r) => r.confidence },
        { label: "Baseline kWh", value: (r) => r.baseline_kwh },
        { label: "Actual kWh", value: (r) => r.actual_kwh },
    ];

    const flagged = rows.filter((r) => r.risk_score >= 55);
    const theft = rows.filter((r) => r.cause === "Theft/Tampering");
    const avgRisk = Math.round(rows.reduce((s, r) => s + r.risk_score, 0) / Math.max(1, rows.length));

    return (
        <>
            <PageHead
                eyebrow="Risk workspace"
                title="Consumers"
                titleKey="page.consumers"
                highlight="& risk"
                sub="Every meter with its score, cause and evidence trail. Filter by feeder, jump with j / k, open with Enter."
                actions={
                    <>
                        <span className="mono hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-mint sm:flex">
                            <LiveDot tone="mint" size="h-1.5 w-1.5" /> streaming
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setImportOpen(true)}
                            className="h-8 gap-1.5 rounded-full border-border/80 bg-foreground/[0.03] text-[12px]"
                        >
                            <Upload className="h-3.5 w-3.5" /> {t("act.import")}
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-full border-border/80 bg-foreground/[0.03] text-[12px]">
                                    <Download className="h-3.5 w-3.5" /> {t("act.export")}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 border-border/80 bg-popover">
                                <DropdownMenuItem onClick={() => exportCSV(rows, columns, "volsentra-consumers")}>CSV</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => exportJSON(rows, "volsentra-consumers")}>JSON</DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={async () => {
                                        await exportPDF(
                                            "Consumer risk register",
                                            rows.map((r) => `${r.consumer_id}  ${r.cause.padEnd(22)} risk ${r.risk_score}  conf ${r.confidence}%  ${r.feeder}`),
                                            "volsentra-consumers",
                                        );
                                        toast.success("PDF generated");
                                    }}
                                >
                                    PDF
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                }
            />

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <Stat label="Meters in view" value={num(rows.length)} note={`${num(consumers.length)} on the grid`} />
                <Stat label="Flagged ≥ 55" value={num(flagged.length)} tone="text-rose" note={`${Math.round((flagged.length / Math.max(1, rows.length)) * 100)}% of view`} />
                <Stat label="Theft classified" value={num(theft.length)} tone="text-rose" note="multi-signal agreement" />
                <Stat label="Recoverable" value={inrCompact(flagged.reduce((s, r) => s + Math.max(0, (r.baseline_kwh - r.actual_kwh) * 8.4), 0))} tone="text-amber" note="per month at ₹8.40/kWh" />
            </div>

            <div className="mt-3">
                <RiskHeatStrip feeders={feeders} active={feeder} onSelect={setFeeder} />
            </div>

            <Panel className="mt-3" noBody>
                <div className="flex flex-col gap-2 border-b border-border/60 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative min-w-0 flex-1 sm:max-w-[260px]">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                            <Input
                                ref={searchRef}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search ID, name or area…"
                                className="h-8 border-border/80 bg-foreground/[0.03] pl-8 text-[12px]"
                            />
                        </div>

                        <Select value={feeder} onValueChange={setFeeder}>
                            <SelectTrigger className="h-8 w-[148px] border-border/80 bg-foreground/[0.03] text-[12px]">
                                <SelectValue placeholder="Feeder" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All feeders</SelectItem>
                                {feeders.map((f) => (
                                    <SelectItem key={f.feeder} value={f.feeder}>
                                        {f.feeder}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={cause} onValueChange={setCause}>
                            <SelectTrigger className="h-8 w-[172px] border-border/80 bg-foreground/[0.03] text-[12px]">
                                <SelectValue placeholder="Cause" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All causes</SelectItem>
                                {CAUSES.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {causeMeta(c).label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="hidden items-center gap-2 rounded-lg border border-border/80 bg-foreground/[0.03] px-2.5 py-1.5 lg:flex">
                            <SlidersHorizontal className="h-3.5 w-3.5 text-ink-faint" />
                            <Slider value={[minRisk]} min={0} max={95} step={5} onValueChange={(v) => setMinRisk(v[0])} className="w-[92px]" />
                            <span className="mono w-7 text-[10px] text-ink-soft">{minRisk}</span>
                        </div>

                        <div className="ml-auto flex items-center gap-1.5">
                            <Tabs value={view} onValueChange={setView}>
                                <TabsList className="h-8 border border-border/80 bg-foreground/[0.03] p-0.5">
                                    <TabsTrigger value="table" className="h-7 gap-1 rounded-md px-2 text-[11px] data-[state=active]:bg-brand/15 data-[state=active]:text-ink">
                                        <Table2 className="h-3.5 w-3.5" /> Table
                                    </TabsTrigger>
                                    <TabsTrigger value="cards" className="h-7 gap-1 rounded-md px-2 text-[11px] data-[state=active]:bg-brand/15 data-[state=active]:text-ink">
                                        <LayoutGrid className="h-3.5 w-3.5" /> Cards
                                    </TabsTrigger>
                                    <TabsTrigger value="map" className="h-7 gap-1 rounded-md px-2 text-[11px] data-[state=active]:bg-brand/15 data-[state=active]:text-ink">
                                        <MapIcon className="h-3.5 w-3.5" /> Map
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        <Filter className="h-3 w-3 text-ink-faint" />
                        {SAVED_VIEWS.map((v) => (
                            <button
                                key={v.key}
                                type="button"
                                onClick={() => applySaved(v.key)}
                                className={`mono rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] transition-colors ${savedView === v.key
                                        ? "border-brand/40 bg-brand/12 text-brand"
                                        : "border-border/80 bg-foreground/[0.02] text-ink-faint hover:text-ink-soft"
                                    }`}
                            >
                                {v.label}
                            </button>
                        ))}
                        {activeFilters.length > 0 && <span className="mx-1 h-3 w-px bg-border" />}
                        {activeFilters.map((f) => (
                            <button
                                key={f.key}
                                type="button"
                                onClick={f.clear}
                                className="flex items-center gap-1 rounded-full border border-border/80 bg-foreground/[0.04] px-2 py-1 text-[10px] text-ink-soft hover:text-ink"
                            >
                                {f.label} <X className="h-2.5 w-2.5" />
                            </button>
                        ))}
                        <span className="mono ml-auto text-[10px] text-ink-faint">avg risk {avgRisk}</span>
                    </div>
                </div>

                {isLoading && consumers.length === 0 ? (
                    <div className="space-y-2 p-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-10 animate-pulse rounded-lg bg-foreground/[0.04]" />
                        ))}
                    </div>
                ) : view === "table" ? (
                    <ConsumersTable
                        rows={rows}
                        allChecked={allChecked}
                        selected={selected}
                        onToggle={toggle}
                        onToggleAll={(v) => setSelected(v ? rows.map((r) => r.consumer_id) : [])}
                        expanded={expanded}
                        onExpand={setExpanded}
                        activeIndex={activeIndex}
                        flashId={flashId}
                    />
                ) : view === "cards" ? (
                    <div className="p-3">
                        <ConsumerCards rows={rows.slice(0, 60)} />
                    </div>
                ) : (
                    <div className="p-3">
                        <ConsumerMap rows={rows} transformers={transformers} />
                    </div>
                )}
            </Panel>

            <p className="mono mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink-faint">
                <span>Shortcuts</span>
                <span className="rounded border border-border/80 px-1">j</span> down
                <span className="rounded border border-border/80 px-1">k</span> up
                <span className="rounded border border-border/80 px-1">x</span> select
                <span className="rounded border border-border/80 px-1">enter</span> open
                <span className="rounded border border-border/80 px-1">/</span> search
            </p>

            {selected.length > 0 && (
                <div className="fixed bottom-[76px] left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-brand/30 bg-surface/95 px-3 py-2 shadow-glow-brand backdrop-blur lg:bottom-6">
                    <span className="mono text-[11px] text-ink">{selected.length} selected</span>
                    <span className="h-4 w-px bg-border" />
                    <Button
                        size="sm"
                        onClick={() => assign.mutate()}
                        disabled={assign.isPending}
                        className="h-7 gap-1.5 rounded-full bg-gradient-to-r from-brand to-brand-2 px-3 text-[11px] text-white"
                    >
                        <UserCheck className="h-3.5 w-3.5" /> {assign.isPending ? "Assigning…" : "Assign to inspector"}
                    </Button>
                    <button type="button" onClick={() => setSelected([])} className="mono text-[10px] text-ink-faint hover:text-ink">
                        clear
                    </button>
                    <button type="button" onClick={() => setSelected([])} aria-label="Close bulk bar" className="text-ink-faint hover:text-ink">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {selected.length === 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-foreground/[0.02] px-3 py-2">
                    <span className="mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Bulk select</span>
                    <Checkbox
                        checked={allChecked}
                        onCheckedChange={(v) => setSelected(v ? rows.map((r) => r.consumer_id) : [])}
                        aria-label="Select every meter in view"
                    />
                    <span className="text-[11px] text-ink-faint">
                        Tick meters (or press <kbd className="rounded border border-border/80 px-1">x</kbd>) to assign a batch of inspections.
                    </span>
                </div>
            )}

            <ImportDataDialog open={importOpen} onOpenChange={setImportOpen} />
        </>
    );
}