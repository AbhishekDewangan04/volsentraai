import { cn } from "@/lib/utils";

export default function Panel({ title, eyebrow, actions, children, className = "", bodyClassName = "", noBody = false }) {
  return (
    <section className={cn("panel overflow-hidden", className)}>
      {(title || eyebrow || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5">
          <div className="min-w-0">
            {eyebrow && <p className="mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">{eyebrow}</p>}
            {title && <h2 className="truncate text-[13px] font-medium text-ink">{title}</h2>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
        </header>
      )}
      {noBody ? children : <div className={cn("p-4", bodyClassName)}>{children}</div>}
    </section>
  );
}