import { Area, CartesianGrid, ComposedChart, Line, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MONTHS, num } from "@/lib/gridData";

function Tip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-border/80 bg-popover/95 px-2.5 py-2 shadow-panel backdrop-blur">
            <p className="mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} className="mono mt-0.5 text-[11px]" style={{ color: p.color }}>
                    {p.dataKey} · {num(p.value)} kWh
                </p>
            ))}
        </div>
    );
}

export default function BaselineChart({ consumer }) {
    const data = consumer.monthly.map((v, i) => ({
        month: MONTHS[i],
        actual: v,
        baseline: consumer.baseline_kwh,
        peer: consumer.peer_avg_kwh,
    }));
    const from = MONTHS[8];

    return (
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                        <linearGradient id="anom-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FF4D6D" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#FF4D6D" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 6" stroke="rgba(148,163,184,0.14)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#8A90A8", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "#8A90A8", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} width={46} />
                    <Tooltip content={<Tip />} cursor={{ stroke: "#7C5CFF", strokeDasharray: "3 3" }} />
                    <ReferenceArea x1={from} x2={MONTHS[MONTHS.length - 1]} fill="#FF4D6D" fillOpacity={0.06} stroke="#FF4D6D" strokeOpacity={0.25} />
                    <Line type="monotone" dataKey="baseline" stroke="#A78BFA" strokeWidth={1.4} strokeDasharray="5 4" dot={false} />
                    <Line type="monotone" dataKey="peer" stroke="#38BDF8" strokeWidth={1} strokeDasharray="2 4" dot={false} />
                    <Area type="monotone" dataKey="actual" stroke="#FF4D6D" strokeWidth={2.2} fill="url(#anom-fill)" />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}