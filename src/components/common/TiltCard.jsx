import { useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

const GLOWS = {
  brand: "group-hover:shadow-glow-brand group-hover:border-brand/30",
  rose: "group-hover:shadow-glow-rose group-hover:border-rose/30",
  mint: "group-hover:shadow-glow-mint group-hover:border-mint/30",
  violet: "group-hover:shadow-glow-violet group-hover:border-violet/30",
  sky: "group-hover:shadow-glow-sky group-hover:border-sky/30",
  amber: "group-hover:shadow-glow-amber group-hover:border-amber/30",
  none: "",
};

const SPOTS = {
  brand: "rgba(124,92,255,0.16)",
  rose: "rgba(255,77,109,0.16)",
  mint: "rgba(46,230,166,0.14)",
  violet: "rgba(167,139,250,0.16)",
  sky: "rgba(56,189,248,0.14)",
  amber: "rgba(255,176,32,0.14)",
  none: "transparent",
};

/** Card surface with cursor tilt, spotlight and press feedback. */
export default function TiltCard({
  children,
  className = "",
  glow = "brand",
  max = 6,
  as = "div",
  interactive = true,
  ...rest
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  const rx = useSpring(useMotionValue(0), { stiffness: 260, damping: 24 });
  const ry = useSpring(useMotionValue(0), { stiffness: 260, damping: 24 });
  const MotionTag = motion[as] ?? motion.div;

  const handleMove = (e) => {
    if (!interactive || reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * max * 2);
    rx.set(-(py - 0.5) * max * 2);
    setSpot({ x: px * 100, y: py * 100 });
  };

  const handleLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <MotionTag
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={interactive && !reduced ? { scale: 0.97 } : undefined}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className={cn(
        "group relative rounded-2xl border border-border/70 bg-surface/80 backdrop-blur-sm transition-shadow duration-500",
        GLOWS[glow] ?? GLOWS.brand,
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(420px circle at ${spot.x}% ${spot.y}%, ${SPOTS[glow] ?? SPOTS.brand}, transparent 62%)` }}
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl shadow-inset" />
      {children}
    </MotionTag>
  );
}