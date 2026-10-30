import { cn } from "@/lib/utils";

/**
 * ONE vertical rhythm token for every landing section.
 * SECTION_PAD = pb-24 (mobile) / pb-32 (desktop, ≥1024px), applied as bottom
 * padding only — so the distance between any two sections is exactly 96px / 128px,
 * including the gap after a sticky scroll track. No section adds its own margin.
 */
export const SECTION_PAD = "pb-24 lg:pb-32";

export default function Section({ id, children, className = "", innerClassName = "", bordered = false }) {
  return (
    <section id={id} className={cn("relative", SECTION_PAD, bordered && "border-y border-border/60", className)}>
      <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", innerClassName)}>{children}</div>
    </section>
  );
}