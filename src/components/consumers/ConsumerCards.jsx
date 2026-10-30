import { Link } from "@tanstack/react-router";
import TiltCard from "@/components/common/TiltCard";
import Sparkline from "@/components/common/Sparkline";
import { CauseChip } from "@/components/common/Chip";
import { causeMeta, num } from "@/lib/gridData";

export default function ConsumerCards({ rows }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((c) => {
        const meta = causeMeta(c.cause);
        return (
          <TiltCard key={c.consumer_id} glow={c.risk_score >= 80 ? "rose" : c.risk_score >= 55 ? "amber" : "mint"} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  to="/dashboard/consumers/$consumerId"
                  params={{ consumerId: c.consumer_id }}
                  className="mono block whitespace-nowrap text-[13px] text-ink hover:text-brand"
                >
                  {c.consumer_id}
                </Link>
                <p className="truncate text-[11px] text-ink-faint">
                  {c.name} · {c.category}
                </p>
              </div>
              <span className="mono shrink-0 text-[20px] font-semibold leading-none" style={{ color: meta.hex }}>
                {c.risk_score}
              </span>
            </div>
            <div className="my-3">
              <Sparkline values={c.monthly} color={meta.hex} height={38} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <CauseChip cause={c.cause} />
              <span className="mono text-[10px] text-ink-faint">{c.feeder}</span>
            </div>
            <p className="mono mt-2 border-t border-border/60 pt-2 text-[10px] text-ink-faint">
              {num(c.actual_kwh)} kWh · peer {num(c.peer_avg_kwh)}
            </p>
          </TiltCard>
        );
      })}
      {rows.length === 0 && (
        <p className="col-span-full rounded-2xl border border-border/70 bg-surface/60 py-16 text-center text-[13px] text-ink-faint">
          No meters match these filters.
        </p>
      )}
    </div>
  );
}