import { motion } from "framer-motion";
import { ArrowRight, Play, ShieldCheck } from "lucide-react";
import GlowField from "@/components/common/GlowField";
import Globe from "@/components/landing/Globe";
import HeroMockup from "@/components/landing/HeroMockup";
import Aurora from "@/components/fx/Aurora";
import ConstellationField from "@/components/fx/ConstellationField";
import BeamPill from "@/components/fx/BeamPill";
import BlurText from "@/components/fx/BlurText";
import ShaderButton from "@/components/fx/ShaderButton";
import GlassButton from "@/components/fx/GlassButton";

export default function Hero() {
  return (
    /* Same section rhythm as every other landing section: pt for the nav, pb-24 / lg:pb-32 below. */
    <section id="overview" className="relative overflow-hidden pt-10 sm:pt-16" style={{ paddingBottom: "var(--landing-rhythm)" }}>
      <GlowField variant="hero" />
      <Aurora />
      <ConstellationField className="opacity-90" />

      <div className="pointer-events-none absolute right-2 top-16 hidden opacity-70 xl:block">
        <Globe size={300} />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <BeamPill icon={ShieldCheck}>
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-soft sm:text-[11px]">
                AI-powered electricity theft detection
              </span>
            </BeamPill>
          </motion.div>

          <BlurText
            as="h1"
            delay={0.1}
            segments={[
              { t: "Catch every loss,", gradient: false },
              { t: "before it costs you.", gradient: true },
            ]}
            className="mt-6 font-heading text-[38px] font-semibold leading-[1.03] tracking-[-0.04em] text-ink sm:text-6xl lg:text-[68px]"
          />

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-ink-soft sm:text-base"
          >
            Volsentra scores every smart meter on your feeders, explains each flag in plain language,
            and points your inspectors at the losses that actually matter.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <ShaderButton to="/dashboard" className="w-full sm:w-auto">
              Open Live Dashboard <ArrowRight className="h-4 w-4" />
            </ShaderButton>
            <GlassButton to="/dashboard/grid" className="w-full sm:w-auto">
              <Play className="h-4 w-4" /> Watch 3D Preview
            </GlassButton>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mono mt-5 text-[11px] uppercase tracking-[0.14em] text-ink-faint"
          >
            Explainable scores · Live meter stream · No setup
          </motion.p>
        </div>

        <HeroMockup />

        <div className="mt-10 flex justify-center xl:hidden">
          <Globe size={190} className="opacity-70" />
        </div>
      </div>
    </section>
  );
}
