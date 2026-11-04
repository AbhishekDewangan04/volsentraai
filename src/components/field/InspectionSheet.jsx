import { useState } from "react";
import { Camera, Check, Loader2, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CauseChip, SeverityChip } from "@/components/common/Chip";
import { useI18n } from "@/lib/i18n";
import { inrCompact, num } from "@/lib/gridData";

const CHECKS = [
  ["seal", "field.seal"],
  ["bypass", "field.bypass"],
  ["illegal", "field.illegal"],
];

export default function InspectionSheet({ stop, open, onOpenChange, onOutcome, busy }) {
  const { t } = useI18n();
  const [checklist, setChecklist] = useState({ seal: false, bypass: false, illegal: false });
  const [reading, setReading] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  const c = stop?.consumer;

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        setPhoto({ uri: reader.result, name: file.name });
        setUploading(false);
      };
      reader.onerror = () => {
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
    }
  };

  const submit = (outcome) => {
    if (!c) return;
    onOutcome?.({
      consumer: c,
      caseRecord: stop.caseRecord,
      outcome,
      checklist: {
        ...checklist,
        reading: reading ? Number(reading) : null,
      },
      notes,
      photoUri: photo?.uri || "",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto border-border/80 bg-canvas">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SeverityChip severity={c?.risk_score >= 80 ? "critical" : c?.risk_score >= 55 ? "high" : "medium"} />
            <span className="mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
              {stop?.priority ? `Stop #${stop.priority}` : "Inspection"}
            </span>
          </div>
          <SheetTitle className="font-heading text-xl text-ink">{c?.name || "Consumer details"}</SheetTitle>
          <SheetDescription className="mono text-[11px] text-ink-faint">
            ID {c?.consumer_id} · Meter {c?.meter_no} · {c?.feeder}
          </SheetDescription>
        </SheetHeader>

        {c && (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-border/70 p-3.5 glass">
              <div className="flex items-center justify-between">
                <div>
                  <p className="mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Current risk score</p>
                  <p className="font-heading text-2xl font-semibold text-ink">{c.risk_score} / 100</p>
                </div>
                <div className="text-right">
                  <p className="mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Confidence</p>
                  <p className="mono text-sm font-semibold text-brand">{c.confidence}%</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-[11px]">
                <span className="text-ink-soft">Baseline vs Actual</span>
                <span className="mono text-ink">
                  {num(c.baseline_kwh)} vs <span className="text-rose">{num(c.actual_kwh)}</span> kWh
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-ink-soft">Est. monthly loss</span>
                <span className="mono font-semibold text-rose">{inrCompact(c.loss_rs_month)}</span>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <CauseChip cause={c.cause} />
              </div>
            </div>

            <div className="space-y-3">
              <p className="mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Physical checklist</p>
              {CHECKS.map(([key, labelKey]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:bg-foreground/[0.03] cursor-pointer"
                >
                  <Checkbox
                    checked={checklist[key]}
                    onCheckedChange={(val) => setChecklist((prev) => ({ ...prev, [key]: Boolean(val) }))}
                  />
                  <span className="text-sm text-ink">{t(labelKey)}</span>
                </label>
              ))}
            </div>

            <div className="space-y-2">
              <label htmlFor="field-reading" className="mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                Current meter reading (kWh)
              </label>
              <Input
                id="field-reading"
                type="number"
                placeholder={String(c.actual_kwh || "")}
                value={reading}
                onChange={(e) => setReading(e.target.value)}
                className="mono h-11"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="field-notes" className="mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                Inspector notes
              </label>
              <Textarea
                id="field-notes"
                placeholder="Observations on tamper evidence, seal integrity or consumer behavior..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <p className="mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Photo evidence</p>
              {photo ? (
                <div className="relative rounded-lg border border-border/80 p-2">
                  <img src={photo.uri} alt="Evidence" className="h-40 w-full rounded object-cover" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-3 h-7 w-7 rounded-full bg-black/70 text-white hover:bg-black"
                    onClick={() => setPhoto(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/80 text-ink-faint transition-colors hover:border-border hover:text-ink cursor-pointer">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Camera className="h-5 w-5" />
                      <span className="text-[12px]">Tap to attach photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => upload(e.target.files?.[0])}
                  />
                </label>
              )}
            </div>

            <div className="space-y-2 border-t border-border/70 pt-4">
              <p className="mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">Resolve inspection</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => submit("confirmed")}
                  className="h-11 bg-rose text-white hover:bg-rose/90 text-xs font-medium"
                >
                  <Check className="mr-1.5 h-3.5 w-3.5" /> Confirmed
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => submit("false_positive")}
                  className="h-11 border-border/80 text-xs font-medium"
                >
                  False positive
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => submit("revisit")}
                  className="h-11 text-ink-soft text-xs font-medium"
                >
                  Revisit
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
