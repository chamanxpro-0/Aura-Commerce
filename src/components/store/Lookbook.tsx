"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Camera, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";

const EDITS = [
  {
    chapter: "I",
    title: "The Morning Ritual",
    subtitle: "Light, brass, and the first sip",
    body: "A Lumen lamp wakes with the sun, the Solace machine hums to pressure. The morning becomes a ceremony, not a routine.",
    image:
      "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2dd0374ad097.jpg",
    span: "lg:col-span-7 lg:row-span-2",
    tall: true,
  },
  {
    chapter: "II",
    title: "Worn, Not Worn",
    subtitle: "The patina of a life well-lived",
    body: "Vegetable-tanned leather, cashmere brushed soft by wear. Objects that record your passage through time.",
    image:
      "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=1200&q=80",
    span: "lg:col-span-5",
    tall: false,
  },
  {
    chapter: "III",
    title: "Sound, Sculpted",
    subtitle: "Silence, then everything",
    body: "Aether headphones fold the world away. The Halo speaker fills a room the way light fills a window.",
    image:
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80",
    span: "lg:col-span-5",
    tall: false,
  },
];

export function Lookbook() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section id="collections" ref={ref} className="relative scroll-mt-24 overflow-hidden py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-72 w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(0.86_0.1_80_/_0.3),transparent)] blur-2xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        {/* header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em] text-gold"
            >
              <Camera className="h-3.5 w-3.5" /> The Lookbook · Spring '25
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-2 text-balance text-4xl font-medium tracking-tight font-display sm:text-5xl"
            >
              An object for every <span className="gold-text">hour of the day</span>
            </motion.h2>
          </div>
          <motion.button
            onClick={() => useStore.getState().setView("shop")}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Shop the edits <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>

        {/* editorial grid */}
        <div className="mt-10 grid gap-4 lg:grid-cols-12">
          {EDITS.map((edit, i) => (
            <motion.article
              key={edit.chapter}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative overflow-hidden rounded-3xl border border-border ${edit.span} ${
                edit.tall ? "min-h-[460px]" : "min-h-[280px]"
              }`}
            >
              <motion.img
                src={edit.image}
                alt={edit.title}
                style={i === 0 ? { y } : undefined}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {/* chapter mark */}
              <div className="absolute right-5 top-5 font-mono text-5xl font-bold text-white/20 transition-colors group-hover:text-white/40">
                {edit.chapter}
              </div>
              <Sparkles className="absolute left-5 top-5 h-4 w-4 text-white/60 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/70">
                  {edit.subtitle}
                </div>
                <h3 className="mt-1 text-2xl font-medium tracking-tight font-display sm:text-3xl">
                  {edit.title}
                </h3>
                <p className="mt-2 max-w-md text-sm text-white/80">{edit.body}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur transition-colors group-hover:bg-white/25">
                  Discover
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
              {/* gold reveal bar */}
              <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
