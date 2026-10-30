import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import RollingNumber from "@/components/common/RollingNumber";

const DATA = [
    { m: "May", actual: 372, baseline: 378, comms: 100 },
    { m: "Jun", actual: 385, baseline: 380, comms: 100 },
    { m: "Jul", actual: 364, baseline: 375, comms: 100 },
    { m: "Aug", actual: 96, baseline: 380, comms: 100 },
    { m: "Sep", actual: 88, baseline: 382, comms: 100 },
    { m: "Oct", actual: 92, baseline: 379, comms: 100 },
];

export default function FeaturedCase({ commsFailed }) {
    return (
        <div>
            <div className="grid gap-2 sm:grid-cols-3">
                {[
                    ["Before", "372 kWh", "3-month average", "text-ink"],
                    ["After", "92 kWh", "−75% sustained", "text-rose"],
                    ["Verdict", commsFailed ? "Comms / Data" : "Probable Theft", commsFailed ? "gap, not tampering" : "91% confidence", commsFailed ? "text-sky" : "text-rose"],
                ].map(([k, v, note, tone]) => (
                    <div key={k} className="rounded-lg border border-border/60 bg-foreground/[0.02] px-2.5 py-2">
                        <p className="mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">{k}</p>
                        <p className={`mono mt-0.5 text-[13px] font-semibold ${tone}`}>{v}</p>
                        <p className="mono text-[8px] text-ink-faint">{note}</p>
                    </div>
                ))}
            </div>

            <div className="mt-3 h-[210px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DATA} margin={{ top: 10, right: 6, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="2 6" stroke="rgba(148,163,184,0.13)" vertical={false} />
                        <XAxis dataKey="m" tick={{ fontSize: 9, fill: "#8A90A8", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: "#8A90A8", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} width={40} />
                        <Tooltip
                            cursor={{ fill: "rgba(124,92,255,0.06)" }}
                            contentStyle={{ background: "rgba(11,14,28,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 11, fontFamily: "var(--font-mono)" }}
                            itemStyle={{ color: "#F4F6FF" }}
                        />
                        <ReferenceLine y={378} stroke="#7C5CFF" strokeDasharray="4 4" strokeOpacity={0.6} />
                        <Bar dataKey="actual" radius={[4, 4, 0, 0]}>
                            {DATA.map((d, i) => (
                                <Cell key={d.m} fill={i >= 3 ? (commsFailed ? "#38BDF8" : "#FF4D6D") : "#7C5CFF"} fillOpacity={i >= 3 ? 0.95 : 0.5} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
                {commsFailed
                    ? "Same 75% drop, but the meter went silent at the same time. The engine reads missing reads as a data problem and routes it to communications, not theft — the drop cannot be trusted without telemetry."
                    : "The meter kept reporting while consumption collapsed and neighbours stayed flat. That combination is the textbook bypass signature, so the engine escalates to theft with high confidence."}
            </p>
            <p className="mono mt-2 flex items-center gap-2 text-[9px] uppercase tracking-[0.1em] text-ink-faint">
                cases scored <RollingNumber value={commsFailed ? 1 : 1} /> · label {commsFailed ? "Communication/Data" : "Theft/Tampering"}
            </p>
        </div>
    );
}