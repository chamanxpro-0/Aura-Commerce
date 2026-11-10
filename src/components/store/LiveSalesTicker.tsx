"use client";

/**
 * LiveSalesTicker — social proof toasts that periodically surface real-looking
 * recent purchases bottom-right. Drives conversion by showing the marketplace
 * is active. Dismissible per-toast; auto-hides after 6s. Pauses when the tab is
 * hidden. All names/cities/products are deterministic (no Math.random in render).
 */
import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, CheckCircle2, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";

const CUSTOMERS = [
  { name: "Olivia Bennett", city: "London" },
  { name: "Daniel Cho", city: "Seoul" },
  { name: "Amara Okafor", city: "Lagos" },
  { name: "Sofia Rossi", city: "Milan" },
  { name: "Kenji Tanaka", city: "Tokyo" },
  { name: "Maya Lindqvist", city: "Stockholm" },
  { name: "Lucas Moreau", city: "Paris" },
  { name: "Priya Sharma", city: "Mumbai" },
  { name: "Elena Volkov", city: "Prague" },
  { name: "Mateo Silva", city: "Lisbon" },
  { name: "Aisha Khan", city: "Dubai" },
  { name: "Noah Williams", city: "Sydney" },
];

const VERBS = ["just ordered", "purchased", "added to their collection", "treated themselves to"];

type Tick = {
  id: number;
  customer: string;
  city: string;
  verb: string;
  product: Product;
  minutesAgo: number;
};

let seq = 0;

export function LiveSalesTicker() {
  const products = useStore((s) => s.products);
  const openProductDetail = useStore((s) => s.openProductDetail);
  const [tick, setTick] = React.useState<Tick | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(0);
  const [tabHidden, setTabHidden] = React.useState(false);

  // Track tab visibility — pause when hidden to avoid burning cycles
  React.useEffect(() => {
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Generate a deterministic-but-varied tick
  const makeTick = React.useCallback((): Tick | null => {
    if (products.length === 0) return null;
    const now = Date.now();
    // pseudo-random but stable per call
    const r1 = (now / 7000) | 0;
    const r2 = (now / 13000) | 0;
    const customer = CUSTOMERS[r1 % CUSTOMERS.length];
    const product = products[r2 % products.length];
    const verb = VERBS[r1 % VERBS.length];
    const minutesAgo = 1 + (r1 % 14);
    return {
      id: ++seq,
      customer: customer.name,
      city: customer.city,
      verb,
      product,
      minutesAgo,
    };
  }, [products]);

  // Main loop — show a tick every 14–22s, hide after 6s
  // Uses a ref for dismissed so the timer loop isn't reset on each dismiss.
  const dismissedRef = React.useRef(0);
  React.useEffect(() => { dismissedRef.current = dismissed; }, [dismissed]);

  React.useEffect(() => {
    if (tabHidden) return;
    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const cycle = () => {
      if (cancelled) return;
      const t = makeTick();
      if (!t) return scheduleNext();
      setTick(t);
      setVisible(true);
      hideTimer = setTimeout(() => {
        if (cancelled) return;
        setVisible(false);
        scheduleNext();
      }, 6000);
    };

    const scheduleNext = () => {
      if (cancelled) return;
      const delay = 14000 + Math.round(Math.random() * 8000);
      showTimer = setTimeout(cycle, delay);
    };

    // first tick after 8s (let the user settle in)
    showTimer = setTimeout(cycle, 8000);

    return () => {
      cancelled = true;
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [makeTick, tabHidden]);

  // Allow one manual dismiss per tick — just hides the current toast
  const dismiss = () => {
    setVisible(false);
    setDismissed((d) => d + 1);
  };

  // Portal to document.body — escapes the parent motion.div's filter: blur(0px)
  // which creates a containing block that breaks position: fixed (would pin the
  // toast to the page height instead of the viewport).
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {visible && tick && (
        <motion.div
          key={tick.id}
          initial={{ opacity: 0, x: 60, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 60, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed bottom-5 right-5 z-[65] hidden w-80 max-w-[calc(100vw-2.5rem)] sm:block"
          role="status"
          aria-live="polite"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl">
            {/* gold accent bar */}
            <div className="absolute inset-x-0 top-0 h-0.5 gold-gradient" />

            {/* close */}
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="absolute right-2 top-2 z-10 grid h-6 w-6 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => {
                openProductDetail(tick.product.id);
                dismiss();
              }}
              className="flex w-full items-center gap-3 p-3 pr-8 text-left"
            >
              {/* product thumb */}
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                <img
                  src={tick.product.images[0]}
                  alt={tick.product.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified purchase
                </div>
                <p className="mt-0.5 text-xs leading-snug text-foreground">
                  <span className="font-semibold">{tick.customer}</span>{" "}
                  <span className="text-muted-foreground">in</span>{" "}
                  <span className="inline-flex items-center gap-0.5 text-muted-foreground">
                    <MapPin className="h-2.5 w-2.5" />
                    {tick.city}
                  </span>
                </p>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                  {tick.verb}{" "}
                  <span className="font-medium text-foreground">{tick.product.name}</span>
                </p>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                  <ShoppingBag className="h-2.5 w-2.5" />
                  {tick.minutesAgo} min ago ·{" "}
                  <span className="text-gold-deep dark:text-gold">View</span>
                </div>
              </div>
            </button>

            {/* progress bar — auto-hide countdown */}
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-muted">
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 6, ease: "linear" }}
                className="h-full origin-left gold-gradient"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
