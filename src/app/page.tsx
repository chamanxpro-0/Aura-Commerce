"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { SiteHeader } from "@/components/store/SiteHeader";
import { HomePage } from "@/components/store/HomePage";
import { ShopPage } from "@/components/store/ShopPage";
import { StoryPage } from "@/components/store/StoryPage";
import { JournalPage } from "@/components/store/JournalPage";
import { JournalArticle } from "@/components/store/JournalArticle";
import { ProductDetail } from "@/components/store/ProductDetail";
import { OrderHistoryPage } from "@/components/store/OrderHistoryPage";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Footer } from "@/components/store/Footer";
import { SearchPalette } from "@/components/store/Navbar";
import { CartDrawer } from "@/components/store/CartDrawer";
import { WishlistDrawer } from "@/components/store/WishlistDrawer";
import { QuickViewModal } from "@/components/store/QuickViewModal";
import { CheckoutModal } from "@/components/store/CheckoutModal";
import { CompareBar } from "@/components/store/CompareBar";
import { CompareModal } from "@/components/store/CompareModal";
import { BackToTop } from "@/components/store/BackToTop";
import { AbandonCartReminder } from "@/components/store/AbandonCartReminder";
import { LiveSalesTicker } from "@/components/store/LiveSalesTicker";

/* ---------------------------------------------------------------
   Multi-page hash router
   `#/`        → home   · `#/shop` → shop   · `#/story` → story
   `#/journal` → journal   ·   `#/journal/<slug>` → journal article
   `#/product/<id>` → product detail  ·  `#/admin` → admin demo
   --------------------------------------------------------------- */

type Route =
  | { view: "home" | "shop" | "story" | "journal" | "admin" | "orders" }
  | { view: "product"; id: string }
  | { view: "journalArticle"; slug: string };

function parseHash(): Route {
  if (typeof window === "undefined") return { view: "home" };
  const raw = window.location.hash.replace(/^#/, "").replace(/^\//, "");
  const lower = raw.toLowerCase();
  if (lower === "admin") return { view: "admin" };
  if (lower === "shop") return { view: "shop" };
  if (lower === "story") return { view: "story" };
  if (lower === "journal") return { view: "journal" };
  if (lower === "orders") return { view: "orders" };
  if (lower.startsWith("product/")) {
    const id = raw.split("/")[1];
    if (id) return { view: "product", id };
  }
  if (lower.startsWith("journal/")) {
    const slug = raw.split("/")[1];
    if (slug) return { view: "journalArticle", slug };
  }
  return { view: "home" };
}

const pageTransition = {
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -14, filter: "blur(4px)" },
  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Home() {
  const view = useStore((s) => s.view);
  const productDetailId = useStore((s) => s.productDetailId);
  const journalArticleSlug = useStore((s) => s.journalArticleSlug);
  const setView = useStore((s) => s.setView);

  const [quickView, setQuickView] = React.useState<Product | null>(null);
  const [checkout, setCheckout] = React.useState(false);
  const [compareOpen, setCompareOpen] = React.useState(false);

  // ---- 1. Hydration-safe store rehydrate (persist runs with skipHydration) ----
  React.useEffect(() => {
    // The hash router owns scroll — stop the browser from restoring stale
    // positions on reload (which landed users mid-story with "empty" scenes).
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    useStore.persist.rehydrate();
  }, []);

  // ---- 2. Hash routing ----
  React.useEffect(() => {
    const applyHash = () => {
      const route = parseHash();
      const s = useStore.getState();
      if (route.view === "product") s.openProductDetail(route.id);
      else if (route.view === "journalArticle") s.openJournalArticle(route.slug);
      else s.setView(route.view);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  // ---- 3. Keep the URL in sync when the view changes from within the app ----
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    let want = "";
    if (view === "admin") want = "/admin";
    else if (view === "shop") want = "/shop";
    else if (view === "story") want = "/story";
    else if (view === "journal") want = "/journal";
    else if (view === "orders") want = "/orders";
    else if (view === "journalArticle" && journalArticleSlug) want = `/journal/${journalArticleSlug}`;
    else if (view === "product" && productDetailId) want = `/product/${productDetailId}`;
    const current = window.location.hash.replace(/^#/, "");
    if (want !== current) {
      const url = want ? `#${want}` : window.location.pathname + window.location.search;
      history.replaceState(null, "", url);
    }
  }, [view, productDetailId, journalArticleSlug]);

  // ---- 4. Reset scroll when the page changes (pages also self-correct on mount) ----
  React.useEffect(() => {
    const raf = requestAnimationFrame(() =>
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
    );
    return () => cancelAnimationFrame(raf);
  }, [view, productDetailId, journalArticleSlug]);

  const onQuickView = React.useCallback((p: Product) => setQuickView(p), []);

  const pageKey =
    view === "product" && productDetailId
      ? `product-${productDetailId}`
      : view === "journalArticle" && journalArticleSlug
      ? `journal-${journalArticleSlug}`
      : view;

  const pageContent =
    view === "shop" ? (
      <ShopPage onQuickView={onQuickView} />
    ) : view === "story" ? (
      <StoryPage />
    ) : view === "journal" ? (
      <JournalPage />
    ) : view === "orders" ? (
      <OrderHistoryPage />
    ) : view === "journalArticle" && journalArticleSlug ? (
      <JournalArticle slug={journalArticleSlug} />
    ) : view === "product" && productDetailId ? (
      <ProductDetail productId={productDetailId} />
    ) : (
      <HomePage onQuickView={onQuickView} />
    );

  return (
    <AnimatePresence mode="wait">
      {view === "admin" ? (
        <AdminDashboard key="admin" />
      ) : (
        <motion.div
          key="store"
          {...pageTransition}
          className="flex min-h-screen flex-col"
        >
          <SiteHeader />
          <SearchPalette />

          {/* page transitions live one level down so the header stays stable */}
          <AnimatePresence mode="wait">
            <motion.div
              key={pageKey}
              {...pageTransition}
              className="flex flex-1 flex-col"
            >
              {pageContent}
            </motion.div>
          </AnimatePresence>

          <Footer onAdmin={() => setView("admin")} />

          {/* overlays */}
          <CartDrawer onCheckout={() => setCheckout(true)} />
          <WishlistDrawer onQuickView={onQuickView} />
          <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
          <CheckoutModal open={checkout} onClose={() => setCheckout(false)} />
          <CompareBar onOpen={() => setCompareOpen(true)} />
          <CompareModal open={compareOpen} onClose={() => setCompareOpen(false)} />
          <AbandonCartReminder />
          <LiveSalesTicker />
          <BackToTop />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
