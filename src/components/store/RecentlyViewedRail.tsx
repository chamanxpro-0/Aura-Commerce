"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Trash2, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { StarRating } from "@/components/shared/StarRating";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function RecentlyViewedRail({ onQuickView }: { onQuickView: (p: Product) => void }) {
  const recentlyViewed = useStore((s) => s.recentlyViewed);
  const products = useStore((s) => s.products);
  const clearRecentlyViewed = useStore((s) => s.clearRecentlyViewed);
  const openProductDetail = useStore((s) => s.openProductDetail);
  const currency = useStore((s) => s.currency);

  const items = recentlyViewed
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  // empty state — curated picks to start exploring
  const curated = products.filter((p) => p.featured).slice(0, 3);
  const fallback = products.slice(0, 3);
  const suggestions = curated.length >= 2 ? curated : fallback;

  // When the user has only 1–2 recently-viewed items, pad the rail with
  // curated suggestions (not already in the list) so the row never looks sparse.
  const paddedItems = React.useMemo(() => {
    if (items.length >= 4) return items.slice(0, 8);
    const seenIds = new Set(items.map((p) => p.id));
    const fillers = products
      .filter((p) => p.featured && !seenIds.has(p.id))
      .concat(products.filter((p) => !seenIds.has(p.id) && !p.featured))
      .slice(0, 4 - items.length);
    return [...items, ...fillers];
  }, [items, products]);

  return (
    <section className="py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold"
            >
              For Your Consideration
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-1 text-2xl font-medium tracking-tight font-display sm:text-3xl"
            >
              Recently <span className="gold-text">viewed</span>
            </motion.h2>
          </div>
          {items.length >= 1 && (
            <button
              onClick={clearRecentlyViewed}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-5 overflow-hidden rounded-2xl border border-dashed border-border bg-card/50 p-5"
          >
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl gold-gradient text-primary-foreground">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-semibold">Start exploring</h3>
                  <p className="text-xs text-muted-foreground">
                    Pieces you open will appear here, so you can return to them anytime.
                  </p>
                </div>
              </div>
              <button
                onClick={() => useStore.getState().setView("shop")}
                className="group inline-flex shrink-0 items-center gap-1.5 rounded-full gold-gradient px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md shadow-gold/20"
              >
                Browse the collection
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
            {/* curated suggestions */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {suggestions.map((p, i) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => onQuickView(p)}
                  className="group relative overflow-hidden rounded-xl border border-border text-left"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 text-white">
                    <div className="text-[9px] uppercase tracking-wide text-white/70">{p.brand}</div>
                    <div className="line-clamp-1 text-xs font-semibold">{p.name}</div>
                    <div className="mt-0.5 flex items-center justify-between">
                      <StarRating value={p.rating} size={9} />
                      <span className="text-xs font-bold">{formatPrice(p.price, currency)}</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="no-scrollbar -mx-4 mt-5 flex gap-4 overflow-x-auto px-4 pb-2">
            <AnimatePresence initial={false}>
              {paddedItems.map((p, i) => {
                const isFiller = i >= items.length;
                return (
                <motion.button
                  key={p.id + '-' + i}
                  layout
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: isFiller ? 0.6 : 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.25) }}
                  onClick={() => onQuickView(p)}
                  onDoubleClick={() => openProductDetail(p.id)}
                  className="group relative w-44 shrink-0 overflow-hidden rounded-2xl border border-border bg-card text-left sm:w-52"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    {isFiller ? (
                      <span className="absolute left-2 top-2 rounded-full bg-gold/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground backdrop-blur">
                        ✦ Curated
                      </span>
                    ) : (
                      <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur">
                        <Eye className="mr-1 inline h-2.5 w-2.5" />
                        {i + 1}
                      </span>
                    )}
                    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 translate-y-2 items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-[10px] font-medium opacity-0 backdrop-blur transition-all group-hover:translate-y-0 group-hover:opacity-100">
                      Quick view <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {p.brand}
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-sm font-semibold">{p.name}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <StarRating value={p.rating} size={10} />
                      <span className="text-sm font-bold">{formatPrice(p.price, currency)}</span>
                    </div>
                  </div>
                </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
