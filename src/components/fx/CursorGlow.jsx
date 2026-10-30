import { useEffect, useRef, useState } from "react";
import { useMotionOff } from "@/lib/useMotionPref";

/** Faint cursor-following glow for app pages (skipped on touch / reduced motion). */
export default function CursorGlow() {
  const ref = useRef(null);
  const motionOff = useMotionOff();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (motionOff) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);

    let raf = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const loop = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      if (ref.current) ref.current.style.transform = `translate3d(${x - 220}px, ${y - 220}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [motionOff]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        ref={ref}
        className="h-[440px] w-[440px] rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, hsl(var(--brand) / 0.09), transparent 62%)" }}
      />
    </div>
  );
}