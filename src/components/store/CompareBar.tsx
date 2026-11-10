"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompare, X, Trash2, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CompareBar({ onOpen }: { onOpen: () => void }) {
  const compareList = useStore((s) => s.compareList);
  const products = useStore((s) => s.products);
  const toggleCompare = useStore((s) => s.toggleCompare);
  const clearCompare = useStore((s) => s.clearCompare);

  const items = compareList
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as NonNullable<ReturnType<typeof products.find>>[];

  const canCompare = items.length >= 2;

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4"
        >
          <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-2xl border border-border glass-strong p-3 shadow-2xl">
            {/* count badge */}
            <div className="flex items-center gap-2 pl-1">
              <span className="grid h-9 w-9 place-items-center rounded-xl gold-gradient text-primary-foreground">
                <GitCompare className="h-4 w-4" />
              </span>
              <div className="hidden leading-none sm:block">
                <div className="text-xs font-semibold">Compare</div>
                <div className="text-[10px] text-muted-foreground">
                  {items.length}/4 selected
                </div>
              </div>
            </div>

            {/* thumbnails */}
            <div className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto">
              <AnimatePresence initial={false}>
                {items.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-border"
                  >
                    <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                    <button
                      onClick={() => toggleCompare(p.id)}
                      className="absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition-all hover:bg-black/50 hover:opacity-100"
                      aria-label={`Remove ${p.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
                {/* empty slots */}
                {Array.from({ length: Math.max(0, 4 - items.length) }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-dashed border-border text-muted-foreground/40"
                  >
                    +
                  </div>
                ))}
              </AnimatePresence>
            </div>

            {/* actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={clearCompare}
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Clear compare"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                disabled={!canCompare}
                onClick={onOpen}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all",
                  canCompare
                    ? "gold-gradient text-primary-foreground shadow-md shadow-gold/20"
                    : "cursor-not-allowed bg-muted text-muted-foreground"
                )}
              >
                <GitCompare className="h-3.5 w-3.5" />
                Compare {canCompare ? `(${items.length})` : ""}
                {canCompare && <ArrowRight className="h-3.5 w-3.5" />}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
