"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useScrollTop } from "@/lib/useScrollTop";
import { ProductGrid } from "./ProductGrid";
import { RecentlyViewedRail } from "./RecentlyViewedRail";

/**
 * ShopPage — the full atelier catalog with its own editorial masthead,
 * then the complete filterable grid.
 */
export function ShopPage({ onQuickView }: { onQuickView: (p: Product) => void }) {
  const products = useStore((s) => s.products);
  const mastheadRef = React.useRef<HTMLDivElement>(null);

  // always start the page at the top when it mounts
  useScrollTop();
  const { scrollYProgress } = useScroll({
    target: mastheadRef,
    offset: ["start start", "end start"],
  });
  const ghostY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <main className="flex-1">
      {/* masthead — oversized editorial band */}
      <div ref={mastheadRef} className="relative overflow-hidden pb-10 pt-12 sm:pt-16">
        {/* ambient */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/3 h-[380px] w-[680px] rounded-full bg-[radial-gradient(closest-side,oklch(0.86_0.1_80_/_0.45),transparent)] blur-2xl dark:bg-[radial-gradient(closest-side,oklch(0.4_0.06_70_/_0.5),transparent)]" />
          <div className="absolute inset-0 grain opacity-30" />
        </div>

        {/* ghost numeral */}
        <motion.div
          style={{ y: ghostY }}
          aria-hidden
          className="pointer-events-none absolute -right-6 top-6 select-none font-display text-[26vw] font-semibold leading-none tracking-display text-foreground/[0.04] sm:text-[18vw]"
        >
          10
        </motion.div>

        <motion.div style={{ opacity: fade }} className="mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="eyebrow text-gold"
          >
            The Atelier Catalog · {products.length} objects
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-4xl text-balance font-display text-5xl font-medium leading-[1.02] tracking-display sm:text-6xl lg:text-7xl"
            style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}
          >
            Ten objects. <span className="gold-text italic">One</span> standard.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
          >
            Electronics, apparel, accessories and home tech — filtered to what
            deserves to exist. Every object hand-finished, guaranteed for life.
          </motion.p>

          {/* gold hairline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 h-px w-full max-w-md origin-left gold-gradient"
          />
        </motion.div>
      </div>

      <ProductGrid onQuickView={onQuickView} />
      <RecentlyViewedRail onQuickView={onQuickView} />
    </main>
  );
}
