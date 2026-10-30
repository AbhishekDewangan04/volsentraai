import { ArrowRight } from "lucide-react";
import { num } from "@/lib/gridData";

function Connector() {
    return (
        <div className="hidden items-center justify-center sm:flex" aria-hidden="true">
            <svg width="48" height="18" viewBox="0 0 48 18">
                <line x1="2" y1="9" x2="46" y2="9" stroke="rgba(124,92,255,0.5)" strokeWidth="1.4" strokeDasharray="4 4" className="animate-dash" />
                <circle r="2" fill="#FFD84D">
                    <animateMotion dur="1.8s" repeatCount="indefinite" path="M2,9 L46,9" />
                </circle>
            </svg>
        </div>
    );
}

export default function TransformerFlow({ transformers }) {
    const input = transformers.reduce((s, t) => s + (t.input_kwh || 0), 0);
    const billed = transformers.reduce((s, t) => s + (t.billed_kwh || 0), 0);
    const loss = Math.max(0, input - billed);
    const lossPct = input ? (loss / input) * 100 : 0;

    const nodes = [
        { label: "Energy in", value: `${num(input)} kWh`, tone: "text-ink", sub: "DT meters, 30 days" },
        { label: "Billed", value: `${num(billed)} kWh`, tone: "text-mint", sub: "consumer invoices" },
        { label: "Unaccounted", value: `${num(loss)} kWh`, tone: "text-rose", sub: `${lossPct.toFixed(1)}% of input` },
    ];

    return (
        <div>
            <div className="grid items-center gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
                {nodes.map((n, i) => (
                    <div key={n.label} className="contents">
                        <div className="rounded-xl border border-border/70 bg-foreground/[0.03] px-3 py-3">
                            <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">{n.label}</p>
                            <p className={`mono mt-1 text-[15px] font-semibold ${n.tone}`}>{n.value}</p>
                            <p className="mono mt-0.5 text-[9px] text-ink-faint">{n.sub}</p>
                        </div>
                        {i < nodes.length - 1 && <Connector />}
                    </div>
                ))}
            </div>

            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-foreground/[0.06]">
                <div className="h-full bg-gradient-to-r from-mint/70 to-mint" style={{ width: `${100 - lossPct}%` }} />
                <div className="h-full bg-gradient-to-r from-rose to-rose/70" style={{ width: `${lossPct}%` }} />
            </div>
            <div className="mono mt-1.5 flex items-center justify-between text-[9px] uppercase tracking-[0.1em] text-ink-faint">
                <span>billed {(100 - lossPct).toFixed(1)}%</span>
                <span className="flex items-center gap-1 text-rose">
                    loss {lossPct.toFixed(1)}% <ArrowRight className="h-2.5 w-2.5" />
                </span>
            </div>
        </div>
    );
}