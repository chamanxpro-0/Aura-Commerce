"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useScrollTop } from "@/lib/useScrollTop";
import { Hero } from "./Hero";
import { Marquee } from "./Marquee";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { DealOfTheDay } from "./DealOfTheDay";
import { ProductCard } from "./ProductCard";
import { RecentlyViewedRail } from "./RecentlyViewedRail";
import { Lookbook } from "./Lookbook";
import { Testimonials } from "./Testimonials";
import { StorySection } from "./StorySection";

/**
 * HomePage — the curated editorial showcase.
 * Full catalog lives on the Shop page; home is the stage.
 */
export function HomePage({ onQuickView }: { onQuickView: (p: Product) => void }) {
  const products = useStore((s) => s.products);
  const setView = useStore((s) => s.setView);

  // always start the page at the top when it mounts
  useScrollTop();

  // signature selection: featured first, then best-rated fill — 6 items
  const signature = React.useMemo(() => {
    const featured = products.filter((p) => p.featured);
    const rest = [...products]
      .filter((p) => !featured.includes(p))
      .sort((a, b) => b.rating - a.rating);
    return [...featured, ...rest].slice(0, 6);
  }, [products]);

  const goShop = () => setView("shop");

  return (
    <main className="flex-1">
      <Hero />
      <Marquee />
      <DealOfTheDay onQuickView={(id) => {
        const p = products.find((x) => x.id === id);
        if (p) onQuickView(p);
      }} />
      <FeaturedCarousel onQuickView={onQuickView} />

      {/* signature selection — a taste of the catalog, with a gateway CTA */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="eyebrow text-gold"
              >
                Signature Selection
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-2 font-display text-3xl font-medium tracking-tight sm:text-4xl"
                style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}
              >
                Six objects, one <span className="gold-text italic">standard</span>
              </motion.h2>
            </div>
            <motion.button
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              onClick={goShop}
              className="group inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-gold/50 hover:text-gold"
            >
              Enter the full atelier
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {signature.map((p, i) => (
              <ProductCard key={p.id} product={p} layout="grid" index={i} onQuickView={onQuickView} />
            ))}
          </div>

          {/* hairline + micro caption */}
          <div className="mt-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
              {products.length} objects in the collection · updated weekly
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>
      </section>

      <RecentlyViewedRail onQuickView={onQuickView} />
      <Lookbook />
      <Testimonials />
      <StorySection />
    </main>
  );
}
