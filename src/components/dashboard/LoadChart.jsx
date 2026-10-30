import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Brush, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Pause, Play } from "lucide-react";
import ChartCard from "@/components/charts/ChartCard";
import GlassTooltip from "@/components/charts/GlassTooltip";
import ChartLegend from "@/components/charts/ChartLegend";
import TimeRangeTabs from "@/components/charts/TimeRangeTabs";
import LiveDot from "@/components/common/LiveDot";
import { useLiveSeries } from "@/components/charts/useLiveSeries";
import { loadSeriesFor } from "@/lib/gridService";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { useMotionOff } from "@/lib/useMotionPref";

const SERIES = [
  { key: "mw", label: "Actual", color: "#A78BFA" },
  { key: "forecast", label: "Forecast", color: "#63E6BE" },
];

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

export default function LoadChart({ consumers = [], className = "" }) {
  const motionOff = useMotionOff();
  const [range, setRange] = useState("24H");
  const [hidden, setHidden] = useState([]);
  const [zoom, setZoom] = useState(null);
  const [chartKey, setChartKey] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [wrapRef, inView] = useInViewOnce();

  const base = useMemo(() => loadSeriesFor(consumers, range), [consumers, range]);
  const { data, paused, toggle } = useLiveSeries(base, {
    key: range,
    enabled: !motionOff,
    keep: 60,
    jitter: range === "1H" ? 1.2 : 5,
  });

  // Draw the area in once it scrolls into view, then stop animating so the live
  // append slides smoothly instead of re-drawing the whole path every 2s.
  useEffect(() => {
    if (!inView) return;
    setAnimate(true);
    const id = setTimeout(() => setAnimate(false), 1400);
    return () => clearTimeout(id);
  }, [inView, range]);

  const toggleSeries = (key) => setHidden((h) => (h.includes(key) ? h.filter((k) => k !== key) : [...h, key]));
  const isZoomed = Boolean(zoom && (zoom.startIndex > 0 || zoom.endIndex < data.length - 1));

  return (
    <div ref={wrapRef} className={className}>
      <ChartCard
        eyebrow="Feeder load"
        title="Grid load vs forecast"
        exportName={`volsentra-load-${range}`}
        rows={data}
        columns={[
          { label: "t", value: (r) => r.t },
          { label: "actual", value: (r) => r.mw },
          { label: "forecast", value: (r) => r.forecast },
        ]}
        actions={
          <>
            {!motionOff && (
              <span className="mono hidden items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-mint sm:flex">
                <LiveDot tone="mint" size="h-1.5 w-1.5" /> live
              </span>
            )}
            <TimeRangeTabs value={range} onChange={setRange} />
            {!motionOff && (
              <button
                type="button"
                onClick={toggle}
                aria-label={paused ? "Resume stream" : "Pause stream"}
                className="grid h-6 w-6 place-items-center rounded-full border border-border/70 text-ink-faint hover:text-ink"
              >
                {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              </button>
            )}
          </>
        }
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ChartLegend items={SERIES} hidden={hidden} onToggle={toggleSeries} />
            <div className="flex items-center gap-2">
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
              <span className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">MW · {range}</span>
            </div>
          </div>
        }
      >
        <div className="h-[236px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart key={`${range}-${chartKey}`} data={data} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="load-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C5CFF" stopOpacity={0.55} />
                  <stop offset="55%" stopColor="#A855F7" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#FF3D9A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke="rgba(148,163,184,0.14)" vertical={false} />
              <XAxis
                dataKey="t"
                tick={{ fontSize: 9, fill: "#8A90A8", fontFamily: "var(--font-mono)" }}
                axisLine={false}
                tickLine={false}
                interval={data.length > 40 ? 9 : data.length > 26 ? 4 : 3}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#8A90A8", fontFamily: "var(--font-mono)" }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                content={<GlassTooltip unit="MW" />}
                cursor={{ stroke: "#7C5CFF", strokeDasharray: "3 3", strokeWidth: 1 }}
              />
              {!hidden.includes("forecast") && (
                <Area
                  type="monotone"
                  dataKey="forecast"
                  stroke="#63E6BE"
                  strokeWidth={1.2}
                  strokeDasharray="4 4"
                  fill="transparent"
                  dot={false}
                  isAnimationActive={animate && !motionOff}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              )}
              {!hidden.includes("mw") && (
                <Area
                  type="monotone"
                  dataKey="mw"
                  stroke="#A78BFA"
                  strokeWidth={2.2}
                  fill="url(#load-grad)"
                  activeDot={{ r: 3.5, stroke: "#05060F", strokeWidth: 2 }}
                  dot={<AnomalyDot />}
                  isAnimationActive={animate && !motionOff}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              )}
              {data.length > 12 && (
                <Brush
                  dataKey="t"
                  height={16}
                  travellerWidth={6}
                  stroke="rgba(124,92,255,0.5)"
                  fill="rgba(124,92,255,0.06)"
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