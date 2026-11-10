"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { StarRating } from "@/components/shared/StarRating";
import { formatPrice } from "@/lib/utils";

export function FeaturedCarousel({ onQuickView }: { onQuickView: (p: Product) => void }) {
  const products = useStore((s) => s.products);
  const currency = useStore((s) => s.currency);
  const featured = products.filter((p) => p.featured).slice(0, 4);

  return (
    <section id="featured" className="scroll-mt-24 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold"
            >
              Editor's Picks
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-1 text-3xl font-medium tracking-tight font-display sm:text-4xl"
            >
              Featured this <span className="gold-text">season</span>
            </motion.h2>
          </div>
          <button
            onClick={() => useStore.getState().setView("shop")}
            className="hidden items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              onClick={() => onQuickView(p)}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-border text-left"
            >
              <img
                src={p.images[0]}
                alt={p.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute right-3 top-3">
                <span className="rounded-full bg-gold/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  Featured
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                  {p.brand}
                </div>
                <div className="mt-0.5 text-base font-semibold">{p.name}</div>
                <div className="mt-1 flex items-center justify-between">
                  <StarRating value={p.rating} size={11} />
                  <span className="text-sm font-bold">{formatPrice(p.price, currency)}</span>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
