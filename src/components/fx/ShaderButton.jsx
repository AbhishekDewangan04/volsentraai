import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useMotionOff } from "@/lib/useMotionPref";
import { cn } from "@/lib/utils";

/**
 * Primary CTA: magnetic pull, pointer-following gradient flow, shimmer sweep and
 * a click-spark burst. Falls back to a plain gradient button with motion off.
 */
export default function ShaderButton({ to, href, onClick, children, className = "", variant = "link" }) {
  const ref = useRef(null);
  const motionOff = useMotionOff();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });

  const onMove = (e) => {
    if (motionOff || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    x.set((px - 0.5) * 14);
    y.set((py - 0.5) * 10);
    ref.current.style.setProperty("--px", `${px * 100}%`);
    ref.current.style.setProperty("--py", `${py * 100}%`);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const onPress = async (e) => {
    if (motionOff) return;
    try {
      const { default: confetti } = await import("canvas-confetti");
      const rect = e.currentTarget.getBoundingClientRect();
      confetti({
        particleCount: 16,
        spread: 55,
        startVelocity: 22,
        gravity: 0.9,
        scalar: 0.6,
        ticks: 60,
        colors: ["#7C5CFF", "#FF3D9A", "#38BDF8"],
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
      });
    } catch {
      /* no confetti available */
    }
  };

  const inner = (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-gradient-to-r from-brand to-brand-2 transition-[background] duration-300"
        style={{ backgroundImage: "radial-gradient(120px circle at var(--px,50%) var(--py,50%), #FF3D9A 0%, #7C5CFF 46%, #5B4BD6 100%)" }}
      />
      <span aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-full">
        {!motionOff && (
          <motion.span
            className="absolute -inset-y-4 left-0 w-1/3 rotate-12 bg-white/25 blur-md"
            animate={{ x: ["-160%", "420%"] }}
            transition={{ duration: 3.4, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
          />
        )}
      </span>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </>
  );

  const classes = cn(
    "relative inline-flex h-11 items-center justify-center overflow-hidden rounded-full px-6 text-sm font-medium text-white shadow-glow-brand transition-shadow hover:shadow-glow-rose",
    className,
  );

  return (
    <motion.div ref={ref} style={{ x, y }} onMouseMove={onMove} onMouseLeave={onLeave} className="inline-flex">
      {variant === "link" ? (
        <Link to={to} onClick={onPress} className={classes}>
          {inner}
        </Link>
      ) : href ? (
        <a href={href} onClick={onPress} className={classes}>
          {inner}
        </a>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            onPress(e);
            onClick?.(e);
          }}
          className={classes}
        >
          {inner}
        </button>
      )}
    </motion.div>
  );
}