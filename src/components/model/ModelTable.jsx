import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ROWS = [
    { name: "Isolation Forest", precision: 71.4, recall: 64.2, f1: 67.6, auc: 0.841, latency: 38, best: false },
    { name: "XGBoost", precision: 89.6, recall: 86.1, f1: 87.8, auc: 0.938, latency: 74, best: false },
    { name: "LightGBM", precision: 90.8, recall: 88.4, f1: 89.6, auc: 0.946, latency: 51, best: false },
    { name: "LSTM Autoencoder", precision: 84.2, recall: 91.0, f1: 87.5, auc: 0.929, latency: 312, best: false },
    { name: "Hybrid ensemble", precision: 94.2, recall: 91.5, f1: 92.8, auc: 0.972, latency: 190, best: true },
];

export default function ModelTable() {
    return (
        <div className="overflow-x-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-border/60 hover:bg-transparent">
                        {["Model", "Precision", "Recall", "F1", "ROC-AUC", "Latency"].map((h) => (
                            <TableHead key={h} className="mono h-8 px-2 text-[8px] uppercase tracking-[0.12em] text-ink-faint">
                                {h}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ROWS.map((r) => (
                        <TableRow key={r.name} className={r.best ? "border-border/40 bg-brand/8" : "border-border/40"}>
                            <TableCell className="px-2 py-2 text-[11px] text-ink">
                                <span className="flex items-center gap-1.5">
                                    {r.best && <span className="h-1.5 w-1.5 rounded-full bg-brand" />}
                                    {r.name}
                                </span>
                            </TableCell>
                            <TableCell className="mono px-2 py-2 text-[11px] text-ink-soft">{r.precision}%</TableCell>
                            <TableCell className="mono px-2 py-2 text-[11px] text-ink-soft">{r.recall}%</TableCell>
                            <TableCell className="mono px-2 py-2 text-[11px] text-ink-soft">{r.f1}</TableCell>
                            <TableCell className="mono px-2 py-2 text-[11px] text-ink-soft">{r.auc}</TableCell>
                            <TableCell className={`mono px-2 py-2 text-[11px] ${r.latency > 250 ? "text-rose" : "text-mint"}`}>{r.latency}ms</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}