import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useRouterState } from "@tanstack/react-router";
import CursorGlow from "@/components/fx/CursorGlow";
import { useMotionOff } from "@/lib/useMotionPref";
import Sidebar, { MOBILE_NAV } from "@/components/layout/Sidebar";
import MobileNavLabel from "@/components/layout/MobileNavLabel";
import TopBar from "@/components/layout/TopBar";
import Ticker from "@/components/layout/Ticker";
import CommandPalette from "@/components/layout/CommandPalette";
import Copilot from "@/components/layout/Copilot";
import { cn } from "@/lib/utils";

export default function AppShell({ children }) {
    const motionOff = useMotionOff();
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const [collapsed, setCollapsed] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem("gg.sidebar");
            if (stored) setCollapsed(stored === "1");
        } catch {
            /* storage blocked */
        }
    }, []);

    const toggle = () =>
        setCollapsed((v) => {
            try {
                window.localStorage.setItem("gg.sidebar", v ? "0" : "1");
            } catch {
                /* storage blocked */
            }
            return !v;
        });

    useEffect(() => {
        const onKey = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setPaletteOpen((o) => !o);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <div className="relative min-h-screen bg-canvas">
            <CursorGlow />
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-grid-lines opacity-40 [mask-image:radial-gradient(ellipse_at_50%_-10%,black,transparent_70%)]" />
                <div className="absolute -top-40 left-1/3 h-[420px] w-[620px] rounded-full bg-brand/10 blur-[150px]" />
            </div>

            <Sidebar collapsed={collapsed} onToggle={toggle} />

            <div className={cn("transition-[padding] duration-300", collapsed ? "lg:pl-[76px]" : "lg:pl-[248px]")}>
                <TopBar onOpenPalette={() => setPaletteOpen(true)} />
                <Ticker />
                <main className="mx-auto w-full max-w-[1560px] px-3 pb-28 pt-5 sm:px-5 lg:px-7 lg:pb-10">
                    {/* Fade-only route transition: a transform here would capture every
              position:fixed overlay inside the page (chart fullscreen, bulk bar). */}
                    <motion.div
                        key={pathname}
                        initial={motionOff ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>

            <nav
                aria-label="Mobile sections"
                className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/70 glass pb-[env(safe-area-inset-bottom)] lg:hidden"
            >
                <div className="flex items-stretch justify-around">
                    {MOBILE_NAV.map((item) => {
                        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={cn(
                                    "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition-colors",
                                    active ? "text-brand" : "text-ink-faint",
                                )}
                            >
                                <item.icon className="h-[18px] w-[18px]" />
                                <MobileNavLabel item={item} />
                            </Link>
                        );
                    })}
                </div>
            </nav>

            <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
            <Copilot />
        </div>
    );
}