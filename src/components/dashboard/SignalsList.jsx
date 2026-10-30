import { causeMeta } from "@/lib/gridData";

export default function SignalsList({ alerts }) {
  return (
    <div className="space-y-1.5">
      {alerts.slice(0, 6).map((a, i) => {
        const meta = causeMeta(a.cause);
        return (
          <div key={a.id ?? `${a.title}-${i}`} className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-foreground/[0.04]">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} />
            <span className="mono shrink-0 text-[10px] text-ink">{a.consumer_id}</span>
            <span className="min-w-0 flex-1 truncate text-[10px] text-ink-faint">{meta.short}</span>
            <span className="mono shrink-0 text-[9px] text-ink-faint">{a.raised_at ? new Date(a.raised_at).toISOString().slice(11, 16) : "live"}</span>
          </div>
        );
      })}
    </div>
  );
}