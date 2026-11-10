"use client";

/**
 * CurrencySwitcher — a discreet pill in the navbar that opens a popover
 * with the five supported currencies (USD/EUR/GBP/JPY/AED). Selecting
 * one updates the persisted `currency` in the store, which propagates
 * through every `formatPrice` call site on the next render.
 */
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { CURRENCY_META } from "@/lib/utils";
import type { Currency } from "@/lib/types";
import { cn } from "@/lib/utils";

const ORDER: Currency[] = ["USD", "EUR", "GBP", "JPY", "AED"];

export function CurrencySwitcher() {
  const currency = useStore((s) => s.currency);
  const setCurrency = useStore((s) => s.setCurrency);
  const [open, setOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const btnRef = React.useRef<HTMLButtonElement>(null);

  // Close on outside click + Escape
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const meta = CURRENCY_META[currency];

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Change currency. Current: ${meta.label}`}
        className="group flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1.5 text-xs font-medium backdrop-blur transition-colors hover:bg-accent"
      >
        <span aria-hidden className="text-sm leading-none">{meta.flag}</span>
        <span className="hidden sm:inline">{currency}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={popoverRef}
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="border-b border-border px-4 py-2.5">
              <div className="eyebrow text-gold">Display currency</div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Prices update across the entire atelier.
              </p>
            </div>
            <ul className="p-1.5">
              {ORDER.map((c) => {
                const m = CURRENCY_META[c];
                const active = c === currency;
                return (
                  <li key={c}>
                    <button
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        setCurrency(c);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                        active ? "bg-gold/10" : "hover:bg-accent"
                      )}
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-base">
                        {m.flag}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-semibold">{c}</span>
                          <span className="font-display text-sm font-bold gold-text">{m.symbol}</span>
                        </div>
                        <div className="truncate text-[11px] text-muted-foreground">{m.label}</div>
                      </div>
                      {active && (
                        <motion.span
                          layoutId="currency-active"
                          className="grid h-5 w-5 place-items-center rounded-full gold-gradient text-primary-foreground"
                        >
                          <Check className="h-3 w-3" />
                        </motion.span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
              Rates are illustrative. Checkout settles in USD.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
