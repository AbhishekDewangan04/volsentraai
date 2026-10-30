import { useMemo, useState } from "react";
import { Area, AreaChart, Brush, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Pause, Play } from "lucide-react";
import ChartCard from "@/components/charts/ChartCard";
import GlassTooltip from "@/components/charts/GlassTooltip";
import TimeRangeTabs from "@/components/charts/TimeRangeTabs";
import LiveDot from "@/components/common/LiveDot";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { useMotionOff } from "@/lib/useMotionPref";

const WINDOWS = { "1H": 8, "24H": 16, "7D": 24, "30D": 30, "12M": 60 };

function AnomalyDot(props) {
    const { cx, cy, payload } = props;
    if (!payload?.anomaly) return null;
    return (
        <g>
            <circle
                cx={cx}
                cy={cy}
                r={7}
                fill="#FF4D6D"
                opacity={0.22}
                className="animate-ping"
                style={{ transformOrigin: `${cx}px ${cy}px` }}
            />
            <circle cx={cx} cy={cy} r={2.6} fill="#FF4D6D" />
        </g>
    );
}

export default function StreamChart({ data = [], paused = false, onTogglePause }) {
    const motionOff = useMotionOff();
    const [windowKey, setWindowKey] = useState("12M");
    const [wrapRef, inView] = useInViewOnce();
    const [zoom, setZoom] = useState(null);
    const [chartKey, setChartKey] = useState(0);

    // The window tabs slice the stream, so switching them re-renders real data.
    const visible = useMemo(() => data.slice(-(WINDOWS[windowKey] ?? 30)), [data, windowKey]);
    const anomalies = visible.filter((d) => d.anomaly).length;
    const isZoomed = Boolean(zoom && (zoom.startIndex > 0 || zoom.endIndex < visible.length - 1));

    return (
        <div ref={wrapRef}>
            <ChartCard
                eyebrow="Live aggregate · 50 meters"
                title="Real-time consumption"
                bodyClassName="p-4"
                exportName="volsentra-live-stream"
                rows={visible}
                columns={[
                    { label: "timestamp", value: (r) => r.t },
                    { label: "kw", value: (r) => r.kw },
                    { label: "anomaly", value: (r) => r.anomaly },
                ]}
                actions={
                    <>
                        <span className="mono hidden items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-mint sm:flex">
                            <LiveDot tone={paused ? "faint" : "mint"} size="h-1.5 w-1.5" /> {paused ? "paused" : "live"}
                        </span>
                        <TimeRangeTabs value={windowKey} onChange={setWindowKey} />
                        <button
                            type="button"
                            onClick={onTogglePause}
                            aria-label={paused ? "Resume stream" : "Pause stream"}
                            className="grid h-6 w-6 place-items-center rounded-full border border-border/70 text-ink-faint hover:text-ink"
                        >
                            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                        </button>
                    </>
                }
                footer={
                    <div className="flex items-center justify-between gap-2">
                        <span className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
                            {anomalies} anomaly marker{anomalies === 1 ? "" : "s"} in view
                        </span>
                        {isZoomed && (
                            <button
                                type="button"
                                onClick={() => {
                                    setZoom(null);
                                    setChartKey((k) => k + 1);
                                }}
                                className="mono rounded-full border border-brand/40 bg-brand/12 px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-brand"
                            >
                                Reset zoom
                            </button>
                        )}
                    </div>
                }
            >
                <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart key={`${windowKey}-${chartKey}`} data={visible} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="stream-fill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.45} />
                                    <stop offset="100%" stopColor="#38BDF8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="2 6" stroke="rgba(148,163,184,0.13)" vertical={false} />
                            <XAxis
                                dataKey="t"
                                tick={{ fontSize: 8, fill: "#8A90A8", fontFamily: "var(--font-mono)" }}
                                axisLine={false}
                                tickLine={false}
                                interval={visible.length > 30 ? 9 : visible.length > 16 ? 4 : 2}
                            />
                            <YAxis
                                tick={{ fontSize: 8, fill: "#8A90A8", fontFamily: "var(--font-mono)" }}
                                axisLine={false}
                                tickLine={false}
                                width={44}
                            />
                            <Tooltip
                                content={<GlassTooltip unit="kW" decimals={1} />}
                                cursor={{ stroke: "#38BDF8", strokeDasharray: "3 3", strokeWidth: 1 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="kw"
                                name="consumption"
                                stroke="#38BDF8"
                                strokeWidth={1.8}
                                fill="url(#stream-fill)"
                                isAnimationActive={inView && !motionOff && paused}
                                animationDuration={1200}
                                animationEasing="ease-out"
                                activeDot={{ r: 3.5, stroke: "#05060F", strokeWidth: 2 }}
                                dot={<AnomalyDot />}
                            />
                            {visible.length > 12 && (
                                <Brush
                                    dataKey="t"
                                    height={16}
                                    travellerWidth={6}
                                    stroke="rgba(56,189,248,0.5)"
                                    fill="rgba(56,189,248,0.06)"
                                    startIndex={zoom?.startIndex}
                                    endIndex={zoom?.endIndex}
                                    onChange={(r) => setZoom({ startIndex: r.startIndex, endIndex: r.endIndex })}
                                />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </ChartCard>
        </div>
    );
}