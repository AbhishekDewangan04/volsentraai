import { causeMeta } from "@/lib/gridData";

export default function CauseBars({ rows, active = null, onSelect }) {
  const total = rows.reduce((s, r) => s + r.count, 0) || 1;
  return (
    <div className="space-y-2.5">
      {rows.map((r) => {
        const meta = causeMeta(r.cause);
        const pct = Math.round((r.count / total) * 100);
        const dim = active && active !== r.cause;
        return (
          <button
            key={r.cause}
            type="button"
            onClick={() => onSelect?.(active === r.cause ? null : r.cause)}
            aria-pressed={active === r.cause}
            className={`group block w-full text-left transition-opacity ${dim ? "opacity-40" : "opacity-100"}`}
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} />
                <span className="truncate text-[11px] text-ink-soft group-hover:text-ink">{meta.label}</span>
              </span>
              <span className="mono shrink-0 text-[10px] text-ink-faint">
                {r.count} <span className="opacity-60">· {pct}%</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-foreground/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-700 group-hover:brightness-125"
                style={{ width: `${Math.max(3, pct)}%`, background: `linear-gradient(90deg, ${meta.hex}55, ${meta.hex})` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}