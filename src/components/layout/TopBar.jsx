import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronRight, LogIn, LogOut, Search, Settings as SettingsIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/common/ThemeToggle";
import LangToggle from "@/components/layout/LangToggle";
import { SeverityChip } from "@/components/common/Chip";
import LiveDot from "@/components/common/LiveDot";
import { useAuth } from "@/lib/AuthContext";
import { getAlerts, isDemoMode, subscribeDemoMode } from "@/lib/gridService";
import { timeAgo } from "@/lib/gridData";
import { useGrid } from "@/lib/GridContext";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

const LABELS = {
    dashboard: "nav.command",
    consumers: "nav.consumers",
    grid: "nav.grid",
    live: "nav.live",
    transformers: "nav.transformers",
    cases: "nav.cases",
    scenarios: "nav.scenarios",
    model: "nav.model",
    settings: "nav.settings",
    field: "nav.field",
};

export default function TopBar({ onOpenPalette }) {
    const [demoData, setDemoData] = useState(isDemoMode());
    useEffect(() => subscribeDemoMode(setDemoData), []);
    const navigate = useNavigate();
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const { user, loading, isDemo, signOut } = useAuth();
    const { liveAlerts } = useGrid();
    const { t } = useI18n();

    const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: () => getAlerts(8) });
    const unread = liveAlerts.length + alerts.filter((a) => a.status === "open").length;

    const segments = pathname.split("/").filter(Boolean);
    const crumbs = segments
        .slice(1)
        .map((seg) => ({ seg, label: LABELS[seg] ? t(LABELS[seg]) : seg }))
        .filter((c) => !/^IN-MH/.test(c.seg) || true);

    const displayName = user?.name || user?.email || "Guest";
    const initials = (user?.name || user?.email || "GA").slice(0, 2).toUpperCase();

    return (
        <header className="sticky top-0 z-30 border-b border-border/70 glass">
            <div className="flex h-14 items-center gap-2 px-3 sm:px-5">
                <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 body">
                    <Link to="/dashboard" className="mono shrink-0 text-[11px] uppercase tracking-[0.14em] text-ink-faint hover:text-ink">
                        volsentra
                    </Link>
                    {crumbs.map((c, i) => (
                        <span key={`${c.seg}-${i}`} className="flex min-w-0 items-center gap-1.5">
                            <ChevronRight className="h-3 w-3 shrink-0 text-ink-faint" />
                            <span
                                className={`mono truncate text-[11px] uppercase tracking-[0.14em] ${i === crumbs.length - 1 ? "text-ink" : "text-ink-faint"
                                    }`}
                            >
                                {c.label}
                            </span>
                        </span>
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-1.5">
                    {/* Demo chip if in demo auth session */}
                    {isDemo && (
                        <span className="mono rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[9px] font-semibold tracking-[0.12em] text-sky-400">
                            Demo
                        </span>
                    )}
                    {/* DEMO DATA chip for underlying mock/synthetic grid data */}
                    {demoData && (
                        <span className="mono rounded-full border border-amber/30 bg-amber/10 px-2 py-0.5 text-[9px] font-semibold tracking-[0.12em] text-amber">
                            DEMO DATA
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={onOpenPalette}
                        className="hidden h-8 items-center gap-2 rounded-full border border-border/80 bg-foreground/[0.03] px-3 text-[12px] text-ink-faint transition-colors hover:border-border hover:text-ink-soft sm:flex"
                    >
                        <Search className="h-3.5 w-3.5" />
                        <span>{t("top.search")}</span>
                        <kbd className="mono ml-2 rounded border border-border/80 bg-foreground/[0.04] px-1.5 py-0.5 text-[10px]">⌘K</kbd>
                    </button>
                    <Button variant="ghost" size="icon" aria-label="Search" onClick={onOpenPalette} className="h-9 w-9 rounded-full text-ink-soft sm:hidden">
                        <Search className="h-4 w-4" />
                    </Button>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={t("top.notifications")} className="relative h-9 w-9 rounded-full text-ink-soft hover:text-ink">
                                <Bell className="h-4 w-4" />
                                {unread > 0 && (
                                    <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose px-1 text-[9px] font-semibold text-white">
                                        {unread > 9 ? "9+" : unread}
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-[320px] border-border/80 bg-popover p-0">
                            <div className="flex items-center justify-between border-b border-border/70 px-3 py-2.5">
                                <p className="mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">{t("top.notifications")}</p>
                                <span className="mono flex items-center gap-1 text-[10px] text-mint">
                                    <LiveDot tone="mint" size="h-1.5 w-1.5" /> live
                                </span>
                            </div>
                            <div className="scroll-thin max-h-[320px] overflow-y-auto">
                                {[...liveAlerts, ...alerts].slice(0, 7).map((a, i) => (
                                    <div key={a.id ?? `${a.title}-${i}`} className="border-b border-border/50 px-3 py-2.5 last:border-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-[12px] font-medium text-ink">{a.title}</p>
                                            <span className="mono shrink-0 text-[9px] text-ink-faint">
                                                {a.at ? timeAgo(a.at) : a.raised_at ? timeAgo(a.raised_at) : "now"}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-2">
                                            <SeverityChip severity={a.severity ?? "medium"} />
                                            <p className="truncate text-[11px] text-ink-faint">{a.detail}</p>
                                        </div>
                                    </div>
                                ))}
                                {liveAlerts.length + alerts.length === 0 && (
                                    <p className="px-3 py-6 text-center text-[12px] text-ink-faint">{t("top.noAlerts")}</p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate({ to: "/dashboard/consumers" })}
                                className="w-full border-t border-border/70 px-3 py-2.5 text-left text-[12px] text-brand hover:bg-foreground/[0.04]"
                            >
                                {t("top.openQueue")}
                            </button>
                        </PopoverContent>
                    </Popover>

                    <LangToggle />
                    <ThemeToggle />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 gap-2 rounded-full border border-border/70 px-1.5 pr-2.5 text-ink-soft hover:text-ink">
                                {user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={displayName}
                                        className="h-6 w-6 rounded-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-[10px] font-semibold text-white">
                                        {initials}
                                    </span>
                                )}
                                <span className="mono hidden max-w-[120px] truncate text-[11px] sm:block">
                                    {loading ? "…" : displayName}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 border-border/80 bg-popover">
                            <DropdownMenuLabel className="mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                                {user ? (user.email || user.name) : "Signed out"}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate({ to: "/dashboard/settings" })}>
                                <SettingsIcon className="mr-2 h-4 w-4" /> {t("top.settings")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate({ to: "/dashboard/consumers" })}>
                                <User className="mr-2 h-4 w-4" /> {t("top.myQueue")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user && !isDemo ? (
                                <DropdownMenuItem onClick={() => signOut()}>
                                    <LogOut className="mr-2 h-4 w-4" /> {t("top.signOut")}
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => navigate({ to: "/login" })}>
                                    <LogIn className="mr-2 h-4 w-4" /> Sign in with Google
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
