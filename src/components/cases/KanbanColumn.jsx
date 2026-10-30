import { Draggable, Droppable } from "@hello-pangea/dnd";
import { CalendarDays } from "lucide-react";
import { CauseChip } from "@/components/common/Chip";
import { severityMeta } from "@/lib/gridData";

const COLUMN_TONE = {
  New: "border-sky/25",
  "Under Review": "border-amber/25",
  "Inspection Scheduled": "border-violet/25",
  "Confirmed Theft": "border-rose/40",
  Resolved: "border-mint/25",
  "False Positive": "border-border",
};

export default function KanbanColumn({ status, items, onOpen }) {
  return (
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex min-h-[180px] flex-col rounded-2xl border bg-foreground/[0.02] p-2 transition-all ${snapshot.isDraggingOver ? "border-brand/50 bg-brand/8 shadow-glow-brand" : COLUMN_TONE[status]
            }`}
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="mono truncate text-[9px] uppercase tracking-[0.1em] text-ink-soft">{status}</p>
            <span className="mono rounded-full bg-foreground/[0.06] px-1.5 py-0.5 text-[9px] text-ink-faint">{items.length}</span>
          </div>

          <div className="space-y-2">
            {items.map((c, index) => {
              const sev = severityMeta(c.priority);
              return (
                <Draggable key={c.id} draggableId={String(c.id)} index={index}>
                  {(p, s) => (
                    <div
                      ref={p.innerRef}
                      {...p.draggableProps}
                      {...p.dragHandleProps}
                      onClick={() => onOpen(c)}
                      className={`cursor-grab rounded-xl border border-border/70 bg-surface/90 p-2.5 transition-shadow active:cursor-grabbing ${s.isDragging ? "shadow-glow-brand ring-1 ring-brand/40" : "hover:border-border"
                        }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
                        <span className="mono truncate text-[10px] text-ink">{c.consumer_id}</span>
                        <span className="mono ml-auto shrink-0 text-[10px]" style={{ color: sev.hex }}>
                          {c.risk_score}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[10px] text-ink-faint">{c.consumer_name}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        <CauseChip cause={c.cause} short className="scale-90" />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between gap-1 border-t border-border/50 pt-1.5">
                        <span className="flex items-center gap-1">
                          <span className="grid h-4 w-4 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-[7px] font-semibold text-white">
                            {(c.assignee ?? "—").slice(0, 2).toUpperCase()}
                          </span>
                          <span className="mono truncate text-[8px] text-ink-faint">{c.assignee}</span>
                        </span>
                        <span className="mono flex shrink-0 items-center gap-0.5 text-[8px] text-ink-faint">
                          <CalendarDays className="h-2.5 w-2.5" />
                          {c.due_date?.slice(5) ?? "—"}
                        </span>
                      </div>
                    </div>
                  )}
                </Draggable>
              );
            })}
          </div>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}