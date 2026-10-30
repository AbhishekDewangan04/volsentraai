import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useMotionOff } from "@/lib/useMotionPref";

/** Glass secondary button with a border beam that travels around the pill. */
export default function GlassButton({ to, href, onClick, children, className = "" }) {
  const motionOff = useMotionOff();

  const body = (
    <>
      {!motionOff && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
          <span
            className="absolute left-1/2 top-1/2 h-[220%] w-[220%] -translate-x-1/2 -translate-y-1/2 animate-spin-slow opacity-70"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(124,92,255,0.9) 28deg, rgba(255,61,154,0.7) 52deg, transparent 92deg)",
              animationDuration: "7s",
            }}
          />
        </span>
      )}
      <span aria-hidden="true" className="absolute inset-px rounded-full glass" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </>
  );

  const classes = cn(
    "relative inline-flex h-11 items-center justify-center overflow-hidden rounded-full border border-border/70 px-6 text-sm font-medium text-ink transition-colors hover:text-white",
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {body}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes}>
        {body}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {body}
    </button>
  );
}