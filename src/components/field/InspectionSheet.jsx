import { useState } from "react";
import { Camera, Check, Loader2, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CauseChip, SeverityChip } from "@/components/common/Chip";
import { base44 } from "@/api/base44Client";
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
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setPhoto({ uri: file_uri, name: file.name });
    } finally {
      setUploading(false);
    }
  };

  const submit = (outcome) => {
    if (!stop) return;
    onOutcome({
      consumer: stop.consumer,
      caseRecord: stop.caseRecord,
      outcome,
      checklist: { ...checklist, reading },
      notes,
      photoUri: photo?.uri ?? "",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-border/70 bg-surface p-0 sm:max-w-md">
        {c && (
          <>
            <SheetHeader className="border-b border-border/60 p-4 text-left">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">
                    {t("field.stop")} {stop.visit} · {stop.legKm} km
                  </p>
                  <SheetTitle className="mt-1 truncate font-heading text-[17px] font-semibold text-ink">{c.name}</SheetTitle>
                  <SheetDescription className="mono mt-1 text-[10px] text-ink-faint">
                    {c.consumer_id} · {c.transformer_id} · {c.feeder}
                  </SheetDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-full" onClick={() => onOpenChange(false)} aria-label={t("act.close")}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <CauseChip cause={c.cause} />
                <SeverityChip severity={stop.priority} />
                <span className="mono rounded-full border border-border/80 px-2 py-[3px] text-[10px] text-ink-soft">
                  risk {c.risk_score}
                </span>
              </div>
            </SheetHeader>

            <div className="space-y-4 p-4">
              <div>
                <p className="mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">{t("field.evidence")}</p>
                <ul className="mt-1.5 space-y-1">
                  {(c.reasons ?? []).slice(0, 3).map((r, i) => (
                    <li key={i} className="flex gap-1.5 text-[11px] leading-snug text-ink-soft">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand" />
                      {r}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {[
                    ["Baseline", num(c.baseline_kwh)],
                    ["Billed", num(c.actual_kwh)],
                    ["Recoverable", inrCompact(stop.recoverable)],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-border/70 bg-foreground/[0.03] px-2 py-1.5">
                      <p className="mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">{k}</p>
                      <p className="mono mt-0.5 truncate text-[11px] text-ink">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">{t("field.checklist")}</p>
                <div className="mt-1.5 space-y-2">
                  {CHECKS.map(([key, label]) => (
                    <label key={key} className="flex cursor-pointer items-center gap-2 text-[12px] text-ink-soft">
                      <Checkbox
                        checked={checklist[key]}
                        onCheckedChange={(v) => setChecklist((prev) => ({ ...prev, [key]: !!v }))}
                        aria-label={t(label)}
                      />
                      <span>{t(label)}</span>
                    </label>
                  ))}
                  <div>
                    <p className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">{t("field.reading")}</p>
                    <Input
                      value={reading}
                      onChange={(e) => setReading(e.target.value)}
                      inputMode="numeric"
                      placeholder="0"
                      className="mt-1 h-9 border-border/80 bg-foreground/[0.03] text-[12px]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">{t("field.photo")}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <label className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border/80 bg-foreground/[0.03] px-3 text-[11px] text-ink-soft hover:text-ink">
                    {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                    <span>{photo ? photo.name : t("field.photo")}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
                  </label>
                  {photo && (
                    <span className="mono flex items-center gap-1 text-[9px] text-mint">
                      <Check className="h-3 w-3" /> stored privately
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">{t("field.notes")}</p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1.5 border-border/80 bg-foreground/[0.03] text-[12px]"
                  placeholder="What did you find on site?"
                />
              </div>

              <div className="grid gap-2 border-t border-border/60 pt-3">
                <Button
                  disabled={busy}
                  onClick={() => submit("confirmed")}
                  className="h-10 gap-1.5 rounded-full bg-rose text-white hover:bg-rose/90"
                >
                  {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} {t("field.confirmed")}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button disabled={busy} variant="outline" onClick={() => submit("false_positive")} className="h-9 rounded-full border-border/80 text-[12px]">
                    {t("field.falsePositive")}
                  </Button>
                  <Button disabled={busy} variant="outline" onClick={() => submit("revisit")} className="h-9 rounded-full border-border/80 text-[12px]">
                    {t("field.revisit")}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}