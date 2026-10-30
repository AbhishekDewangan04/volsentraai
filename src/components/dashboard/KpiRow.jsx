import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import TiltCard from "@/components/common/TiltCard";
import RollingNumber from "@/components/common/RollingNumber";
import Sparkline from "@/components/common/Sparkline";
import { compact } from "@/lib/gridData";

const TONE_HEX = {
  brand: "#7C5CFF",
  rose: "#FF4D6D",
  amber: "#FFB020",
  sky: "#38BDF8",
  violet: "#A78BFA",
  mint: "#2EE6A6",
};

export default function KpiRow({ items }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((k, i) => (
        <TiltCard
          key={k.label}
          glow={k.glow ?? "brand"}
          className="p-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, type: "spring", stiffness: 260, damping: 24 }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">{k.label}</p>
              <p className="mono mt-1.5 text-[22px] font-semibold leading-none text-ink">
                <RollingNumber value={k.value} prefix={k.prefix} suffix={k.suffix} format={k.format} />
              </p>
              {k.note && <p className="mt-1 truncate text-[11px] text-ink-faint">{k.note}</p>}
            </div>
            {k.delta != null && (
              <span
                className={`mono flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] ${k.delta >= 0 ? "bg-rose/12 text-rose" : "bg-mint/12 text-mint"
                  }`}
              >
                {k.delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {compact(Math.abs(k.delta))}
              </span>
            )}
          </div>
          <div className="mt-3 h-[34px]">
            <Sparkline values={k.spark} color={TONE_HEX[k.tone] ?? TONE_HEX.brand} height={34} />
          </div>
        </TiltCard>
      ))}
    </div>
  );
}