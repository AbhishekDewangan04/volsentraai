import { useEffect, useRef, useState } from "react";
import { Download, FileSpreadsheet, Maximize2, Minimize2, Table2, ChartNoAxesColumn } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadCSV, downloadPNG } from "@/lib/chartExport";

/**
 * Chart chrome shared by every graph: title, action slot, PNG / CSV / fullscreen
 * toolbar, shimmer skeleton and empty state. Fullscreen re-uses the very same
 * chart instance (no clone), so tooltips, brush and live updates keep working.
 */
export default function ChartCard({
  title,
  eyebrow,
  actions,
  rows = [],
  columns = [],
  exportName = "chart",
  children,
  loading = false,
  empty = false,
  emptyLabel = "No data for this filter",
  className = "",
  bodyClassName = "",
  footer,
}) {
  const [full, setFull] = useState(false);
  const [tableView, setTableView] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (!full) return;
    const onKey = (e) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [full]);

  return (
    <section
      className={cn(
        "panel flex flex-col overflow-hidden",
        full && "fixed inset-0 z-[70] m-0 rounded-none border-0 bg-canvas",
        className,
      )}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5">
        <div className="min-w-0">
          {eyebrow && <p className="mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">{eyebrow}</p>}
          {title && <h2 className="truncate text-[13px] font-medium text-ink">{title}</h2>}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {actions}
          <div className="ml-1 flex items-center gap-0.5 border-l border-border/60 pl-1.5">
            {rows.length > 0 && columns.length > 0 && <button type="button" aria-label={tableView ? "View chart" : "View chart data as table"} title={tableView ? "View chart" : "View table"} onClick={() => setTableView((v) => !v)} className="grid h-6 w-6 place-items-center rounded-md text-ink-faint transition-colors hover:bg-foreground/[0.06] hover:text-ink">{tableView ? <ChartNoAxesColumn className="h-3 w-3" /> : <Table2 className="h-3 w-3" />}</button>}
            <button
              type="button"
              aria-label="Download chart as PNG"
              title="Download PNG"
              onClick={() => downloadPNG(bodyRef.current, exportName)}
              className="grid h-6 w-6 place-items-center rounded-md text-ink-faint transition-colors hover:bg-foreground/[0.06] hover:text-ink"
            >
              <Download className="h-3 w-3" />
            </button>
            <button
              type="button"
              aria-label="Export chart data as CSV"
              title="Export CSV"
              disabled={!rows.length || !columns.length}
              onClick={() => downloadCSV(rows, columns, exportName)}
              className="grid h-6 w-6 place-items-center rounded-md text-ink-faint transition-colors hover:bg-foreground/[0.06] hover:text-ink disabled:opacity-30"
            >
              <FileSpreadsheet className="h-3 w-3" />
            </button>
            <button
              type="button"
              aria-label={full ? "Exit fullscreen" : "Expand chart fullscreen"}
              title={full ? "Exit fullscreen" : "Fullscreen"}
              onClick={() => setFull((f) => !f)}
              className="grid h-6 w-6 place-items-center rounded-md text-ink-faint transition-colors hover:bg-foreground/[0.06] hover:text-ink"
            >
              {full ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </header>

      <div ref={bodyRef} className={cn("flex-1 p-4", full && "flex flex-col justify-center", bodyClassName)}>
        {loading ? (
          <div className="space-y-2">
            <div className="h-[78%] min-h-[150px] animate-pulse rounded-lg bg-foreground/[0.05]" />
            <div className="flex gap-2">
              <span className="h-1.5 w-1/3 animate-pulse rounded-full bg-foreground/[0.05]" />
              <span className="h-1.5 w-1/4 animate-pulse rounded-full bg-foreground/[0.05]" />
            </div>
          </div>
        ) : empty ? (
          <div className="grid h-full min-h-[150px] place-content-center text-center">
            <p className="text-[12px] text-ink-soft">{emptyLabel}</p>
            <p className="mono mt-1 text-[10px] uppercase tracking-[0.12em] text-ink-faint">adjust the filters</p>
          </div>
        ) : tableView && rows.length && columns.length ? (
          <div className="max-h-[420px] overflow-auto rounded-lg border border-border/60">
            <table className="w-full text-left text-xs"><thead className="sticky top-0 bg-surface"><tr>{columns.map((column) => <th key={column.label} className="border-b border-border/60 px-3 py-2 font-medium text-ink-soft">{column.label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id ?? row.t ?? index} className="border-b border-border/40 last:border-0">{columns.map((column) => <td key={column.label} className="px-3 py-2 text-ink">{String(column.value(row) ?? "")}</td>)}</tr>)}</tbody></table>
          </div>
        ) : (
          children
        )}
      </div>
      {footer && <div className="shrink-0 border-t border-border/60 px-4 py-2">{footer}</div>}
    </section>
  );
}
