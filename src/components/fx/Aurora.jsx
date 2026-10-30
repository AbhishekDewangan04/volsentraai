import { motion } from "framer-motion";
import { useMotionOff } from "@/lib/useMotionPref";

/** Slow-drifting violet / magenta / sky gradient wash. Static when motion is off. */
export default function Aurora({ className = "", intensity = 1 }) {
  const motionOff = useMotionOff();

  const blobs = [
    { c: "#7C5CFF", x: "-10%", y: "-20%", w: 620, h: 520, d: 0 },
    { c: "#FF3D9A", x: "58%", y: "-10%", w: 560, h: 460, d: 3 },
    { c: "#38BDF8", x: "22%", y: "34%", w: 520, h: 420, d: 6 },
  ];

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: b.x,
            top: b.y,
            width: b.w,
            height: b.h,
            background: `radial-gradient(circle at 50% 50%, ${b.c}, transparent 68%)`,
            opacity: 0.15 * intensity,
            filter: "blur(70px)",
          }}
          animate={
            motionOff
              ? undefined
              : {
                x: [0, 34, -18, 0],
                y: [0, -26, 18, 0],
                scale: [1, 1.08, 0.97, 1],
              }
          }
          transition={{ duration: 26 + i * 6, repeat: Infinity, ease: "easeInOut", delay: b.d }}
        />
      ))}
      {/* fade the layer to transparent at every edge */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,hsl(var(--canvas))_88%)]" />
    </div>
  );
}