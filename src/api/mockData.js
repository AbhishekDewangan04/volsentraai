import { CAUSES, FEEDERS } from "@/lib/gridData";

const stored = () => {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("volsentra.demo.v1") || "null"); } catch { return null; }
};
const causeAt = (i) => i < 140 ? "Normal" : i < 156 ? "Theft/Tampering" : i < 168 ? "Meter Fault" : i < 180 ? "Communication Failure" : i < 190 ? "Legit Abnormal" : "Requires Review";
const seeded = () => {
  const transformers = Array.from({ length: 10 }, (_, i) => {
    const loss_pct = i < 3 ? 18 + i * 2 : 3 + i % 5;
    const input_kwh = 100000 + i * 5000;
    return { id: `trf-${i + 1}`, transformer_id: `TRF-${String(i + 1).padStart(2, "0")}`, name: `Transformer ${String(i + 1).padStart(2, "0")}`, feeder: FEEDERS[i % 3], capacity_kva: 400 + (i % 4) * 100, loss_pct, consumers: 20, input_kwh, billed_kwh: Math.round(input_kwh * (1 - loss_pct / 100)), x: 12 + (i % 5) * 18, z: 12 + Math.floor(i / 5) * 52 };
  });
  const consumers = Array.from({ length: 200 }, (_, i) => {
    const cause = causeAt(i); const transformer = i >= 140 && i < 156 ? (i % 3) + 1 : ((i * 7) % 10) + 1;
    const score = cause === "Theft/Tampering" ? 82 + i % 18 : cause === "Requires Review" ? 55 + i % 25 : cause === "Normal" ? 8 + i % 35 : 45 + i % 40;
    const id = `IN-MH-240${String(100 + i).padStart(3, "0")}`;
    const monthly_readings = Array.from({ length: 12 }, (_, m) => ({ month: m + 1, kwh: 180 + ((i * 31 + m * 17) % 390) }));
    return { id: `consumer-${i + 1}`, consumer_id: id, name: `Consumer ${String(i + 1).padStart(3, "0")}`, feeder: FEEDERS[i % 3], transformer_id: `TRF-${String(transformer).padStart(2, "0")}`, cause, risk_score: score, confidence: 78 + i % 21, status: score >= 55 ? "flagged" : "normal", baseline_kwh: 280 + (i * 37) % 500, actual_kwh: 180 + (i * 29) % 520, last_seen: new Date(Date.now() - i * 60000).toISOString(), reasons: [cause === "Theft/Tampering" ? "Persistent consumption drop" : "Peer variance"], monthly_readings, monthly: monthly_readings.map((reading) => reading.kwh), x: 8 + (i % 20) * 4.2, z: 8 + (Math.floor(i / 20) % 10) * 9 };
  });
  const alerts = consumers.filter(c => c.risk_score >= 75).slice(0, 40).map((c, i) => ({ id: `alert-${i + 1}`, consumer_id: c.consumer_id, title: `${c.cause} · ${c.consumer_id}`, detail: `${c.feeder} · ${c.transformer_id}`, cause: c.cause, severity: c.risk_score >= 85 ? "critical" : "high", status: "open", raised_at: new Date(Date.now() - i * 3600000).toISOString() }));
  const cases = consumers.filter(c => c.risk_score >= 60).slice(0, 28).map((c, i) => ({ id: `case-${i + 1}`, consumer_id: c.consumer_id, consumer_name: c.name, title: `${c.cause} · ${c.consumer_id}`, status: ["New", "Under Review", "Inspection Scheduled"][i % 3], cause: c.cause, risk_score: c.risk_score, priority: c.risk_score >= 85 ? "critical" : "medium", feeder: c.feeder, order: i }));
  return { consumers, transformers, feeders: FEEDERS.map((name, i) => ({ id: `feeder-${i + 1}`, name })), alerts, cases, scenarioRuns: [], settings: { id: "demo-settings", key: "default", risk_threshold: 55, notify: true, reduced_motion: false, api_base_url: "" }, feedback: [], readings: Array.from({ length: 12 }, (_, month) => ({ month: month + 1, consumers: consumers.map(c => ({ consumer_id: c.consumer_id, kwh: c.monthly_readings[month].kwh })) })) };
};
const seed = seeded();
let data = stored() || seed;
data.transformers = (data.transformers || seed.transformers).map((row, i) => ({ ...seed.transformers[i], ...row }));
data.consumers = (data.consumers || seed.consumers).map((row, i) => {
  const defaults = seed.consumers.find((consumer) => consumer.consumer_id === row.consumer_id) || seed.consumers[i];
  return { ...defaults, ...row, monthly: row.monthly ?? row.monthly_readings?.map((reading) => reading.kwh) ?? defaults.monthly };
});
function persist() { if (typeof window !== "undefined") try { localStorage.setItem("volsentra.demo.v1", JSON.stringify(data)); } catch { /* storage can be disabled */ } }
export function getMockData() { return data; }
export function resetMockData() { data = seeded(); persist(); return data; }
export function mockRows(name, limit) { const value = data[name]; const rows = Array.isArray(value) ? value : value ? [value] : []; return limit ? rows.slice(0, limit) : rows; }
export function mockCreate(name, payload) { const row = { id: `${name}-${Date.now()}`, ...payload }; data[name] = [row, ...(data[name] || [])]; persist(); return row; }
export function mockUpdate(name, id, patch) { const rows = data[name] || []; const idx = rows.findIndex(r => r.id === id || r.consumer_id === id); if (idx < 0) return null; rows[idx] = { ...rows[idx], ...patch }; persist(); return rows[idx]; }
export function mockDelete(name, id) { data[name] = (data[name] || []).filter(r => r.id !== id && r.consumer_id !== id); persist(); return true; }
export function mockIsActive() { return true; }
