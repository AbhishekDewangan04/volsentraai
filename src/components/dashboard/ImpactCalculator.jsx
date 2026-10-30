import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { IndianRupee, TrendingUp } from "lucide-react";
import Panel from "@/components/common/Panel";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useI18n } from "@/lib/i18n";
import { inrCompact, num } from "@/lib/gridData";

const DEFAULTS = { tariff: 8.4, meters: 200, inspection: 450, theft: 320 };
const DETECTION_RATE = 0.12;
const ATTEMPTS_PER_CASE = 2.5;

function Field({ label, value, onChange, min, max, step, prefix, suffix }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">{label}</p>
        <p className="mono text-[11px] text-ink">
          {prefix}
          {num(value)}
          {suffix}
        </p>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} className="flex-1" />
        <Input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="h-7 w-[72px] shrink-0 border-border/80 bg-foreground/[0.03] text-[11px]"
        />
      </div>
    </div>
  );
}

export default function ImpactCalculator({ variant = "section", className = "" }) {
  const { t } = useI18n();
  const [v, setV] = useState(DEFAULTS);
  const set = (key) => (next) => setV((prev) => ({ ...prev, [key]: next }));

  const detected = Math.round(v.meters * DETECTION_RATE);
  const monthly = detected * v.theft * v.tariff;
  const spend = Math.round(detected * ATTEMPTS_PER_CASE * v.inspection);
  const net = monthly - spend;
  const annual = monthly * 12;
  const payback = monthly > 0 ? Math.max(0.2, spend / monthly) : 0;

  const series = Array.from({ length: 13 }, (_, i) => ({
    month: i === 0 ? "now" : `+${i}`,
    cumulative: Math.round(monthly * i - spend),
  }));

  const inputs = (
    <div className={variant === "card" ? "grid gap-2.5 sm:grid-cols-2" : "grid gap-3 sm:grid-cols-2"}>
      <Field label={`${t("impact.tariff")} (₹)`} value={v.tariff} onChange={set("tariff")} min={4} max={20} step={0.1} prefix="₹" />
      <Field label={t("impact.meters")} value={v.meters} onChange={set("meters")} min={50} max={5000} step={50} />
      <Field label={`${t("impact.inspection")} (₹)`} value={v.inspection} onChange={set("inspection")} min={100} max={2000} step={50} prefix="₹" />
      <Field label={t("impact.theft")} value={v.theft} onChange={set("theft")} min={60} max={900} step={10} suffix=" kWh" />
    </div>
  );

  const outputs = (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {[
        [t("impact.monthly"), inrCompact(monthly), "text-mint"],
        [t("impact.annual"), inrCompact(annual), "text-brand"],
        [t("impact.payback"), `${payback.toFixed(1)} ${t("impact.months")}`, "text-amber"],
        [t("impact.net"), inrCompact(net), net >= 0 ? "text-ink" : "text-rose"],
      ].map(([label, value, tone]) => (
        <div key={label} className="rounded-xl border border-border/70 bg-surface/60 px-3 py-2.5">
          <p className="mono text-[8px] uppercase tracking-[0.12em] text-ink-faint">{label}</p>
          <p className={`mono mt-1 text-[16px] font-semibold leading-none ${tone}`}>{value}</p>
        </div>
      ))}
    </div>
  );

  const chart = (
    <div className="h-[150px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="impact-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2EE6A6" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#2EE6A6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fontSize: 8, fill: "#8A90A8", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 8, fill: "#8A90A8", fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} tickFormatter={(n) => inrCompact(n)} />
          <Tooltip
            contentStyle={{ background: "rgba(11,14,28,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 11, fontFamily: "var(--font-mono)" }}
            itemStyle={{ color: "#F4F6FF" }}
            formatter={(n) => [inrCompact(n), t("impact.cumulative")]}
          />
          <Area type="monotone" dataKey="cumulative" stroke="#2EE6A6" strokeWidth={1.8} fill="url(#impact-fill)" animationDuration={500} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  if (variant === "card") {
    return (
      <Panel
        eyebrow="Programme economics"
        title={t("impact.title")}
        className={className}
        actions={
          <span className="mono flex items-center gap-1 text-[9px] uppercase tracking-[0.12em] text-mint">
            <TrendingUp className="h-3 w-3" /> live
          </span>
        }
      >
        {inputs}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-mint/25 bg-mint/10 px-3 py-2">
            <p className="mono text-[8px] uppercase tracking-[0.12em] text-ink-faint">{t("impact.monthly")}</p>
            <p className="mono mt-0.5 text-[16px] font-semibold text-mint">{inrCompact(monthly)}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-surface/60 px-3 py-2">
            <p className="mono text-[8px] uppercase tracking-[0.12em] text-ink-faint">{t("impact.payback")}</p>
            <p className="mono mt-0.5 text-[16px] font-semibold text-ink">{payback.toFixed(1)} {t("impact.months")}</p>
          </div>
        </div>
        <p className="mono mt-2 flex items-center gap-1 text-[8px] uppercase tracking-[0.1em] text-ink-faint">
          <IndianRupee className="h-2.5 w-2.5" /> {t("impact.assumption")}
        </p>
      </Panel>
    );
  }

  return (
    <Panel eyebrow="Recovery model" title={t("impact.title")} className={className}>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-3">
          {inputs}
          <p className="mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">{t("impact.assumption")}</p>
        </div>
        <div>
          {outputs}
          {chart}
        </div>
      </div>
    </Panel>
  );
}