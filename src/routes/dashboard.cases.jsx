import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { DragDropContext } from "@hello-pangea/dnd";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PageHead from "@/components/common/PageHead";
import LiveDot from "@/components/common/LiveDot";
import KanbanColumn from "@/components/cases/KanbanColumn";
import CaseDrawer from "@/components/cases/CaseDrawer";
import { getCases, updateCase } from "@/lib/gridService";
import { CASE_COLUMNS } from "@/lib/gridData";
import { exportCSV } from "@/lib/exporters";

export const Route = createFileRoute("/dashboard/cases")({
    ssr: false,
    head: () => ({ meta: [{ title: "Case Management · Volsentra AI" }] }),
    component: CasesPage,
});

function CasesPage() {
    const queryClient = useQueryClient();
    const { data: cases = [], isLoading } = useQuery({ queryKey: ["cases"], queryFn: getCases });
    const [local, setLocal] = useState([]);
    const [active, setActive] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (cases.length) setLocal(cases);
    }, [cases]);

    const grouped = useMemo(
        () => Object.fromEntries(CASE_COLUMNS.map((c) => [c, local.filter((x) => x.status === c)])),
        [local],
    );

    const refresh = () => queryClient.invalidateQueries({ queryKey: ["cases"] });

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const dragged = local.find((c) => String(c.id) === draggableId);
        if (!dragged) return;

        setLocal((prev) =>
            prev.map((c) =>
                String(c.id) === draggableId
                    ? {
                        ...c,
                        status: destination.droppableId,
                        activity: [...(c.activity ?? []), { author: "You", text: `Moved to ${destination.droppableId}`, at: new Date().toISOString() }],
                    }
                    : c,
            ),
        );

        try {
            await updateCase(dragged.id, {
                status: destination.droppableId,
                activity: [...(dragged.activity ?? []), { author: "You", text: `Moved to ${destination.droppableId}`, at: new Date().toISOString() }],
            });
            toast.success(`${dragged.consumer_id} → ${destination.droppableId}`);
            refresh();
        } catch {
            toast.error("Could not move that case — restoring.");
            refresh();
        }
    };

    const addNote = async (caseItem, text) => {
        setBusy(true);
        const entry = { author: "You", text, at: new Date().toISOString() };
        const nextNotes = [...(caseItem.notes ?? []), entry];
        const nextActivity = [...(caseItem.activity ?? []), { author: "You", text: "Added a note", at: entry.at }];
        setLocal((prev) => prev.map((c) => (c.id === caseItem.id ? { ...c, notes: nextNotes, activity: nextActivity } : c)));
        setActive((prev) => (prev ? { ...prev, notes: nextNotes, activity: nextActivity } : prev));
        try {
            await updateCase(caseItem.id, { notes: nextNotes, activity: nextActivity });
            toast.success("Note added");
            refresh();
        } catch {
            toast.error("Note saved locally only");
        } finally {
            setBusy(false);
        }
    };

    const total = local.length;
    const openCount = local.filter((c) => !["Resolved", "False Positive"].includes(c.status)).length;

    return (
        <>
            <PageHead
                eyebrow="Field operations"
                title="Case"
                titleKey="page.cases"
                highlight="management"
                sub="Drag a case between columns to move the investigation. Every move, note and status change is written to its activity log."
                actions={
                    <>
                        <span className="mono hidden items-center gap-1.5 rounded-full border border-border/70 bg-foreground/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-ink-soft sm:flex">
                            <LiveDot tone="mint" size="h-1.5 w-1.5" /> {openCount} open · {total} total
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 rounded-full border-border/80 bg-foreground/[0.03] text-[12px]"
                            onClick={() => {
                                exportCSV(local, [
                                    { label: "Case", value: (r) => r.consumer_id },
                                    { label: "Consumer", value: (r) => r.consumer_name },
                                    { label: "Status", value: (r) => r.status },
                                    { label: "Cause", value: (r) => r.cause },
                                    { label: "Risk", value: (r) => r.risk_score },
                                    { label: "Assignee", value: (r) => r.assignee },
                                    { label: "Due", value: (r) => r.due_date },
                                ], "volsentra-cases");
                                toast.success("Cases exported");
                            }}
                        >
                            <Download className="h-3.5 w-3.5" /> Export
                        </Button>
                    </>
                }
            />

            {isLoading && local.length === 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                    {CASE_COLUMNS.map((c) => (
                        <div key={c} className="h-[240px] animate-pulse rounded-2xl bg-foreground/[0.04]" />
                    ))}
                </div>
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                        {CASE_COLUMNS.map((status) => (
                            <KanbanColumn
                                key={status}
                                status={status}
                                items={grouped[status] ?? []}
                                onOpen={(c) => {
                                    setActive(c);
                                    setDrawerOpen(true);
                                }}
                            />
                        ))}
                    </div>
                </DragDropContext>
            )}

            <CaseDrawer open={drawerOpen} onOpenChange={setDrawerOpen} caseItem={active} onAddNote={addNote} busy={busy} />
        </>
    );
}