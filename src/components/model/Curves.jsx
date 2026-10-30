import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const roc = Array.from({ length: 21 }, (_, i) => {
    const fpr = i / 20;
    return { fpr, tpr: Number((1 - Math.pow(1 - fpr, 3.4)).toFixed(3)), baseline: fpr };
});

const pr = Array.from({ length: 21 }, (_, i) => {
    const recall = i / 20;
    return { recall, precision: Number((0.995 - 0.36 * Math.pow(recall, 2.3)).toFixed(3)) };
});

const axis = { fontSize: 9, fill: "#8A90A8", fontFamily: "var(--font-mono)" };
const tooltipStyle = {
    background: "rgba(11,14,28,0.95)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    fontSize: 11,
    fontFamily: "var(--font-mono)",
};

export function RocCurve() {
    return (
        <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={roc} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 6" stroke="rgba(148,163,184,0.13)" />
                    <XAxis dataKey="fpr" tick={axis} axisLine={false} tickLine={false} type="number" domain={[0, 1]} />
                    <YAxis tick={axis} axisLine={false} tickLine={false} domain={[0, 1]} width={40} />
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#F4F6FF" }} labelFormatter={(v) => `FPR ${v}`} />
                    <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="tpr" stroke="#7C5CFF" strokeWidth={2.2} dot={false} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export function PrCurve() {
    return (
        <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pr} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 6" stroke="rgba(148,163,184,0.13)" />
                    <XAxis dataKey="recall" tick={axis} axisLine={false} tickLine={false} type="number" domain={[0, 1]} />
                    <YAxis tick={axis} axisLine={false} tickLine={false} domain={[0.5, 1]} width={40} />
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#F4F6FF" }} labelFormatter={(v) => `Recall ${v}`} />
                    <Line type="monotone" dataKey="precision" stroke="#FF3D9A" strokeWidth={2.2} dot={false} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}