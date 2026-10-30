/** Legend whose items toggle their series on and off. */
export default function ChartLegend({ items, hidden = [], onToggle, className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {items.map((it) => {
        const off = hidden.includes(it.key);
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onToggle?.(it.key)}
            aria-pressed={!off}
            className={`flex items-center gap-1.5 text-[10px] transition-opacity ${off ? "opacity-40" : "opacity-100"}`}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: it.color }} />
            <span className="text-ink-soft">{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}