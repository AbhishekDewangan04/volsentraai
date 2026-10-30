
import { cn } from "@/lib/utils";

/** Faint grid + soft radial glows, fading to transparent on every edge. */
export default function GlowField({ className = "", variant = "hero" }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)} aria-hidden="true">
      <div className="absolute inset-0 bg-grid-lines opacity-70 [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_78%)]" />
      {variant === "hero" && (
        <>
          <div className="absolute -top-56 left-1/2 h-[560px] w-[920px] -translate-x-1/2 rounded-full bg-brand/25 blur-[150px]" />
          <div className="absolute top-24 right-[6%] h-[380px] w-[380px] rounded-full bg-brand2/20 blur-[140px]" />
          <div className="absolute top-[38%] -left-24 h-[360px] w-[360px] rounded-full bg-sky/10 blur-[130px]" />
        </>
      )}
      {variant === "soft" && (
        <>
          <div className="absolute -top-40 left-[10%] h-[420px] w-[620px] rounded-full bg-brand/12 blur-[140px]" />
          <div className="absolute bottom-0 right-[8%] h-[320px] w-[420px] rounded-full bg-rose/10 blur-[130px]" />
        </>
      )}
      {variant === "grid" && <div className="absolute inset-0 bg-grid-dots opacity-60" />}
    </div>
  );
}