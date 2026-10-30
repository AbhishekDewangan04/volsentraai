import { Filter, Layers, ThermometerSun } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CAUSES, causeMeta } from "@/lib/gridData";

export default function SceneControls({ filters, setFilters, transformers, feeders, heatmap, setHeatmap, onlySuspicious, setOnlySuspicious }) {
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <div className="w-full space-y-2.5 rounded-xl border border-border/70 bg-surface/85 p-3 backdrop-blur-xl lg:w-[248px]">
      <p className="mono flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-ink-faint">
        <Filter className="h-3 w-3" /> Scene filters
      </p>

      <div className="space-y-1">
        <Label className="mono text-[9px] uppercase tracking-[0.1em] text-ink-faint">Risk band</Label>
        <Select value={filters.risk} onValueChange={(v) => set("risk", v)}>
          <SelectTrigger className="h-7 border-border/80 bg-foreground/[0.03] text-[11px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All risks</SelectItem>
            <SelectItem value="critical">Critical ≥ 80</SelectItem>
            <SelectItem value="high">High ≥ 60</SelectItem>
            <SelectItem value="medium">Medium ≥ 40</SelectItem>
            <SelectItem value="low">Low &lt; 40</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="mono text-[9px] uppercase tracking-[0.1em] text-ink-faint">Feeder</Label>
        <Select value={filters.feeder} onValueChange={(v) => set("feeder", v)}>
          <SelectTrigger className="h-7 border-border/80 bg-foreground/[0.03] text-[11px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All feeders</SelectItem>
            {feeders.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="mono text-[9px] uppercase tracking-[0.1em] text-ink-faint">Transformer</Label>
        <Select value={filters.transformer} onValueChange={(v) => set("transformer", v)}>
          <SelectTrigger className="h-7 border-border/80 bg-foreground/[0.03] text-[11px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All DTs</SelectItem>
            {transformers.map((t) => (
              <SelectItem key={t.transformer_id} value={t.transformer_id}>
                {t.transformer_id} · {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="mono text-[9px] uppercase tracking-[0.1em] text-ink-faint">Category</Label>
        <Select value={filters.category} onValueChange={(v) => set("category", v)}>
          <SelectTrigger className="h-7 border-border/80 bg-foreground/[0.03] text-[11px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {["Residential", "Commercial", "Industrial", "Agricultural"].map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="mono text-[9px] uppercase tracking-[0.1em] text-ink-faint">Cause</Label>
        <Select value={filters.cause} onValueChange={(v) => set("cause", v)}>
          <SelectTrigger className="h-7 border-border/80 bg-foreground/[0.03] text-[11px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All causes</SelectItem>
            {CAUSES.map((c) => (
              <SelectItem key={c} value={c}>
                {causeMeta(c).label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 border-t border-border/60 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-ink-soft">
            <Layers className="h-3 w-3" /> Suspicious clusters
          </span>
          <Switch checked={onlySuspicious} onCheckedChange={setOnlySuspicious} aria-label="Show only suspicious clusters" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[11px] text-ink-soft">
            <ThermometerSun className="h-3 w-3" /> Heatmap mode
          </span>
          <Switch checked={heatmap} onCheckedChange={setHeatmap} aria-label="Heatmap mode" />
        </div>
      </div>
    </div>
  );
}