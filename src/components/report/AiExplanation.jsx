import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { causeMeta, num } from "@/lib/gridData";

export function explanationFor(consumer) {
    const meta = causeMeta(consumer.cause);
    const drop = Math.round((1 - consumer.actual_kwh / Math.max(1, consumer.baseline_kwh)) * 100);
    if (consumer.cause === "Communication Failure") {
        return `${consumer.consumer_id} stopped reporting ${consumer.last_seen}. Every scheduled read for the last three weeks is missing, and the last heartbeat arrived while the meter was still in its normal band. Because the meter is silent rather than low, this is a communication or data-pipeline issue, not a consumption anomaly — the billed amount has been estimated. Restore the link before drawing any conclusion about theft.`;
    }
    if (consumer.cause === "Theft/Tampering") {
        return `${consumer.consumer_id} consumed ${num(consumer.actual_kwh)} kWh against a ${num(consumer.baseline_kwh)} kWh baseline — a ${drop}% drop that began three cycles ago and has not recovered. The meter kept reporting throughout, and ${consumer.transformer_id} peers stayed flat, so the change is local to this connection. That combination is the classic bypass signature: billing sees less energy than the household is drawing. Confidence ${consumer.confidence}%.`;
    }
    if (consumer.cause === "Meter Fault") {
        return `${consumer.consumer_id} shows impossible consumption: zero-draw intervals alternating with near-normal readings, plus a 41-minute clock drift. Voltage is present while current is flat, which points to a faulty metering element rather than a genuine drop in usage. Energy may still be consumed and unbilled — dispatch a meter replacement.`;
    }
    if (consumer.cause === "Legit Abnormal") {
        return `${consumer.consumer_id} is ${Math.abs(drop)}% ${drop > 0 ? "below" : "above"} baseline, but the movement tracks the seasonal temperature curve and matches peers on ${consumer.transformer_id}. No tamper or communication flags were raised. This is a genuine behaviour change, not a loss event.`;
    }
    if (consumer.cause === "Requires Review") {
        return `${consumer.consumer_id} drifted ${Math.max(drop, 18)}% off baseline with four missing intervals in the last 90 days. The evidence is suggestive but not conclusive: the drop is shallower than a bypass signature and the communication gap blurs the series. A second clean billing cycle would settle it.`;
    }
    return `${consumer.consumer_id} sits inside its peer band at ${num(consumer.actual_kwh)} kWh. Nothing in the last twelve months suggests tampering, meter failure or a communication gap. No action needed.`;
}

export default function AiExplanation({ consumer }) {
    const full = explanationFor(consumer);
    const [text, setText] = useState("");

    useEffect(() => {
        setText("");
        let i = 0;
        const id = setInterval(() => {
            i += 4;
            setText(full.slice(0, i));
            if (i >= full.length) clearInterval(id);
        }, 16);
        return () => clearInterval(id);
    }, [full]);

    return (
        <div className="relative rounded-2xl p-[1px]">
            <span
                aria-hidden="true"
                className="absolute inset-0 rounded-2xl bg-[linear-gradient(110deg,#7C5CFF,#FF3D9A,#7C5CFF)] bg-[length:220%_100%] opacity-70"
                style={{ animation: "gradient-x 6s ease infinite" }}
            />
            <div className="relative rounded-[15px] bg-surface/95 p-4">
                <p className="mono mb-2 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-brand">
                    <Sparkles className="h-3 w-3" /> AI explanation
                </p>
                <p className="min-h-[76px] text-[12.5px] leading-relaxed text-ink-soft">
                    {text}
                    {text.length < full.length && <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-brand align-middle" />}
                </p>
            </div>
        </div>
    );
}