import { useState } from "react";
import { Send } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CauseChip, SeverityChip } from "@/components/common/Chip";
import { timeAgo } from "@/lib/gridData";

export default function CaseDrawer({ open, onOpenChange, caseItem, onAddNote, busy }) {
  const [note, setNote] = useState("");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full border-l border-border/70 bg-surface p-0 sm:max-w-[440px]">
        {caseItem && (
          <>
            <SheetHeader className="border-b border-border/60 px-4 py-3">
              <SheetTitle className="mono text-[13px] text-ink">{caseItem.consumer_id}</SheetTitle>
              <SheetDescription className="text-[11px] text-ink-faint">
                {caseItem.title} · {caseItem.feeder}
              </SheetDescription>
            </SheetHeader>

            <div className="scroll-thin h-[calc(100vh-132px)] space-y-4 overflow-y-auto px-4 py-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <CauseChip cause={caseItem.cause} />
                <SeverityChip severity={caseItem.priority} />
                <span className="mono rounded-full border border-border/70 bg-foreground/[0.03] px-2 py-0.5 text-[10px] text-ink-soft">
                  {caseItem.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Risk score", `${caseItem.risk_score}/100`],
                  ["Assignee", caseItem.assignee],
                  ["Due", caseItem.due_date],
                  ["Consumer", caseItem.consumer_name],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-border/60 bg-foreground/[0.02] px-2.5 py-2">
                    <p className="mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">{k}</p>
                    <p className="mono mt-0.5 truncate text-[11px] text-ink">{v}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">Notes</p>
                <div className="mt-1.5 space-y-1.5">
                  {(caseItem.notes ?? []).map((n, i) => (
                    <div key={i} className="rounded-lg border border-border/60 bg-foreground/[0.03] px-2.5 py-2">
                      <p className="text-[11px] leading-snug text-ink-soft">{n.text}</p>
                      <p className="mono mt-1 text-[8px] uppercase tracking-[0.1em] text-ink-faint">
                        {n.author} · {n.at ? timeAgo(n.at) : "—"}
                      </p>
                    </div>
                  ))}
                  {(caseItem.notes ?? []).length === 0 && <p className="text-[11px] text-ink-faint">No notes yet.</p>}
                </div>
                <div className="mt-2 flex items-end gap-1.5">
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a field note…"
                    className="min-h-[58px] resize-none border-border/80 bg-foreground/[0.03] text-[11px]"
                  />
                  <Button
                    size="icon"
                    disabled={!note.trim() || busy}
                    onClick={() => {
                      onAddNote(caseItem, note.trim());
                      setNote("");
                    }}
                    className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-brand to-brand-2 text-white"
                    aria-label="Add note"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">Activity log</p>
                <ol className="mt-1.5 space-y-2 border-l border-border/70 pl-3">
                  {(caseItem.activity ?? []).map((a, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[15px] top-1.5 h-1.5 w-1.5 rounded-full bg-brand/70" />
                      <p className="text-[11px] leading-snug text-ink-soft">{a.text}</p>
                      <p className="mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">
                        {a.author} · {a.at ? timeAgo(a.at) : "—"}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}