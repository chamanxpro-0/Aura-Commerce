"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Play, ArrowRight } from "lucide-react";
import { MarkHand, MarkGem, MarkFeather, MarkInfinity } from "@/components/shared/CustomMarks";
import { useStore } from "@/lib/store";

const PILLARS = [
  { Mark: MarkHand, title: "Made by hand", body: "Each object passes through the hands of artisans — never an assembly line." },
  { Mark: MarkGem, title: "Honest materials", body: "Vegetable-tanned leather, Grade-A cashmere, solid brass. Things that age well." },
  { Mark: MarkFeather, title: "Quietly considered", body: "No logos screaming. Design that whispers and endures beyond the season." },
  { Mark: MarkInfinity, title: "Built to be kept", body: "A lifetime craftsmanship guarantee. We repair, we restore, we refuse to be disposable." },
];

export function StorySection() {
  const setView = useStore((s) => s.setView);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const lineWidth = useTransform(scrollYProgress, [0, 0.6], ["0%", "100%"]);

  return (
    <section id="story" ref={ref} className="relative overflow-hidden py-24 sm:py-36">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          style={{ y }}
          className="absolute left-1/2 top-1/2 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(0.86_0.1_80_/_0.3),transparent)] blur-2xl"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        {/* editorial statement */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="eyebrow text-gold"
          >
            The AURA Ethos
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-balance font-display text-4xl font-medium leading-[1.05] tracking-display sm:text-6xl lg:text-7xl"
            style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}
          >
            We make fewer things,
            <br />
            <span className="gold-text italic">exceptionally</span> well.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
          >
            In a world of endless catalogues and disposable trends, AURA exists for
            the opposite reason. Ten carefully sourced objects. A craft-first supply
            chain. A relationship with each piece that lasts decades, not seasons.
          </motion.p>
        </div>

        {/* the thin gold rule that draws as you scroll */}
        <div className="mx-auto mt-16 h-px w-full max-w-3xl bg-border">
          <motion.div style={{ width: lineWidth }} className="h-full gold-gradient" />
        </div>

        {/* pillars — refined, no card chrome, just typography + bespoke marks */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="group relative bg-background p-7 transition-colors hover:bg-accent/40"
            >
              <p.Mark className="mb-5 h-7 w-7 text-gold transition-transform duration-500 group-hover:-translate-y-0.5" />
              <h3 className="font-display text-lg font-medium tracking-tight">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              <span className="mt-5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
                0{i + 1} — AURA
              </span>
            </motion.div>
          ))}
        </div>

        {/* cinematic invitation to the full story page */}
        <motion.button
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          onClick={() => setView("story")}
          className="group relative mx-auto mt-16 flex max-w-3xl flex-col items-center gap-4 overflow-hidden rounded-3xl border border-border bg-[oklch(0.155_0.012_60)] px-6 py-12 text-center"
        >
          {/* faint backdrop image */}
          <img
            src="https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ad6805beb3f4.jpg"
            alt=""
            aria-hidden
            loading="lazy"
            className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover opacity-30 transition-transform duration-700 group-hover:scale-110"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[oklch(0.155_0.012_60)] via-[oklch(0.155_0.012_60/0.55)] to-transparent" />
          <span className="relative grid h-14 w-14 place-items-center rounded-full gold-gradient text-primary-foreground shadow-lg shadow-gold/30 transition-transform duration-500 group-hover:scale-110">
            <Play className="ml-1 h-5 w-5 fill-current" />
          </span>
          <div className="relative">
            <p className="eyebrow text-[oklch(0.96_0.008_80/0.6)]">The Atelier Film · 5 movements</p>
            <h3
              className="mt-3 text-balance font-display text-3xl font-medium tracking-display text-[oklch(0.96_0.008_80)] sm:text-4xl"
              style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}
            >
              Scroll through our story
            </h3>
          </div>
          <span className="relative inline-flex items-center gap-2 text-sm font-medium text-gold">
            Enter the story
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </motion.button>
      </div>
    </section>
  );
}
