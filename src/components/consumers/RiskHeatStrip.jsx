import { cn } from "@/lib/utils";

/** Risk by feeder — each cell is a clickable risk bucket. */
export default function RiskHeatStrip({ feeders, active, onSelect }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {feeders.map((f) => {
        const isActive = active === f.feeder;
        return (
          <button
            key={f.feeder}
            type="button"
            onClick={() => onSelect(isActive ? "all" : f.feeder)}
            className={cn(
              "group relative overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-all",
              isActive ? "border-brand/50 bg-brand/10" : "border-border/70 bg-foreground/[0.02] hover:border-border",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="mono truncate text-[10px] uppercase tracking-[0.1em] text-ink-soft">{f.feeder}</span>
              <span className="mono shrink-0 text-[11px]" style={{ color: f.avgRisk >= 60 ? "#FF4D6D" : f.avgRisk >= 40 ? "#FFB020" : "#2EE6A6" }}>
                {f.avgRisk}
              </span>
            </div>
            <div className="mt-1.5 flex gap-0.5">
              {Array.from({ length: 20 }).map((_, i) => {
                const filled = i < Math.round((f.flagged / Math.max(1, f.total)) * 20);
                return (
                  <span
                    key={i}
                    className={cn("h-2 flex-1 rounded-[1px]", filled ? "bg-rose/80" : "bg-mint/25")}
                  />
                );
              })}
            </div>
            <p className="mono mt-1 text-[9px] text-ink-faint">
              {f.flagged} flagged / {f.total} meters
            </p>
          </button>
        );
      })}
    </div>
  );
}