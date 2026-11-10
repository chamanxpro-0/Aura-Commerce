"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Check,
  Truck,
  ShieldCheck,
  RefreshCcw,
  Star,
  ChevronRight,
  GitCompare,
  Sparkles,
  Share2,
  ZoomIn,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useScrollTop } from "@/lib/useScrollTop";
import { StarRating } from "@/components/shared/StarRating";
import { CheckoutModal } from "@/components/store/CheckoutModal";
import { SizeGuideModal } from "@/components/store/SizeGuideModal";
import { cn, formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import type { Product, Currency } from "@/lib/types";

export function ProductDetail({ productId }: { productId: string }) {
  const product = useStore((s) => s.products.find((p) => p.id === productId));
  const products = useStore((s) => s.products);
  const addToCart = useStore((s) => s.addToCart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const isWishlisted = useStore((s) => s.wishlist.includes(productId));
  const toggleCompare = useStore((s) => s.toggleCompare);
  const inCompare = useStore((s) => s.compareList.includes(productId));
  const closeProductDetail = useStore((s) => s.closeProductDetail);
  const openProductDetail = useStore((s) => s.openProductDetail);
  const setView = useStore((s) => s.setView);
  const currency = useStore((s) => s.currency);
  const [checkout, setCheckout] = React.useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = React.useState(false);

  const [imgIdx, setImgIdx] = React.useState(0);
  const [color, setColor] = React.useState(product?.colors[0]?.name ?? "");
  const [size, setSize] = React.useState(product?.sizes[0] ?? "");
  const [qty, setQty] = React.useState(1);
  const [tab, setTab] = React.useState<"description" | "specs" | "reviews">("description");
  const [completeLookIdx, setCompleteLookIdx] = React.useState(0);

  // Deterministic scroll-to-top once the page has actually mounted —
  // fixes the "detail opens mid-page" positioning bug.
  useScrollTop();

  React.useEffect(() => {
    setImgIdx(0);
    setColor(product?.colors[0]?.name ?? "");
    setSize(product?.sizes[0] ?? "");
    setQty(1);
    setTab("description");
  }, [productId, product]);

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Product not found.</p>
        <button
          onClick={() => setView("shop")}
          className="rounded-full gold-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Back to the atelier
        </button>
      </div>
    );
  }

  const outOfStock = product.stock === 0;
  const stockPct = Math.min(100, Math.round((product.stock / 20) * 100));
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;

  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);
  const relatedFallback = products.filter((p) => p.id !== product.id).slice(0, 4);
  const relatedList = related.length >= 2 ? related : relatedFallback;

  // "Complete the Look" — pick complementary pieces from OTHER categories
  // to encourage cross-category styling (e.g. headphones + leather bag + watch).
  const completeTheLook = (() => {
    const otherCats = products.filter(
      (p) => p.id !== product.id && p.category !== product.category
    );
    // Deterministic "stylist pick" — sort by rating then take 3 distinct categories
    const sorted = [...otherCats].sort((a, b) => b.rating - a.rating);
    const picks: typeof products = [];
    const seenCats = new Set<string>();
    for (const p of sorted) {
      if (!seenCats.has(p.category) && picks.length < 3) {
        picks.push(p);
        seenCats.add(p.category);
      }
    }
    // pad if needed
    if (picks.length < 3) {
      for (const p of sorted) {
        if (!picks.find((x) => x.id === p.id) && picks.length < 3) picks.push(p);
      }
    }
    return picks;
  })();

  const completeLookTotal = product.price + completeTheLook.reduce((s, p) => s + p.price, 0);

  const handleAdd = () => {
    addToCart({ productId: product.id, qty, color, size });
    toast.success(`Added ${qty} × ${product.name}`, { description: `${color} · ${size}` });
  };

  const handleBuyNow = () => {
    addToCart({ productId: product.id, qty, color, size });
    setCheckout(true);
    setCartOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="pb-8"
    >
      <CheckoutModal open={checkout} onClose={() => setCheckout(false)} />
      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        kind={product.category === "Accessories" ? "accessories" : "apparel"}
      />

      {/* Sticky add-to-cart bar — appears when the main CTA scrolls out of view */}
      <StickyAddToCartBar
        product={product}
        color={color}
        size={size}
        qty={qty}
        currency={currency}
        onAdd={handleAdd}
        onBuyNow={handleBuyNow}
        outOfStock={outOfStock}
      />

      <main className="flex-1 pt-6">
        <div className="mx-auto max-w-7xl px-4">
          {/* breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <button onClick={() => setView("home")} className="hover:text-foreground">
              Home
            </button>
            <ChevronRight className="h-3 w-3" />
            <button onClick={() => setView("shop")} className="hover:text-foreground">
              Shop
            </button>
            <ChevronRight className="h-3 w-3" />
            <span>{product.category}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="truncate text-foreground/70">{product.name}</span>
          </nav>

          {/* back button */}
          <button
            onClick={() => closeProductDetail()}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" /> Back to collection
          </button>

          {/* main grid */}
          <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* gallery */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ZoomImage
                src={product.images[imgIdx]}
                alt={product.name}
                badge={product.badge}
                discount={discount}
                key={imgIdx}
              />
              {product.images.length > 1 && (
                <div className="mt-3 flex gap-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setImgIdx(idx)}
                      className={cn(
                        "h-20 w-20 overflow-hidden rounded-xl ring-2 transition-all",
                        idx === imgIdx ? "ring-gold" : "ring-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* purchase panel */}
            <div className="flex flex-col gap-5">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold">
                  {product.brand}
                </div>
                <h1 className="mt-2 text-3xl font-medium tracking-tight font-display sm:text-4xl">
                  {product.name}
                </h1>
                <p className="mt-2 text-base text-muted-foreground">{product.tagline}</p>
                <div className="mt-3 flex items-center gap-3">
                  <StarRating value={product.rating} size={16} showValue count={product.reviewCount} />
                  <button className="text-xs text-muted-foreground hover:text-foreground">
                    Read reviews
                  </button>
                </div>
              </div>

              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold tracking-tight gold-text">
                  {formatPrice(product.price, currency)}
                </span>
                {product.compareAtPrice && (
                  <span className="pb-1 text-lg text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice, currency)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="mb-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                    Save {discount}%
                  </span>
                )}
              </div>

              <p className="text-sm leading-relaxed text-foreground/80">{product.description}</p>

              {/* color */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Color
                  </span>
                  <span className="text-xs text-foreground/70">{color}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setColor(c.name)}
                      className={cn(
                        "relative h-10 w-10 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all",
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

              {/* size */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Size
                  </span>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
                  >
                    Size guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={cn(
                        "min-w-14 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
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

              {/* stock */}
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

              {/* qty + actions */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-full border border-border">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="grid h-12 w-12 place-items-center rounded-l-full hover:bg-accent"
                    aria-label="Decrease"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                    className="grid h-12 w-12 place-items-center rounded-r-full hover:bg-accent"
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
                    "flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors",
                    outOfStock
                      ? "cursor-not-allowed bg-muted text-muted-foreground"
                      : "border border-border bg-background hover:bg-accent"
                  )}
                >
                  <ShoppingBag className="h-4 w-4" /> Add to bag
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBuyNow}
                  disabled={outOfStock}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors",
                    outOfStock
                      ? "cursor-not-allowed bg-muted text-muted-foreground"
                      : "gold-gradient text-primary-foreground shadow-lg shadow-gold/20"
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                  {outOfStock ? "Sold out" : `Buy now · ${formatPrice(product.price * qty, currency)}`}
                </motion.button>
              </div>

              {/* secondary actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
                    isWishlisted
                      ? "border-rose-500 bg-rose-500/10 text-rose-500"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <Heart className={cn("h-3.5 w-3.5", isWishlisted && "fill-rose-500")} />
                  {isWishlisted ? "Saved" : "Save"}
                </button>
                <button
                  onClick={() => {
                    if (!inCompare) {
                      const list = useStore.getState().compareList;
                      if (list.length >= 4) {
                        toast.error("Compare is full (max 4)");
                        return;
                      }
                    }
                    toggleCompare(product.id);
                    toast(inCompare ? "Removed from compare" : "Added to compare");
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
                    inCompare ? "border-gold bg-gold/10 text-gold-deep dark:text-gold" : "border-border hover:bg-accent"
                  )}
                >
                  <GitCompare className="h-3.5 w-3.5" /> Compare
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success("Product link copied");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-medium hover:bg-accent"
                >
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
              </div>

              {/* trust */}
              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-muted/30 p-3 text-center text-[11px] text-muted-foreground">
                <span className="flex flex-col items-center gap-1">
                  <Truck className="h-4 w-4 text-gold" /> Free ship {formatPrice(250, currency)}+
                </span>
                <span className="flex flex-col items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-gold" /> Lifetime guarantee
                </span>
                <span className="flex flex-col items-center gap-1">
                  <RefreshCcw className="h-4 w-4 text-gold" /> 30-day returns
                </span>
              </div>

              {/* tabs */}
              <div className="border-t border-border pt-4">
                <div className="flex gap-1 rounded-xl bg-muted p-1">
                  {(["description", "specs", "reviews"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={cn(
                        "relative flex-1 rounded-lg px-3 py-2 text-xs font-medium capitalize transition-colors",
                        tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab === t && <motion.span layoutId="pd-tab" className="absolute inset-0 rounded-lg bg-background shadow-sm" />}
                      <span className="relative">{t}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 min-h-[140px] text-sm text-muted-foreground">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      {tab === "description" && <p className="leading-relaxed">{product.description}</p>}
                      {tab === "specs" && (
                        <dl className="grid grid-cols-2 gap-2">
                          <SpecRow label="Brand" value={product.brand} />
                          <SpecRow label="Category" value={product.category} />
                          <SpecRow label="Colors" value={String(product.colors.length)} />
                          <SpecRow label="Sizes" value={String(product.sizes.length)} />
                          <SpecRow label="Rating" value={`${product.rating} / 5`} />
                          <SpecRow label="Reviews" value={String(product.reviewCount)} />
                          <SpecRow label="Units sold" value={product.sales.toLocaleString()} />
                          <SpecRow label="SKU" value={product.id.toUpperCase()} />
                        </dl>
                      )}
                      {tab === "reviews" && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-4 rounded-xl border border-border p-3">
                            <div className="text-center">
                              <div className="text-3xl font-bold gold-text">{product.rating}</div>
                              <StarRating value={product.rating} size={12} />
                              <div className="mt-0.5 text-[10px] text-muted-foreground">{product.reviewCount} reviews</div>
                            </div>
                            <div className="flex-1 space-y-1">
                              {[5, 4, 3, 2, 1].map((star) => {
                                const pct = star === 5 ? 78 : star === 4 ? 16 : star === 3 ? 4 : 1;
                                return (
                                  <div key={star} className="flex items-center gap-2 text-[10px]">
                                    <span className="w-3 text-muted-foreground">{star}</span>
                                    <Star className="h-2.5 w-2.5 fill-gold text-gold" />
                                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                      <div className="h-full gold-gradient" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="w-8 text-right text-muted-foreground">{pct}%</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
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
                                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">✓ Verified buyer</span>
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

                      {/* Write a review form */}
                      <WriteReviewForm productId={product.id} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Complete the Look — stylist cross-category pairing */}
          <section className="mt-16 scroll-mt-24 border-t border-border pt-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold">
                  The stylist's pick
                </div>
                <h2 className="mt-1 text-2xl font-medium tracking-tight font-display sm:text-3xl">
                  Complete the <span className="gold-text">look</span>
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Three pieces from other ateliers that pair effortlessly with{" "}
                  <span className="font-medium text-foreground">{product.name}</span>.
                </p>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Look total</div>
                <div className="font-display text-2xl font-bold gold-text">
                  {formatPrice(completeLookTotal, currency)}
                </div>
                <button
                  onClick={() => {
                    completeTheLook.forEach((p) =>
                      addToCart({
                        productId: p.id,
                        qty: 1,
                        color: p.colors[0]?.name,
                        size: p.sizes[0],
                      })
                    );
                    toast.success(`Added the full look (${completeTheLook.length + 1} pieces)`);
                  }}
                  className="mt-2 inline-flex items-center gap-2 rounded-full gold-gradient px-5 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> Add the full look
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* the main product, always shown first */}
              <CompleteLookCard
                product={product}
                currency={currency}
                featured
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              />
              {completeTheLook.map((p, i) => (
                <CompleteLookCard
                  key={p.id}
                  product={p}
                  currency={currency}
                  index={i}
                  onClick={() => openProductDetail(p.id)}
                />
              ))}
            </div>
          </section>

          {/* related products */}
          <section className="mt-16 scroll-mt-24 border-t border-border pt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold">
                  You may also like
                </div>
                <h2 className="mt-1 text-2xl font-medium tracking-tight font-display sm:text-3xl">
                  Related <span className="gold-text">pieces</span>
                </h2>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {relatedList.map((p, i) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  onClick={() => openProductDetail(p.id)}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-border text-left"
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <div className="text-[10px] uppercase tracking-wide text-white/70">{p.brand}</div>
                    <div className="mt-0.5 line-clamp-1 text-sm font-semibold">{p.name}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <StarRating value={p.rating} size={10} />
                      <span className="text-sm font-bold">{formatPrice(p.price, currency)}</span>
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
                </motion.button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </motion.div>
  );
}

/* ---- Complete the Look card ---- */
function CompleteLookCard({
  product,
  currency,
  index = 0,
  featured = false,
  onClick,
}: {
  product: Product;
  currency: Currency;
  index?: number;
  featured?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: 0.05 + index * 0.08 }}
      onClick={onClick}
      className={cn(
        "group relative aspect-[4/5] overflow-hidden rounded-2xl border text-left",
        featured ? "border-gold ring-2 ring-gold/20" : "border-border"
      )}
    >
      <img
        src={product.images[0]}
        alt={product.name}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      {featured && (
        <div className="absolute left-3 top-3 rounded-full gold-gradient px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
          This piece
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="text-[10px] uppercase tracking-wide text-white/70">{product.category}</div>
        <div className="mt-0.5 line-clamp-1 font-display text-base font-semibold">{product.name}</div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-bold gold-text">
            {formatPrice(product.price, currency)}
          </span>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15 backdrop-blur-sm transition-colors group-hover:bg-gold group-hover:text-primary-foreground">
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </motion.button>
  );
}

/* ---- WriteReviewForm — submit a customer review ---- */
function WriteReviewForm({ productId }: { productId: string }) {
  const addReview = useStore((s) => s.addReview);
  const [open, setOpen] = React.useState(false);
  const [author, setAuthor] = React.useState("");
  const [rating, setRating] = React.useState(5);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const reset = () => {
    setAuthor("");
    setRating(5);
    setTitle("");
    setBody("");
    setOpen(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    addReview(productId, {
      author: author.trim() || "Anonymous",
      rating,
      title: title.trim(),
      body: body.trim(),
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      reset();
    }, 2500);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-4 flex items-center gap-2.5 rounded-xl border border-gold/40 bg-gold/10 p-3"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full gold-gradient text-primary-foreground">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
        <span className="text-sm font-medium text-gold-deep dark:text-gold">
          Thank you — your review is now live.
        </span>
      </motion.div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-xs font-medium transition-colors hover:border-gold/50 hover:text-gold"
      >
        <Star className="h-3.5 w-3.5" /> Write a review
      </button>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      onSubmit={submit}
      className="mt-4 overflow-hidden rounded-xl border border-border bg-muted/30 p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Share your experience
        </span>
        <button
          type="button"
          onClick={reset}
          className="text-[10px] text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Name (optional)
          </span>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Anonymous"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Rating
          </span>
          <div className="flex items-center gap-1 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5"
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
              >
                <Star
                  className={cn(
                    "h-5 w-5 transition-colors",
                    star <= (hoverRating || rating)
                      ? "fill-gold text-gold"
                      : "text-muted-foreground/40"
                  )}
                />
              </button>
            ))}
          </div>
        </label>
      </div>

      <label className="mt-3 block">
        <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Title
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum up your experience in a line"
          required
          maxLength={80}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </label>

      <label className="mt-3 block">
        <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Review
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What did you love? What could be better? How does it feel in hand?"
          required
          rows={3}
          maxLength={500}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
        />
        <div className="mt-1 text-right text-[10px] text-muted-foreground">{body.length}/500</div>
      </label>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="submit"
          disabled={!title.trim() || !body.trim()}
          className="inline-flex items-center gap-2 rounded-full gold-gradient px-5 py-2 text-xs font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5" /> Submit review
        </button>
      </div>
    </motion.form>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

/* ---- ZoomImage — hover magnifier lens for the product gallery ---- */
function ZoomImage({
  src,
  alt,
  badge,
  discount,
}: {
  src: string;
  alt: string;
  badge?: string;
  discount?: number;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [lens, setLens] = React.useState<{ x: number; y: number; on: boolean }>({
    x: 50,
    y: 50,
    on: false,
  });

  const onMove = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setLens({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)), on: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0.4, scale: 1.03 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      ref={containerRef}
      onMouseMove={onMove}
      onMouseLeave={() => setLens((l) => ({ ...l, on: false }))}
      className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border border-border bg-muted luxury-shadow"
    >
      {/* base image */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-200"
        style={{ transform: lens.on ? "scale(1.02)" : "scale(1)" }}
      />

      {/* magnifier lens — a circular window that follows the cursor */}
      <AnimatePresence>
        {lens.on && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute z-20 h-32 w-32 overflow-hidden rounded-full border-2 border-white/80 shadow-2xl"
            style={{
              left: `calc(${lens.x}% - 64px)`,
              top: `calc(${lens.y}% - 64px)`,
              backgroundImage: `url(${src})`,
              backgroundSize: "300% 300%",
              backgroundPosition: `${lens.x}% ${lens.y}%`,
              backgroundRepeat: "no-repeat",
            }}
          />
        )}
      </AnimatePresence>

      {/* hover hint */}
      <div
        className={cn(
          "pointer-events-none absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-medium backdrop-blur transition-opacity duration-200",
          lens.on ? "opacity-0" : "opacity-100 group-hover:opacity-70"
        )}
      >
        <ZoomIn className="h-3.5 w-3.5 text-gold" />
        Hover to zoom
      </div>

      {badge && (
        <span className="absolute left-4 top-4 z-10 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur">
          {badge}
        </span>
      )}
      {discount !== undefined && discount > 0 && (
        <span className="absolute right-4 top-4 z-10 rounded-full bg-rose-500 px-3 py-1 text-[11px] font-bold text-white">
          −{discount}%
        </span>
      )}
    </motion.div>
  );
}


/* ---- StickyAddToCartBar — appears when the main CTA scrolls out of view ---- */
function StickyAddToCartBar({
  product,
  color,
  size,
  qty,
  currency,
  onAdd,
  onBuyNow,
  outOfStock,
}: {
  product: Product;
  color: string;
  size: string;
  qty: number;
  currency: Currency;
  onAdd: () => void;
  onBuyNow: () => void;
  outOfStock: boolean;
}) {
  const [visible, setVisible] = React.useState(false);
  const [portalTarget] = React.useState(() => {
    // Portal to body — escapes the filter:blur(0px) containing-block bug
    if (typeof document === "undefined") return null;
    return document.body;
  });
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Track scroll — show the bar after the user scrolls 500px (past the hero gallery + main CTA)
  React.useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 500);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!mounted || !portalTarget) return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="fixed inset-x-0 bottom-0 z-[75] border-t border-border bg-card/95 backdrop-blur-xl shadow-[0_-8px_30px_oklch(0.21_0.014_60/0.08)]"
        >
          {/* gold hairline accent */}
          <div className="absolute inset-x-0 top-0 h-0.5 gold-gradient" />
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
            {/* product thumbnail */}
            <img
              src={product.images[0]}
              alt={product.name}
              className="hidden h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-border sm:block"
            />
            {/* product info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="truncate text-sm font-semibold">{product.name}</span>
                <span className="hidden text-[10px] uppercase tracking-wide text-muted-foreground md:inline">
                  {color} · {size}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-bold gold-text">
                  {formatPrice(product.price * qty, currency)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice * qty, currency)}
                  </span>
                )}
              </div>
            </div>
            {/* qty badge */}
            <span className="hidden rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground sm:inline">
              ×{qty}
            </span>
            {/* actions */}
            <button
              onClick={onAdd}
              disabled={outOfStock}
              className={cn(
                "hidden items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors sm:inline-flex",
                outOfStock
                  ? "cursor-not-allowed border-border text-muted-foreground"
                  : "border-border hover:bg-accent"
              )}
            >
              <ShoppingBag className="h-4 w-4" /> Add to bag
            </button>
            <button
              onClick={onBuyNow}
              disabled={outOfStock}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.02]",
                outOfStock
                  ? "cursor-not-allowed bg-muted text-muted-foreground"
                  : "gold-gradient text-primary-foreground shadow-lg shadow-gold/20"
              )}
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">{outOfStock ? "Sold out" : "Buy now"}</span>
              <span className="sm:hidden">{outOfStock ? "Sold out" : "Buy"}</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalTarget
  );
}
