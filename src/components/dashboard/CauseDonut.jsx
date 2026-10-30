import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import RollingNumber from "@/components/common/RollingNumber";
import GlassTooltip from "@/components/charts/GlassTooltip";
import { causeMeta } from "@/lib/gridData";

export default function CauseDonut({ rows, active = null, onSelect }) {
  const total = rows.reduce((s, r) => s + r.count, 0);
  const data = rows.filter((r) => r.cause !== "Normal");

  return (
    <div className="relative">
      <div className="h-[190px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="cause"
              innerRadius={62}
              outerRadius={86}
              paddingAngle={3}
              stroke="none"
              startAngle={90}
              endAngle={-270}
              animationDuration={900}
              onClick={(entry) => onSelect?.(entry?.cause ?? null)}
              className="cursor-pointer [&_.recharts-sector]:transition-opacity"
            >
              {data.map((r) => (
                <Cell
                  key={r.cause}
                  fill={causeMeta(r.cause).hex}
                  opacity={active && active !== r.cause ? 0.35 : 1}
                />
              ))}
            </Pie>
            <Tooltip content={<GlassTooltip unit="meters" decimals={0} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="pointer-events-none absolute inset-0 grid place-content-center text-center" style={{ height: 190 }}>
        <p className="mono text-[26px] font-semibold leading-none text-ink">
          <RollingNumber value={total} />
        </p>
        <p className="mono mt-1 text-[9px] uppercase tracking-[0.16em] text-ink-faint">meters scored</p>
      </div>
      <p className="mono mt-1 text-center text-[9px] uppercase tracking-[0.12em] text-ink-faint">
        click a slice to filter the queue
      </p>
    </div>
  );
}