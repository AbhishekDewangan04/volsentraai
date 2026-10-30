import { Languages } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LANGS, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function LangToggle() {
    const { lang, setLang, t } = useI18n();
    const active = LANGS.find((l) => l.key === lang) ?? LANGS[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    aria-label={t("top.language")}
                    className="h-9 gap-1.5 rounded-full px-2 text-[11px] text-ink-soft hover:text-ink"
                >
                    <Languages className="h-3.5 w-3.5" />
                    <span className="mono">{active.short}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 border-border/80 bg-popover">
                <DropdownMenuLabel className="mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                    {t("top.language")}
                </DropdownMenuLabel>
                {LANGS.map((l) => (
                    <DropdownMenuItem
                        key={l.key}
                        onClick={() => setLang(l.key)}
                        className={cn("flex items-center justify-between gap-2 text-[12px]", l.key === lang && "text-brand")}
                    >
                        <span>{l.name}</span>
                        <span className="mono text-[10px] text-ink-faint">{l.short}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}