import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CauseChip } from "@/components/common/Chip";
import Sparkline from "@/components/common/Sparkline";
import RollingNumber from "@/components/common/RollingNumber";
import { causeMeta, num } from "@/lib/gridData";

export default function DetailDrawer({ open, onOpenChange, consumer, transformer }) {
  const item = consumer ?? null;
  const meta = item ? causeMeta(item.cause) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full border-l border-border/70 bg-surface p-0 sm:max-w-[380px]">
        <SheetHeader className="border-b border-border/60 px-4 py-3">
          <SheetTitle className="mono text-[13px] text-ink">{item ? item.consumer_id : transformer?.transformer_id}</SheetTitle>
          <SheetDescription className="text-[11px] text-ink-faint">
            {item ? `${item.name} · ${item.category} · ${item.area}` : transformer ? `${transformer.name} · ${transformer.feeder}` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto px-4 py-4">
          {item && (
            <>
              <div className="flex items-center gap-3">
                <div className="relative grid h-[76px] w-[76px] place-items-center">
                  <svg viewBox="0 0 76 76" className="absolute inset-0 -rotate-90">
                    <circle cx="38" cy="38" r="31" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                    <motion.circle
                      cx="38"
                      cy="38"
                      r="31"
                      fill="none"
                      stroke={meta.hex}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 31}
                      initial={{ strokeDashoffset: 2 * Math.PI * 31 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 31 - (item.risk_score / 100) * 2 * Math.PI * 31 }}
                      transition={{ type: "spring", stiffness: 80, damping: 20 }}
                    />
                  </svg>
                  <p className="mono text-[18px] font-semibold text-ink">
                    <RollingNumber value={item.risk_score} />
                  </p>
                </div>
                <div className="space-y-1.5">
                  <CauseChip cause={item.cause} />
                  <p className="mono text-[10px] text-ink-faint">confidence {item.confidence}%</p>
                  <p className="mono text-[10px] text-ink-faint">{item.feeder}</p>
                </div>
              </div>

              <div>
                <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">12-month consumption</p>
                <Sparkline values={item.monthly} color={meta.hex} height={56} className="mt-1" />
                <div className="mono mt-1 flex justify-between text-[9px] text-ink-faint">
                  <span>baseline {num(item.baseline_kwh)}</span>
                  <span>last {num(item.actual_kwh)}</span>
                </div>
              </div>

              <div>
                <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">Top reasons</p>
                <ul className="mt-1.5 space-y-1.5">
                  {item.reasons.slice(0, 3).map((r) => (
                    <li key={r} className="flex gap-2 text-[11px] leading-snug text-ink-soft">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: meta.hex }} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <Button asChild className="h-9 w-full gap-1.5 rounded-full bg-gradient-to-r from-brand to-brand-2 text-[12px] text-white">
                <Link to="/dashboard/consumers/$consumerId" params={{ consumerId: item.consumer_id }}>
                  Open investigation <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </>
          )}

          {!item && transformer && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Loss", `${transformer.loss_pct}%`],
                  ["Risk", `${transformer.risk}/100`],
                  ["Input kWh", num(transformer.input_kwh)],
                  ["Billed kWh", num(transformer.billed_kwh)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-border/60 bg-foreground/[0.02] px-2.5 py-2">
                    <p className="mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">{k}</p>
                    <p className="mono mt-0.5 text-[13px] text-ink">{v}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] leading-relaxed text-ink-soft">
                {transformer.transformer_id} is losing {transformer.loss_pct}% between the DT meter and billed units.
                Meters on this transformer that carry a theft or review classification are highlighted in the scene.
              </p>
              <Button asChild variant="outline" className="h-9 w-full gap-1.5 rounded-full border-border/80 text-[12px]">
                <Link to="/dashboard/transformers">Open transformer analysis</Link>
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}