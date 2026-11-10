"use client";

/**
 * OrderHistoryPage — customer-facing order history with status tracking,
 * line-item expansion, and one-click reorder. Visible at `#/orders`.
 *
 * Shows the most recent orders first. Each row expands to reveal line items
 * + a reorder CTA. Empty-state CTA sends the user to the shop.
 */
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ChevronDown,
  RefreshCcw,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  CreditCard,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useScrollTop } from "@/lib/useScrollTop";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { OrderStatus } from "@/lib/types";

const STATUS_META: Record<OrderStatus, { color: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
  Pending: { color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Clock, label: "Pending" },
  Processing: { color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20", icon: Package, label: "Processing" },
  Shipped: { color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20", icon: Truck, label: "Shipped" },
  Delivered: { color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2, label: "Delivered" },
  Cancelled: { color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20", icon: XCircle, label: "Cancelled" },
};

// Visual progress timeline for the 4 active statuses
const TIMELINE: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered"];

export function OrderHistoryPage() {
  const orders = useStore((s) => s.orders);
  const reorder = useStore((s) => s.reorder);
  const setView = useStore((s) => s.setView);
  const currency = useStore((s) => s.currency);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  useScrollTop();

  // sort newest first
  const sorted = React.useMemo(
    () => [...orders].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [orders]
  );

  const totalSpent = sorted.reduce((s, o) => s + (o.status === "Cancelled" ? 0 : o.total), 0);
  const activeOrders = sorted.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length;

  return (
    <main className="flex-1">
      {/* masthead */}
      <div className="relative overflow-hidden border-b border-border pb-10 pt-12 sm:pt-16">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 right-1/4 h-[380px] w-[680px] rounded-full bg-[radial-gradient(closest-side,oklch(0.86_0.1_80_/_0.35),transparent)] blur-2xl dark:bg-[radial-gradient(closest-side,oklch(0.4_0.06_70_/_0.4),transparent)]" />
          <div className="absolute inset-0 grain opacity-30" />
        </div>
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="eyebrow text-gold"
          >
            Your atelier history
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="mt-3 text-balance font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}
          >
            Orders <span className="gold-text italic">kept.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-4 max-w-xl text-pretty text-base text-muted-foreground"
          >
            Every object you've brought home, in one place. Reorder in a single tap, track shipments, revisit the care notes.
          </motion.p>

          {/* summary stat strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 grid grid-cols-3 gap-3 sm:max-w-md"
          >
            <StatCard label="Orders" value={String(sorted.length)} />
            <StatCard label="In transit" value={String(activeOrders)} accent />
            <StatCard label="Lifetime spend" value={formatPrice(totalSpent, currency)} />
          </motion.div>
        </div>
      </div>

      {/* orders list */}
      <div className="mx-auto max-w-5xl px-4 py-10">
        {sorted.length === 0 ? (
          <EmptyState onShop={() => setView("shop")} />
        ) : (
          <div className="space-y-3">
            {sorted.map((order, i) => {
              const isOpen = expanded === order.id;
              const meta = STATUS_META[order.status];
              const isCancelled = order.status === "Cancelled";
              return (
                <motion.article
                  key={order.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.4) }}
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-card transition-shadow",
                    isOpen ? "luxury-shadow" : "border-border"
                  )}
                >
                  {/* header row */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
                    aria-expanded={isOpen}
                  >
                    {/* status icon */}
                    <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full border", meta.color)}>
                      <meta.icon className="h-5 w-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                        <span className="font-display text-base font-semibold tracking-tight">{order.id}</span>
                        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", meta.color)}>
                          {meta.label}
                        </span>
                        {isCancelled && (
                          <span className="text-[11px] text-muted-foreground line-through">
                            {formatPrice(order.total, currency)}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span>{order.date}</span>
                        <span className="hidden sm:inline">·</span>
                        <span className="hidden sm:inline">{order.items.length} item{order.items.length === 1 ? "" : "s"}</span>
                        <span className="hidden sm:inline">·</span>
                        <span className="hidden sm:inline truncate max-w-[200px]">{order.customer}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!isCancelled && (
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground sm:hidden">Total</div>
                          <div className="font-display text-base font-bold gold-text">{formatPrice(order.total, currency)}</div>
                        </div>
                      )}
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.span>
                    </div>
                  </button>

                  {/* expandable detail */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden border-t border-border"
                      >
                        <div className="p-4 sm:p-5">
                          {/* status timeline (for non-cancelled) */}
                          {!isCancelled && (
                            <Timeline current={order.status} />
                          )}

                          {/* meta grid */}
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-border bg-background/50 p-3">
                              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                <MapPin className="h-3 w-3 text-gold" /> Shipped to
                              </div>
                              <div className="mt-1 text-xs text-foreground">{order.shippingAddress}</div>
                            </div>
                            <div className="rounded-xl border border-border bg-background/50 p-3">
                              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                <CreditCard className="h-3 w-3 text-gold" /> Payment
                              </div>
                              <div className="mt-1 text-xs text-foreground">{order.paymentMethod}</div>
                            </div>
                          </div>

                          {/* line items */}
                          <div className="mt-4 space-y-2">
                            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              Items
                            </div>
                            {order.items.map((item) => (
                              <div
                                key={`${item.productId}-${item.variant?.color}-${item.variant?.size}`}
                                className="flex items-center gap-3 rounded-xl border border-border bg-background/30 p-2.5"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-12 w-12 rounded-lg object-cover ring-1 ring-border"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-medium">{item.name}</div>
                                  <div className="text-[11px] text-muted-foreground">
                                    {item.variant?.color && `${item.variant.color} · `}
                                    {item.variant?.size} · ×{item.qty}
                                  </div>
                                </div>
                                <div className="text-sm font-semibold">{formatPrice(item.price * item.qty, currency)}</div>
                              </div>
                            ))}
                          </div>

                          {/* footer: total + reorder */}
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs text-muted-foreground">Order total</span>
                              <span className="font-display text-lg font-bold gold-text">
                                {formatPrice(order.total, currency)}
                              </span>
                            </div>
                            {!isCancelled && (
                              <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                  reorder(order.id);
                                  toast.success(`Added ${order.items.length} item${order.items.length === 1 ? "" : "s"} from ${order.id} to your bag`);
                                }}
                                className="group inline-flex items-center gap-2 rounded-full gold-gradient px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-gold/20"
                              >
                                <RefreshCcw className="h-3.5 w-3.5 transition-transform group-hover:rotate-180 duration-500" />
                                Reorder all
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn(
      "rounded-2xl border p-3 text-center",
      accent ? "border-gold/40 bg-gold/5" : "border-border bg-card"
    )}>
      <div className={cn("font-display text-xl font-bold tabular-nums", accent && "gold-text")}>
        {value}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function Timeline({ current }: { current: OrderStatus }) {
  const currentIdx = TIMELINE.indexOf(current);
  return (
    <div className="flex items-center gap-1.5">
      {TIMELINE.map((s, i) => {
        const done = i <= currentIdx;
        const isCurrent = i === currentIdx;
        const Icon = STATUS_META[s].icon;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1">
              <motion.div
                initial={false}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full border transition-colors",
                  done
                    ? "border-gold bg-gold/15 text-gold-deep dark:text-gold"
                    : "border-border bg-muted text-muted-foreground/50"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </motion.div>
              <span className={cn(
                "text-[9px] font-medium uppercase tracking-wide",
                done ? "text-foreground" : "text-muted-foreground/50"
              )}>
                {s}
              </span>
            </div>
            {i < TIMELINE.length - 1 && (
              <div className="h-0.5 flex-1">
                <div className={cn("h-full rounded-full", i < currentIdx ? "gold-gradient" : "bg-border")} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function EmptyState({ onShop }: { onShop: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-muted">
        <Package className="h-9 w-9 text-muted-foreground" />
      </div>
      <div>
        <p className="text-base font-semibold">No orders yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          When you place your first order, it'll appear here with tracking and reorder options.
        </p>
      </div>
      <button
        onClick={onShop}
        className="mt-2 inline-flex items-center gap-2 rounded-full gold-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-gold/20"
      >
        <ShoppingBag className="h-4 w-4" /> Browse the collection
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
