import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Check, CloudUpload, Download, FileSpreadsheet, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { causeMeta } from "@/lib/gridData";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { getConsumers, applyDetectionResults } from "@/lib/gridService";
import { downloadText, parseCsv, sampleCsv, scoreReadings, validateRows, MAX_ROWS } from "@/lib/csvImport";

const STEPS = ["imp.profiling", "imp.scoring", "imp.explaining"];
const ERROR_LABEL = {
  missing: "missing value",
  "not-number": "not a number",
  negative: "negative kWh",
  duplicate: "duplicate meter + month",
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ImportDataDialog({ open, onOpenChange }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const { data: consumers = [] } = useQuery({ queryKey: ["consumers"], queryFn: getConsumers });

  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [headerError, setHeaderError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState(-1);
  const [busy, setBusy] = useState(false);

  const { errors, usable } = useMemo(() => validateRows(rows), [rows]);
  const { results, unknown } = useMemo(
    () => scoreReadings(consumers, usable),
    [consumers, usable],
  );

  const reset = () => {
    setFileName("");
    setRows([]);
    setHeaderError(null);
    setStep(-1);
    setBusy(false);
  };

  const readFile = async (file) => {
    if (!file) return;
    const text = await file.text();
    const parsed = parseCsv(text);
    setFileName(file.name);
    setHeaderError(parsed.headerError);
    if (parsed.rows.length > MAX_ROWS) {
      setRows([]);
      setHeaderError(t("imp.tooMany"));
      return;
    }
    setRows(parsed.rows);
    setStep(-1);
  };

  const errorChips = useMemo(() => {
    const map = new Map();
    errors.forEach((e) => {
      const key = e.code;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()].map(([code, count]) => ({ code, count }));
  }, [errors]);

  const run = async () => {
    if (!usable.length || busy) return;
    setBusy(true);
    setStep(0);
    await wait(650);
    setStep(1);
    await wait(700);
    setStep(2);
    await wait(600);
    try {
      await applyDetectionResults(results);
      setStep(3);
      queryClient.invalidateQueries({ queryKey: ["consumers"] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success(`${results.length} meters rescored`, {
        description: `Profiled, scored and explained from ${fileName}.`,
      });
      await wait(900);
      onOpenChange(false);
      reset();
    } catch {
      toast.error("Could not save the detection run");
      setBusy(false);
      setStep(-1);
    }
  };

  const preview = rows.slice(0, 6);

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-border/70 bg-surface p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/60 p-4 text-left">
          <DialogTitle className="flex items-center gap-2 font-heading text-[17px] font-semibold text-ink">
            <FileSpreadsheet className="h-4 w-4 text-brand" /> {t("imp.title")}
          </DialogTitle>
          <DialogDescription className="text-[12px] leading-relaxed text-ink-soft">{t("imp.desc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 p-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); readFile(e.dataTransfer.files?.[0]); }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 py-7 text-center transition-colors",
              dragging ? "border-brand bg-brand/10" : "border-border/80 bg-foreground/[0.02] hover:border-brand/60",
            )}
          >
            <CloudUpload className={cn("h-5 w-5", dragging ? "text-brand" : "text-ink-faint")} />
            <p className="text-[12px] text-ink-soft">
              {t("imp.drop")}{" "}
              <span className="text-brand underline underline-offset-2">{t("imp.browse")}</span>
            </p>
            <p className="mono text-[9px] uppercase tracking-[0.1em] text-ink-faint">{t("imp.accept")}</p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => readFile(e.target.files?.[0])}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="mono flex items-center gap-1.5 text-[10px] text-ink-faint">
              {fileName ? <><FileSpreadsheet className="h-3 w-3" /> {fileName} · {rows.length} rows</> : t("imp.empty")}
            </p>
            <button
              type="button"
              onClick={() => downloadText("volsentra-sample-readings.csv", sampleCsv(consumers))}
              className="mono flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] text-brand hover:opacity-80"
            >
              <Download className="h-3 w-3" /> {t("act.sample")}
            </button>
          </div>

          {headerError && (
            <div className="flex items-start gap-2 rounded-lg border border-rose/30 bg-rose/10 px-3 py-2 text-[11px] text-rose">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {headerError}
            </div>
          )}

          {(errorChips.length > 0 || unknown.length > 0) && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">{t("imp.errors")}</span>
              {errorChips.map((e) => (
                <span key={e.code} className="mono inline-flex items-center gap-1 rounded-full border border-amber/30 bg-amber/12 px-2 py-[3px] text-[9px] uppercase tracking-[0.1em] text-amber">
                  <AlertTriangle className="h-2.5 w-2.5" /> {e.count} {ERROR_LABEL[e.code] ?? e.code}
                </span>
              ))}
              {unknown.length > 0 && (
                <span className="mono inline-flex items-center gap-1 rounded-full border border-rose/30 bg-rose/12 px-2 py-[3px] text-[9px] uppercase tracking-[0.1em] text-rose">
                  <AlertTriangle className="h-2.5 w-2.5" /> {unknown.length} unknown meter
                </span>
              )}
            </div>
          )}

          {preview.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-border/70">
              <div className="flex items-center justify-between border-b border-border/60 px-3 py-1.5">
                <p className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">{t("imp.preview")}</p>
                <p className="mono text-[9px] text-mint">
                  {usable.length} {t("imp.ready")} · {results.length} {t("imp.meters")}
                </p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-foreground/[0.02]">
                    {["consumer_id", "month", "kwh"].map((h) => (
                      <th key={h} className="mono px-3 py-1.5 text-left text-[9px] uppercase tracking-[0.1em] text-ink-faint">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i} className="border-b border-border/40 last:border-0">
                      <td className="mono px-3 py-1 text-[10.5px] text-ink">{r.consumer_id}</td>
                      <td className="mono px-3 py-1 text-[10.5px] text-ink-soft">{r.month}</td>
                      <td className="mono px-3 py-1 text-[10.5px] text-ink-soft">{r.kwh}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {step >= 0 && (
            <div className="rounded-xl border border-border/70 bg-foreground/[0.02] p-3">
              <div className="flex items-center gap-2">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex flex-1 items-center gap-2">
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[9px] transition-colors",
                        i < step ? "border-mint/50 bg-mint/15 text-mint" : i === step ? "border-brand/50 bg-brand/15 text-brand" : "border-border text-ink-faint",
                      )}
                    >
                      {i < step || step === 3 ? <Check className="h-3 w-3" /> : i === step ? <Loader2 className="h-3 w-3 animate-spin" /> : i + 1}
                    </span>
                    <span className={cn("mono truncate text-[9px] uppercase tracking-[0.1em]", i <= step ? "text-ink" : "text-ink-faint")}>
                      {t(s)}
                    </span>
                    {i < STEPS.length - 1 && <span className={cn("h-px flex-1", i < step ? "bg-mint/40" : "bg-border")} />}
                  </div>
                ))}
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-foreground/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand to-brand-2 transition-all duration-500"
                  style={{ width: `${Math.min(100, ((step + 1) / 4) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex items-start gap-2 rounded-lg border border-mint/30 bg-mint/10 px-3 py-2 text-[11px] text-mint">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                {t("imp.done")} — {results.length} meters merged with score, cause and reasons.
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
            <div className="flex flex-wrap gap-1">
              {results.slice(0, 3).map((r) => (
                <span key={r.consumer_id} className={cn("mono rounded-full border px-2 py-[3px] text-[9px] uppercase tracking-[0.08em]", causeMeta(r.cause).border, causeMeta(r.cause).bg, causeMeta(r.cause).text)}>
                  {r.consumer_id} · {r.risk_score}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-9 rounded-full px-3 text-[12px] text-ink-soft">
                <X className="h-3.5 w-3.5" /> {t("act.cancel")}
              </Button>
              <Button
                onClick={run}
                disabled={busy || results.length === 0}
                className="h-9 gap-1.5 rounded-full bg-gradient-to-r from-brand to-brand-2 px-4 text-[12px] text-white disabled:opacity-40"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {t("act.run")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}