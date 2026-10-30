import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { causeMeta } from "@/lib/gridData";

const W = 800;
const H = 620;
const CX = 400;
const CY = 250;

const project = (x, z) => ({ sx: CX + (x - z) * 3.05, sy: CY + (x + z) * 1.5 });
const cube = (sx, sy, s = 9, fill = "#1B2142") => `M${sx} ${sy - s} L${sx + s} ${sy} L${sx} ${sy + s} L${sx - s} ${sy} Z M${sx - s} ${sy} L${sx - s} ${sy + s * 1.1} L${sx} ${sy + s * 2.1} L${sx} ${sy + s} Z M${sx + s} ${sy} L${sx + s} ${sy + s * 1.1} L${sx} ${sy + s * 2.1} L${sx} ${sy + s} Z`;

const heatColor = (risk) => (risk >= 80 ? "#FF4D6D" : risk >= 60 ? "#FFB020" : risk >= 40 ? "#FFD84D" : "#2EE6A6");

export default function GridScene({ consumers, transformers, month, onSelect, selectedId, heatmap, showOnlySuspicious, spin, onSpin, children }) {
  const [hover, setHover] = useState(null);
  const [camera, setCamera] = useState({ scale: 1, x: 0, y: 0 });
  const drag = useRef({ active: false, startX: 0, base: 0 });

  const monthRisk = (c) => {
    const ratio = (c.monthly?.[month] ?? 0) / Math.max(1, c.baseline_kwh);
    return Math.round(Math.max(0, Math.min(100, (1 - ratio) * 240)));
  };
  const effRisk = (c) => Math.round(c.risk_score * 0.4 + monthRisk(c) * 0.6);

  const substation = project(6, 94);

  const focus = (c) => {
    const { sx, sy } = project(c.x, c.z);
    setCamera({ scale: 1.45, x: (CX - sx) * 1.45, y: (CY - sy + 40) * 1.45 });
    onSelect(c);
  };

  return (
    <div
      className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-border/70 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(124,92,255,0.16),transparent_62%)] sm:h-[620px]"
      style={{ perspective: 1200 }}
    >
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          drag.current = { active: true, startX: e.clientX, base: spin };
        }}
        onPointerMove={(e) => {
          if (!drag.current.active) return;
          onSpin(Math.max(-34, Math.min(34, drag.current.base + (e.clientX - drag.current.startX) * 0.18)));
        }}
        onPointerUp={() => {
          drag.current.active = false;
        }}
        onPointerLeave={() => {
          drag.current.active = false;
        }}
      >
        <motion.div
          animate={{ x: camera.x, y: camera.y, scale: camera.scale, rotate: spin }}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
          className="absolute inset-0 origin-center"
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label="3D distribution grid">
            <defs>
              <radialGradient id="halo-rose" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF4D6D" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#FF4D6D" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="feeder-line" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7C5CFF" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.35" />
              </linearGradient>
              <linearGradient id="floor-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#05060F" stopOpacity="0" />
                <stop offset="100%" stopColor="#05060F" stopOpacity="0.9" />
              </linearGradient>
              <filter id="soft-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ground grid */}
            <g stroke="rgba(124,92,255,0.14)" strokeWidth="0.6">
              {Array.from({ length: 11 }).map((_, i) => {
                const v = i * 10;
                const a = project(v, 0);
                const b = project(v, 100);
                const c1 = project(0, v);
                const d1 = project(100, v);
                return (
                  <g key={i}>
                    <line x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy} />
                    <line x1={c1.sx} y1={c1.sy} x2={d1.sx} y2={d1.sy} />
                  </g>
                );
              })}
            </g>

            {/* feeders */}
            {Array.from(new Set(consumers.map((c) => c.feeder))).map((feeder) => {
              const nodes = transformers.filter((t) => t.feeder === feeder);
              return (
                <g key={feeder}>
                  {nodes.map((t) => {
                    if (!Number.isFinite(t.x) || !Number.isFinite(t.z)) return null;
                    const p = project(t.x, t.z);
                    const d = `M${substation.sx} ${substation.sy} L${p.sx} ${p.sy}`;
                    return (
                      <g key={t.transformer_id}>
                        <path d={d} fill="none" stroke="url(#feeder-line)" strokeWidth="2.4" strokeLinecap="round" />
                        <path d={d} fill="none" stroke="#A78BFA" strokeWidth="1" strokeDasharray="4 12" className="animate-dash" opacity="0.8" />
                        <circle r="2.4" fill="#FFD84D" filter="url(#soft-glow)">
                          <animateMotion dur={`${5 + (t.x % 4)}s`} repeatCount="indefinite" path={d} />
                        </circle>
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* substation */}
            <g>
              <ellipse cx={substation.sx} cy={substation.sy + 6} rx="34" ry="14" fill="rgba(255,216,77,0.10)" />
              <path d={cube(substation.sx, substation.sy - 6, 20, "#232a55")} fill="#1B2142" stroke="rgba(255,216,77,0.55)" strokeWidth="1" />
              <circle cx={substation.sx} cy={substation.sy - 10} r="3" fill="#FFD84D" filter="url(#soft-glow)" />
              <text x={substation.sx} y={substation.sy + 34} textAnchor="middle" fill="#8A90A8" fontSize="9" fontFamily="var(--font-mono)" letterSpacing="1">
                132/33 kV
              </text>
            </g>

            {/* transformers */}
            {transformers.map((t) => {
              if (!Number.isFinite(t.x) || !Number.isFinite(t.z)) return null;
              const p = project(t.x, t.z);
              const critical = t.loss_pct > 14;
              return (
                <g key={t.transformer_id} onClick={() => onSelect({ transformer: t })} className="cursor-pointer">
                  <path d={cube(p.sx, p.sy, 12)} fill={critical ? "#2A1730" : "#141A33"} stroke={critical ? "rgba(255,77,109,0.7)" : "rgba(167,139,250,0.4)"} strokeWidth="0.9" />
                  <circle cx={p.sx} cy={p.sy} r="2" fill={critical ? "#FF4D6D" : "#A78BFA"} />
                  <text x={p.sx} y={p.sy + 26} textAnchor="middle" fill="#636A8C" fontSize="7.5" fontFamily="var(--font-mono)">
                    {t.transformer_id}
                  </text>
                </g>
              );
            })}

            {/* consumers */}
            {consumers.map((c) => {
              if (!Number.isFinite(c.x) || !Number.isFinite(c.z)) return null;
              const p = project(c.x, c.z);
              const risk = effRisk(c);
              const meta = causeMeta(c.cause);
              const color = heatmap ? heatColor(risk) : meta.hex;
              const flagged = risk >= 70 && c.cause !== "Normal";
              const isSelected = selectedId === c.consumer_id;
              if (showOnlySuspicious && !["Theft/Tampering", "Requires Review"].includes(c.cause)) return null;
              return (
                <g
                  key={c.consumer_id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHover({ c, risk, ...p })}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => focus(c)}
                >
                  {flagged && <circle cx={p.sx} cy={p.sy} r="14" fill="url(#halo-rose)" />}
                  <path
                    d={`M${p.sx} ${p.sy - 5.5} L${p.sx + 5} ${p.sy} L${p.sx} ${p.sy + 5.5} L${p.sx - 5} ${p.sy} Z`}
                    fill={color}
                    fillOpacity={risk >= 45 ? 0.95 : 0.55}
                    stroke={isSelected ? "#fff" : color}
                    strokeOpacity={isSelected ? 1 : 0.4}
                    strokeWidth={isSelected ? 1.4 : 0.6}
                  />
                  {isSelected && <circle cx={p.sx} cy={p.sy} r="10" fill="none" stroke="#fff" strokeOpacity="0.5" strokeDasharray="2 3" />}
                </g>
              );
            })}

            <rect x="0" y="440" width={W} height="180" fill="url(#floor-fade)" pointerEvents="none" />
          </svg>
        </motion.div>
      </div>

      {hover && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg border border-border/80 bg-popover/95 px-2.5 py-1.5 shadow-panel backdrop-blur"
          style={{ left: `${(hover.sx / W) * 100}%`, top: `${(hover.sy / H) * 100}%` }}
        >
          <p className="mono text-[10px] text-ink">{hover.c.consumer_id}</p>
          <p className="mono mt-0.5 text-[9px] text-ink-faint">
            {causeMeta(hover.c.cause).short} · risk {hover.risk}
          </p>
        </div>
      )}

      <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-border/60 bg-surface/80 px-2 py-1 backdrop-blur">
        <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">drag to orbit</p>
      </div>

      {children}
    </div>
  );
}
