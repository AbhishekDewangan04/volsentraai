import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { causeMeta, timeAgo } from "@/lib/gridData";
import { useGrid } from "@/lib/GridContext";

const POOL = [
  { cause: "Meter Fault", detail: "Pulse count flat for 9 consecutive days", severity: "high" },
  { cause: "Communication Failure", detail: "Heartbeat lost — reading gap opened", severity: "medium" },
  { cause: "Theft/Tampering", detail: "Consumption fell 71% while comms stayed healthy", severity: "critical" },
  { cause: "Legit Abnormal", detail: "Seasonal uplift matched the temperature curve", severity: "low" },
];

export default function AlertFeed({ alerts, consumers }) {
  const { liveAlerts } = useGrid();
  const [extra, setExtra] = useState([]);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      const pool = POOL[i % POOL.length];
      const consumer = consumers[(i * 7 + 3) % Math.max(1, consumers.length)];
      i += 1;
      if (!consumer) return;
      setExtra((prev) =>
        [
          {
            id: `feed-${Date.now()}`,
            consumer_id: consumer.consumer_id,
            title: `${pool.cause} · ${consumer.consumer_id}`,
            detail: pool.detail,
            cause: pool.cause,
            severity: pool.severity,
            at: new Date().toISOString(),
          },
          ...prev,
        ].slice(0, 6),
      );
    }, 9000);
    return () => clearInterval(id);
  }, [consumers]);

  const items = useMemo(() => [...liveAlerts, ...extra, ...alerts].slice(0, 7), [liveAlerts, extra, alerts]);

  return (
    <div className="scroll-thin max-h-[420px] overflow-y-auto">
      <AnimatePresence initial={false}>
        {items.map((a) => {
          const meta = causeMeta(a.cause);
          return (
            <motion.div
              key={a.id ?? `${a.title}-${a.at ?? a.raised_at}`}
              layout
              initial={{ opacity: 0, x: -14, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 14 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="border-b border-border/50 px-4 py-2.5 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} />
                <p className="mono min-w-0 flex-1 truncate text-[11px] text-ink">{a.title}</p>
                <span className="mono shrink-0 text-[9px] text-ink-faint">{timeAgo(a.at ?? a.raised_at)}</span>
              </div>
              <p className="mt-0.5 truncate pl-3.5 text-[11px] text-ink-faint">{a.detail}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {items.length === 0 && <p className="px-4 py-8 text-center text-[12px] text-ink-faint">No alerts yet.</p>}
      <Link
        to="/dashboard/consumers"
        className="mono sticky bottom-0 flex items-center justify-center gap-1 border-t border-border/70 bg-surface/95 py-2 text-[10px] uppercase tracking-[0.14em] text-brand backdrop-blur"
      >
        Open risk queue <ArrowUpRight className="h-3 w-3" />
      </Link>
    </div>
  );
}