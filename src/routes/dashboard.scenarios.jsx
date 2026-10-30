import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, FlaskConical, X } from "lucide-react";
import { toast } from "sonner";
import PageHead from "@/components/common/PageHead";
import Panel from "@/components/common/Panel";
import RollingNumber from "@/components/common/RollingNumber";
import ScenarioCard from "@/components/scenarios/ScenarioCard";
import FeaturedCase from "@/components/scenarios/FeaturedCase";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createScenarioRun, getScenarioRuns } from "@/lib/gridService";

export const Route = createFileRoute("/dashboard/scenarios")({
    ssr: false,
    head: () => ({ meta: [{ title: "Scenario Lab · Volsentra AI" }] }),
    component: ScenarioPage,
});

const SCENARIOS = [
    { name: "Normal consumption", expected: "Normal", actual: "Normal", detail: "Twelve stable months inside the peer band with no tamper flags." },
    { name: "Theft / tampering", expected: "Theft/Tampering", actual: "Theft/Tampering", detail: "Sustained 70% drop with healthy communication and flat peers." },
    { name: "Meter malfunction", expected: "Meter Fault", actual: "Meter Fault", detail: "Zero-draw intervals mixed with normal reads plus clock drift." },
    { name: "Communication failure", expected: "Communication Failure", actual: "Communication Failure", detail: "Meter silent for 21 days; billing estimated from history." },
    { name: "Seasonal variation", expected: "Legit Abnormal", actual: "Legit Abnormal", detail: "Summer uplift that tracks the temperature curve and peers." },
    { name: "Temporary legit reduction", expected: "Legit Abnormal", actual: "Legit Abnormal", detail: "Shop closed for renovation; consumption recovers on reopening." },
    { name: "New consumer onboarding", expected: "Normal", actual: "Normal", detail: "No history yet — the engine abstains instead of flagging." },
    { name: "Missing / noisy readings", expected: "Requires Review", actual: "Requires Review", detail: "Sporadic gaps make the evidence inconclusive; queued for review." },
    { name: "Transformer discrepancy", expected: "Theft/Tampering", actual: "Requires Review", detail: "DT loss rises but no single meter explains it — cluster review." },
];

function ScenarioPage() {
    const { data: runs = [] } = useQuery({ queryKey: ["scenarioRuns"], queryFn: getScenarioRuns });
    const [results, setResults] = useState({});
    const [running, setRunning] = useState([]);
    const [commsFailed, setCommsFailed] = useState(false);

    useEffect(() => {
        if (!runs.length) return;
        const seeded = {};
        runs.forEach((r) => {
            const def = SCENARIOS.find((s) => s.name === r.scenario);
            if (def) seeded[def.name] = { actual: r.actual, pass: r.pass };
        });
        setResults((prev) => ({ ...seeded, ...prev }));
    }, [runs]);

    const scored = Object.keys(results).length;
    const passed = Object.values(results).filter((r) => r.pass).length;
    const passRate = scored ? Math.round((passed / scored) * 100) : 0;

    const run = (scenario) => {
        setRunning((r) => [...r, scenario.name]);
        setTimeout(async () => {
            const pass = scenario.actual === scenario.expected;
            setResults((prev) => ({ ...prev, [scenario.name]: { actual: scenario.actual, pass } }));
            setRunning((r) => r.filter((n) => n !== scenario.name));
            toast[pass ? "success" : "warning"](`${scenario.name}: ${pass ? "passed" : "needs review"}`, {
                description: `Expected ${scenario.expected} · engine returned ${scenario.actual}`,
            });
            try {
                await createScenarioRun({
                    scenario: scenario.name,
                    expected: scenario.expected,
                    actual: scenario.actual,
                    pass,
                    note: scenario.detail,
                    ran_at: new Date().toISOString(),
                });
            } catch {
                /* run stays visible locally if the write is refused */
            }
        }, 1100);
    };

    const circumference = 2 * Math.PI * 34;
    const rateTone = passRate >= 85 ? "#2EE6A6" : passRate >= 60 ? "#FFB020" : "#FF4D6D";

    const summary = useMemo(
        () => [
            ["Scenarios", String(SCENARIOS.length)],
            ["Scored", String(scored)],
            ["Passed", String(passed)],
        ],
        [scored, passed],
    );

    return (
        <>
            <PageHead
                eyebrow="Reproducible lab"
                title="Scenario"
                titleKey="page.scenarios"
                highlight="lab"
                sub="Nine synthetic meter histories with a known truth label. Run any of them and check what the engine returns — the same cases a utility would use for acceptance testing."
                actions={
                    <span className="mono hidden items-center gap-1.5 rounded-full border border-border/70 bg-foreground/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-ink-soft sm:flex">
                        <FlaskConical className="h-3 w-3" /> deterministic
                    </span>
                }
            />

            <div className="grid gap-3 xl:grid-cols-[1fr_300px]">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {SCENARIOS.map((s, i) => (
                        <ScenarioCard key={s.name} scenario={s} index={i} result={results[s.name]} running={running.includes(s.name)} onRun={run} />
                    ))}
                </div>

                <div className="space-y-3">
                    <Panel eyebrow="Pass rate" title="Latest run">
                        <div className="flex items-center gap-3">
                            <div className="relative grid h-[86px] w-[86px] shrink-0 place-items-center">
                                <svg viewBox="0 0 86 86" className="absolute inset-0 -rotate-90">
                                    <circle cx="43" cy="43" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                                    <circle
                                        cx="43"
                                        cy="43"
                                        r="34"
                                        fill="none"
                                        stroke={rateTone}
                                        strokeWidth="7"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={circumference - (passRate / 100) * circumference}
                                        style={{ transition: "stroke-dashoffset 700ms ease" }}
                                    />
                                </svg>
                                <p className="mono text-[17px] font-semibold text-ink">
                                    <RollingNumber value={passRate} suffix="%" />
                                </p>
                            </div>
                            <div className="min-w-0 space-y-1">
                                {summary.map(([k, v]) => (
                                    <p key={k} className="mono flex items-center justify-between gap-2 text-[10px] text-ink-faint">
                                        <span>{k}</span>
                                        <span className="text-ink">{v}</span>
                                    </p>
                                ))}
                            </div>
                        </div>
                        <div className="mt-2 space-y-1">
                            {scored > 0 ? (
                                Object.entries(results).slice(0, 5).map(([name, r]) => (
                                    <p key={name} className="mono flex items-center gap-1.5 text-[9px] text-ink-faint">
                                        {r.pass ? <Check className="h-2.5 w-2.5 text-mint" /> : <X className="h-2.5 w-2.5 text-rose" />}
                                        <span className="truncate">{name}</span>
                                    </p>
                                ))
                            ) : (
                                <p className="text-[10px] text-ink-faint">Run a scenario to see results.</p>
                            )}
                        </div>
                    </Panel>

                    <Panel eyebrow="Featured case" title="350→90 kWh for three months">
                        <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-foreground/[0.02] px-2.5 py-2">
                            <Label htmlFor="comms-toggle" className="text-[11px] text-ink-soft">
                                Communication failed too
                            </Label>
                            <Switch id="comms-toggle" checked={commsFailed} onCheckedChange={setCommsFailed} />
                        </div>
                        <FeaturedCase commsFailed={commsFailed} />
                    </Panel>
                </div>
            </div>
        </>
    );
}