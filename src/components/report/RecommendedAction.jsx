import { ArrowRight, Gauge, Radio, Wrench } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { inr } from "@/lib/gridData";

export default function RecommendedAction({ consumer }) {
    const recoverable = Math.max(0, (consumer.baseline_kwh - consumer.actual_kwh) * 8.4 * 3);
    const map = {
        "Theft/Tampering": {
            icon: Wrench,
            title: "Dispatch a meter inspection within 24h",
            steps: [
                "Verify the meter seal, CT ratio and service cable",
                "Photograph the terminal cover and load check on site",
                `Raise a provisional assessment of ${inr(recoverable)} for 3 cycles`,
            ],
        },
        "Meter Fault": {
            icon: Gauge,
            title: "Replace the metering unit",
            steps: ["Bench-test the meter for clock drift", "Install a replacement and re-read the register", "Back-bill using the peer average for the gap"],
        },
        "Communication Failure": {
            icon: Radio,
            title: "Restore the meter link before analysis",
            steps: ["Check the DT concentrator and SIM status", "Replay the last 21 days of buffered reads", "Re-run scoring once two clean cycles land"],
        },
        "Requires Review": {
            icon: Gauge,
            title: "Hold for one more billing cycle",
            steps: ["Request a clean read with no gap", "Compare against the two nearest peers", "Escalate if the drop persists past 90 days"],
        },
        "Legit Abnormal": {
            icon: Gauge,
            title: "No field action needed",
            steps: ["Note the seasonal driver on the account", "Refresh the baseline after the season", "Keep the meter on standard monitoring"],
        },
        Normal: {
            icon: Gauge,
            title: "No action — meter is healthy",
            steps: ["Continue nightly scoring", "Leave the baseline untouched", "No case required"],
        },
    };
    const cfg = map[consumer.cause] ?? map.Normal;

    return (
        <div className="panel p-4">
            <p className="mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">Recommended action</p>
            <div className="mt-2 flex items-start gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-brand/25 bg-brand/12 text-brand">
                    <cfg.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-[13px] font-medium leading-snug text-ink">{cfg.title}</p>
                    <ul className="mt-2 space-y-1">
                        {cfg.steps.map((s) => (
                            <li key={s} className="flex gap-1.5 text-[11px] leading-snug text-ink-soft">
                                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand" />
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <Link to="/dashboard/cases" className="mono mt-3 flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-brand hover:opacity-80">
                Open in case management <ArrowRight className="h-3 w-3" />
            </Link>
        </div>
    );
}