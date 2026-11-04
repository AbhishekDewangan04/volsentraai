/**
 * Single data seam for Volsentra.
 * Provides grid data, telemetry, and case operations using local state / storage,
 * and seamlessly reads from a custom API base URL if configured in Settings.
 */
import { CAUSES } from "@/lib/gridData";
import { getMockData, mockRows, mockCreate, mockUpdate, mockDelete } from "@/api/mockData";
import { isDemoMode } from "@/lib/demoMode";

let apiBase = "";
export { isDemoMode };

export function subscribeDemoMode(listener) {
    const timer = setInterval(() => listener(true), 1000);
    return () => clearInterval(timer);
}

export const setApiBase = (url) => {
    apiBase = (url || "").replace(/\/$/, "");
};

async function remote(path) {
    if (!apiBase) return null;
    try {
        const res = await fetch(`${apiBase}${path}`, { headers: { Accept: "application/json" } });
        if (!res.ok) return null;
        const json = await res.json();
        return Array.isArray(json) ? json : (json?.items ?? null);
    } catch {
        return null;
    }
}

export async function getConsumers() {
    const remoteRows = await remote("/consumers");
    if (remoteRows) return remoteRows;
    return mockRows("consumers");
}

export async function getConsumer(consumerId) {
    const rows = await getConsumers();
    return rows.find((c) => c.consumer_id === consumerId || c.id === consumerId) ?? null;
}

export async function getTransformers() {
    const remoteRows = await remote("/transformers");
    if (remoteRows) return remoteRows;
    return mockRows("transformers");
}

export async function getFeeders() {
    const remoteRows = await remote("/feeders");
    if (remoteRows) return remoteRows;
    return mockRows("feeders");
}

export async function getAlerts(limit = 40) {
    const remoteRows = await remote("/alerts");
    if (remoteRows) return remoteRows.slice(0, limit);
    return mockRows("alerts", limit);
}

export async function getCases() {
    const remoteRows = await remote("/cases");
    if (remoteRows) return remoteRows;
    return mockRows("cases");
}

export async function getScenarioRuns() {
    return mockRows("scenarioRuns");
}

export async function createScenarioRun(payload) {
    return mockCreate("scenarioRuns", payload);
}

export async function createCase(payload) {
    return mockCreate("cases", payload);
}

export async function updateCase(id, patch) {
    return mockUpdate("cases", id, patch);
}

export async function deleteCase(id) {
    return mockDelete("cases", id);
}

export async function updateAlert(id, patch) {
    return mockUpdate("alerts", id, patch);
}

export async function deleteAlert(id) {
    return mockDelete("alerts", id);
}

export async function getSettings() {
    return (
        mockRows("settings").find((r) => r.key === "default") ?? {
            key: "default",
            risk_threshold: 55,
            notify: true,
            reduced_motion: false,
            api_base_url: "",
        }
    );
}

export async function saveSettings(id, patch) {
    const next = { ...getMockData().settings, ...patch };
    getMockData().settings = next;
    try {
        localStorage.setItem("volsentra.demo.v1", JSON.stringify(getMockData()));
    } catch {
        /* storage can be disabled */
    }
    return next;
}

export async function deleteSettings(id) {
    getMockData().settings = { key: "default", risk_threshold: 55, notify: true, reduced_motion: false, api_base_url: "" };
    return getMockData().settings;
}

/* ---------- derived analytics (pure, computed from the same rows) ---------- */

export function kpis(consumers, transformers, cases, alerts) {
    const flagged = consumers.filter((c) => c.risk_score >= 55);
    const openCases = cases.filter((c) => !["Resolved", "False Positive"].includes(c.status));
    const lossKwh = consumers.reduce((sum, c) => sum + Math.max(0, (c.baseline_kwh || 0) - (c.actual_kwh || 0)), 0);
    const lossRs = lossKwh * 8.4;
    return {
        consumers: consumers.length,
        highRisk: flagged.length,
        openCases: openCases.length,
        lossKwh: Math.round(lossKwh),
        lossRs: Math.round(lossRs),
        activeAlerts: alerts.filter((a) => a.status === "open").length,
        latency: 412,
        transformers: transformers.length,
    };
}

export function causeBreakdown(consumers) {
    return CAUSES.map((cause) => ({
        cause,
        count: consumers.filter((c) => c.cause === cause).length,
    })).filter((r) => r.count > 0);
}

export function riskByFeeder(consumers) {
    return [...new Set(consumers.map((c) => c.feeder))].map((feeder) => {
        const rows = consumers.filter((c) => c.feeder === feeder);
        const avg = rows.reduce((s, c) => s + c.risk_score, 0) / Math.max(1, rows.length);
        return {
            feeder,
            avgRisk: Math.round(avg),
            flagged: rows.filter((c) => c.risk_score >= 55).length,
            total: rows.length,
        };
    });
}

/** 24-hour load profile, deterministic from the grid's own baseline. */
export function loadSeries(consumers, points = 24) {
    const base = consumers.reduce((s, c) => s + (c.actual_kwh || 0), 0) / 24 / 1000;
    return Array.from({ length: points }, (_, i) => {
        const hour = (i * 24) / points;
        const shape = 0.62 + 0.38 * Math.sin(((hour - 6) / 24) * Math.PI * 2) + 0.12 * Math.sin(hour / 2.2);
        return {
            t: `${String(Math.floor(hour)).padStart(2, "0")}:00`,
            mw: Number((base * (0.82 + shape * 0.4)).toFixed(1)),
            forecast: Number((base * (0.8 + shape * 0.38)).toFixed(1)),
        };
    });
}

/** Same 24-hour profile shape, resampled to whatever time range the chart asks for. */
export function loadSeriesFor(consumers, range = "24H") {
    const day = loadSeries(consumers, 24);
    const avg = day.reduce((s, d) => s + d.mw, 0) / Math.max(1, day.length);
    const wave = (i, a = 0.08, b = 0.05) => 1 + Math.sin(i / 3) * a + Math.sin(i / 7) * b;

    if (range === "1H") {
        return Array.from({ length: 60 }, (_, i) => {
            const mw = Number((avg * wave(i, 0.05, 0.03)).toFixed(2));
            return { t: `09:${String(i).padStart(2, "0")}`, mw, forecast: Number((mw * 1.012).toFixed(2)) };
        });
    }
    if (range === "7D") {
        const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return labels.map((t, i) => {
            const mw = Number((avg * 24 * (0.94 + Math.sin(i / 1.6) * 0.08 + i * 0.004)).toFixed(0));
            return { t, mw, forecast: Number((mw * 0.985).toFixed(0)) };
        });
    }
    if (range === "30D") {
        return Array.from({ length: 30 }, (_, i) => {
            const mw = Number((avg * 24 * (0.9 + Math.sin(i / 4) * 0.12 + i * 0.003)).toFixed(0));
            return { t: String(i + 1).padStart(2, "0"), mw, forecast: Number((mw * 0.99).toFixed(0)) };
        });
    }
    if (range === "12M") {
        const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return labels.map((t, i) => {
            const seasonal = 1 + Math.cos(((i - 5) / 12) * Math.PI * 2) * 0.22;
            const mw = Number((avg * 24 * 30 * seasonal * 0.001).toFixed(0));
            return { t, mw, forecast: Number((mw * 0.96).toFixed(0)) };
        });
    }
    return day;
}

export function priorityList(consumers, limit = 10) {
    return [...consumers]
        .sort((a, b) => b.risk_score - a.risk_score)
        .slice(0, limit)
        .map((c) => ({
            ...c,
            expectedRecovery: Math.round(Math.max(0, (c.baseline_kwh - c.actual_kwh) * 8.4 * 3)),
        }));
}

export function transformerClusters(consumers, transformers) {
    return transformers
        .map((t) => {
            const rows = consumers.filter((c) => c.transformer_id === t.transformer_id);
            const suspicious = rows.filter((c) => ["Theft/Tampering", "Requires Review"].includes(c.cause));
            return {
                ...t,
                suspiciousCount: suspicious.length,
                avgRisk: Math.round(rows.reduce((s, c) => s + c.risk_score, 0) / Math.max(1, rows.length)),
                sample: suspicious.slice(0, 4),
            };
        })
        .sort((a, b) => b.loss_pct - a.loss_pct);
}

/* ---------- CSV detection import ---------- */

/** Writes one detection result per meter. */
export async function applyDetectionResults(results = []) {
    results.forEach((r) => mockUpdate("consumers", r.id ?? r.consumer_id, r));
    return results.length;
}

/* ---------- field inspection outcome ---------- */

const OUTCOME = {
    confirmed: { consumerStatus: "flagged", cause: "Theft/Tampering", caseStatus: "Confirmed Theft", severity: "critical" },
    false_positive: { consumerStatus: "cleared", cause: "Normal", caseStatus: "False Positive", severity: "low" },
    revisit: { consumerStatus: "flagged", cause: "Requires Review", caseStatus: "Inspection Scheduled", severity: "medium" },
};

const nextScore = (score, outcome) => {
    const base = Number(score) || 0;
    if (outcome === "confirmed") return Math.min(100, Math.round(base + 6));
    if (outcome === "false_positive") return Math.max(0, Math.round(base * 0.45));
    return Math.max(0, Math.round(base - 4));
};

/**
 * One field outcome moves three records: the meter, its case and its alert.
 */
export async function resolveInspection({ consumer, caseRecord, outcome, checklist = {}, notes = "", photoUri = "" }) {
    const rule = OUTCOME[outcome] ?? OUTCOME.revisit;
    const score = nextScore(consumer.risk_score, outcome);
    const evidence = [
        checklist.seal ? "seal broken" : null,
        checklist.bypass ? "bypass found" : null,
        checklist.illegal ? "illegal connection" : null,
        checklist.reading ? `field reading ${checklist.reading} kWh` : null,
    ].filter(Boolean);
    const at = new Date().toISOString();

    const updatedConsumer = mockUpdate("consumers", consumer.id, {
        risk_score: score,
        cause: rule.cause,
        status: rule.consumerStatus,
        last_seen: at,
        reasons: [...evidence, ...(consumer.reasons ?? [])].slice(0, 6),
    });

    const updatedCase = caseRecord?.id
        ? mockUpdate("cases", caseRecord.id, {
            status: rule.caseStatus,
            cause: rule.cause,
            risk_score: score,
            activity: [...(caseRecord.activity ?? []), { author: "Field inspector", text: `Outcome: ${rule.caseStatus}`, at }],
        })
        : mockCreate("cases", {
            consumer_id: consumer.consumer_id,
            consumer_name: consumer.name,
            title: `${rule.caseStatus} · ${consumer.name}`,
            status: rule.caseStatus,
            cause: rule.cause,
            risk_score: score,
            priority: "medium",
            feeder: consumer.feeder,
            order: 0,
        });

    mockCreate("alerts", {
        consumer_id: consumer.consumer_id,
        title: `${rule.caseStatus} · ${consumer.consumer_id}`,
        detail: `Field visit ${at.slice(0, 10)}`,
        cause: rule.cause,
        severity: rule.severity,
        status: "closed",
        raised_at: at,
        feeder: consumer.feeder,
    });

    mockCreate("feedback", {
        consumer_id: consumer.consumer_id,
        outcome,
        risk_before: Number(consumer.risk_score) || 0,
        risk_after: score,
        checklist,
        notes,
        photo_uri: photoUri,
        at,
    });

    return { consumer: updatedConsumer, caseRecord: updatedCase, score };
}

export async function getModelFeedback() {
    return mockRows("feedback");
}
