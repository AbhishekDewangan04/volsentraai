const DEFAULT = { tp: 148, fp: 9, fn: 14, tn: 1229 };

export default function ConfusionHeatmap({ counts }) {
    const v = counts ?? DEFAULT;
    const CELLS = [
        { label: "True positive", value: v.tp, tone: "bg-rose/60" },
        { label: "False positive", value: v.fp, tone: "bg-amber/40" },
        { label: "False negative", value: v.fn, tone: "bg-amber/40" },
        { label: "True negative", value: v.tn, tone: "bg-mint/45" },
    ];

    return (
        <div>
            <div className="grid grid-cols-[auto_1fr_1fr] gap-1">
                <span />
                <span className="mono text-center text-[8px] uppercase tracking-[0.1em] text-ink-faint">pred theft</span>
                <span className="mono text-center text-[8px] uppercase tracking-[0.1em] text-ink-faint">pred normal</span>

                <span className="mono flex items-center pr-1 text-[8px] uppercase tracking-[0.1em] text-ink-faint">act theft</span>
                <div className={`grid aspect-[4/3] place-items-center rounded-lg ${CELLS[0].tone}`}>
                    <div className="text-center">
                        <p className="mono text-[18px] font-semibold text-ink">{CELLS[0].value}</p>
                        <p className="mono text-[7px] uppercase tracking-[0.1em] text-ink-soft">TP</p>
                    </div>
                </div>
                <div className={`grid aspect-[4/3] place-items-center rounded-lg ${CELLS[2].tone}`}>
                    <div className="text-center">
                        <p className="mono text-[18px] font-semibold text-ink">{CELLS[2].value}</p>
                        <p className="mono text-[7px] uppercase tracking-[0.1em] text-ink-soft">FN</p>
                    </div>
                </div>

                <span className="mono flex items-center pr-1 text-[8px] uppercase tracking-[0.1em] text-ink-faint">act normal</span>
                <div className={`grid aspect-[4/3] place-items-center rounded-lg ${CELLS[1].tone}`}>
                    <div className="text-center">
                        <p className="mono text-[20px] font-semibold text-ink">{CELLS[1].value}</p>
                        <p className="mono text-[7px] uppercase tracking-[0.1em] text-ink-soft">FP</p>
                    </div>
                </div>
                <div className={`grid aspect-[4/3] place-items-center rounded-lg ${CELLS[3].tone}`}>
                    <div className="text-center">
                        <p className="mono text-[20px] font-semibold text-ink">{CELLS[3].value}</p>
                        <p className="mono text-[7px] uppercase tracking-[0.1em] text-ink-soft">TN</p>
                    </div>
                </div>
            </div>
            <p className="mono mt-2 text-[9px] text-ink-faint">1,400 held-out meter-months · label = confirmed field outcome</p>
        </div>
    );
}