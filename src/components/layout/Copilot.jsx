import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getConsumers, getTransformers } from "@/lib/gridService";
import { compact, inr, num } from "@/lib/gridData";
import LiveDot from "@/components/common/LiveDot";
import { useMotionOff } from "@/lib/useMotionPref";

const SUGGESTIONS = [
    "Which transformer has the highest loss?",
    "Why was IN-MH-240101 flagged?",
    "How many consumers are high risk?",
];

function answerFor(question, consumers, transformers) {
    const q = question.toLowerCase();
    const idMatch = question.match(/IN-MH-\d+/i);

    if (idMatch) {
        const c = consumers.find((x) => x.consumer_id.toUpperCase() === idMatch[0].toUpperCase());
        if (!c) return `I can't find ${idMatch[0]} on this grid. It may be outside the 200-meter demo set.`;
        return `${c.consumer_id} (${c.name}, ${c.category}, ${c.area}) is scored ${c.risk_score}/100 and classified ${c.cause} at ${c.confidence}% confidence. Its 12-month baseline is ${num(c.baseline_kwh)} kWh; last billed month was ${num(c.actual_kwh)} kWh. The three signals that moved the score: ${c.reasons.slice(0, 3).join("; ")}. It sits on ${c.transformer_id} under the ${c.feeder} feeder.`;
    }

    if (q.includes("transformer") && (q.includes("loss") || q.includes("highest") || q.includes("worst"))) {
        const t = [...transformers].sort((a, b) => b.loss_pct - a.loss_pct)[0];
        if (!t) return "Transformer data is still loading.";
        const thefts = consumers.filter((c) => c.transformer_id === t.transformer_id && c.cause === "Theft/Tampering").length;
        return `${t.transformer_id} · ${t.name} (${t.feeder}) carries the highest loss at ${t.loss_pct}%. Input ${num(t.input_kwh)} kWh against ${num(t.billed_kwh)} kWh billed — ${num(t.input_kwh - t.billed_kwh)} kWh unaccounted, roughly ${inr((t.input_kwh - t.billed_kwh) * 8.4)} a month at ₹8.40/kWh. ${thefts} theft-classified meters are clustered on this transformer, which is why it tops the inspection list.`;
    }

    if (q.includes("feeder")) {
        const feeders = [...new Set(consumers.map((c) => c.feeder))];
        const worst = feeders
            .map((f) => ({ f, risk: consumers.filter((c) => c.feeder === f).reduce((s, c) => s + c.risk_score, 0) / Math.max(1, consumers.filter((c) => c.feeder === f).length) }))
            .sort((a, b) => b.risk - a.risk)[0];
        return `Three feeders are live: North Loop, Central Industrial and East Residential. ${worst.f} carries the highest average risk at ${Math.round(worst.risk)}/100, driven by theft clusters on transformers TRF-02, TRF-05 and TRF-07. Recovered units there would move the needle fastest.`;
    }

    if (q.includes("how many") || q.includes("count") || q.includes("high risk")) {
        const high = consumers.filter((c) => c.risk_score >= 55);
        const critical = consumers.filter((c) => c.risk_score >= 80);
        return `Of ${consumers.length} meters, ${high.length} score 55 or above and ${critical.length} are already critical (≥80). Theft dominates the top of the queue: ${consumers.filter((c) => c.cause === "Theft/Tampering").length} meters carry a theft/tampering classification. That's roughly ${compact((high.length / consumers.length) * 100)}% of the grid needing human eyes.`;
    }

    if (q.includes("case")) {
        return `Cases flow through six columns: New, Under Review, Inspection Scheduled, Confirmed Theft, Resolved and False Positive. Drag a card in Case Management to move it; every move writes back to the case record and its activity log.`;
    }

    const top = [...consumers].sort((a, b) => b.risk_score - a.risk_score)[0];
    if (!top) return "I'm still loading the grid. Give me a second and ask again.";
    return `Right now ${consumers.length} meters across ${transformers.length} transformers are scored. The loudest signal is ${top.consumer_id} at ${top.risk_score}/100 — ${top.cause}, ${top.confidence}% confidence, on ${top.transformer_id}. Ask me "why was ${top.consumer_id} flagged?" for the evidence trail, or "which transformer has the highest loss?" to see where the money leaks.`;
}

export default function Copilot() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: "I'm Volsentra Copilot. I read the same scored grid the console does — ask about a meter, a transformer, or where the loss is concentrating.",
        },
    ]);
    const [hoverSpark, setHoverSpark] = useState(false);
    const [ripples, setRipples] = useState([]);
    const motionOff = useMotionOff();
    const timers = useRef([]);
    const { data: consumers = [] } = useQuery({ queryKey: ["consumers"], queryFn: getConsumers });
    const { data: transformers = [] } = useQuery({ queryKey: ["transformers"], queryFn: getTransformers });

    useEffect(() => () => timers.current.forEach(clearInterval), []);

    const stream = (full) => {
        const idx = { i: 0 };
        setMessages((prev) => [...prev, { role: "assistant", text: "", typing: true }]);
        const id = setInterval(() => {
            idx.i += 3;
            const slice = full.slice(0, idx.i);
            setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: "assistant", text: slice, typing: slice.length < full.length };
                return next;
            });
            if (idx.i >= full.length) clearInterval(id);
        }, 16);
        timers.current.push(id);
    };

    const send = (question) => {
        const text = (question ?? input).trim();
        if (!text) return;
        setMessages((prev) => [...prev, { role: "user", text }]);
        setInput("");
        stream(answerFor(text, consumers, transformers));
    };

    return (
        <>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 260, damping: 24 }}
                        className="fixed bottom-20 right-3 z-50 flex h-[min(520px,72vh)] w-[min(380px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface/95 shadow-panel backdrop-blur-xl sm:bottom-24 sm:right-6"
                    >
                        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-2">
                                    <Sparkles className="h-3.5 w-3.5 text-white" />
                                </span>
                                <div>
                                    <p className="text-[13px] font-medium text-ink">Ask Volsentra</p>
                                    <p className="mono flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-ink-faint">
                                        <LiveDot tone="mint" size="h-1 w-1" /> grounded in your data
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" aria-label="Close copilot" onClick={() => setOpen(false)} className="h-8 w-8 rounded-full text-ink-faint hover:text-ink">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="scroll-thin flex-1 space-y-3 overflow-y-auto px-4 py-3">
                            {messages.map((m, i) => (
                                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                                    <p
                                        className={
                                            m.role === "user"
                                                ? "max-w-[85%] rounded-2xl rounded-br-sm bg-brand px-3 py-2 text-[12px] leading-relaxed text-white"
                                                : "max-w-[92%] rounded-2xl rounded-bl-sm border border-border/70 bg-foreground/[0.04] px-3 py-2 text-[12px] leading-relaxed text-ink-soft"
                                        }
                                    >
                                        {m.text}
                                        {m.typing && <span className="ml-0.5 inline-block h-3 w-[2px] animate-pulse bg-brand align-middle" />}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-border/70 px-3 py-2">
                            <div className="mb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => send(s)}
                                        className="mono shrink-0 rounded-full border border-border/80 bg-foreground/[0.03] px-2.5 py-1 text-[10px] text-ink-soft transition-colors hover:border-brand/40 hover:text-ink"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    send();
                                }}
                                className="flex items-center gap-2"
                            >
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Why was this meter flagged?"
                                    className="h-9 border-border/80 bg-foreground/[0.03] text-[12px]"
                                />
                                <Button type="submit" size="icon" className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-brand to-brand-2 text-white" aria-label="Send">
                                    <ArrowUp className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                type="button"
                onClick={(e) => {
                    setRipples((r) => [...r, { id: Date.now(), x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }]);
                    setTimeout(() => setRipples((r) => r.slice(1)), 620);
                    setOpen((v) => !v);
                }}
                onMouseEnter={() => setHoverSpark(true)}
                onMouseLeave={() => setHoverSpark(false)}
                whileTap={{ scale: 0.96 }}
                aria-label="Ask Volsentra"
                className="group fixed bottom-[74px] right-3 z-40 flex h-11 items-center gap-2 overflow-hidden rounded-full border border-brand/40 bg-background/75 px-4 text-[12px] font-medium text-ink shadow-glow-brand backdrop-blur-xl sm:bottom-6 sm:right-6"
            >
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-brand/30 to-brand-2/30" />
                <span className="relative z-10 flex items-center gap-2">
                    <span className="relative grid h-5 w-5 place-items-center">
                        <span className="absolute h-2.5 w-2.5 rounded-full bg-brand animate-pulse-ring" />
                        <span className="absolute h-3 w-3 rounded-full bg-brand/40 blur-[4px]" />
                        <Sparkles className="relative h-3.5 w-3.5 text-white" />
                    </span>
                    <span className="hidden sm:inline">Ask Volsentra</span>
                    <span className="sm:hidden">Ask</span>
                </span>

                {hoverSpark && !motionOff && (
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <motion.span
                                key={i}
                                className="absolute h-1 w-1 rounded-full bg-white/80"
                                style={{ left: `${18 + i * 15}%`, top: "60%" }}
                                animate={{ y: [-2, -14 - i * 2], opacity: [0, 1, 0], scale: [1, 0.4] }}
                                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12, ease: "easeOut" }}
                            />
                        ))}
                    </span>
                )}

                {ripples.map((r) => (
                    <motion.span
                        key={r.id}
                        className="pointer-events-none absolute h-4 w-4 rounded-full bg-white/40"
                        style={{ left: r.x, top: r.y }}
                        initial={{ scale: 0, opacity: 0.6 }}
                        animate={{ scale: 14, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                ))}
            </motion.button>
        </>
    );
}