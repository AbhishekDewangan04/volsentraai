
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Boxes, Radio, FlaskConical, ShieldAlert, Users } from "lucide-react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { getConsumers, getTransformers } from "@/lib/gridService";
import { useGrid } from "@/lib/GridContext";
import { NAV, navKey } from "@/components/layout/Sidebar";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function CommandPalette({ open, onOpenChange }) {
    const { t } = useI18n();
    const navigate = useNavigate();
    const { injectScenario } = useGrid();
    const { data: consumers = [] } = useQuery({ queryKey: ["consumers"], queryFn: getConsumers });
    const { data: transformers = [] } = useQuery({ queryKey: ["transformers"], queryFn: getTransformers });

    const topConsumers = useMemo(() => [...consumers].sort((a, b) => b.risk_score - a.risk_score).slice(0, 8), [consumers]);
    const go = (to) => {
        onOpenChange(false);
        navigate({ to });
    };

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput placeholder="Search pages, consumers, transformers or actions…" />
            <CommandList className="max-h-[420px]">
                <CommandEmpty>No matches.</CommandEmpty>

                <CommandGroup heading="Pages">
                    {NAV.flatMap((s) => s.items).map((item) => (
                        <CommandItem key={item.to} value={`page ${t(navKey(item.to))}`} onSelect={() => go(item.to)}>
                            <item.icon className="mr-2 h-4 w-4 text-ink-faint" />
                            {t(navKey(item.to))}
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />
                <CommandGroup heading="Consumers">
                    {topConsumers.map((c) => (
                        <CommandItem
                            key={c.consumer_id}
                            value={`consumer ${c.consumer_id} ${c.name} ${c.cause}`}
                            onSelect={() => go(`/dashboard/consumers/${c.consumer_id}`)}
                        >
                            <Users className="mr-2 h-4 w-4 text-ink-faint" />
                            <span className="mono">{c.consumer_id}</span>
                            <span className="ml-2 truncate text-ink-faint">{c.cause}</span>
                            <span className="mono ml-auto text-rose">{c.risk_score}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />
                <CommandGroup heading="Transformers">
                    {transformers.slice(0, 6).map((t) => (
                        <CommandItem
                            key={t.transformer_id}
                            value={`transformer ${t.transformer_id} ${t.name} ${t.feeder}`}
                            onSelect={() => go("/dashboard/transformers")}
                        >
                            <Boxes className="mr-2 h-4 w-4 text-ink-faint" />
                            <span className="mono">{t.transformer_id}</span>
                            <span className="ml-2 truncate text-ink-faint">{t.name}</span>
                            <span className="mono ml-auto text-amber">{t.loss_pct}% loss</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />
                <CommandGroup heading="Actions">
                    <CommandItem
                        value="action inject theft on a consumer"
                        onSelect={() => {
                            const target = topConsumers[0];
                            onOpenChange(false);
                            if (target) {
                                injectScenario(target, "theft");
                                navigate({ to: "/dashboard/live" });
                            } else toast.error("No consumer available to inject.");
                        }}
                    >
                        <ShieldAlert className="mr-2 h-4 w-4 text-rose" /> Inject a theft scenario
                    </CommandItem>
                    <CommandItem value="action run scenario lab" onSelect={() => go("/dashboard/scenarios")}>
                        <FlaskConical className="mr-2 h-4 w-4 text-violet" /> Run a scenario batch
                    </CommandItem>
                    <CommandItem value="action open live stream" onSelect={() => go("/dashboard/live")}>
                        <Radio className="mr-2 h-4 w-4 text-sky" /> Open the live meter stream
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}