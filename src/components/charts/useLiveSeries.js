import { useEffect, useState } from "react";

/**
 * Appends one live point every `interval` ms, keeping the last `keep` points.
 * Resets whenever `key` changes (e.g. the time-range tab).
 */
export function useLiveSeries(seed, { key = "", enabled = true, interval = 2000, keep = 60, jitter = 6, anomalyRate = 0.08 } = {}) {
  const [data, setData] = useState(seed ?? []);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setData(seed ?? []);
    // seed changes only when the range key changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!enabled || paused) return;
    const id = setInterval(() => {
      setData((prev) => {
        if (!prev.length) return prev;
        const last = prev[prev.length - 1];
        const base = last.mw ?? last.kw ?? 0;
        const nextVal = Number(Math.max(0, base + (Math.random() - 0.5) * jitter).toFixed(1));
        const anomaly = Math.random() < anomalyRate;
        const point = {
          ...last,
          t: new Date().toTimeString().slice(0, 8),
          mw: nextVal,
          kw: nextVal,
          anomaly,
        };
        return [...prev, point].slice(-keep);
      });
    }, interval);
    return () => clearInterval(id);
  }, [enabled, paused, interval, keep, jitter, anomalyRate]);

  return { data, paused, setPaused, toggle: () => setPaused((p) => !p) };
}