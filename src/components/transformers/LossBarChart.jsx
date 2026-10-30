import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import GlassTooltip from "@/components/charts/GlassTooltip";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { useMotionOff } from "@/lib/useMotionPref";

export default function LossBarChart({ rows, threshold = 10, onSelect }) {
    const [ref, inView] = useInViewOnce();
    const motionOff = useMotionOff();

    return (
        <div ref={ref} className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows} margin={{ top: 12, right: 8, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 6" stroke="rgba(148,163,184,0.13)" vertical={false} />
                    <XAxis
                        dataKey="transformer_id"
                        tick={{ fontSize: 8, fill: "#8A90A8", fontFamily: "var(--font-mono)" }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        height={40}
                    />
                    <YAxis
                        tick={{ fontSize: 8, fill: "#8A90A8", fontFamily: "var(--font-mono)" }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                        unit="%"
                    />
                    <Tooltip content={<GlassTooltip unit="%" />} cursor={{ fill: "rgba(124,92,255,0.06)" }} />
                    <ReferenceLine y={threshold} stroke="#FFB020" strokeDasharray="4 4" strokeOpacity={0.7} />
                    <Bar
                        dataKey="loss_pct"
                        name="loss"
                        radius={[4, 4, 0, 0]}
                        className="cursor-pointer"
                        onClick={(d) => onSelect?.(d?.transformer_id)}
                        isAnimationActive={inView && !motionOff}
                        animationDuration={1200}
                        animationEasing="ease-out"
                    >
                        {rows.map((r) => (
                            <Cell
                                key={r.transformer_id}
                                fill={r.loss_pct >= threshold ? "#FF4D6D" : "#7C5CFF"}
                                fillOpacity={r.loss_pct >= threshold ? 0.95 : 0.55}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}