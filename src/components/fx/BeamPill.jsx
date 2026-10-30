import { useMotionOff } from "@/lib/useMotionPref";
import { cn } from "@/lib/utils";

/** Eyebrow pill with a light beam travelling around its border. */
export default function BeamPill({ children, className = "", icon: Icon }) {
  const motionOff = useMotionOff();

  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-border/80 bg-foreground/[0.04] px-3.5 py-1.5 backdrop-blur",
        className,
      )}
    >
      {!motionOff && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span
            className="absolute left-1/2 top-1/2 h-[320%] w-[320%] animate-spin-slow"
            style={{
              animationDuration: "9s",
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(124,92,255,0.75) 22deg, rgba(255,61,154,0.55) 40deg, transparent 66deg)",
              maskImage: "linear-gradient(#000,#000)",
            }}
          />
          <span className="absolute inset-px rounded-full bg-background/85" />
        </span>
      )}
      <span className="relative z-10 flex items-center gap-2">
        {Icon && <Icon className="h-3.5 w-3.5 text-brand" />}
        {children}
      </span>
    </span>
  );
}