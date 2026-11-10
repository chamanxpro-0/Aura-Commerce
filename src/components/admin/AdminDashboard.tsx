"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import { useStore } from "@/lib/store";
import { DemoBanner } from "./DemoBanner";
import { AdminSidebar } from "./AdminSidebar";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { ProductManager } from "./ProductManager";
import { OrderManager } from "./OrderManager";
import { SettingsPanel } from "./SettingsPanel";
import { ActivityLog } from "./ActivityLog";

export function AdminDashboard() {
  const section = useStore((s) => s.adminSection);
  const [mobileNav, setMobileNav] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-screen flex-col bg-background"
    >
      <DemoBanner />

      <div className="flex flex-1">
        <AdminSidebar mobileOpen={mobileNav} onMobileClose={() => setMobileNav(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* mobile topbar */}
          <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
            <button
              onClick={() => setMobileNav(true)}
              className="grid h-9 w-9 place-items-center rounded-full border border-border"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold">AURA Admin</span>
          </div>

          <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {section === "analytics" && <AnalyticsDashboard />}
                {section === "products" && <ProductManager />}
                {section === "orders" && <OrderManager />}
                {section === "settings" && <SettingsPanel />}
                {section === "activity" && <ActivityLog />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </motion.div>
  );
}
