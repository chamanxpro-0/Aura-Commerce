"use client";

import { motion } from "framer-motion";
import { Zap, ArrowLeft, ShieldAlert } from "lucide-react";
import { useStore } from "@/lib/store";

export function DemoBanner() {
  const setView = useStore((s) => s.setView);
  const settings = useStore((s) => s.settings);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-gradient-to-r from-gold-deep via-gold to-gold-deep px-4 py-2 text-primary-foreground shadow-lg"
    >
      <motion.span
        animate={{ rotate: [0, 14, -14, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2 }}
      >
        <Zap className="h-4 w-4 fill-current" />
      </motion.span>
      <p className="text-center text-xs font-medium sm:text-sm">
        <span className="font-bold">TEST MODE ACTIVE:</span> Auto-redirected to Admin.
        Modify components in{" "}
        <code className="rounded bg-primary-foreground/20 px-1.5 py-0.5 font-mono text-[11px]">
          /src/components/admin
        </code>{" "}
        to attach real authentication (Clerk/NextAuth).
      </p>
      <button
        onClick={() => setView("home")}
        className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-semibold backdrop-blur transition-colors hover:bg-primary-foreground/30"
      >
        <ArrowLeft className="h-3 w-3" /> Store
      </button>
      <span className="hidden items-center gap-1 text-[11px] text-primary-foreground/80 sm:flex">
        <ShieldAlert className="h-3 w-3" /> {settings.storeName}
      </span>
    </motion.div>
  );
}
