export const TIME_RANGES = ["1H", "24H", "7D", "30D", "12M"];

/** Time-range pills that actually refetch the series behind the chart. */
export default function TimeRangeTabs({ value, onChange, ranges = TIME_RANGES, className = "" }) {
  return (
    <div className={`flex items-center gap-0.5 rounded-full border border-border/70 bg-foreground/[0.03] p-0.5 ${className}`}>
      {ranges.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          aria-pressed={value === r}
          className={`mono rounded-full px-2 py-[3px] text-[9px] uppercase tracking-[0.08em] transition-colors ${value === r ? "bg-brand/20 text-ink" : "text-ink-faint hover:text-ink-soft"
            }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}