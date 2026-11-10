"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Command,
  Package,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cartCount } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { StarRating } from "@/components/shared/StarRating";
import { BrandMark } from "@/components/shared/BrandMark";
import { CurrencySwitcher } from "./CurrencySwitcher";

const PAGE_LINKS = [
  { label: "Home", view: "home" as const },
  { label: "Shop", view: "shop" as const },
  { label: "Story", view: "story" as const },
  { label: "Journal", view: "journal" as const },
];

export function Navbar({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const wishlist = useStore((s) => s.wishlist);
  const cart = useStore((s) => s.cart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const setView = useStore((s) => s.setView);
  const view = useStore((s) => s.view);
  const settings = useStore((s) => s.settings);
  const setSearchOpen = useStore((s) => s.setSearchOpen);
  const setWishlistOpen = useStore((s) => s.setWishlistOpen);

  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const count = cartCount(cart);

  const goAdmin = () => setView("admin");
  const goHome = () => setView("home");

  // the product page belongs to the shopping flow — highlight "Shop" there
  const activePage =
    view === "product"
      ? "shop"
      : view === "journalArticle"
      ? "journal"
      : view === "home" || view === "shop" || view === "story" || view === "journal"
      ? view
      : null;

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "py-2" : "py-3"
      )}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-2xl px-3 py-2 transition-all duration-300",
            scrolled
              ? "glass-strong luxury-shadow"
              : "border border-transparent bg-transparent"
          )}
        >
          {/* Brand */}
          <button
            onClick={goHome}
            className="group flex items-center gap-2.5"
            aria-label="AURA Commerce home"
          >
            <BrandMark size={32} className="text-foreground transition-transform group-hover:rotate-[18deg] duration-500" />
            <div className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-lg font-semibold tracking-display" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
                {settings.storeName.split(" ")[0]}
              </span>
              <span className="eyebrow mt-0.5 text-muted-foreground">
                Luxury Marketplace
              </span>
            </div>
          </button>

          {/* Center nav — multi-page routes */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Pages">
            {PAGE_LINKS.map((item) => {
              const active = activePage === item.view;
              return (
                <button
                  key={item.label}
                  onClick={() => setView(item.view)}
                  className={cn(
                    "relative rounded-full px-3.5 py-1.5 text-sm transition-colors",
                    active ? "text-foreground" : "text-foreground/70 hover:text-foreground"
                  )}
                >
                  <span className="relative">
                    {item.label}
                    {/* animated gold underline */}
                    <span
                      className={cn(
                        "absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300",
                        active ? "w-full" : "w-0"
                      )}
                    />
                    {active && (
                      <motion.span
                        layoutId="nav-active-glow"
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                        className="absolute inset-0 -z-10 rounded-full bg-gold/10"
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Search trigger */}
            <button
              onClick={() => (onOpenSearch ? onOpenSearch() : setSearchOpen(true))}
              className="group flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur transition-colors hover:bg-accent hover:text-foreground"
            >
              <Search className="h-4 w-4" />
              <span className="hidden lg:inline">Search the atelier…</span>
              <kbd className="hidden items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium lg:flex">
                <Command className="h-2.5 w-2.5" /> K
              </kbd>
            </button>

            <ThemeToggle />
            <CurrencySwitcher />

            {/* Wishlist */}
            <button
              onClick={() => setWishlistOpen(true)}
              className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-background/60 backdrop-blur transition-colors hover:bg-accent"
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4" />
              <AnimatePresence>
                {wishlist.length > 0 && (
                  <motion.span
                    key={wishlist.length}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white"
                  >
                    {wishlist.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-background/60 backdrop-blur transition-colors hover:bg-accent"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-4 w-4" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="absolute -right-1 -top-1 grid h-4.5 min-w-4.5 place-items-center rounded-full gold-gradient px-1 text-[10px] font-bold text-primary-foreground shadow"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Orders */}
            <button
              onClick={() => setView("orders")}
              className={cn(
                "relative grid h-9 w-9 place-items-center rounded-full border border-border bg-background/60 backdrop-blur transition-colors hover:bg-accent",
                view === "orders" && "border-gold text-gold"
              )}
              aria-label="Your orders"
              title="Your orders"
            >
              <Package className="h-4 w-4" />
            </button>

            {/* Admin demo pill */}
            <button
              onClick={goAdmin}
              className={cn(
                "group relative hidden items-center gap-2 overflow-hidden rounded-full px-4 py-1.5 text-sm transition-colors sm:flex",
                view === "admin"
                  ? "gold-gradient text-primary-foreground"
                  : "border border-border bg-background/60 text-foreground backdrop-blur hover:bg-accent"
              )}
            >
              <span className="relative h-1.5 w-1.5 rounded-full bg-gold">
                <span className="absolute inset-0 animate-ping rounded-full bg-gold opacity-60" />
              </span>
              <span className="font-medium">Admin Demo</span>
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background/60 backdrop-blur md:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile sheet */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-2 overflow-hidden rounded-2xl glass-strong p-2 md:hidden"
            >
              {PAGE_LINKS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setView(item.view);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    "block w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    activePage === item.view
                      ? "bg-gold/15 font-medium text-foreground"
                      : "text-foreground/80 hover:bg-accent"
                  )}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setView("orders");
                  setMobileOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                  view === "orders"
                    ? "bg-gold/15 font-medium text-foreground"
                    : "text-foreground/80 hover:bg-accent"
                )}
              >
                <Package className="h-4 w-4" /> Your orders
              </button>
              <button
                onClick={() => {
                  goAdmin();
                  setMobileOpen(false);
                }}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl gold-gradient px-3 py-2.5 text-sm font-medium text-primary-foreground"
              >
                <span className="relative h-1.5 w-1.5 rounded-full bg-primary-foreground/80">
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary-foreground/60" />
                </span>
                Admin Demo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

// ---------- Command-K style search palette ----------
const SEARCH_HISTORY_KEY = "aura-search-history-v1";
const MAX_HISTORY = 5;

function loadSearchHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(items: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function SearchPalette() {
  const open = useStore((s) => s.searchOpen);
  const setOpen = useStore((s) => s.setSearchOpen);
  const products = useStore((s) => s.products);
  const addToCart = useStore((s) => s.addToCart);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const openProductDetail = useStore((s) => s.openProductDetail);
  const currency = useStore((s) => s.currency);

  const [q, setQ] = React.useState("");
  const [highlight, setHighlight] = React.useState(0);
  const [history, setHistory] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setQ("");
      setHighlight(0);
      setHistory(loadSearchHistory());
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useStore.getState().searchOpen);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const results = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products.slice(0, 5);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          p.tags.some((t) => t.toLowerCase().includes(term))
      )
      .slice(0, 6);
  }, [q, products]);

  // Commit a search term to history (most-recent-first, deduped, capped)
  const commitSearch = (term: string) => {
    const t = term.trim();
    if (!t) return;
    setHistory((prev) => {
      const next = [t, ...prev.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, MAX_HISTORY);
      saveSearchHistory(next);
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    saveSearchHistory([]);
  };

  const openResult = (p: typeof products[number]) => {
    if (q.trim()) commitSearch(q.trim());
    openProductDetail(p.id);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]"
        >
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setHighlight(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setHighlight((h) => Math.min(results.length - 1, h + 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHighlight((h) => Math.max(0, h - 1));
                  } else if (e.key === "Enter" && results[highlight]) {
                    e.preventDefault();
                    openResult(results[highlight]);
                  }
                }}
                placeholder="Search products, brands, categories…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ESC
              </kbd>
            </div>
            <div className="max-h-[60vh] overflow-y-auto thin-scrollbar p-2">
              {/* Recent searches — only when no query + history exists */}
              {!q.trim() && history.length > 0 && (
                <div className="mb-2 px-2 py-1">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Recent searches
                    </span>
                    <button
                      onClick={clearHistory}
                      className="text-[10px] text-muted-foreground transition-colors hover:text-rose-500"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {history.map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setQ(term);
                          setHighlight(0);
                          inputRef.current?.focus();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground transition-colors hover:border-gold/50 hover:text-gold"
                      >
                        <Search className="h-3 w-3 text-muted-foreground" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {results.length === 0 && q.trim() && (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No results for “{q}”.
                </div>
              )}
              {results.map((p, i) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => openResult(p)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors",
                    i === highlight ? "bg-accent" : "hover:bg-accent"
                  )}
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="h-12 w-12 rounded-lg object-cover ring-1 ring-border"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{p.brand}</span>
                      <StarRating value={p.rating} size={11} />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{formatPrice(p.price, currency)}</div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground group-hover:text-gold">
                      Open page
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
              <span>Press ↑ ↓ to navigate · Enter to open</span>
              <span className="font-display italic text-gold">AURA search</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
