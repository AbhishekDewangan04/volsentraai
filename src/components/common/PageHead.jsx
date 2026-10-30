import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export default function PageHead({ eyebrow, title, titleKey, highlight, sub, actions, className = "" }) {
  const { t, lang } = useI18n();
  const translated = titleKey ? t(titleKey) : null;
  const showTranslated = lang !== "en" && translated;

  return (
    <div className={cn("mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">{eyebrow}</p>
        )}
        <h1 className="mt-1.5 font-heading text-[22px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[27px]">
          {showTranslated ? (
            <span className="text-gradient">{translated}</span>
          ) : (
            <>
              {title} {highlight && <span className="text-gradient">{highlight}</span>}
            </>
          )}
        </h1>
        {sub && <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-soft">{sub}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}