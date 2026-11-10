"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const ITEMS = [
  "Free shipping over $250",
  "Lifetime craftsmanship guarantee",
  "Carbon-neutral delivery",
  "30-day returns",
  "Hand-finished in small batches",
  "Private atelier previews",
];

export function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-border bg-card/50 py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
      <motion.div className="flex w-max animate-marquee gap-8 pr-8">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span key={i} className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-gold" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
