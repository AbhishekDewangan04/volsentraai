import { cn } from "@/lib/utils";
import BeamPill from "@/components/fx/BeamPill";
import BlurText from "@/components/fx/BlurText";

/** Signature section header: beam eyebrow pill, word-staggered headline, muted subline. */
export default function SectionHeader({ feature, eyebrow, title, highlight, sub, align = "left", className = "" }) {
  const centered = align === "center";
  return (
    <div className={cn("relative", centered && "mx-auto max-w-3xl text-center", className)}>
      <BeamPill>
        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
        <span className="mono text-[11px] uppercase leading-none tracking-[0.18em] text-ink-soft">
          {feature ? `Feature ${feature} · ` : ""}
          {eyebrow}
        </span>
      </BeamPill>

      <BlurText
        as="h2"
        mode="rise"
        shine={false}
        segments={[
          { t: title, gradient: false },
          ...(highlight ? [{ t: highlight, gradient: true }] : []),
        ]}
        className="mt-5 font-heading text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] text-ink sm:text-4xl md:text-[42px]"
      />

      {sub && (
        <p className={cn("mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft", centered && "mx-auto")}>{sub}</p>
      )}
    </div>
  );
}