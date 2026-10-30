import { motion } from "framer-motion";
import { useMotionOff } from "@/lib/useMotionPref";

/** Converging beams + meteor streaks behind the final CTA. */
export default function WarpField({ className = "" }) {
  const motionOff = useMotionOff();

  const beams = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * 360;
    return { angle, delay: i * 0.22, len: 40 + ((i * 37) % 55) };
  });

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {beams.map((b, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 origin-bottom"
          style={{ width: 1, height: `${b.len}%`, transform: `rotate(${b.angle}deg)` }}
        >
          <motion.span
            className="block h-full w-full"
            style={{ background: "linear-gradient(to top, hsl(var(--brand) / 0.55), transparent)" }}
            animate={motionOff ? undefined : { opacity: [0.05, 0.35, 0.05], scaleY: [0.85, 1, 0.85] }}
            transition={{ duration: 5.5, repeat: Infinity, delay: b.delay, ease: "easeInOut" }}
          />
        </span>
      ))}

      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={`m-${i}`}
          className="absolute h-px rounded-full"
          style={{
            top: `${12 + i * 21}%`,
            width: 120 + i * 40,
            left: `${8 + i * 22}%`,
            background: "linear-gradient(90deg, transparent, hsl(var(--brand2) / 0.7), transparent)",
            opacity: 0.5,
          }}
          animate={motionOff ? undefined : { x: ["-30%", "120%"], opacity: [0, 0.7, 0] }}
          transition={{ duration: 7 + i, repeat: Infinity, delay: i * 2.2, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}