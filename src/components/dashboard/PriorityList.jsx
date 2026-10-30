import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CauseChip } from "@/components/common/Chip";

export default function PriorityList({ rows }) {
  return (
    <>
      <div className="hidden items-center gap-3 border-b border-border/60 px-4 py-2 sm:flex">
        <span className="mono w-6 text-[9px] uppercase tracking-[0.16em] text-ink-faint">#</span>
        <span className="mono flex-1 text-[9px] uppercase tracking-[0.16em] text-ink-faint">Consumer</span>
        <span className="mono w-[120px] text-[9px] uppercase tracking-[0.16em] text-ink-faint">Cause</span>
        <span className="mono w-[86px] text-[9px] uppercase tracking-[0.16em] text-ink-faint">Score</span>
        <span className="w-[92px]" />
      </div>
      <div className="divide-y divide-border/50">
        {rows.map((c, i) => (
          <div key={c.consumer_id} className="flex items-center gap-2 px-3 py-2.5 transition-colors hover:bg-foreground/[0.03] sm:gap-3 sm:px-4">
            <span className="mono w-5 shrink-0 text-[10px] text-ink-faint sm:w-6">{String(i + 1).padStart(2, "0")}</span>
            <div className="min-w-0 flex-1">
              <p className="mono whitespace-nowrap text-[12px] text-ink">{c.consumer_id}</p>
              <p className="truncate text-[10px] text-ink-faint">
                {c.area} · {c.transformer_id}
              </p>
            </div>
            <div className="hidden w-[120px] sm:block">
              <CauseChip cause={c.cause} />
            </div>
            <div className="hidden w-[86px] items-center gap-1.5 md:flex">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-foreground/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand to-rose"
                  style={{ width: `${c.risk_score}%` }}
                />
              </div>
              <span className="mono w-6 text-right text-[10px] text-ink">{c.risk_score}</span>
            </div>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="h-7 shrink-0 gap-1 rounded-full border border-border/70 px-2 text-[10px] text-ink-soft hover:border-brand/40 hover:text-ink"
            >
              <Link to="/dashboard/consumers/$consumerId" params={{ consumerId: c.consumer_id }}>
                Investigate <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}