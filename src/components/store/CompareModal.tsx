"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  GitCompare,
  Trophy,
  DollarSign,
  Star,
  Ruler,
  Palette,
  Boxes,
  Tag,
  ShoppingBag,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { StarRating } from "@/components/shared/StarRating";
import { cn, formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export function CompareModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const compareList = useStore((s) => s.compareList);
  const products = useStore((s) => s.products);
  const toggleCompare = useStore((s) => s.toggleCompare);
  const addToCart = useStore((s) => s.addToCart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const currency = useStore((s) => s.currency);

  const items = compareList
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  // winners
  const lowestPriceId = items.length ? items.reduce((a, b) => (a.price <= b.price ? a : b)).id : null;
  const topRatedId = items.length ? items.reduce((a, b) => (a.rating >= b.rating ? a : b)).id : null;
  const mostStockId = items.length ? items.reduce((a, b) => (a.stock >= b.stock ? a : b)).id : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[85] bg-background/70 backdrop-blur-md"
          />
          <div className="fixed left-0 top-0 z-[86] flex h-[100dvh] w-screen items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
            >
              {/* header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg gold-gradient text-primary-foreground">
                    <GitCompare className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold">Compare</h2>
                    <p className="text-[11px] text-muted-foreground">
                      {items.length} of 4 products · side-by-side
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent"
                  aria-label="Close compare"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* body */}
              <div className="overflow-auto thin-scrollbar p-4 sm:p-6">
                {items.length === 0 ? (
                  <div className="py-16 text-center text-sm text-muted-foreground">
                    Add products to compare using the compare icon on any card.
                  </div>
                ) : (
                  <div className="overflow-x-auto thin-scrollbar">
                    <table className="w-full border-separate border-spacing-0">
                      <tbody>
                        {/* image + name row */}
                        <tr>
                          <td className="sticky left-0 z-10 w-28 bg-card p-2 align-bottom">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Product
                            </span>
                          </td>
                          {items.map((p) => {
                            const wins: string[] = [];
                            if (p.id === lowestPriceId) wins.push("Best value");
                            if (p.id === topRatedId) wins.push("Top rated");
                            if (p.id === mostStockId && p.stock > 0) wins.push("Most stock");
                            return (
                            <td key={p.id} className="min-w-44 p-2 align-bottom">
                              <div className="relative">
                                <button
                                  onClick={() => toggleCompare(p.id)}
                                  className="absolute right-1 top-1 z-10 grid h-7 w-7 place-items-center rounded-full bg-background/80 text-muted-foreground backdrop-blur hover:text-rose-500"
                                  aria-label="Remove from compare"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                                <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                                  <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                                  {p.badge && (
                                    <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide backdrop-blur">
                                      {p.badge}
                                    </span>
                                  )}
                                  {/* winner ribbon — gold gradient diagonal */}
                                  {wins.length > 0 && (
                                    <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
                                      {wins.map((w) => (
                                        <span
                                          key={w}
                                          className="inline-flex items-center gap-1 rounded-full gold-gradient px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-primary-foreground shadow"
                                        >
                                          <Trophy className="h-2.5 w-2.5" /> {w}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                                  {p.brand}
                                </div>
                                <div className="text-sm font-semibold leading-tight">{p.name}</div>
                              </div>
                            </td>
                            );
                          })}
                        </tr>

                        {/* price */}
                        <SpecRow label="Price" icon={DollarSign}>
                          {items.map((p) => (
                            <SpecCell key={p.id} highlight={p.id === lowestPriceId}>
                              <span className="text-base font-bold">{formatPrice(p.price, currency)}</span>
                              {p.compareAtPrice && (
                                <span className="ml-1 text-[11px] text-muted-foreground line-through">
                                  {formatPrice(p.compareAtPrice, currency)}
                                </span>
                              )}
                              {p.id === lowestPriceId && <BestBadge label="Best price" />}
                            </SpecCell>
                          ))}
                        </SpecRow>

                        {/* rating */}
                        <SpecRow label="Rating" icon={Star}>
                          {items.map((p) => (
                            <SpecCell key={p.id} highlight={p.id === topRatedId}>
                              <StarRating value={p.rating} size={12} showValue count={p.reviewCount} />
                              {p.id === topRatedId && <BestBadge label="Top rated" />}
                            </SpecCell>
                          ))}
                        </SpecRow>

                        {/* stock */}
                        <SpecRow label="Stock" icon={Boxes}>
                          {items.map((p) => (
                            <SpecCell key={p.id} highlight={p.id === mostStockId && p.stock > 0}>
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-[11px] font-medium",
                                  p.stock === 0
                                    ? "bg-muted text-muted-foreground"
                                    : p.stock <= 5
                                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                )}
                              >
                                {p.stock === 0 ? "Out of stock" : p.stock <= 5 ? `Only ${p.stock}` : `${p.stock} in stock`}
                              </span>
                            </SpecCell>
                          ))}
                        </SpecRow>

                        {/* colors */}
                        <SpecRow label="Colors" icon={Palette}>
                          {items.map((p) => (
                            <SpecCell key={p.id}>
                              <div className="flex flex-wrap gap-1">
                                {p.colors.map((c) => (
                                  <span
                                    key={c.name}
                                    className="h-4 w-4 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/15"
                                    style={{ backgroundColor: c.hex }}
                                    title={c.name}
                                  />
                                ))}
                              </div>
                            </SpecCell>
                          ))}
                        </SpecRow>

                        {/* sizes */}
                        <SpecRow label="Sizes" icon={Ruler}>
                          {items.map((p) => (
                            <SpecCell key={p.id}>
                              <div className="flex flex-wrap gap-1">
                                {p.sizes.map((s) => (
                                  <span key={s} className="rounded border border-border px-1.5 py-0.5 text-[10px]">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </SpecCell>
                          ))}
                        </SpecRow>

                        {/* brand */}
                        <SpecRow label="Brand" icon={Tag}>
                          {items.map((p) => (
                            <SpecCell key={p.id}>
                              <span className="text-sm">{p.brand}</span>
                            </SpecCell>
                          ))}
                        </SpecRow>

                        {/* category */}
                        <SpecRow label="Category" icon={Tag}>
                          {items.map((p) => (
                            <SpecCell key={p.id}>
                              <span className="text-sm">{p.category}</span>
                            </SpecCell>
                          ))}
                        </SpecRow>

                        {/* tags */}
                        <SpecRow label="Tags" icon={Tag}>
                          {items.map((p) => (
                            <SpecCell key={p.id}>
                              <div className="flex flex-wrap gap-1">
                                {p.tags.map((t) => (
                                  <span key={t} className="rounded-full bg-accent px-2 py-0.5 text-[10px]">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </SpecCell>
                          ))}
                        </SpecRow>

                        {/* add to cart row */}
                        <tr>
                          <td className="sticky left-0 z-10 w-28 bg-card p-2 align-top">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Action
                            </span>
                          </td>
                          {items.map((p) => (
                            <td key={p.id} className="min-w-44 p-2 align-top">
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                disabled={p.stock === 0}
                                onClick={() => {
                                  addToCart({
                                    productId: p.id,
                                    qty: 1,
                                    color: p.colors[0]?.name,
                                    size: p.sizes[0],
                                  });
                                  toast.success(`${p.name} added to bag`);
                                  onClose();
                                  setCartOpen(true);
                                }}
                                className={cn(
                                  "inline-flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors",
                                  p.stock === 0
                                    ? "cursor-not-allowed bg-muted text-muted-foreground"
                                    : "gold-gradient text-primary-foreground shadow-md shadow-gold/20"
                                )}
                              >
                                <ShoppingBag className="h-3.5 w-3.5" />
                                {p.stock === 0 ? "Sold out" : "Add to bag"}
                              </motion.button>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function SpecRow({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Star;
  children: React.ReactNode;
}) {
  return (
    <tr className="border-t border-border/60">
      <td className="sticky left-0 z-10 w-28 bg-card p-2 align-middle">
        <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <Icon className="h-3 w-3 text-gold" /> {label}
        </span>
      </td>
      {children}
    </tr>
  );
}

function SpecCell({
  children,
  highlight,
}: {
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <td
      className={cn(
        "min-w-44 p-2 align-middle",
        highlight && "bg-gold/5"
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </td>
  );
}

function BestBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold-deep dark:text-gold">
      <Trophy className="h-2.5 w-2.5" /> {label}
    </span>
  );
}
