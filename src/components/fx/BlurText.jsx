import { motion } from "framer-motion";
import { useMotionOff } from "@/lib/useMotionPref";
import { cn } from "@/lib/utils";

/**
 * Word-by-word reveal for headlines.
 * mode="blur" — hero: blur-in + rise, then a single shine sweep across the gradient words.
 * mode="rise" — section headlines: staggered rise with a soft bloom on gradient words.
 */
export default function BlurText({ segments, as = "h1", className = "", mode = "blur", delay = 0, shine = true }) {
  const motionOff = useMotionOff();
  const Tag = as;
  const words = [];
  segments.forEach((seg, si) => {
    seg.t.split(" ").filter(Boolean).forEach((word, wi) => {
      words.push({ word, gradient: seg.gradient, key: `${si}-${wi}` });
    });
  });

  if (motionOff) {
    return (
      <Tag className={className}>
        {segments.map((s, i) =>
          s.gradient ? (
            <span key={i} className="text-gradient">
              {s.t}
            </span>
          ) : (
            <span key={i}>{s.t}</span>
          ),
        )}
      </Tag>
    );
  }

  const reveal =
    mode === "blur"
      ? { animate: { opacity: 1, filter: "blur(0px)", y: 0 } }
      : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" } };

  return (
    <Tag className={cn("relative", className)}>
      {words.map((w, i) => (
        <motion.span
          key={w.key}
          initial={mode === "blur" ? { opacity: 0, filter: "blur(10px)", y: 14 } : { opacity: 0, y: 18 }}
          {...reveal}
          transition={{ duration: 0.55, delay: delay + i * 0.055, ease: [0.22, 1, 0.36, 1] }}
          className={cn("relative inline-block", w.gradient && "text-gradient")}
        >
          {w.gradient && mode === "rise" && (
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 -z-10 h-[0.5em] rounded-full opacity-40 blur-2xl"
              style={{ background: "linear-gradient(100deg,#7C5CFF,#FF3D9A)" }}
            />
          )}
          {w.word}
          {"\u00A0"}
        </motion.span>
      ))}

      {shine && mode === "blur" && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 block"
          initial={{ x: "-120%" }}
          animate={{ x: "220%" }}
          transition={{ duration: 1.4, delay: delay + words.length * 0.055 + 0.15, ease: "easeInOut" }}
          style={{
            background: "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)",
            mixBlendMode: "overlay",
            width: "45%",
          }}
        />
      )}
    </Tag>
  );
}