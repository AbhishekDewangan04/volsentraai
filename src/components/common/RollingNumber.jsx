import { useEffect, useState } from "react";

const DIGITS = "0123456789".split("");

function Digit({ d }) {
  return (
    <span className="relative inline-block overflow-hidden align-baseline" style={{ height: "1em", width: "0.63em", lineHeight: 1 }}>
      <span
        className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-700 ease-out"
        style={{ transform: `translateY(-${d}em)` }}
        aria-hidden="true"
      >
        {DIGITS.map((c) => (
          <span key={c} style={{ height: "1em", lineHeight: 1 }}>
            {c}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Digit-column counter — each column rolls to its new value. */
export default function RollingNumber({ value, format, className = "", prefix = "", suffix = "" }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const text = format ? format(Number(value) || 0) : Math.round(Number(value) || 0).toLocaleString("en-US");

  return (
    <span className={`mono tnum inline-flex items-baseline ${className}`}>
      <span className="sr-only">
        {prefix}
        {text}
        {suffix}
      </span>
      <span aria-hidden="true" className="inline-flex items-baseline">
        {prefix}
        {ready
          ? text.split("").map((ch, i) =>
            /\d/.test(ch) ? (
              <Digit key={i} d={Number(ch)} />
            ) : (
              <span key={i} className="inline-block">
                {ch}
              </span>
            ),
          )
          : text}
        {suffix}
      </span>
    </span>
  );
}