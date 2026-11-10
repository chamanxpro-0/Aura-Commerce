"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  message: string;
  cta: string;
  /** "shop" navigates to the shop page; "newsletter" scrolls to the footer form. */
  action: "shop" | "newsletter";
}

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "spring-edit",
    message: "Spring Edit — complimentary engraving on all timepieces this week.",
    cta: "Explore",
    action: "shop",
  },
  {
    id: "free-ship",
    message: "Carbon-neutral free shipping on every order over $250.",
    cta: "Shop now",
    action: "shop",
  },
  {
    id: "inner-circle",
    message: "Join the Inner Circle for private previews & early access drops.",
    cta: "Subscribe",
    action: "newsletter",
  },
];

export function AnnouncementBar() {
  const dismissed = useStore((s) => s.announcementDismissed);
  const dismiss = useStore((s) => s.dismissAnnouncement);
  const setView = useStore((s) => s.setView);

  // active announcements = those not yet dismissed
  const activeList = ANNOUNCEMENTS.filter((a) => !dismissed.includes(a.id));
  const [idx, setIdx] = React.useState(0);

  // rotate through active announcements every 7s
  React.useEffect(() => {
    if (activeList.length <= 1) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % activeList.length);
    }, 7000);
    return () => clearInterval(t);
  }, [activeList.length]);

  const active = activeList[idx] ?? activeList[0] ?? null;

  const handleCta = (a: Announcement) => {
    if (a.action === "newsletter") {
      const el = document.getElementById("footer-newsletter");
      el?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setView("shop");
  };

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-gold-deep via-gold to-gold-deep text-primary-foreground">
            {/* shimmer sweep */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-marquee" />
            </div>
            <div className="relative mx-auto flex max-w-7xl items-center justify-center gap-2 px-8 py-2 sm:gap-3 sm:px-4">
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.5 }}
                className="hidden sm:inline-flex"
              >
                <Sparkles className="h-3.5 w-3.5 fill-current" />
              </motion.span>
              {/* rotating message with slide transition */}
              <div className="relative min-w-0 flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={active.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="truncate text-center text-[11px] font-medium sm:text-xs"
                  >
                    {active.message}
                  </motion.p>
                </AnimatePresence>
              </div>
              <button
                onClick={() => handleCta(active)}
                className="hidden shrink-0 items-center gap-0.5 rounded-full bg-primary-foreground/20 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur transition-colors hover:bg-primary-foreground/30 sm:inline-flex"
              >
                {active.cta}
                <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </button>
              {/* rotation dots */}
              {activeList.length > 1 && (
                <div className="absolute left-2 flex items-center gap-1">
                  {activeList.map((a, i) => (
                    <button
                      key={a.id}
                      onClick={() => setIdx(i)}
                      aria-label={`Announcement ${i + 1}`}
                      className={cn(
                        "h-1 rounded-full transition-all",
                        i === idx ? "w-4 bg-primary-foreground" : "w-1 bg-primary-foreground/40 hover:bg-primary-foreground/60"
                      )}
                    />
                  ))}
                </div>
              )}
              <button
                onClick={() => dismiss(active.id)}
                className="absolute right-2 grid h-6 w-6 place-items-center rounded-full text-primary-foreground/70 transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground"
                aria-label="Dismiss announcement"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
