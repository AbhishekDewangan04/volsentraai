import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CauseChip } from "@/components/common/Chip";
import { causeMeta } from "@/lib/gridData";

export default function ReadingsTable({ rows }) {
    return (
        <div className="max-h-[280px] overflow-y-auto overflow-x-hidden scroll-thin">
            <Table>
                <TableHeader className="sticky top-0 bg-surface/95 backdrop-blur">
                    <TableRow className="border-border/60 hover:bg-transparent">
                        <TableHead className="mono h-8 text-[9px] uppercase tracking-[0.14em] text-ink-faint">Meter</TableHead>
                        <TableHead className="mono h-8 text-[9px] uppercase tracking-[0.14em] text-ink-faint">Reading</TableHead>
                        <TableHead className="mono hidden h-8 text-[9px] uppercase tracking-[0.14em] text-ink-faint sm:table-cell">Δ</TableHead>
                        <TableHead className="mono h-8 text-[9px] uppercase tracking-[0.14em] text-ink-faint">Signal</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((r, i) => (
                        <TableRow key={`${r.consumer_id}-${r.seq}`} className={`border-border/40 ${i === 0 ? "bg-brand/6" : ""}`}>
                            <TableCell className="mono py-2 text-[11px] whitespace-nowrap">
                                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: causeMeta(r.cause).hex }} />
                                {r.consumer_id}
                            </TableCell>
                            <TableCell className="mono py-2 text-[11px] text-ink">{r.kw} kW</TableCell>
                            <TableCell className={`mono hidden py-2 text-[11px] sm:table-cell ${r.delta >= 0 ? "text-mint" : "text-rose"}`}>
                                {r.delta >= 0 ? "+" : ""}
                                {r.delta}%
                            </TableCell>
                            <TableCell className="py-2">
                                <CauseChip cause={r.cause} short />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}