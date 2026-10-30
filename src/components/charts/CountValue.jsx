import { useEffect, useRef, useState } from "react";
import { useMotionOff } from "@/lib/useMotionPref";

/** Mono rolling number that counts up to `value` (static when motion is off). */
export default function CountValue({ value, decimals = 0, prefix = "", suffix = "" }) {
  const motionOff = useMotionOff();
  const [shown, setShown] = useState(motionOff ? value : 0);
  const raf = useRef(null);

  useEffect(() => {
    if (motionOff) {
      setShown(value);
      return;
    }
    const from = 0;
    const start = performance.now();
    const dur = 420;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(from + (value - from) * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, motionOff]);

  return (
    <span className="mono tabular-nums">
      {prefix}
      {Number(shown || 0).toFixed(decimals)}
      {suffix}
    </span>
  );
}