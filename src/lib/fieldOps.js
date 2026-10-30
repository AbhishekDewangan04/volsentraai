/**
 * Field route planning. Stops come from open cases; visit order is a greedy
 * nearest-neighbour walk from the depot so the list and the map always agree.
 */
export const DEPOT = { x: 50, y: 10, label: "Depot" };
const KM_PER_UNIT = 0.22;
const MIN_PER_KM = 3.2;
const ON_SITE_MIN = 14;

const hash = (str = "") => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i += 1) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
};

/** Stable pseudo-position per meter — the demo grid has no geo column. */
export function positionOf(consumerId) {
    const h = hash(consumerId);
    return { x: 10 + (h % 80), y: 20 + ((h >>> 5) % 68) };
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

const PRIORITY = (risk) => (risk >= 80 ? "critical" : risk >= 65 ? "high" : risk >= 55 ? "medium" : "low");

export function buildQueue(cases, consumers) {
    const open = cases.filter((c) => ["New", "Under Review", "Inspection Scheduled"].includes(c.status));
    const rows = open
        .map((c) => {
            const consumer = consumers.find((x) => x.consumer_id === c.consumer_id);
            if (!consumer) return null;
            return { caseRecord: c, consumer, pos: positionOf(consumer.consumer_id) };
        })
        .filter(Boolean)
        .sort((a, b) => b.consumer.risk_score - a.consumer.risk_score || (a.caseRecord.order ?? 0) - (b.caseRecord.order ?? 0));

    let cursor = DEPOT;
    let totalKm = 0;
    const stops = rows.map((row, i) => {
        const legKm = dist(cursor, row.pos) * KM_PER_UNIT;
        totalKm += legKm;
        cursor = row.pos;
        return {
            ...row,
            visit: i + 1,
            legKm: Number(legKm.toFixed(1)),
            etaMin: Math.round(legKm * MIN_PER_KM + ON_SITE_MIN),
            priority: PRIORITY(row.consumer.risk_score),
            recoverable: Math.round(Math.max(0, (row.consumer.baseline_kwh || 0) - (row.consumer.actual_kwh || 0)) * 8.4),
        };
    });

    const totalMin = stops.reduce((s, x) => s + x.etaMin, 0);
    return { stops, totalKm: Number(totalKm.toFixed(1)), totalMin };
}

/** Cumulative distance from the depot to each stop, for the ETA column. */
export function withCumulative(stops) {
    let km = 0;
    return stops.map((s) => {
        km += s.legKm;
        return { ...s, km: Number(km.toFixed(1)) };
    });
}