import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

export default function PeerRadar({ consumer }) {
    const drop = Math.max(0, Math.round((1 - consumer.actual_kwh / Math.max(1, consumer.baseline_kwh)) * 100));
    const data = [
        { axis: "Night load", consumer: Math.max(8, 70 - drop), peer: 68 },
        { axis: "Weekday", consumer: Math.max(10, 76 - drop * 0.8), peer: 74 },
        { axis: "Weekend", consumer: Math.max(6, 62 - drop * 0.6), peer: 63 },
        { axis: "Peak hours", consumer: Math.max(12, 80 - drop * 0.9), peer: 72 },
        { axis: "Stability", consumer: consumer.cause === "Meter Fault" ? 22 : 64, peer: 70 },
    ];

    return (
        <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data} outerRadius="72%">
                    <PolarGrid stroke="rgba(148,163,184,0.18)" />
                    <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9, fill: "#8A90A8", fontFamily: "var(--font-mono)" }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="peer" dataKey="peer" stroke="#38BDF8" strokeWidth={1.2} fill="#38BDF8" fillOpacity={0.1} />
                    <Radar name="consumer" dataKey="consumer" stroke="#FF4D6D" strokeWidth={1.8} fill="#FF4D6D" fillOpacity={0.18} />
                    <Tooltip
                        contentStyle={{
                            background: "rgba(11,14,28,0.95)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 10,
                            fontSize: 11,
                            fontFamily: "var(--font-mono)",
                        }}
                        itemStyle={{ color: "#F4F6FF" }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}