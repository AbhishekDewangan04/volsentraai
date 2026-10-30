import { motion } from "framer-motion";
import { Link, useRouterState } from "@tanstack/react-router";
import {
    Boxes,
    Columns3,
    FlaskConical,
    LayoutDashboard,
    LineChart,
    MapPin,
    Network,
    PanelLeftClose,
    PanelLeftOpen,
    Radio,
    Settings,
    Users,
} from "lucide-react";
import Logo from "@/components/brand/Logo";
import Orb from "@/components/fx/Orb";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

/** Route → dictionary key, so the nav and the palette never drift. */
export const navKey = (to) => (to === "/dashboard" ? "nav.command" : `nav.${String(to).split("/").pop()}`);

export const NAV = [
    {
        group: "Monitor",
        items: [
            { label: "Command Center", to: "/dashboard", icon: LayoutDashboard, exact: true },
            { label: "Consumers & Risk", to: "/dashboard/consumers", icon: Users },
            { label: "3D Grid", to: "/dashboard/grid", icon: Boxes },
            { label: "Live Monitor", to: "/dashboard/live", icon: Radio },
            { label: "Field Inspections", to: "/dashboard/field", icon: MapPin },
        ],
    },
    {
        group: "Analyse",
        items: [
            { label: "Transformer Analysis", to: "/dashboard/transformers", icon: Network },
            { label: "Case Management", to: "/dashboard/cases", icon: Columns3 },
            { label: "Scenario Lab", to: "/dashboard/scenarios", icon: FlaskConical },
            { label: "Model Performance", to: "/dashboard/model", icon: LineChart },
        ],
    },
    {
        group: "System",
        items: [{ label: "Settings", to: "/dashboard/settings", icon: Settings }],
    },
];

export const MOBILE_NAV = [
    { label: "Home", to: "/dashboard", icon: LayoutDashboard, exact: true },
    { label: "Risk", to: "/dashboard/consumers", icon: Users },
    { label: "3D", to: "/dashboard/grid", icon: Boxes },
    { label: "Live", to: "/dashboard/live", icon: Radio },
    { label: "Field", to: "/dashboard/field", icon: MapPin, key: "nav.fieldShort" },
    { label: "Cases", to: "/dashboard/cases", icon: Columns3 },
];

export default function Sidebar({ collapsed, onToggle }) {
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const { t } = useI18n();
    const isActive = (item) => (item.exact ? pathname === item.to : pathname.startsWith(item.to));

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border/70 bg-sidebar transition-[width] duration-300 lg:flex",
                collapsed ? "w-[76px]" : "w-[248px]",
            )}
        >
            <div className={cn("flex h-16 items-center border-b border-border/70", collapsed ? "justify-center px-2" : "justify-between px-4")}>
                <Logo compact={collapsed} />
                {!collapsed && (
                    <button
                        type="button"
                        onClick={onToggle}
                        aria-label="Collapse sidebar"
                        className="grid h-7 w-7 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-foreground/[0.06] hover:text-ink"
                    >
                        <PanelLeftClose className="h-4 w-4" />
                    </button>
                )}
            </div>

            {collapsed && (
                <button
                    type="button"
                    onClick={onToggle}
                    aria-label="Expand sidebar"
                    className="mx-auto mt-2 grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-foreground/[0.06] hover:text-ink"
                >
                    <PanelLeftOpen className="h-4 w-4" />
                </button>
            )}

            <nav className="scroll-thin flex-1 overflow-y-auto px-2 py-4" aria-label="Sections">
                {NAV.map((section) => (
                    <div key={section.group} className="mb-4">
                        {!collapsed && (
                            <p className="mono mb-1.5 px-3 text-[9px] uppercase tracking-[0.2em] text-ink-faint">
                                {t(`nav.${section.group.toLowerCase()}`)}
                            </p>
                        )}
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const active = isActive(item);
                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        title={collapsed ? t(navKey(item.to)) : undefined}
                                        className={cn(
                                            "group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
                                            collapsed && "justify-center px-0",
                                            active ? "text-ink" : "text-ink-soft hover:bg-foreground/[0.05] hover:text-ink",
                                        )}
                                    >
                                        {active && (
                                            <motion.span
                                                layoutId="nav-active"
                                                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                                                className="absolute inset-0 -z-10 rounded-xl border border-brand/25 bg-brand/12"
                                            />
                                        )}
                                        <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-brand" : "text-ink-faint group-hover:text-ink-soft")} />
                                        {!collapsed && <span className="truncate">{t(navKey(item.to))}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className={cn("border-t border-border/70 p-3", collapsed && "flex justify-center")}>
                {collapsed ? (
                    <Orb tone="mint" size="h-2.5 w-2.5" />
                ) : (
                    <div className="rounded-xl border border-mint/25 bg-mint/8 px-3 py-2.5">
                        <p className="mono flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-mint">
                            <Orb tone="mint" size="h-2 w-2" /> system live
                        </p>
                        <p className="mono mt-1 text-[10px] text-ink-faint">3 feeders · 10 DTs · 412ms</p>
                    </div>
                )}
            </div>
        </aside>
    );
}