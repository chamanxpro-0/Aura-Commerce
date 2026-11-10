"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  XCircle,
  Eye,
  X,
  Download,
  Filter,
} from "lucide-react";
import type { Order, OrderStatus } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUSES: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

type RangePreset = "all" | "7d" | "30d" | "month" | "custom";
const RANGES: { id: RangePreset; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "month", label: "This month" },
  { id: "custom", label: "Custom" },
];

const statusMeta: Record<OrderStatus, { color: string; icon: typeof Clock; dot: string }> = {
  Pending: { color: "bg-amber-500/15 text-amber-600 dark:text-amber-400", icon: Clock, dot: "bg-amber-500" },
  Processing: { color: "bg-sky-500/15 text-sky-600 dark:text-sky-400", icon: Package, dot: "bg-sky-500" },
  Shipped: { color: "bg-violet-500/15 text-violet-600 dark:text-violet-400", icon: Truck, dot: "bg-violet-500" },
  Delivered: { color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", icon: CheckCircle2, dot: "bg-emerald-500" },
  Cancelled: { color: "bg-rose-500/15 text-rose-600 dark:text-rose-400", icon: XCircle, dot: "bg-rose-500" },
};

export function OrderManager() {
  const orders = useStore((s) => s.orders);
  const setOrderStatus = useStore((s) => s.setOrderStatus);
  const settings = useStore((s) => s.settings);

  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<OrderStatus | "All">("All");
  const [range, setRange] = React.useState<RangePreset>("all");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");
  const [selected, setSelected] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = React.useMemo(() => {
    let list = [...orders];
    if (filter !== "All") list = list.filter((o) => o.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q)
      );
    }
    // date range filtering (relative to today)
    if (range !== "all") {
      const now = new Date();
      let from: Date | null = null;
      let to: Date | null = null;
      if (range === "7d") {
        from = new Date(now); from.setDate(now.getDate() - 6);
      } else if (range === "30d") {
        from = new Date(now); from.setDate(now.getDate() - 29);
      } else if (range === "month") {
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (range === "custom") {
        if (customFrom) from = new Date(customFrom);
        if (customTo) to = new Date(customTo + "T23:59:59");
      }
      list = list.filter((o) => {
        const d = new Date(o.date);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    }
    return list;
  }, [orders, filter, query, range, customFrom, customTo]);

  const counts = STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: orders.filter((o) => o.status === s).length }),
    {} as Record<OrderStatus, number>
  );

  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;

  const exportCsv = () => {
    const rows = [
      ["Order ID", "Date", "Customer", "Email", "Status", "Items", "Total", "Currency", "Payment", "Shipping"],
      ...orders.map((o) => [
        o.id,
        o.date,
        o.customer,
        o.email,
        o.status,
        String(o.items.reduce((n, i) => n + i.qty, 0)),
        o.total.toFixed(2),
        o.currency,
        o.paymentMethod,
        o.shippingAddress.replace(/[\n\r,]/g, " "),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aura-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${orders.length} orders to CSV`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight font-display">Orders</h1>
          <p className="text-sm text-muted-foreground">
            {orders.length} orders · {orders.filter((o) => o.status !== "Cancelled").length} valid · {settings.currency}{totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} revenue
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          <Download className="h-4 w-4 text-gold" /> Export CSV
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatChip label="Total orders" value={String(orders.length)} accent="gold" />
        <StatChip label="Valid revenue" value={`${settings.currency}${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} accent="emerald" />
        <StatChip label="Avg order value" value={`${settings.currency}${avgOrderValue.toFixed(0)}`} accent="violet" />
        <StatChip label="Pending action" value={String(counts.Pending)} accent="amber" />
      </div>

      {/* status summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STATUSES.map((s, i) => {
          const meta = statusMeta[s];
          const active = filter === s;
          return (
            <motion.button
              key={s}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setFilter(active ? "All" : s)}
              className={cn(
                "rounded-2xl border bg-card p-4 text-left transition-all",
                active ? "border-gold ring-1 ring-gold/40" : "border-border hover:border-foreground/20"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("grid h-8 w-8 place-items-center rounded-lg", meta.color)}>
                  <meta.icon className="h-4 w-4" />
                </span>
                <span className="text-2xl font-bold">{counts[s]}</span>
              </div>
              <div className="mt-2 text-xs font-medium">{s}</div>
            </motion.button>
          );
        })}
      </div>

      {/* search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by order ID or customer…"
          className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm outline-none focus:border-gold"
        />
      </div>

      {/* date range filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-full border border-border bg-card p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                range === r.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        {range === "custom" && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            className="flex items-center gap-2"
          >
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs outline-none focus:border-gold"
            />
            <span className="text-xs text-muted-foreground">→</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs outline-none focus:border-gold"
            />
          </motion.div>
        )}
      </div>

      {/* orders list */}
      <div className="space-y-3">
        {loading ? (
          <OrderListSkeleton rows={5} />
        ) : (
          <>
            <AnimatePresence initial={false}>
              {filtered.map((o, idx) => {
                const meta = statusMeta[o.status];
                return (
                  <motion.div
                    key={o.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.2) }}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        {o.avatar ? (
                          <img src={o.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-border" />
                        ) : (
                          <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-sm font-bold">
                            {o.customer[0]}
                          </span>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-muted-foreground">{o.id}</span>
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", meta.color)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                          {o.status}
                        </span>
                      </div>
                      <div className="mt-0.5 text-sm font-medium">{o.customer}</div>
                      <div className="text-xs text-muted-foreground">{o.date} · {o.items.length} item(s)</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-bold">{o.currency}{o.total.toLocaleString()}</div>
                      <div className="text-[11px] text-muted-foreground">{o.paymentMethod}</div>
                    </div>
                    <button
                      onClick={() => setSelected(o)}
                      className="grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-accent"
                      aria-label="View order"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* status switcher */}
                <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Update status:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setOrderStatus(o.id, s)}
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                          o.status === s
                            ? statusMeta[s].color + " border-transparent"
                            : "border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                No orders found.
              </div>
            )}
          </>
        )}
      </div>

      {/* order detail */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 z-[70] bg-background/70 backdrop-blur-sm"
            />
            <div className="fixed left-0 top-0 z-[71] flex h-[100dvh] w-screen items-center justify-center p-3 sm:p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">{selected.id}</div>
                    <h2 className="text-lg font-semibold">Order detail</h2>
                  </div>
                  <button onClick={() => setSelected(null)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent" aria-label="Close">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto thin-scrollbar px-6 py-5">
                  {/* status timeline */}
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Fulfillment status
                      </span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", statusMeta[selected.status].color)}>
                        {selected.status}
                      </span>
                    </div>
                    {/* mini timeline */}
                    <div className="flex items-center gap-1">
                      {(["Pending", "Processing", "Shipped", "Delivered"] as OrderStatus[]).map((s, i) => {
                        const idx = STATUSES.indexOf(selected.status);
                        const done = i <= idx && selected.status !== "Cancelled";
                        const isCurrent = s === selected.status;
                        const Ico = statusMeta[s].icon;
                        return (
                          <React.Fragment key={s}>
                            <div className="flex flex-col items-center gap-1">
                              <div className={cn(
                                "grid h-7 w-7 place-items-center rounded-full border transition-all",
                                done
                                  ? "border-gold bg-gold/15 text-gold-deep dark:text-gold"
                                  : "border-border bg-muted text-muted-foreground/50",
                                isCurrent && "ring-2 ring-gold/30 scale-110"
                              )}>
                                <Ico className="h-3.5 w-3.5" />
                              </div>
                              <span className={cn(
                                "text-[9px] font-medium uppercase tracking-wide",
                                done ? "text-foreground" : "text-muted-foreground/50"
                              )}>{s}</span>
                            </div>
                            {i < 3 && (
                              <div className="h-0.5 flex-1">
                                <div className={cn("h-full rounded-full", i < idx ? "gold-gradient" : "bg-border")} />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    {/* quick status change */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setOrderStatus(selected.id, s);
                            toast.success(`${selected.id} → ${s}`);
                            setSelected({ ...selected, status: s });
                          }}
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors",
                            s === selected.status
                              ? "border-gold bg-gold/15 text-gold-deep dark:text-gold"
                              : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {selected.avatar && <img src={selected.avatar} alt="" className="h-12 w-12 rounded-full object-cover ring-1 ring-border" />}
                    <div>
                      <div className="font-medium">{selected.customer}</div>
                      <div className="text-xs text-muted-foreground">{selected.email}</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-border p-3">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Date</div>
                      <div className="mt-0.5 font-medium">{selected.date}</div>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Payment</div>
                      <div className="mt-0.5 font-medium">{selected.paymentMethod}</div>
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl border border-border p-3 text-sm">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Shipping address</div>
                    <div className="mt-0.5">{selected.shippingAddress}</div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Items
                    </div>
                    <ul className="space-y-2">
                      {selected.items.map((it, i) => (
                        <li key={i} className="flex items-center gap-3 rounded-xl border border-border p-2">
                          <img src={it.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{it.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {it.variant?.color} · {it.variant?.size} · ×{it.qty}
                            </div>
                          </div>
                          <div className="text-sm font-semibold">{selected.currency}{it.price * it.qty}</div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-xl font-bold gold-text">{selected.currency}{selected.total.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatChip({ label, value, accent }: { label: string; value: string; accent: "gold" | "emerald" | "violet" | "amber" }) {
  const tone = {
    gold: "bg-gold/10 text-gold-deep dark:text-gold",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  }[accent];
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-xl font-bold tracking-tight", tone)}>{value}</div>
    </div>
  );
}

function OrderListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="shimmer h-10 w-10 rounded-full" />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="shimmer h-3 w-16 rounded" />
                  <div className="shimmer h-4 w-20 rounded-full" />
                </div>
                <div className="shimmer h-3 w-32 rounded" />
                <div className="shimmer h-2.5 w-24 rounded" />
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="shimmer h-4 w-16 rounded" />
              <div className="shimmer h-7 w-7 rounded-full" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
            <div className="shimmer h-3 w-20 rounded" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="shimmer h-5 w-16 rounded-full" />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
