import { Fragment, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, ShieldAlert } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { CauseChip } from "@/components/common/Chip";
import Sparkline from "@/components/common/Sparkline";
import { causeMeta, MONTHS, num } from "@/lib/gridData";

export default function ConsumersTable({ rows, allChecked, selected, onToggle, onToggleAll, expanded, onExpand, activeIndex, flashId }) {
  const scroller = useRef(null);

  useEffect(() => {
    if (activeIndex < 0 || !scroller.current) return;
    const el = scroller.current.querySelector(`[data-row="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <div ref={scroller} className="max-h-[590px] overflow-y-auto overflow-x-hidden scroll-thin">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-surface/95 backdrop-blur">
          <TableRow className="border-border/60 hover:bg-transparent">
            <TableHead className="h-9 w-9 pl-3">
              <Checkbox checked={allChecked} onCheckedChange={(v) => onToggleAll(!!v)} aria-label="Select all rows" />
            </TableHead>
            <TableHead className="mono h-9 text-[9px] uppercase tracking-[0.14em] text-ink-faint">Consumer</TableHead>
            <TableHead className="mono hidden h-9 text-[9px] uppercase tracking-[0.14em] text-ink-faint md:table-cell">Cause</TableHead>
            <TableHead className="mono hidden h-9 text-[9px] uppercase tracking-[0.14em] text-ink-faint sm:table-cell">Feeder</TableHead>
            <TableHead className="mono h-9 text-[9px] uppercase tracking-[0.14em] text-ink-faint">Risk</TableHead>
            <TableHead className="h-9 w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((c, i) => {
            const meta = causeMeta(c.cause);
            const isOpen = expanded === c.consumer_id;
            const isActive = activeIndex === i;
            return (
              <Fragment key={c.consumer_id}>
                <TableRow
                  data-row={i}
                  className={`group h-14 cursor-pointer border-border/40 transition-colors duration-700 ${flashId === c.consumer_id ? "bg-mint/8" : isActive ? "bg-brand/8" : "hover:bg-foreground/[0.03]"
                    }`}
                  onClick={() => onExpand(isOpen ? null : c.consumer_id)}
                >
                  <TableCell className="relative pl-3" onClick={(e) => e.stopPropagation()}>
                    <span className="absolute left-0 top-0 h-full w-[3px]" style={{ background: meta.hex }} />
                    <Checkbox
                      checked={selected.includes(c.consumer_id)}
                      onCheckedChange={() => onToggle(c.consumer_id)}
                      aria-label={`Select ${c.consumer_id}`}
                    />
                  </TableCell>
                  <TableCell className="py-2">
                    <HoverCard openDelay={220} closeDelay={60}>
                      <HoverCardTrigger asChild>
                        <Link
                          to="/dashboard/consumers/$consumerId"
                          params={{ consumerId: c.consumer_id }}
                          onClick={(e) => e.stopPropagation()}
                          className="mono block whitespace-nowrap text-[12px] text-ink hover:text-brand"
                        >
                          {c.consumer_id}
                        </Link>
                      </HoverCardTrigger>
                      <HoverCardContent align="start" className="w-[280px] border-border/80 bg-popover">
                        <p className="mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">12-month consumption</p>
                        <Sparkline values={c.monthly} color={meta.hex} height={44} className="mt-2" />
                        <div className="mt-2 flex items-center justify-between">
                          <span className="mono text-[10px] text-ink-faint">{num(c.actual_kwh)} kWh last month</span>
                          <span className="mono text-[10px]" style={{ color: meta.hex }}>{c.risk_score}/100</span>
                        </div>
                        <ul className="mt-2 space-y-1 border-t border-border/60 pt-2">
                          {c.reasons.slice(0, 3).map((r) => (
                            <li key={r} className="flex gap-1.5 text-[10px] leading-snug text-ink-soft">
                              <span className="mt-1 h-1 w-1 shrink-0 rounded-full" style={{ background: meta.hex }} />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </HoverCardContent>
                    </HoverCard>
                    <p className="truncate text-[11px] text-ink-faint">
                      {c.name} · {c.category}
                    </p>
                  </TableCell>
                  <TableCell className="hidden py-2 md:table-cell">
                    <CauseChip cause={c.cause} />
                  </TableCell>
                  <TableCell className="mono hidden py-2 text-[11px] text-ink-soft sm:table-cell">{c.feeder}</TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-10 overflow-hidden rounded-full bg-foreground/[0.08] sm:w-16">
                        <div className="h-full rounded-full" style={{ width: `${c.risk_score}%`, background: `linear-gradient(90deg, ${meta.hex}77, ${meta.hex})` }} />
                      </div>
                      <span className="mono text-[11px] text-ink">{c.risk_score}</span>
                    </div>
                  </TableCell>
                  <TableCell className="pr-2">
                    <span className="grid h-6 w-6 place-items-center rounded-md text-ink-faint group-hover:text-ink">
                      {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </span>
                  </TableCell>
                </TableRow>

                {isOpen && (
                  <TableRow className="border-border/40 bg-foreground/[0.02] hover:bg-foreground/[0.02]">
                    <TableCell colSpan={6} className="p-0">
                      <div className="grid gap-4 px-4 py-4 md:grid-cols-[1.2fr_1fr_auto]">
                        <div>
                          <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">Why it was flagged</p>
                          <ul className="mt-2 space-y-1">
                            {c.reasons.map((r) => (
                              <li key={r} className="flex gap-2 text-[11px] leading-snug text-ink-soft">
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: meta.hex }} />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">Monthly kWh</p>
                          <Sparkline values={c.monthly} color={meta.hex} height={40} className="mt-2" />
                          <div className="mono mt-1 flex justify-between text-[9px] text-ink-faint">
                            <span>{MONTHS[0]}</span>
                            <span>{MONTHS[MONTHS.length - 1]}</span>
                          </div>
                          <p className="mono mt-2 text-[10px] text-ink-faint">
                            baseline {num(c.baseline_kwh)} · peer {num(c.peer_avg_kwh)} · conf {c.confidence}%
                          </p>
                        </div>
                        <div className="flex flex-row gap-2 md:flex-col md:justify-center">
                          <Button asChild size="sm" className="h-8 rounded-full bg-gradient-to-r from-brand to-brand-2 text-[11px] text-white">
                            <Link to="/dashboard/consumers/$consumerId" params={{ consumerId: c.consumer_id }}>
                              <ShieldAlert className="h-3.5 w-3.5" /> Investigation
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="outline" className="h-8 rounded-full border-border/80 text-[11px]">
                            <Link to="/dashboard/grid">Locate on grid</Link>
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
      {rows.length === 0 && (
        <div className="grid place-items-center px-4 py-16 text-center">
          <p className="text-[13px] font-medium text-ink">No meters match these filters</p>
          <p className="mt-1 text-[11px] text-ink-faint">Clear a filter or widen the risk threshold.</p>
        </div>
      )}
    </div>
  );
}