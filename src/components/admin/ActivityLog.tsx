"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  GitCompare,
  Package,
  ClipboardList,
  Ticket,
  Settings,
  CheckCircle2,
  Mail,
  History,
  Trash2,
  Filter,
  Clock,
} from "lucide-react";
import type { ActivityType } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const TYPE_META: Record<ActivityType, { icon: typeof ShoppingBag; color: string; label: string }> = {
  cart: { icon: ShoppingBag, color: "bg-gold/15 text-gold-deep dark:text-gold", label: "Cart" },
  wishlist: { icon: Heart, color: "bg-rose-500/15 text-rose-600 dark:text-rose-400", label: "Wishlist" },
  compare: { icon: GitCompare, color: "bg-violet-500/15 text-violet-600 dark:text-violet-400", label: "Compare" },
  product: { icon: Package, color: "bg-sky-500/15 text-sky-600 dark:text-sky-400", label: "Product" },
  order: { icon: ClipboardList, color: "bg-amber-500/15 text-amber-600 dark:text-amber-400", label: "Order" },
  coupon: { icon: Ticket, color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", label: "Coupon" },
  settings: { icon: Settings, color: "bg-muted text-muted-foreground", label: "Settings" },
  checkout: { icon: CheckCircle2, color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", label: "Checkout" },
  newsletter: { icon: Mail, color: "bg-gold/15 text-gold-deep dark:text-gold", label: "Newsletter" },
};

function relTime(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function ActivityLog() {
  const activity = useStore((s) => s.activity);
  const clearActivity = useStore((s) => s.clearActivity);
  const subscribers = useStore((s) => s.subscribers);
  const [filter, setFilter] = React.useState<ActivityType | "all">("all");

  const filtered = React.useMemo(
    () => (filter === "all" ? activity : activity.filter((a) => a.type === filter)),
    [activity, filter]
  );

  const typeCounts = React.useMemo(() => {
    const c: Partial<Record<ActivityType, number>> = {};
    activity.forEach((a) => {
      c[a.type] = (c[a.type] ?? 0) + 1;
    });
    return c;
  }, [activity]);

  const presentTypes = Object.keys(TYPE_META).filter((t) =>
    activity.some((a) => a.type === t)
  ) as ActivityType[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight font-display">Activity Log</h1>
          <p className="text-sm text-muted-foreground">
            {activity.length} event(s) · audit trail of storefront & admin actions
          </p>
        </div>
        {activity.length > 0 && (
          <button
            onClick={() => {
              if (confirm("Clear all activity history?")) clearActivity();
            }}
            className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
          >
            <Trash2 className="h-4 w-4" /> Clear log
          </button>
        )}
      </div>

      {/* stat strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total events" value={activity.length} icon={History} accent="gold" />
        <StatCard
          label="Subscribers"
          value={subscribers.length}
          icon={Mail}
          accent="emerald"
        />
        <StatCard
          label="Cart actions"
          value={typeCounts.cart ?? 0}
          icon={ShoppingBag}
          accent="violet"
        />
        <StatCard
          label="Product changes"
          value={(typeCounts.product ?? 0) + (typeCounts.order ?? 0)}
          icon={Package}
          accent="amber"
        />
      </div>

      {/* filter chips */}
      {presentTypes.length > 1 && (
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-full border border-border bg-card p-1">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === "all"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Filter className="mr-1 inline h-3 w-3" /> All ({activity.length})
          </button>
          {presentTypes.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                filter === t
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {TYPE_META[t].label} ({typeCounts[t]})
            </button>
          ))}
        </div>
      )}

      {/* timeline */}
      <div className="rounded-2xl border border-border bg-card p-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <History className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm">No activity yet. Interact with the storefront to populate the log.</p>
          </div>
        ) : (
          <ol className="relative space-y-1">
            <AnimatePresence initial={false}>
              {filtered.map((entry, idx) => {
                const meta = TYPE_META[entry.type];
                const Icon = meta.icon;
                return (
                  <motion.li
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.15) }}
                    className="group relative flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-accent/40"
                  >
                    {/* timeline rail */}
                    {idx < filtered.length - 1 && (
                      <span className="absolute left-[26px] top-12 h-[calc(100%-1.5rem)] w-px bg-border" />
                    )}
                    <span className={cn("relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full ring-4 ring-card", meta.color)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-center gap-2">
                        <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide", meta.color)}>
                          {meta.label}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" /> {relTime(entry.ts)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium leading-tight">{entry.message}</p>
                      {entry.detail && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{entry.detail}</p>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: typeof History;
  accent: "gold" | "emerald" | "violet" | "amber";
}) {
  const tone = {
    gold: "bg-gold/10 text-gold-deep dark:text-gold",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  }[accent];
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className={cn("grid h-8 w-8 place-items-center rounded-lg", tone)}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-2xl font-bold tracking-tight">{value}</span>
      </div>
      <div className="mt-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
