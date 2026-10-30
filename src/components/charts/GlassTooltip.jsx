import CountValue from "@/components/charts/CountValue";

/** Glass tooltip with a semantic colour dot per series and count-up values. */
export default function GlassTooltip({ active, payload, label, unit = "", decimals = 1, labelSuffix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[128px] rounded-xl border border-border/80 bg-popover/90 px-3 py-2 shadow-panel backdrop-blur-md">
      <p className="mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
        {labelSuffix}
      </p>
      <div className="mt-1 space-y-0.5">
        {payload.map((p) => {
          const color = p.color || p.payload?.fill || "hsl(var(--brand))";
          return (
            <div key={p.dataKey ?? p.name} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
              <span className="text-[10px] text-ink-soft">{p.name}</span>
              <span className="ml-auto text-[11px] text-ink">
                <CountValue value={Number(p.value) || 0} decimals={decimals} suffix={unit ? ` ${unit}` : ""} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}