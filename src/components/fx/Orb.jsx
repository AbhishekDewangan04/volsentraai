import { cn } from "@/lib/utils";

const TONES = {
  mint: "hsl(var(--mint))",
  rose: "hsl(var(--rose))",
  amber: "hsl(var(--amber))",
  sky: "hsl(var(--sky))",
  violet: "hsl(var(--violet))",
  brand: "hsl(var(--brand))",
  faint: "hsl(var(--faint))",
};

/** Soft pulsing status orb — replaces plain dots on live indicators. */
export default function Orb({ tone = "mint", size = "h-2.5 w-2.5", className = "", pulse = true }) {
  const color = TONES[tone] ?? TONES.mint;
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", size, className)} aria-hidden="true">
      {pulse && (
        <span
          className="absolute inset-[-4px] rounded-full opacity-50 animate-pulse-ring"
          style={{ background: color, filter: "blur(2px)" }}
        />
      )}
      <span className="absolute inset-[-3px] rounded-full opacity-40 blur-[5px]" style={{ background: color }} />
      <span
        className="relative h-full w-full rounded-full ring-1 ring-white/25"
        style={{ background: `radial-gradient(circle at 32% 28%, #fff8, ${color})`, boxShadow: `0 0 10px ${color}` }}
      />
    </span>
  );
}