import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import StatStrip from "@/components/landing/StatStrip";
import HowItThinks from "@/components/landing/HowItThinks";
import SeverityJourney from "@/components/landing/SeverityJourney";
import CtaBand from "@/components/landing/CtaBand";
import Logo from "@/components/brand/Logo";

export const Route = createFileRoute("/")({
    head: () => ({
        meta: [
            { title: "Volsentra AI · Catch every loss before it costs you" },
            {
                name: "description",
                content:
                    "AI-powered electricity theft and anomaly detection for power distribution utilities: explainable risk scores, transformer loss clusters and a live smart-meter stream.",
            },
        ],
    }),
    component: LandingPage,
});

const FOOTER_LINKS = [
    { label: "Command center", to: "/dashboard" },
    { label: "Consumers", to: "/dashboard/consumers" },
    { label: "3D grid", to: "/dashboard/grid" },
    { label: "Live monitor", to: "/dashboard/live" },
    { label: "Case management", to: "/dashboard/cases" },
    { label: "Settings", to: "/dashboard/settings" },
];

function LandingPage() {
    return (
        <div className="relative min-h-screen overflow-x-clip bg-canvas">
            <LandingNav />
            <main>
                <Hero />
                <StatStrip />
                <HowItThinks />
                <SeverityJourney />
                <CtaBand />
            </main>
            <footer className="border-t border-border/60">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                    <div className="space-y-2">
                        <Logo />
                        <p className="mono max-w-sm text-[10px] uppercase leading-relaxed tracking-[0.12em] text-ink-faint">
                            Demo data · synthetic meters · reproducible scenario lab
                        </p>
                    </div>
                    <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
                        {FOOTER_LINKS.map((l) => (
                            <Link key={l.to} to={l.to} className="text-[13px] text-ink-soft transition-colors hover:text-ink">
                                {l.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </footer>
        </div>
    );
}