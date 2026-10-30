import { useState } from "react";
import { FlaskConical, RotateCcw, ShieldAlert, Radio, Activity, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const ACTIONS = [
    { key: "theft", label: "Theft", icon: ShieldAlert, tone: "text-rose border-rose/30 hover:bg-rose/10" },
    { key: "meter", label: "Meter fault", icon: Gauge, tone: "text-violet border-violet/30 hover:bg-violet/10" },
    { key: "comms", label: "Comms failure", icon: Radio, tone: "text-sky border-sky/30 hover:bg-sky/10" },
    { key: "legit", label: "Legit spike", icon: Activity, tone: "text-volt border-volt/30 hover:bg-volt/10" },
    { key: "reset", label: "Reset", icon: RotateCcw, tone: "text-mint border-mint/30 hover:bg-mint/10" },
];

export default function ScenarioInjector({ consumers, onInject }) {
    const [targetId, setTargetId] = useState(consumers[0]?.consumer_id ?? "");
    const target = consumers.find((c) => c.consumer_id === targetId) ?? consumers[0];

    return (
        <div>
            <p className="mono flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-ink-faint">
                <FlaskConical className="h-3 w-3" /> Scenario injector
            </p>
            <div className="mt-2 space-y-1">
                <Label className="mono text-[9px] uppercase tracking-[0.1em] text-ink-faint">Target meter</Label>
                <Select value={targetId} onValueChange={setTargetId}>
                    <SelectTrigger className="h-8 border-border/80 bg-foreground/[0.03] text-[11px]">
                        <SelectValue placeholder="Pick a meter" />
                    </SelectTrigger>
                    <SelectContent>
                        {consumers.slice(0, 14).map((c) => (
                            <SelectItem key={c.consumer_id} value={c.consumer_id}>
                                {c.consumer_id} · {c.cause}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {ACTIONS.map((a) => (
                    <Button
                        key={a.key}
                        variant="outline"
                        size="sm"
                        disabled={!target}
                        onClick={() => target && onInject(target, a.key)}
                        className={`h-8 gap-1.5 rounded-lg border bg-foreground/[0.02] px-2 text-[10px] ${a.tone}`}
                    >
                        <a.icon className="h-3 w-3" /> {a.label}
                    </Button>
                ))}
            </div>
            <p className="mt-2 text-[10px] leading-snug text-ink-faint">
                The simulator stands in for a real field sensor — an ESP32 energy meter publishing over MQTT can replace it
                without touching the UI.
            </p>
        </div>
    );
}