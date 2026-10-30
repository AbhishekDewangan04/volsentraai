import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Globe from "@/components/landing/Globe";
import WarpField from "@/components/fx/WarpField";
import ShaderButton from "@/components/fx/ShaderButton";
import GlassButton from "@/components/fx/GlassButton";

export default function CtaBand() {
  return (
    /* Section spacing token: pb-24 mobile / pb-32 desktop. */
    <section className="relative px-4 sm:px-6 lg:px-8" style={{ paddingBottom: "var(--landing-rhythm)" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl border border-border/70 bg-surface/70 px-6 py-14 text-center backdrop-blur sm:px-12"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 h-[280px] w-[420px] rounded-full bg-brand/25 blur-[110px]" />
          <div className="absolute -right-16 bottom-0 h-[260px] w-[380px] rounded-full bg-brand2/20 blur-[110px]" />
          <div className="absolute inset-0 bg-grid-dots opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        </div>
        <WarpField className="opacity-70" />

        <div className="pointer-events-none absolute -right-10 top-1/2 hidden -translate-y-1/2 opacity-60 lg:block">
          <Globe size={260} />
        </div>

        <div className="relative mx-auto max-w-2xl">
          <p className="mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">The losses are already in your data</p>
          <h2 className="mt-4 font-heading text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] text-ink sm:text-[40px]">
            Your grid is telling you. <span className="text-gradient">Start listening.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">
            Open the command center and see today&apos;s inspection queue, the flagged clusters and the live meter
            stream — no sign-up, no setup.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ShaderButton to="/dashboard" className="w-full sm:w-auto">
              Open Live Dashboard <ArrowRight className="h-4 w-4" />
            </ShaderButton>
            <GlassButton to="/dashboard/model" className="w-full sm:w-auto">
              See model performance
            </GlassButton>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
