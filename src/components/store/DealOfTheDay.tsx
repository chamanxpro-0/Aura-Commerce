"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { MarkFlame, MarkClock } from "@/components/shared/CustomMarks";
import { useStore } from "@/lib/store";
import { StarRating } from "@/components/shared/StarRating";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

function useCountdown(target: number) {
  // `mounted` gate: the server and the client will disagree on wall-clock time,
  // so we render neutral placeholders until hydration has settled.
  const [mounted, setMounted] = React.useState(false);
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  const hours = Math.floor(diff / 3.6e6);
  const minutes = Math.floor((diff % 3.6e6) / 6e4);
  const seconds = Math.floor((diff % 6e4) / 1000);
  return { hours, minutes, seconds, done: diff === 0, mounted };
}

export function DealOfTheDay({ onQuickView }: { onQuickView?: (id: string) => void }) {
  const products = useStore((s) => s.products);
  const addToCart = useStore((s) => s.addToCart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const currency = useStore((s) => s.currency);
  const reduce = useReducedMotion();

  // pick the product with the deepest discount
  const deal = React.useMemo(() => {
    const withDiscount = products.filter(
      (p) => p.compareAtPrice && p.compareAtPrice > p.price && p.stock > 0
    );
    if (withDiscount.length === 0) return products[0];
    return withDiscount.sort(
      (a, b) =>
        (b.compareAtPrice! - b.price) / b.compareAtPrice! -
        (a.compareAtPrice! - a.price) / a.compareAtPrice!
    )[0];
  }, [products]);

  // countdown to end of day
  const [target] = React.useState(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end.getTime();
  });
  const { hours, minutes, seconds, mounted } = useCountdown(target);

  if (!deal) return null;
  const discount = deal.compareAtPrice
    ? Math.round((1 - deal.price / deal.compareAtPrice) * 100)
    : 0;

  const cells = [
    { label: "Hours", value: hours },
    { label: "Mins", value: minutes },
    { label: "Secs", value: seconds },
  ];

  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-gold-deep/5" />
        <div className="absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(0.7_0.13_75_/_0.25),transparent)] blur-2xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-stretch gap-6 overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-2">
          {/* image side */}
          <div className="relative min-h-[300px] overflow-hidden lg:min-h-[460px]">
            <motion.img
              src={deal.images[0]}
              alt={deal.name}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                <MarkFlame className="h-3.5 w-3.5" /> Deal of the Day
              </span>
              {discount > 0 && (
                <span className="inline-flex w-fit items-center rounded-full bg-background/90 px-2.5 py-1 text-xs font-bold text-rose-600 backdrop-blur">
                  Save {discount}%
                </span>
              )}
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-white">
              <MarkClock className="h-4 w-4 text-gold" />
              <span className="text-xs font-medium uppercase tracking-wide">
                Offer ends at midnight
              </span>
            </div>
          </div>

          {/* content side */}
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold">
                {deal.brand}
              </div>
              <h2 className="mt-2 text-3xl font-medium tracking-tight font-display sm:text-4xl">
                {deal.name}
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {deal.tagline}
              </p>

              <div className="mt-3 flex items-center gap-3">
                <StarRating value={deal.rating} size={14} showValue count={deal.reviewCount} />
              </div>

              <div className="mt-5 flex items-end gap-3">
                <span className="text-4xl font-bold tracking-tight gold-text">
                  {formatPrice(deal.price, currency)}
                </span>
                {deal.compareAtPrice && (
                  <span className="pb-1 text-lg text-muted-foreground line-through">
                    {formatPrice(deal.compareAtPrice, currency)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="mb-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                    −{discount}%
                  </span>
                )}
              </div>

              {/* countdown */}
              <div className="mt-5 flex items-center gap-2">
                {cells.map((c) => (
                  <div
                    key={c.label}
                    className="flex flex-col items-center rounded-xl border border-border bg-background px-3 py-2 min-w-14"
                  >
                    <span className="font-mono text-xl font-bold tabular-nums">
                      {mounted ? String(c.value).padStart(2, "0") : "––"}
                    </span>
                    <span className="text-[9px] uppercase tracking-wide text-muted-foreground">
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* stock meter */}
              <div className="mt-5">
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Already claimed today</span>
                  <span className="font-medium text-foreground">
                    {Math.min(deal.sales, 100)}/100
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min(deal.sales, 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full gold-gradient"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <MagneticButton
                  onClick={() => {
                    addToCart({
                      productId: deal.id,
                      qty: 1,
                      color: deal.colors[0]?.name,
                      size: deal.sizes[0],
                    });
                    setCartOpen(true);
                    toast.success(`${deal.name} added to bag`);
                  }}
                  className="group inline-flex items-center gap-2 rounded-full gold-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-gold/20"
                >
                  <Check className="h-4 w-4" /> Claim deal
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </MagneticButton>
                {onQuickView && (
                  <button
                    onClick={() => onQuickView(deal.id)}
                    className="rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-accent"
                  >
                    View details
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
