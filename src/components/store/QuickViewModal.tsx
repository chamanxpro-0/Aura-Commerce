"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Check,
  ChevronRight,
  Truck,
  ShieldCheck,
  RefreshCcw,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";
import { StarRating } from "@/components/shared/StarRating";
import { toast } from "sonner";

export function QuickViewModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {product && <Inner key={product.id} product={product} onClose={onClose} />}
    </AnimatePresence>
  );
}

function Inner({ product, onClose }: { product: Product; onClose: () => void }) {
  const addToCart = useStore((s) => s.addToCart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const isWishlisted = useStore((s) => s.wishlist.includes(product.id));
  const pushRecentlyViewed = useStore((s) => s.pushRecentlyViewed);
  const openProductDetail = useStore((s) => s.openProductDetail);
  const currency = useStore((s) => s.currency);

  const [imgIdx, setImgIdx] = React.useState(0);
  const [color, setColor] = React.useState(product.colors[0]?.name);
  const [size, setSize] = React.useState(product.sizes[0]);
  const [qty, setQty] = React.useState(1);
  const [tab, setTab] = React.useState<"details" | "reviews" | "shipping">("details");

  // Track this product as recently viewed whenever the modal opens it
  React.useEffect(() => {
    pushRecentlyViewed(product.id);
  }, [product.id, pushRecentlyViewed]);

  // Close on Escape
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  React.useEffect(() => {
    setImgIdx(0);
    setColor(product.colors[0]?.name);
    setSize(product.sizes[0]);
    setQty(1);
    setTab("details");
  }, [product.id]);

  const outOfStock = product.stock === 0;
  const stockPct = Math.min(100, Math.round((product.stock / 20) * 100));

  const handleAdd = () => {
    addToCart({ productId: product.id, qty, color, size });
    toast.success(`Added ${qty} × ${product.name}`, {
      description: `${color} · ${size}`,
    });
    onClose();
    setCartOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-background/70 backdrop-blur-md"
      />
      <div className="fixed inset-0 z-[71] flex items-center justify-center p-3 sm:p-6">
        <motion.div
          layoutId={`product-${product.id}`}
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-border bg-background/70 backdrop-blur hover:bg-accent"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="grid max-h-[92vh] grid-cols-1 overflow-y-auto thin-scrollbar md:grid-cols-2 md:overflow-hidden">
            {/* Gallery */}
            <div className="relative bg-muted">
              <motion.div
                key={imgIdx}
                initial={{ opacity: 0.4, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative aspect-square"
              >
                <img
                  src={product.images[imgIdx]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </motion.div>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setImgIdx(idx)}
                    className={cn(
                      "h-14 w-14 overflow-hidden rounded-lg ring-2 transition-all",
                      idx === imgIdx ? "ring-gold" : "ring-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              {product.badge && (
                <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col gap-4 overflow-y-auto thin-scrollbar p-6 sm:p-8">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {product.brand}
                  </span>
                  <StarRating value={product.rating} size={13} showValue count={product.reviewCount} />
                </div>
                <h2 className="mt-1 text-2xl font-medium tracking-tight font-display sm:text-3xl">
                  {product.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{product.tagline}</p>
              </div>

              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold tracking-tight">
                  {formatPrice(product.price, currency)}
                </span>
                {product.compareAtPrice && (
                  <span className="pb-1 text-sm text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice, currency)}
                  </span>
                )}
              </div>

              {/* Color picker */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Color
                  </span>
                  <span className="text-xs text-foreground/70">{color}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setColor(c.name)}
                      className={cn(
                        "relative h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-card transition-all",
                        color === c.name ? "ring-gold" : "ring-transparent hover:ring-border"
                      )}
                      style={{ backgroundColor: c.hex }}
                      aria-label={c.name}
                    >
                      {color === c.name && (
                        <Check className="absolute inset-0 m-auto h-4 w-4 text-white mix-blend-difference" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size picker */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Size
                  </span>
                  <button className="text-xs text-gold hover:underline">Size guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={cn(
                        "min-w-12 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                        size === s
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground/40 hover:bg-accent"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock progress */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Availability</span>
                  <span className={cn("font-medium", outOfStock ? "text-muted-foreground" : "text-gold-deep dark:text-gold")}>
                    {outOfStock ? "Sold out" : product.stock <= 5 ? `Only ${product.stock} left!` : `${product.stock} in stock`}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${outOfStock ? 4 : stockPct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn("h-full rounded-full", outOfStock ? "bg-muted-foreground" : "gold-gradient")}
                  />
                </div>
              </div>

              {/* Qty + add */}
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-full border border-border">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="grid h-11 w-11 place-items-center rounded-l-full hover:bg-accent"
                    aria-label="Decrease"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                    className="grid h-11 w-11 place-items-center rounded-r-full hover:bg-accent"
                    aria-label="Increase"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAdd}
                  disabled={outOfStock}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors",
                    outOfStock
                      ? "cursor-not-allowed bg-muted text-muted-foreground"
                      : "gold-gradient text-primary-foreground shadow-lg shadow-gold/20"
                  )}
                >
                  <ShoppingBag className="h-4 w-4" />
                  {outOfStock ? "Sold Out" : `Add to Bag · ${formatPrice(product.price * qty, currency)}`}
                </motion.button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={cn(
                    "grid h-11 w-11 place-items-center rounded-full border transition-colors",
                    isWishlisted ? "border-rose-500 bg-rose-500 text-white" : "border-border hover:bg-accent"
                  )}
                  aria-label="Wishlist"
                >
                  <Heart className={cn("h-4 w-4", isWishlisted && "fill-white")} />
                </button>
              </div>

              <button
                onClick={() => {
                  onClose();
                  openProductDetail(product.id);
                }}
                className="group -mt-1 inline-flex items-center gap-1 self-start text-xs font-medium text-gold hover:underline"
              >
                View full details
                <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </button>

              {/* trust row */}
              <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-muted/30 p-3 text-center text-[11px] text-muted-foreground">
                <span className="flex flex-col items-center gap-1">
                  <Truck className="h-4 w-4 text-gold" /> Free ship $250+
                </span>
                <span className="flex flex-col items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-gold" /> Lifetime guarantee
                </span>
                <span className="flex flex-col items-center gap-1">
                  <RefreshCcw className="h-4 w-4 text-gold" /> 30-day returns
                </span>
              </div>

              {/* Tabs */}
              <div className="border-t border-border pt-3">
                <div className="flex gap-1 rounded-xl bg-muted p-1">
                  {(["details", "reviews", "shipping"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={cn(
                        "relative flex-1 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                        tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab === t && (
                        <motion.span layoutId="qv-tab" className="absolute inset-0 rounded-lg bg-background shadow-sm" />
                      )}
                      <span className="relative">{t}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 min-h-[120px] text-sm text-muted-foreground">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      {tab === "details" && (
                        <p className="leading-relaxed">{product.description}</p>
                      )}
                      {tab === "reviews" && (
                        <div className="space-y-3">
                          {product.reviews.map((rev) => (
                            <div key={rev.id} className="rounded-xl border border-border p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-[11px] font-bold">
                                    {rev.author[0]}
                                  </span>
                                  <div>
                                    <div className="text-xs font-semibold text-foreground">{rev.author}</div>
                                    {rev.verified && (
                                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                        ✓ Verified buyer
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <StarRating value={rev.rating} size={11} />
                              </div>
                              <div className="mt-2 text-xs font-medium text-foreground">{rev.title}</div>
                              <p className="mt-0.5 text-xs text-muted-foreground">{rev.body}</p>
                              <div className="mt-1 text-[10px] text-muted-foreground/70">{rev.date}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {tab === "shipping" && (
                        <ul className="space-y-2 text-xs">
                          <li>• Free carbon-neutral shipping on orders over $250.</li>
                          <li>• Express delivery in 1–3 business days.</li>
                          <li>• International duties calculated at checkout.</li>
                          <li>• 30-day no-questions returns. Items must be unworn with tags.</li>
                        </ul>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
