import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Slow auto-scrolling strip; pauses on hover. Duplicates the track for a seamless loop. */
export default function Marquee({ items = [], className = "", speed = 42 }) {
  const [paused, setPaused] = useState(false);
  const ref = useRef(null);

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex w-max animate-marquee items-center gap-8 pr-8"
        style={{ animationDuration: `${speed}s`, animationPlayState: paused ? "paused" : "running" }}
      >
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center gap-8" aria-hidden={dup === 1}>
            {items.map((it) => (
              <span key={`${dup}-${it}`} className="mono whitespace-nowrap text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                {it}
                <span className="ml-8 text-brand/50">·</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-canvas to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-canvas to-transparent" />
    </div>
  );
}