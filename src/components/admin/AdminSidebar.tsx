"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Settings,
  Store,
  History,
  Mail,
} from "lucide-react";
import type { AdminSection } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/shared/BrandMark";

const NAV: { id: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "analytics", label: "Analytics", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "activity", label: "Activity", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ mobileOpen, onMobileClose }: { mobileOpen: boolean; onMobileClose: () => void }) {
  const section = useStore((s) => s.adminSection);
  const setSection = useStore((s) => s.setAdminSection);
  const setView = useStore((s) => s.setView);
  const settings = useStore((s) => s.settings);
  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);
  const activity = useStore((s) => s.activity);
  const subscribers = useStore((s) => s.subscribers);

  const pending = orders.filter((o) => o.status === "Pending").length;
  const lowStock = products.filter((p) => p.stock <= 5).length;

  const counts: Partial<Record<AdminSection, number>> = {
    orders: pending,
    products: lowStock,
    activity: activity.length,
  };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden" onClick={onMobileClose} />
      )}
      <motion.aside
        initial={false}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* brand */}
        <div className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-4">
          <BrandMark size={30} className="text-sidebar-foreground" />
          <div className="leading-none">
            <div className="font-display text-sm font-semibold tracking-display" style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}>
              {settings.storeName.split(" ")[0]}
              <span className="gold-text"> Admin</span>
            </div>
            <div className="eyebrow mt-1 text-muted-foreground">
              Control Center
            </div>
          </div>
        </div>

        {/* nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto thin-scrollbar p-3">
          <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Manage
          </div>
          {NAV.map((item) => {
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSection(item.id);
                  onMobileClose();
                }}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="admin-nav"
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full gold-gradient"
                  />
                )}
                <item.icon className={cn("h-4 w-4", active && "text-gold")} />
                <span className="flex-1 text-left">{item.label}</span>
                {counts[item.id] ? (
                  <span
                    className={cn(
                      "grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold",
                      item.id === "activity"
                        ? "bg-gold/20 text-gold-deep dark:text-gold"
                        : "bg-rose-500 text-white"
                    )}
                  >
                    {counts[item.id]}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* footer */}
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={() => setView("home")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <Store className="h-4 w-4" /> Back to storefront
          </button>
          <div className="mt-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              All systems operational
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Demo data persists in your browser via LocalStorage.
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-wide text-muted-foreground">
                <Mail className="h-2.5 w-2.5" /> Subs
              </div>
              <div className="text-sm font-bold text-gold-deep dark:text-gold">{subscribers.length}</div>
            </div>
            <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-wide text-muted-foreground">
                <History className="h-2.5 w-2.5" /> Events
              </div>
              <div className="text-sm font-bold text-gold-deep dark:text-gold">{activity.length}</div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
