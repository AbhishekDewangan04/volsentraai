export const CAUSES = [
    "Normal",
    "Theft/Tampering",
    "Meter Fault",
    "Communication Failure",
    "Legit Abnormal",
    "Requires Review",
];

export const CAUSE_META = {
    Normal: {
        label: "Normal", short: "NORMAL", hex: "#2EE6A6",
        text: "text-mint", bg: "bg-mint/12", border: "border-mint/25", dot: "bg-mint", glow: "shadow-glow-mint",
    },
    "Theft/Tampering": {
        label: "Theft / Tampering", short: "THEFT", hex: "#FF4D6D",
        text: "text-rose", bg: "bg-rose/12", border: "border-rose/25", dot: "bg-rose", glow: "shadow-glow-rose",
    },
    "Meter Fault": {
        label: "Meter Fault", short: "METER", hex: "#A78BFA",
        text: "text-violet", bg: "bg-violet/12", border: "border-violet/25", dot: "bg-violet", glow: "shadow-glow-violet",
    },
    "Communication Failure": {
        label: "Communication Failure", short: "COMMS", hex: "#38BDF8",
        text: "text-sky", bg: "bg-sky/12", border: "border-sky/25", dot: "bg-sky", glow: "shadow-glow-sky",
    },
    "Legit Abnormal": {
        label: "Legit Abnormal", short: "LEGIT", hex: "#FFD84D",
        text: "text-volt", bg: "bg-volt/12", border: "border-volt/25", dot: "bg-volt", glow: "shadow-glow-amber",
    },
    "Requires Review": {
        label: "Requires Review", short: "REVIEW", hex: "#FFB020",
        text: "text-amber", bg: "bg-amber/12", border: "border-amber/25", dot: "bg-amber", glow: "shadow-glow-amber",
    },
};

export const causeMeta = (cause) => CAUSE_META[cause] ?? CAUSE_META.Normal;

export const SEVERITY = {
    critical: { label: "Critical", hex: "#FF4D6D", text: "text-rose", bg: "bg-rose/12", border: "border-rose/25", dot: "bg-rose" },
    high: { label: "High", hex: "#FFB020", text: "text-amber", bg: "bg-amber/12", border: "border-amber/25", dot: "bg-amber" },
    medium: { label: "Medium", hex: "#38BDF8", text: "text-sky", bg: "bg-sky/12", border: "border-sky/25", dot: "bg-sky" },
    low: { label: "Low", hex: "#2EE6A6", text: "text-mint", bg: "bg-mint/12", border: "border-mint/25", dot: "bg-mint" },
};

export const riskBand = (score) => (score >= 80 ? "critical" : score >= 60 ? "high" : score >= 40 ? "medium" : "low");
export const severityMeta = (key) => SEVERITY[key] ?? SEVERITY.low;

export const FEEDERS = ["North Loop", "Central Industrial", "East Residential"];
export const CASE_COLUMNS = [
    "New",
    "Under Review",
    "Inspection Scheduled",
    "Confirmed Theft",
    "Resolved",
    "False Positive",
];

const inrFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
export const inr = (n) => `₹${inrFmt.format(Math.round(Number(n) || 0))}`;
export const compact = (n) => {
    const v = Number(n) || 0;
    if (Math.abs(v) >= 1e7) return `${(v / 1e7).toFixed(2)}Cr`;
    if (Math.abs(v) >= 1e5) return `${(v / 1e5).toFixed(1)}L`;
    if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}k`;
    return `${Math.round(v)}`;
};
export const inrCompact = (n) => `₹${compact(n)}`;
export const num = (n) => inrFmt.format(Math.round(Number(n) || 0));

export function timeAgo(iso) {
    const then = new Date(iso).getTime();
    if (!then || Number.isNaN(then)) return "—";
    const mins = Math.max(1, Math.round((Date.now() - then) / 60000));
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.round(hrs / 24)}d ago`;
}

export const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];