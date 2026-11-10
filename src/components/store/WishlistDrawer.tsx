"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  ShoppingBag,
  Trash2,
  Eye,
  Sparkles,
  ArrowRight,
  Share2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { StarRating } from "@/components/shared/StarRating";
import { WishlistShareModal } from "./WishlistShareModal";
import type { Product } from "@/lib/types";
import { toast } from "sonner";
import { cn, formatPrice } from "@/lib/utils";

export function WishlistDrawer({ onQuickView }: { onQuickView: (p: Product) => void }) {
  const open = useStore((s) => s.wishlistOpen);
  const setOpen = useStore((s) => s.setWishlistOpen);
  const wishlist = useStore((s) => s.wishlist);
  const products = useStore((s) => s.products);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const moveWishlistToCart = useStore((s) => s.moveWishlistToCart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const currency = useStore((s) => s.currency);
  const [shareOpen, setShareOpen] = React.useState(false);

  const items = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  const total = items.reduce((sum, p) => sum + p.price, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[80] bg-background/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="fixed right-0 top-0 z-[81] flex h-[100dvh] w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-rose-500/15 text-rose-500">
                  <Heart className="h-4 w-4 fill-rose-500" />
                </span>
                <h2 className="text-base font-semibold">Saved Items</h2>
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold">
                  {items.length}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent"
                aria-label="Close wishlist"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* body */}
            <div className="flex-1 overflow-y-auto thin-scrollbar px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-accent">
                    <Heart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">No saved pieces yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Tap the heart on any product to keep it here for later.
                    </p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="mt-2 rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-accent"
                  >
                    Browse the collection
                  </button>
                </div>
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map((p) => (
                      <motion.li
                        key={p.id}
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
                        className="group flex gap-3 rounded-2xl border border-border bg-background p-3"
                      >
                        <button
                          onClick={() => {
                            setOpen(false);
                            onQuickView(p);
                          }}
                          className="relative shrink-0"
                        >
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="h-20 w-20 rounded-xl object-cover ring-1 ring-border transition-transform group-hover:scale-105"
                          />
                          <span className="absolute inset-0 grid place-items-center rounded-xl bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                            <Eye className="h-4 w-4 text-white" />
                          </span>
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold">{p.name}</div>
                              <div className="text-[11px] text-muted-foreground">{p.brand}</div>
                              <div className="mt-1">
                                <StarRating value={p.rating} size={11} showValue />
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                toggleWishlist(p.id);
                                toast(`Removed ${p.name} from saved items`);
                              }}
                              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                              aria-label="Remove from wishlist"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm font-bold">{formatPrice(p.price, currency)}</span>
                              {p.compareAtPrice && (
                                <span className="text-[11px] text-muted-foreground line-through">
                                  {formatPrice(p.compareAtPrice, currency)}
                                </span>
                              )}
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.94 }}
                              disabled={p.stock === 0}
                              onClick={() => {
                                moveWishlistToCart(p.id);
                                toast.success(`${p.name} moved to bag`);
                                setCartOpen(true);
                                setOpen(false);
                              }}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors",
                                p.stock === 0
                                  ? "cursor-not-allowed bg-muted text-muted-foreground"
                                  : "gold-gradient text-primary-foreground"
                              )}
                            >
                              <ShoppingBag className="h-3 w-3" />
                              {p.stock === 0 ? "Sold out" : "Add to bag"}
                            </motion.button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-5 py-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {items.length} saved piece{items.length === 1 ? "" : "s"}
                  </span>
                  <span className="font-semibold">
                    Combined value: <span className="gold-text">{formatPrice(total, currency)}</span>
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShareOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
                    aria-label="Share wishlist"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      items.forEach((p) => p.stock > 0 && moveWishlistToCart(p.id));
                      toast.success(`Moved ${items.length} items to bag`);
                      setOpen(false);
                      setCartOpen(true);
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full gold-gradient py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-gold/20"
                  >
                    <Sparkles className="h-4 w-4" /> Move all to bag
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.aside>

          {/* Share modal — rendered outside the drawer so it isn't clipped */}
          <WishlistShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
        </>
      )}
    </AnimatePresence>
  );
}
