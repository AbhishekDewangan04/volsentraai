import { cn } from "@/lib/utils";
import { causeMeta, severityMeta } from "@/lib/gridData";
import { useI18n } from "@/lib/i18n";

const TONES = {
  neutral: "bg-foreground/[0.05] border-border text-ink-soft",
  brand: "bg-brand/12 border-brand/25 text-brand",
  mint: "bg-mint/12 border-mint/25 text-mint",
  amber: "bg-amber/12 border-amber/25 text-amber",
  rose: "bg-rose/12 border-rose/25 text-rose",
  violet: "bg-violet/12 border-violet/25 text-violet",
  sky: "bg-sky/12 border-sky/25 text-sky",
  volt: "bg-volt/12 border-volt/25 text-volt",
};

const DOTS = {
  neutral: "bg-ink-faint",
  brand: "bg-brand",
  mint: "bg-mint",
  amber: "bg-amber",
  rose: "bg-rose",
  violet: "bg-violet",
  sky: "bg-sky",
  volt: "bg-volt",
};

export function Pill({ children, tone = "neutral", dot = false, className = "", as: Tag = "span" }) {
  return (
    <Tag
      className={cn(
        "mono inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[11px] uppercase leading-[1.5] tracking-[0.12em]",
        TONES[tone] ?? TONES.neutral,
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOTS[tone] ?? DOTS.neutral)} />}
      <span className="whitespace-nowrap">{children}</span>
    </Tag>
  );
}

const TONE_KEY = {
  Normal: "mint",
  "Theft/Tampering": "rose",
  "Meter Fault": "violet",
  "Communication Failure": "sky",
  "Legit Abnormal": "volt",
  "Requires Review": "amber",
};

export function CauseChip({ cause, short = false, className = "" }) {
  const meta = causeMeta(cause);
  const { t } = useI18n();
  return (
    <Pill tone={TONE_KEY[cause] ?? "neutral"} dot className={className}>
      {short ? meta.short : t(`cause.${cause ?? "Normal"}`)}
    </Pill>
  );
}

const SEV_TONE = { critical: "rose", high: "amber", medium: "sky", low: "mint" };

export function SeverityChip({ severity, className = "" }) {
  const { t } = useI18n();
  const key = SEV_TONE[severity] ? severity : "low";
  return (
    <Pill tone={SEV_TONE[key]} dot className={className}>
      {t(`sev.${key}`)}
    </Pill>
  );
}

export function Eyebrow({ children, className = "" }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}