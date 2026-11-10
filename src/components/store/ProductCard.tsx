"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Heart, Eye, Plus, Check, GitCompare } from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";
import { StarRating } from "@/components/shared/StarRating";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  layout: "grid" | "list";
  index?: number;
  onQuickView: (p: Product) => void;
}

const badgeStyle: Record<string, string> = {
  Bestseller: "bg-gold/15 text-gold-deep dark:text-gold border-gold/30",
  New: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  Limited: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  "Low Stock": "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  "Out of Stock": "bg-muted text-muted-foreground border-border",
};

export function ProductCard({ product, layout, index = 0, onQuickView }: ProductCardProps) {
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const isWishlisted = useStore((s) => s.wishlist.includes(product.id));
  const addToCart = useStore((s) => s.addToCart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const toggleCompare = useStore((s) => s.toggleCompare);
  const inCompare = useStore((s) => s.compareList.includes(product.id));
  const openProductDetail = useStore((s) => s.openProductDetail);
  const currency = useStore((s) => s.currency);
  const [added, setAdded] = React.useState(false);

  const outOfStock = product.stock === 0;
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    addToCart({
      productId: product.id,
      qty: 1,
      color: product.colors[0]?.name,
      size: product.sizes[0],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
    toast.success(`${product.name} added to bag`, {
      description: `${formatPrice(product.price, currency)} · ${product.colors[0]?.name}`,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
    if (!isWishlisted) toast(`${product.name} saved to wishlist`);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inCompare) {
      const list = useStore.getState().compareList;
      if (list.length >= 4) {
        toast.error("Compare is full (max 4). Remove one first.");
        return;
      }
    }
    toggleCompare(product.id);
    toast(
      inCompare ? `Removed ${product.name} from compare` : `Added ${product.name} to compare`
    );
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView(product);
  };

  const cardInner = (
    <>
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <motion.img
          src={product.images[0]}
          alt={product.name}
          className={cn(
            "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110",
            outOfStock && "opacity-60 grayscale"
          )}
          loading="lazy"
        />
        {/* second image crossfade on hover */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {/* gradient + badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badge && (
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur",
                badgeStyle[product.badge] ?? "bg-background/80 border-border"
              )}
            >
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur">
              -{discount}%
            </span>
          )}
        </div>

        {/* wishlist heart */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <button
            onClick={handleWishlist}
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition-all",
              isWishlisted
                ? "border-rose-500/40 bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                : "border-border bg-background/70 text-foreground hover:bg-background"
            )}
            aria-label="Toggle wishlist"
          >
            <motion.span
              key={isWishlisted ? "on" : "off"}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
            >
              <Heart className={cn("h-4 w-4", isWishlisted && "fill-white")} />
            </motion.span>
            {isWishlisted && (
              <span className="pulse-ring pointer-events-none absolute inset-0 rounded-full" />
            )}
          </button>
          <button
            onClick={handleCompare}
            className={cn(
              "grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition-all",
              inCompare
                ? "border-gold/50 bg-gold text-primary-foreground shadow-lg shadow-gold/30"
                : "border-border bg-background/70 text-foreground hover:bg-background"
            )}
            aria-label="Toggle compare"
            title={inCompare ? "Remove from compare" : "Add to compare"}
          >
            <GitCompare className={cn("h-4 w-4", inCompare && "rotate-180")} />
          </button>
        </div>

        {/* quick view */}
        <button
          onClick={handleQuickView}
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 translate-y-3 items-center gap-1.5 rounded-full bg-background/90 px-3.5 py-1.5 text-xs font-medium text-foreground opacity-0 shadow-lg backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-background"
        >
          <Eye className="h-3.5 w-3.5" /> Quick View
        </button>

        {/* floating quick add — hover flyout with size/color quick-pick */}
        <div className="absolute bottom-3 right-3 group/quickadd">
          {/* flyout panel — appears on hover of the + button */}
          {!outOfStock && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              whileHover={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute bottom-12 right-0 hidden w-44 rounded-2xl border border-border bg-card p-2.5 shadow-2xl opacity-0 transition-opacity duration-200 group-hover/quickadd:opacity-100 group-hover/quickadd:block"
            >
              <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                Quick add
              </div>
              {/* color row */}
              {product.colors.length > 1 && (
                <div className="mb-2">
                  <div className="mb-1 text-[9px] text-muted-foreground/70">Color</div>
                  <div className="flex flex-wrap gap-1">
                    {product.colors.slice(0, 5).map((c) => (
                      <button
                        key={c.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({
                            productId: product.id,
                            qty: 1,
                            color: c.name,
                            size: product.sizes[0],
                          });
                          setAdded(true);
                          setTimeout(() => setAdded(false), 1400);
                          toast.success(`${product.name} (${c.name}) added to bag`);
                        }}
                        className="h-5 w-5 rounded-full ring-1 ring-inset ring-black/10 transition-transform hover:scale-125 dark:ring-white/15"
                        style={{ backgroundColor: c.hex }}
                        title={`${c.name} — add to bag`}
                        aria-label={`Add ${c.name} to bag`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {/* size row */}
              {product.sizes.length > 0 && (
                <div>
                  <div className="mb-1 text-[9px] text-muted-foreground/70">Size</div>
                  <div className="flex flex-wrap gap-1">
                    {product.sizes.slice(0, 4).map((s) => (
                      <button
                        key={s}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({
                            productId: product.id,
                            qty: 1,
                            color: product.colors[0]?.name,
                            size: s,
                          });
                          setAdded(true);
                          setTimeout(() => setAdded(false), 1400);
                          toast.success(`${product.name} (${s}) added to bag`);
                        }}
                        className="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-medium transition-colors hover:border-gold hover:text-gold"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* gold accent */}
              <div className="absolute -bottom-1 right-4 h-2 w-2 rotate-45 border-b border-r border-border bg-card" />
            </motion.div>
          )}
          <motion.button
            onClick={handleAdd}
            disabled={outOfStock}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full shadow-lg transition-colors",
              outOfStock
                ? "cursor-not-allowed bg-muted text-muted-foreground"
                : added
                ? "bg-emerald-500 text-white"
                : "gold-gradient text-primary-foreground"
            )}
            aria-label="Quick add to cart"
          >
            {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </motion.button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1.5 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </span>
          <StarRating value={product.rating} size={11} showValue count={product.reviewCount} />
        </div>
        <h3 className="line-clamp-1 text-[15px] font-medium tracking-tight font-display">
          {product.name}
        </h3>
        <p className="line-clamp-1 text-xs text-muted-foreground">{product.tagline}</p>

        {/* color swatches */}
        <div className="mt-1 flex items-center gap-1.5">
          {product.colors.slice(0, 5).map((c) => (
            <span
              key={c.name}
              className="h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/15"
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
          {product.colors.length > 5 && (
            <span className="text-[10px] text-muted-foreground">+{product.colors.length - 5}</span>
          )}
        </div>

        <div className="mt-2 flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight">
              {formatPrice(product.price, currency)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice, currency)}
              </span>
            )}
          </div>
          <StockPill stock={product.stock} />
        </div>
      </div>
    </>
  );

  if (layout === "list") {
    return (
      <motion.article
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
        onClick={() => openProductDetail(product.id)}
        className="group grid cursor-pointer grid-cols-[160px_1fr] gap-4 overflow-hidden rounded-2xl border border-border bg-card p-3 transition-shadow hover:luxury-shadow sm:grid-cols-[200px_1fr] sm:gap-6 sm:p-4"
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted sm:aspect-[4/5]">
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        </div>
        <div className="flex flex-col justify-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{product.brand}</span>
          <h3 className="text-xl font-medium tracking-tight font-display">{product.name}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          <div className="flex items-center gap-3">
            <StarRating value={product.rating} size={12} showValue count={product.reviewCount} />
            <StockPill stock={product.stock} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{formatPrice(product.price, currency)}</span>
              {product.compareAtPrice && <span className="text-sm text-muted-foreground line-through">{formatPrice(product.compareAtPrice, currency)}</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={handleWishlist} className={cn("grid h-9 w-9 place-items-center rounded-full border", isWishlisted ? "border-rose-500 bg-rose-500 text-white" : "border-border hover:bg-accent")}>
                <Heart className={cn("h-4 w-4", isWishlisted && "fill-white")} />
              </button>
              <button onClick={handleCompare} className={cn("grid h-9 w-9 place-items-center rounded-full border", inCompare ? "border-gold bg-gold text-primary-foreground" : "border-border hover:bg-accent")} title="Compare">
                <GitCompare className="h-4 w-4" />
              </button>
              <button onClick={handleQuickView} className="rounded-full border border-border px-3 py-2 text-xs font-medium hover:bg-accent">Quick View</button>
              <motion.button onClick={handleAdd} disabled={outOfStock} whileTap={{ scale: 0.9 }} className={cn("rounded-full px-4 py-2 text-xs font-semibold", outOfStock ? "bg-muted text-muted-foreground" : "gold-gradient text-primary-foreground")}>
                {added ? "Added!" : "Add"}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      onClick={() => openProductDetail(product.id)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:luxury-shadow"
    >
      {cardInner}
    </motion.article>
  );
}

function StockPill({ stock }: { stock: number }) {
  const tone =
    stock === 0
      ? "bg-muted text-muted-foreground"
      : stock <= 5
      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
      : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
  const label =
    stock === 0 ? "Out of stock" : stock <= 5 ? `Only ${stock} left` : "In stock";
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", tone)}>
      {label}
    </span>
  );
}
