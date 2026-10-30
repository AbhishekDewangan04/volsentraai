import { useId } from "react";

export default function Sparkline({ values = [], color = "#7C5CFF", height = 34, className = "", area = true }) {
  const gid = useId().replace(/[:]/g, "");
  const data = values.length > 1 ? values : [0, 0];
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const points = data.map((v, i) => [
    (i / (data.length - 1)) * 100,
    height - 3 - ((v - min) / span) * (height - 6),
  ]);
  const line = points.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className={className} style={{ height, width: "100%" }} aria-hidden="true">
      <defs>
        <linearGradient id={`sp-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && <path d={`${line} L100,${height} L0,${height} Z`} fill={`url(#sp-${gid})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}