import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import GlassTooltip from "@/components/charts/GlassTooltip";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { useMotionOff } from "@/lib/useMotionPref";

export default function ClusterScatter({ rows, onSelect }) {
    const suspicious = rows.filter((r) => r.loss_pct >= 12);
    const normal = rows.filter((r) => r.loss_pct < 12);
    const [ref, inView] = useInViewOnce();
    const motionOff = useMotionOff();

    return (
        <div ref={ref} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 12, right: 14, left: -18, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="2 6" stroke="rgba(148,163,184,0.13)" />
                    <XAxis
                        type="number"
                        dataKey="loss_pct"
                        name="loss"
                        unit="%"
                        tick={{ fontSize: 8, fill: "#8A90A8", fontFamily: "var(--font-mono)" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        type="number"
                        dataKey="suspiciousCount"
                        name="suspicious"
                        tick={{ fontSize: 8, fill: "#8A90A8", fontFamily: "var(--font-mono)" }}
                        axisLine={false}
                        tickLine={false}
                        width={36}
                    />
                    <ZAxis type="number" dataKey="consumers" range={[60, 360]} />
                    <ReferenceLine x={12} stroke="#FFB020" strokeDasharray="4 4" strokeOpacity={0.6} />
                    <Tooltip content={<GlassTooltip decimals={0} />} cursor={{ strokeDasharray: "3 3" }} />
                    <Scatter
                        name="normal"
                        data={normal}
                        fill="#38BDF8"
                        fillOpacity={0.55}
                        className="cursor-pointer"
                        onClick={(p) => onSelect?.(p?.transformer_id)}
                        isAnimationActive={inView && !motionOff}
                        animationDuration={1200}
                    />
                    <Scatter
                        name="suspicious"
                        data={suspicious}
                        fill="#FF4D6D"
                        shape="diamond"
                        className="cursor-pointer"
                        onClick={(p) => onSelect?.(p?.transformer_id)}
                        isAnimationActive={inView && !motionOff}
                        animationDuration={1200}
                    />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}