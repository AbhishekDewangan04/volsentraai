import { Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export default function Logo({ compact = false, className = "", to = "/" }) {
  return (
    <Link to={to} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Volsentra home">
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 shadow-glow-brand">
        <Zap className="h-[18px] w-[18px] text-white" strokeWidth={2.4} />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
      </span>
      {!compact && (
        <span className="font-heading text-[17px] font-semibold tracking-[-0.02em] text-ink">
          Volsentra
          <span className="mono ml-1 align-super text-[9px] tracking-[0.15em] text-brand">AI</span>
        </span>
      )}
    </Link>
  );
}