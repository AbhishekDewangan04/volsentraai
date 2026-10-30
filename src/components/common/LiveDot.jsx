import { cn } from "@/lib/utils";

const TONES = {
  mint: "bg-mint",
  rose: "bg-rose",
  amber: "bg-amber",
  sky: "bg-sky",
  violet: "bg-violet",
  brand: "bg-brand",
  faint: "bg-ink-faint",
};

export default function LiveDot({ tone = "mint", className = "", size = "h-2 w-2" }) {
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", size, className)}>
      <span className={cn("absolute inset-0 rounded-full opacity-60 animate-ping", TONES[tone] ?? TONES.mint)} />
      <span className={cn("relative rounded-full", size, TONES[tone] ?? TONES.mint)} />
    </span>
  );
}