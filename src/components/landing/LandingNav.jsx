import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import Logo from "@/components/brand/Logo";
import ThemeToggle from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";

const LINKS = [
  { label: "Overview", to: "/", hash: "overview" },
  { label: "Detection", to: "/", hash: "detection" },
  { label: "3D Grid", to: "/dashboard/grid" },
  { label: "Live Monitor", to: "/dashboard/live" },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className={`border-b transition-colors duration-300 ${scrolled ? "border-border/70 glass" : "border-transparent"}`}>
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {LINKS.map((l) =>
              l.hash ? (
                <a
                  key={l.label}
                  href={`#${l.hash}`}
                  className="rounded-full px-3 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-foreground/[0.05] hover:text-ink"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  to={l.to}
                  className="rounded-full px-3 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:bg-foreground/[0.05] hover:text-ink"
                >
                  {l.label}
                </Link>
              ),
            )}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="rounded-full text-[13px] text-ink-soft hover:text-ink">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full bg-gradient-to-r from-brand to-brand-2 px-4 text-[13px] font-medium text-white hover:opacity-90">
              <Link to="/dashboard">Open dashboard</Link>
            </Button>
          </div>

          <div className="flex items-center gap-1.5 lg:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full border border-border/70"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="border-b border-border/70 glass lg:hidden"
          >
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-3">
              {LINKS.map((l) =>
                l.hash ? (
                  <a
                    key={l.label}
                    href={`#${l.hash}`}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm text-ink-soft hover:bg-foreground/[0.05] hover:text-ink"
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    key={l.label}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm text-ink-soft hover:bg-foreground/[0.05] hover:text-ink"
                  >
                    {l.label}
                  </Link>
                ),
              )}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="rounded-full">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="rounded-full bg-gradient-to-r from-brand to-brand-2 text-white">
                  <Link to="/dashboard" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}