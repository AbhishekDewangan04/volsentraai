import { motion } from "framer-motion";

export default function LossGauge({ value = 12, threshold = 10, max = 26 }) {
    const len = Math.PI * 70;
    const pct = Math.min(1, Math.max(0, value / max));
    const tone = value >= threshold ? "#FF4D6D" : value >= threshold * 0.7 ? "#FFB020" : "#2EE6A6";
    const tickAngle = (threshold / max) * 180;

    return (
        <div className="relative">
            <svg viewBox="0 0 180 108" className="w-full" role="img" aria-label={`Loss ${value} percent`}>
                <defs>
                    <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#2EE6A6" />
                        <stop offset="55%" stopColor="#FFB020" />
                        <stop offset="100%" stopColor="#FF4D6D" />
                    </linearGradient>
                </defs>
                <path d="M20 92 A 70 70 0 0 1 160 92" fill="none" stroke="url(#gauge-grad)" strokeWidth="12" strokeLinecap="round" opacity="0.16" />
                <motion.path
                    d="M20 92 A 70 70 0 0 1 160 92"
                    fill="none"
                    stroke="url(#gauge-grad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={len}
                    initial={{ strokeDashoffset: len }}
                    animate={{ strokeDashoffset: len - pct * len }}
                    transition={{ type: "spring", stiffness: 70, damping: 18 }}
                />
                <g transform={`rotate(${tickAngle - 90} 90 92)`}>
                    <line x1="90" y1="12" x2="90" y2="22" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" strokeDasharray="2 2" />
                </g>
                <text x="90" y="80" textAnchor="middle" fill="#F4F6FF" fontSize="26" fontFamily="var(--font-mono)" fontWeight="600">
                    {value}%
                </text>
                <text x="90" y="96" textAnchor="middle" fill="#636A8C" fontSize="8" fontFamily="var(--font-mono)" letterSpacing="1.4">
                    DT LOSS
                </text>
                <text x="22" y="104" fill="#636A8C" fontSize="7" fontFamily="var(--font-mono)">0%</text>
                <text x="150" y="104" fill="#636A8C" fontSize="7" fontFamily="var(--font-mono)">{max}%</text>
            </svg>
            <p className="mono mt-1 text-center text-[9px] uppercase tracking-[0.12em]" style={{ color: tone }}>
                {value >= threshold ? "above 10% threshold" : "within tolerance"}
            </p>
        </div>
    );
}