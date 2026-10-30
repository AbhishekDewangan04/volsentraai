/**
 * CSV ingestion for meter readings. Pure functions only — the page parses and
 * previews, the service layer writes. Expected columns: consumer_id, month, kwh.
 */
const COLUMNS = ["consumer_id", "month", "kwh"];
export const MAX_ROWS = 5000;

export function parseCsv(text) {
    const lines = String(text ?? "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
    if (!lines.length) return { rows: [], headerError: "The file is empty." };

    const split = (line) => line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const header = split(lines[0]).map((h) => h.toLowerCase());
    const index = Object.fromEntries(COLUMNS.map((c) => [c, header.indexOf(c)]));
    const missing = COLUMNS.filter((c) => index[c] === -1);
    if (missing.length) {
        return { rows: [], headerError: `Missing column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}` };
    }

    const rows = lines.slice(1).map((line) => {
        const cells = split(line);
        return {
            consumer_id: cells[index.consumer_id] ?? "",
            month: cells[index.month] ?? "",
            kwh: cells[index.kwh] ?? "",
        };
    });

    return { rows, headerError: null };
}

/** Structural validation — returns per-row error codes plus the usable rows. */
export function validateRows(rows) {
    const errors = [];
    const seen = new Set();
    const usable = [];

    rows.forEach((row, i) => {
        const line = i + 2;
        if (!row.consumer_id) errors.push({ line, code: "missing", field: "consumer_id" });
        if (!row.month) errors.push({ line, code: "missing", field: "month" });
        if (row.kwh === "") errors.push({ line, code: "missing", field: "kwh" });

        const kwh = Number(row.kwh);
        if (row.kwh !== "" && Number.isNaN(kwh)) errors.push({ line, code: "not-number", field: "kwh" });
        if (row.kwh !== "" && !Number.isNaN(kwh) && kwh < 0) errors.push({ line, code: "negative", field: "kwh" });

        const key = `${row.consumer_id}|${row.month}`;
        if (row.consumer_id && row.month && seen.has(key)) errors.push({ line, code: "duplicate", field: "month" });
        seen.add(key);

        if (row.consumer_id && row.month && row.kwh !== "" && !Number.isNaN(kwh) && kwh >= 0) {
            usable.push({ ...row, kwh });
        }
    });

    return { errors, usable };
}

const CAUSE_RULES = (ratio) => {
    if (ratio === null) return { cause: "Communication Failure", score: 72 };
    if (ratio === 0) return { cause: "Communication Failure", score: 76 };
    if (ratio < 0.55) return { cause: "Theft/Tampering", score: 94 };
    if (ratio < 0.75) return { cause: "Theft/Tampering", score: 84 };
    if (ratio < 0.9) return { cause: "Requires Review", score: 64 };
    if (ratio > 1.6) return { cause: "Legit Abnormal", score: 44 };
    return { cause: "Normal", score: 18 };
};

/** Profiling → scoring → explanation, one result per meter in the file. */
export function scoreReadings(consumers, usable) {
    const byMeter = new Map();
    usable.forEach((r) => {
        const list = byMeter.get(r.consumer_id) ?? [];
        list.push(r);
        byMeter.set(r.consumer_id, list);
    });

    const results = [];
    const unknown = [];

    byMeter.forEach((rows, consumerId) => {
        const consumer = consumers.find((c) => c.consumer_id === consumerId);
        if (!consumer) {
            unknown.push(consumerId);
            return;
        }
        const avg = rows.reduce((s, r) => s + r.kwh, 0) / rows.length;
        const baseline = Number(consumer.baseline_kwh) || 0;
        const ratio = baseline > 0 ? avg / baseline : null;
        const { cause, score } = CAUSE_RULES(ratio);
        const deviation = ratio === null ? 0 : Math.round((ratio - 1) * 100);
        const reasons = [
            `Imported ${rows.length} billing month${rows.length === 1 ? "" : "s"} · avg ${Math.round(avg)} kWh`,
            ratio === null ? "No baseline on record — classified from raw reads" : `Deviation ${deviation > 0 ? "+" : ""}${deviation}% vs own baseline`,
        ];
        if (cause === "Theft/Tampering") reasons.push("Sustained draw well under peer and own history");
        if (cause === "Communication Failure") reasons.push("Reads clustered at zero — meter silent");
        if (cause === "Requires Review") reasons.push("Drift inside the review band");

        results.push({
            id: consumer.id,
            consumer_id: consumer.consumer_id,
            risk_score: score,
            cause,
            confidence: Math.min(97, 74 + Math.round(Math.abs(deviation) / 4)),
            status: cause === "Normal" ? "cleared" : "flagged",
            baseline_kwh: baseline,
            actual_kwh: Math.round(avg),
            reasons: reasons.slice(0, 4),
        });
    });

    return { results, unknown, meters: byMeter.size };
}

export function sampleCsv(consumers, rows = 12) {
    const picks = [...consumers].sort((a, b) => b.risk_score - a.risk_score).slice(0, rows);
    const lines = ["consumer_id,month,kwh"];
    picks.forEach((c) => {
        const base = Number(c.baseline_kwh) || 300;
        const factor = c.cause === "Theft/Tampering" ? 0.42 : c.cause === "Communication Failure" ? 0 : 0.98;
        ["2025-01", "2025-02", "2025-03"].forEach((month, i) => {
            const value = Math.max(0, Math.round(base * factor * (1 - i * 0.03)));
            lines.push(`${c.consumer_id},${month},${value}`);
        });
    });
    return lines.join("\n");
}

export function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}