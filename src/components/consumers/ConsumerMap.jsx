import { useNavigate } from "@tanstack/react-router";
import { causeMeta } from "@/lib/gridData";

const FEEDER_X = { "North Loop": 22, "Central Industrial": 62, "East Residential": 44 };

export default function ConsumerMap({ rows, transformers }) {
  const navigate = useNavigate();
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-surface/60">
      <svg viewBox="0 0 100 100" className="h-[420px] w-full sm:h-[520px]" role="img" aria-label="Consumer risk map">
        <defs>
          <radialGradient id="map-glow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#7C5CFF" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#7C5CFF" stopOpacity="0" />
          </radialGradient>
          <pattern id="map-grid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M8 0H0V8" fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="0.2" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#map-glow)" />
        <rect width="100" height="100" fill="url(#map-grid)" />

        {Object.entries(FEEDER_X).map(([name, x]) => (
          <g key={name}>
            <line x1={x} y1={4} x2={x} y2={96} stroke="rgba(124,92,255,0.28)" strokeWidth="0.35" strokeDasharray="1.5 2" />
            <text x={x + 1.4} y={6.5} fill="#8A90A8" fontSize="2.4" fontFamily="var(--font-mono)" letterSpacing="0.3">
              {name.toUpperCase()}
            </text>
          </g>
        ))}

        {transformers.map((t) => (
          <g key={t.transformer_id}>
            <rect x={t.x - 2.2} y={t.z - 2.2} width="4.4" height="4.4" rx="0.9" fill="rgba(17,21,43,0.9)" stroke="rgba(255,216,77,0.5)" strokeWidth="0.3" />
            <circle cx={t.x} cy={t.z} r="1" fill="#FFD84D" />
            <text x={t.x + 3} y={t.z + 0.8} fill="#A3A9C7" fontSize="2" fontFamily="var(--font-mono)">
              {t.transformer_id}
            </text>
          </g>
        ))}

        {rows.map((c) => {
          const meta = causeMeta(c.cause);
          return (
            <circle
              key={c.consumer_id}
              cx={c.x}
              cy={c.z}
              r={c.risk_score >= 80 ? 1.15 : 0.8}
              fill={meta.hex}
              fillOpacity={c.risk_score >= 55 ? 0.95 : 0.4}
              stroke={meta.hex}
              strokeOpacity="0.4"
              strokeWidth="0.25"
              className="cursor-pointer"
              onClick={() => navigate({ to: "/dashboard/consumers/$consumerId", params: { consumerId: c.consumer_id } })}
            >
              <title>{`${c.consumer_id} · ${c.cause} · ${c.risk_score}`}</title>
            </circle>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-2 rounded-xl border border-border/70 bg-surface/85 px-2.5 py-1.5 backdrop-blur">
        {["Normal", "Theft/Tampering", "Meter Fault", "Communication Failure", "Requires Review"].map((c) => (
          <span key={c} className="flex items-center gap-1 text-[9px] text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: causeMeta(c).hex }} />
            {causeMeta(c).short}
          </span>
        ))}
      </div>
    </div>
  );
}