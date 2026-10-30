import { cn } from "@/lib/utils";

const TONE = {
  critical: "#FF4D6D",
  high: "#FFB020",
  medium: "#38BDF8",
  low: "#2EE6A6",
};

/** Schematic route map — SVG so it stays sharp and needs no tile server. */
export default function InspectionMap({ stops = [], depot, selectedId, onSelect, className = "" }) {
  const path = [depot, ...stops.map((s) => s.pos)];
  const d = path.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border/70 bg-surface/60", className)}>
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none" role="img" aria-label="Inspection route map">
        <defs>
          <pattern id="field-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M10 0H0V10" fill="none" stroke="currentColor" className="text-foreground/[0.06]" strokeWidth="0.3" />
          </pattern>
          <linearGradient id="field-route" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C5CFF" />
            <stop offset="100%" stopColor="#FF4DA6" />
          </linearGradient>
        </defs>

        <rect width="100" height="100" fill="url(#field-grid)" />
        <path d={d} fill="none" stroke="url(#field-route)" strokeWidth="0.8" strokeDasharray="2 1.6" strokeLinecap="round" opacity="0.9" />

        <g>
          <circle cx={depot.x} cy={depot.y} r="2.6" className="fill-brand/25" />
          <circle cx={depot.x} cy={depot.y} r="1.2" className="fill-brand" />
        </g>

        {stops.map((s) => (
          <g
            key={s.consumer.consumer_id}
            onClick={() => onSelect?.(s)}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.(s)}
          >
            <circle
              cx={s.pos.x}
              cy={s.pos.y}
              r={selectedId === s.consumer.consumer_id ? 4.2 : 3.2}
              fill={TONE[s.priority] ?? TONE.low}
              fillOpacity={selectedId === s.consumer.consumer_id ? 0.95 : 0.7}
              stroke="#080A14"
              strokeWidth="0.6"
            />
            <text
              x={s.pos.x}
              y={s.pos.y + 1.1}
              textAnchor="middle"
              className="fill-black font-mono"
              style={{ fontSize: 3.2, fontWeight: 700 }}
            >
              {s.visit}
            </text>
          </g>
        ))}
      </svg>

      <div className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-2 py-1 backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
        <span className="mono text-[8px] uppercase tracking-[0.12em] text-ink-faint">depot → stops</span>
      </div>
    </div>
  );
}