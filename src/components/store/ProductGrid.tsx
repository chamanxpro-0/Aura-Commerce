"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Grid3x3,
  Rows3,
  SlidersHorizontal,
  Search,
  X,
  ChevronDown,
  Star,
} from "lucide-react";
import type { Product, SortOption, LayoutMode, Category } from "@/lib/types";
import { useStore } from "@/lib/store";
import { ALL_CATEGORIES, ALL_TAGS } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  onQuickView,
}: {
  onQuickView: (p: Product) => void;
}) {
  const products = useStore((s) => s.products);

  const [query, setQuery] = React.useState("");
  const [cat, setCat] = React.useState<Category | "All">("All");
  const [maxPrice, setMaxPrice] = React.useState(2500);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [sort, setSort] = React.useState<SortOption>("featured");
  const [layout, setLayout] = React.useState<LayoutMode>("grid-3");
  const [showFilters, setShowFilters] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const filtered = React.useMemo(() => {
    let list = [...products];
    if (cat !== "All") list = list.filter((p) => p.category === cat);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    list = list.filter((p) => p.price <= maxPrice);
    if (selectedTags.length)
      list = list.filter((p) => p.tags.some((t) => selectedTags.includes(t)));

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "popularity":
        list.sort((a, b) => b.sales - a.sales);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return list;
  }, [products, cat, query, maxPrice, selectedTags, sort]);

  const toggleTag = (t: string) =>
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const clearFilters = () => {
    setQuery("");
    setCat("All");
    setMaxPrice(2500);
    setSelectedTags([]);
    setSort("featured");
  };

  const gridCols =
    layout === "grid-4"
      ? "grid-cols-2 lg:grid-cols-4"
      : layout === "list"
      ? "grid-cols-1"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section id="catalog" className="scroll-mt-24 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold"
              >
                The Collection
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-1 text-3xl font-medium tracking-tight font-display sm:text-4xl"
              >
                Curated for the <span className="gold-text">discerning</span>
              </motion.h2>
            </div>
            <div className="hidden items-center gap-1 rounded-full border border-border bg-card p-1 sm:flex">
              {[
                { mode: "grid-3" as const, icon: Grid3x3 },
                { mode: "grid-4" as const, icon: LayoutGrid },
                { mode: "list" as const, icon: Rows3 },
              ].map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setLayout(mode)}
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-full transition-colors",
                    layout === mode ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label={mode}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* category tabs */}
          <div className="no-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-1">
            {(["All", ...ALL_CATEGORIES] as const).map((c) => {
              const count =
                c === "All" ? products.length : products.filter((p) => p.category === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c as Category | "All")}
                  className={cn(
                    "relative shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors",
                    cat === c
                      ? "border-transparent text-primary-foreground"
                      : "border-border text-foreground/70 hover:bg-accent hover:text-foreground"
                  )}
                >
                  {cat === c && (
                    <motion.span layoutId="cat-tab" className="absolute inset-0 rounded-full gold-gradient" />
                  )}
                  <span className="relative">
                    {c}{" "}
                    <span className={cn("text-[10px]", cat === c ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* search + sort + filter toggle */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the collection…"
                className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-9 text-sm outline-none transition-colors focus:border-gold"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors",
                  showFilters || selectedTags.length > 0 || maxPrice < 2500
                    ? "border-gold bg-gold/10 text-gold-deep dark:text-gold"
                    : "border-border hover:bg-accent"
                )}
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {selectedTags.length > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-primary-foreground">
                    {selectedTags.length}
                  </span>
                )}
              </button>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="appearance-none rounded-full border border-border bg-card py-2.5 pl-4 pr-9 text-sm outline-none focus:border-gold"
                >
                  <option value="featured">Featured</option>
                  <option value="popularity">Popularity</option>
                  <option value="rating">Top rated</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid gap-5 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2">
                  <div>
                    <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <span>Max price</span>
                      <motion.span
                        key={maxPrice}
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="rounded-full gold-gradient px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground"
                      >
                        ${maxPrice}
                      </motion.span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={2500}
                      step={50}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="aura-range"
                      style={
                        {
                          "--aura-range-fill": `${((maxPrice - 100) / (2500 - 100)) * 100}%`,
                        } as React.CSSProperties
                      }
                      aria-label="Maximum price"
                    />
                    <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                      <span>$100</span>
                      <span>$2,500</span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-3 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <span>Tags</span>
                      {selectedTags.length > 0 && (
                        <button
                          onClick={() => setSelectedTags([])}
                          className="text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          Clear ({selectedTags.length})
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <AnimatePresence mode="popLayout">
                        {ALL_TAGS.map((t) => {
                          const on = selectedTags.includes(t);
                          return (
                            <motion.button
                              key={t}
                              layout
                              initial={{ opacity: 0, scale: 0.6 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.6 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              onClick={() => toggleTag(t)}
                              className={cn(
                                "relative overflow-hidden rounded-full border px-3 py-1.5 text-xs transition-colors",
                                on
                                  ? "border-gold text-primary-foreground"
                                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                              )}
                            >
                              {on && (
                                <motion.span
                                  className="absolute inset-0 -z-10 gold-gradient"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                />
                              )}
                              {t}
                              {on && (
                                <motion.span
                                  className="ml-1.5 inline-block"
                                  initial={{ scale: 0, rotate: -30 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  exit={{ scale: 0 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                                >
                                  ✓
                                </motion.span>
                              )}
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* result count + clear */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span> pieces
            {cat !== "All" && <> in <span className="text-foreground">{cat}</span></>}
          </p>
          {(query || selectedTags.length > 0 || maxPrice < 2500 || cat !== "All") && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>

        {/* grid */}
        <div className="mt-5">
          {loading ? (
            <div className={cn("grid gap-5", gridCols)}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border">
                  <div className="aspect-square shimmer" />
                  <div className="space-y-2 p-4">
                    <div className="h-3 w-1/3 shimmer rounded" />
                    <div className="h-4 w-2/3 shimmer rounded" />
                    <div className="h-3 w-1/2 shimmer rounded" />
                    <div className="h-6 w-20 shimmer rounded mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center">
              <Star className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                No pieces match your filters. Try widening the search.
              </p>
            </div>
          ) : (
            <motion.div layout className={cn("grid gap-5", gridCols)}>
              <AnimatePresence mode="popLayout">
                {filtered.map((p, idx) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    index={idx}
                    layout={layout === "list" ? "list" : "grid"}
                    onQuickView={onQuickView}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
