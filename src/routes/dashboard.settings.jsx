import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Database, Plug, RotateCcw, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import PageHead from "@/components/common/PageHead";
import Panel from "@/components/common/Panel";
import ImportDataDialog from "@/components/consumers/ImportDataDialog";
import { useGrid } from "@/lib/GridContext";
import { num } from "@/lib/gridData";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard/settings")({
    ssr: false,
    head: () => ({ meta: [{ title: "Settings · Volsentra AI" }] }),
    component: SettingsPage,
});

const STEPS = [
    ["Historical data", "12 months of billing + meter reads land in the warehouse."],
    ["Profiling", "Each connection is profiled against its own history and peers."],
    ["ML detection", "The hybrid ensemble scores every meter each night."],
    ["Risk / cause", "Score and probable cause are attached to the meter."],
    ["Explanation", "SHAP-style attribution and a one-line reason per flag."],
    ["Virtual IoT stream", "A simulated meter feed replays at two-second cadence."],
    ["Real-time anomaly", "Streaming reads are scored as they arrive."],
    ["Alert", "Critical scores raise an alert and open a case."],
    ["Inspection priority", "Risk × recoverable units ranks the field queue."],
];

function SettingsPage() {
    const { settings, updateSettings } = useGrid();
    const { t } = useI18n();
    const [threshold, setThreshold] = useState(settings.risk_threshold);
    const [api, setApi] = useState(settings.api_base_url);
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(true);
    const [importOpen, setImportOpen] = useState(false);

    useEffect(() => setThreshold(settings.risk_threshold), [settings.risk_threshold]);
    useEffect(() => setApi(settings.api_base_url), [settings.api_base_url]);

    useEffect(() => {
        if (!playing) return;
        const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 2400);
        return () => clearInterval(id);
    }, [playing]);

    return (
        <>
            <PageHead
                eyebrow="Configuration"
                title="Settings"
                titleKey="page.settings"
                sub="Tune the risk threshold, decide what the console is allowed to do, and point Volsentra at a live utility API when you are ready."
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setImportOpen(true)}
                        className="h-8 gap-1.5 rounded-full border-border/80 bg-foreground/[0.03] text-[12px]"
                    >
                        <Upload className="h-3.5 w-3.5" /> {t("act.import")}
                    </Button>
                }
            />

            <div className="grid gap-3 xl:grid-cols-2">
                <Panel eyebrow="Data" title="Dataset & assumptions">
                    <div className="space-y-1.5">
                        {[
                            ["Dataset", "Kaggle Electricity Theft Detection Dataset"],
                            ["Meter population", `${num(200)} consumers · 10 DTs · 3 feeders`],
                            ["History window", "12 billing months"],
                            ["Tariff assumption", "₹8.40 per kWh"],
                            ["Class mix", "70% normal · 8% theft · 22% other anomalies"],
                            ["Model", "Hybrid ensemble (IF + LightGBM + LSTM-AE)"],
                        ].map(([k, v]) => (
                            <div key={k} className="flex items-start justify-between gap-3 border-b border-border/50 py-1.5 last:border-0">
                                <span className="text-[11px] text-ink-faint">{k}</span>
                                <span className="mono max-w-[62%] text-right text-[10.5px] leading-snug text-ink">{v}</span>
                            </div>
                        ))}
                    </div>
                    <p className="mono mt-2 flex items-start gap-1.5 text-[9px] leading-relaxed text-ink-faint">
                        <Database className="mt-0.5 h-3 w-3 shrink-0" />
                        Every figure in the console is reproducible from this seeded dataset.
                    </p>
                </Panel>

                <div className="space-y-3">
                    <Panel eyebrow="Detection" title="Risk threshold">
                        <div className="flex items-baseline justify-between">
                            <p className="text-[11px] text-ink-soft">Flag a meter for review at</p>
                            <p className="mono text-[18px] font-semibold text-ink">{threshold}</p>
                        </div>
                        <Slider
                            value={[threshold]}
                            min={20}
                            max={95}
                            step={5}
                            onValueChange={(v) => setThreshold(v[0])}
                            onValueCommit={(v) => {
                                updateSettings({ risk_threshold: v[0] });
                                toast.success(`Threshold set to ${v[0]}`, { description: "Applies to the risk queue on the next load." });
                            }}
                            className="mt-3"
                        />
                        <div className="mono mt-1.5 flex justify-between text-[8px] uppercase tracking-[0.1em] text-ink-faint">
                            <span>more alerts</span>
                            <span>fewer alerts</span>
                        </div>
                        <p className="mt-2 text-[10px] leading-relaxed text-ink-faint">
                            Below 55 the queue fills with weak signals; above 75 the model misses early theft. 55 is the accepted
                            operating point for this grid.
                        </p>
                    </Panel>

                    <Panel eyebrow="Behaviour" title="Notifications & motion">
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[11.5px] text-ink">Alert notifications</p>
                                    <p className="text-[10px] text-ink-faint">Show the toast and badge when a critical score lands.</p>
                                </div>
                                <Switch checked={settings.notify} onCheckedChange={(v) => updateSettings({ notify: v })} aria-label="Alert notifications" />
                            </div>
                            <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-2.5">
                                <div>
                                    <p className="text-[11.5px] text-ink">Reduced motion</p>
                                    <p className="text-[10px] text-ink-faint">Stop entrance animations, marquees and the 3D drift.</p>
                                </div>
                                <Switch checked={settings.reduced_motion} onCheckedChange={(v) => updateSettings({ reduced_motion: v })} aria-label="Reduced motion" />
                            </div>
                        </div>
                    </Panel>
                </div>
            </div>

            <div className="mt-3 grid gap-3 xl:grid-cols-2">
                <Panel eyebrow="Integration" title="API base URL">
                    <Label htmlFor="api-url" className="mono text-[9px] uppercase tracking-[0.1em] text-ink-faint">
                        Utility service endpoint
                    </Label>
                    <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                        <Input
                            id="api-url"
                            value={api}
                            onChange={(e) => setApi(e.target.value)}
                            placeholder="https://api.your-utility.example/v1"
                            className="h-9 border-border/80 bg-foreground/[0.03] text-[12px]"
                        />
                        <Button
                            onClick={() => {
                                updateSettings({ api_base_url: api.trim() });
                                toast.success(api.trim() ? "Service endpoint saved" : "Endpoint cleared", {
                                    description: api.trim() ? "Reads will try your API first, then fall back to the demo grid." : "Back to the seeded demo grid.",
                                });
                            }}
                            className="h-9 shrink-0 gap-1.5 rounded-full bg-gradient-to-r from-brand to-brand-2 px-4 text-[12px] text-white"
                        >
                            <Plug className="h-3.5 w-3.5" /> Save
                        </Button>
                    </div>
                    <p className="mt-2 text-[10px] leading-relaxed text-ink-faint">
                        Every screen reads through one service layer, so pointing it at a real utility API swaps the whole data
                        source without touching a single page.
                    </p>
                    <p className="mono mt-2 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.1em] text-mint">
                        <ShieldCheck className="h-3 w-3" /> {api.trim() ? "custom endpoint configured" : "demo dataset active"}
                    </p>
                </Panel>

                <Panel
                    eyebrow="Reproducible demo"
                    title="End-to-end walkthrough"
                    actions={
                        <Button variant="ghost" size="sm" onClick={() => { setStep(0); setPlaying(true); }} className="h-7 gap-1 rounded-full px-2 text-[10px] text-ink-soft">
                            <RotateCcw className="h-3 w-3" /> Replay
                        </Button>
                    }
                >
                    <div className="mb-2 flex items-center justify-between">
                        <p className="mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                            step {String(step + 1).padStart(2, "0")} / 09
                        </p>
                        <button
                            type="button"
                            onClick={() => setPlaying((p) => !p)}
                            className="mono text-[9px] uppercase tracking-[0.12em] text-brand hover:opacity-80"
                        >
                            {playing ? "pause" : "play"}
                        </button>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-foreground/[0.06]">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-brand to-brand-2 transition-all duration-500"
                            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>
                    <ol className="mt-3 space-y-1">
                        {STEPS.map(([title, desc], i) => (
                            <li
                                key={title}
                                onClick={() => { setStep(i); setPlaying(false); }}
                                className={`cursor-pointer rounded-lg px-2 py-1.5 transition-colors ${i === step ? "bg-brand/10 ring-1 ring-brand/25" : "hover:bg-foreground/[0.03]"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[8px] ${i <= step ? "border-brand/50 bg-brand/15 text-brand" : "border-border text-ink-faint"}`}>
                                        {i < step ? <Check className="h-2.5 w-2.5" /> : i + 1}
                                    </span>
                                    <p className={`truncate text-[11px] ${i === step ? "text-ink" : "text-ink-soft"}`}>{title}</p>
                                </div>
                                {i === step && <p className="ml-6 mt-0.5 text-[10px] leading-snug text-ink-faint">{desc}</p>}
                            </li>
                        ))}
                    </ol>
                </Panel>
            </div>

            <ImportDataDialog open={importOpen} onOpenChange={setImportOpen} />
        </>
    );
}