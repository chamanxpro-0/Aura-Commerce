"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Twitter, Youtube, ArrowUpRight, Mail, Check, Loader2, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/shared/BrandMark";
import type { View } from "@/lib/types";

export function Footer({ onAdmin }: { onAdmin: () => void }) {
  const settings = useStore((s) => s.settings);
  const setView = useStore((s) => s.setView);
  const year = new Date().getFullYear();
  const brand = settings.storeName.split(" ")[0] || "AURA";

  const go = (v: View) => () => setView(v);

  return (
    <footer className="relative mt-auto overflow-hidden bg-[oklch(0.155_0.012_60)] text-[oklch(0.96_0.008_80)]">
      {/* ambient gold wash */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-72 w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(0.55_0.13_62_/_0.35),transparent)] blur-2xl" />
        <div className="absolute inset-0 grain opacity-30" />
      </div>

      {/* top hairline that draws itself in */}
      <div className="absolute left-0 right-0 top-0 h-px">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="h-full w-full origin-left gold-gradient"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        {/* top band — brand statement + newsletter */}
        <div className="grid gap-10 border-b border-white/10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark size={40} className="text-[oklch(0.96_0.008_80)]" />
              <div className="leading-none">
                <div
                  className="font-display text-2xl font-semibold tracking-display"
                  style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}
                >
                  {brand}
                </div>
                <div className="eyebrow mt-1.5 text-[oklch(0.96_0.008_80/0.55)]">
                  Luxury Marketplace
                </div>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-pretty text-sm leading-relaxed text-[oklch(0.96_0.008_80/0.65)]">
              Fewer things, made exceptionally well. A craft-first marketplace for
              objects designed to be kept for decades.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-[oklch(0.96_0.008_80/0.7)] transition-all hover:-translate-y-0.5 hover:border-gold hover:text-gold"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <NewsletterSection />
        </div>

        {/* link columns — page-aware */}
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="eyebrow text-[oklch(0.96_0.008_80/0.55)]">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              <FooterLink label="Home" onClick={go("home")} />
              <FooterLink label="Shop the collection" onClick={go("shop")} />
              <FooterLink label="The story" onClick={go("story")} />
              <FooterLink label="Your orders" onClick={go("orders")} />
              <FooterLink label="Featured this season" onClick={go("shop")} />
            </ul>
          </div>
          <div>
            <h3 className="eyebrow text-[oklch(0.96_0.008_80/0.55)]">Categories</h3>
            <ul className="mt-4 space-y-2.5">
              <FooterLink label="Electronics" onClick={go("shop")} />
              <FooterLink label="Apparel" onClick={go("shop")} />
              <FooterLink label="Accessories" onClick={go("shop")} />
              <FooterLink label="Home Tech" onClick={go("shop")} />
            </ul>
          </div>
          <div>
            <h3 className="eyebrow text-[oklch(0.96_0.008_80/0.55)]">Atelier</h3>
            <ul className="mt-4 space-y-2.5">
              <FooterLink label="Our story" onClick={go("story")} />
              <FooterLink label="Craftsmanship" onClick={go("story")} />
              <FooterLink label="Sustainability" onClick={go("story")} />
              <FooterLink label="Journal" onClick={go("journal")} />
            </ul>
          </div>
          <div>
            <h3 className="eyebrow text-[oklch(0.96_0.008_80/0.55)]">Showroom</h3>
            <address className="mt-4 space-y-2 text-sm not-italic leading-relaxed text-[oklch(0.96_0.008_80/0.65)]">
              <p>12 Rue de Rivoli</p>
              <p>75004 Paris, France</p>
              <p className="pt-2">
                <a href="#" onClick={(e) => e.preventDefault()} className="underline decoration-white/30 underline-offset-4 hover:text-gold">
                  hello@aura-atelier.com
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* oversized wordmark with gold shimmer */}
        <div className="pointer-events-none select-none overflow-hidden border-t border-white/10 pt-6">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 0.28 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="gold-text font-display text-[18vw] font-semibold leading-[0.8] tracking-display"
            style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}
            aria-hidden
          >
            {brand.toUpperCase()}
          </motion.div>
        </div>

        {/* bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs text-[oklch(0.96_0.008_80/0.5)] sm:flex-row">
          <p suppressHydrationWarning>© {year} {settings.storeName}. Crafted with care.</p>
          <div className="flex items-center gap-5">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gold">Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gold">Terms</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gold">Returns</a>
            <button
              onClick={onAdmin}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold transition-colors hover:bg-gold/20"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
              </span>
              Admin Demo
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <li>
      <button
        onClick={onClick}
        className="group inline-flex items-center gap-1.5 text-sm text-[oklch(0.96_0.008_80/0.65)] transition-colors hover:text-gold"
      >
        {label}
        <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
      </button>
    </li>
  );
}

function NewsletterSection() {
  const subscribe = useStore((s) => s.subscribe);
  const logActivity = useStore((s) => s.logActivity);
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = React.useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus("loading");
    // simulate async
    setTimeout(() => {
      const res = subscribe(email);
      if (res.ok) {
        setStatus("done");
        logActivity("newsletter", `New subscriber: ${email.trim().toLowerCase()}`);
        toast.success(res.message, { description: "Watch your inbox for private previews." });
        setEmail("");
        setTimeout(() => setStatus("idle"), 3500);
      } else {
        setStatus("idle");
        setError(res.message);
      }
    }, 700);
  };

  return (
    <div id="footer-newsletter" className="lg:justify-self-end">
      <h3
        className="font-display text-3xl font-medium leading-tight tracking-tight text-[oklch(0.96_0.008_80)]"
        style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}
      >
        The Inner Circle
      </h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-[oklch(0.96_0.008_80/0.6)]">
        Private previews, atelier stories, and the occasional early access drop.
      </p>
      <form onSubmit={submit} className="relative mt-5 max-w-sm">
        <AnimatePresence mode="wait">
          {status === "done" ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="relative overflow-hidden rounded-full border border-gold/50 bg-gold/10 p-1 pl-3 text-gold"
            >
              {/* gold shimmer sweep */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/20 to-transparent transition-transform duration-1000"
                style={{ animation: "marquee 2s ease-out" }}
              />
              <motion.span
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 16, delay: 0.1 }}
                className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full gold-gradient text-primary-foreground"
              >
                <Check className="h-4 w-4" strokeWidth={3} />
              </motion.span>
              <span className="relative py-1.5 text-sm font-medium text-gold">Welcome to the Inner Circle.</span>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "flex items-center gap-2 rounded-full border bg-white/[0.04] p-1 pl-4 transition-colors",
                error
                  ? "border-rose-400/60"
                  : email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                  ? "border-gold/60"
                  : "border-white/15 focus-within:border-gold"
              )}
            >
              <Mail className="h-4 w-4 text-[oklch(0.96_0.008_80/0.5)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="you@example.com"
                aria-label="Email address"
                className="w-full bg-transparent py-2 text-sm text-[oklch(0.96_0.008_80)] outline-none placeholder:text-[oklch(0.96_0.008_80/0.4)]"
              />
              {/* live validation check */}
              <AnimatePresence>
                {email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !error && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="grid h-5 w-5 shrink-0 place-items-center rounded-full gold-gradient text-primary-foreground"
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                type="submit"
                disabled={status === "loading" || !email}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full gold-gradient text-primary-foreground transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Subscribe"
              >
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-1.5 pl-2 text-[11px] text-rose-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
      <p className="mt-3 text-[10px] text-[oklch(0.96_0.008_80/0.4)]">
        No spam. Unsubscribe anytime. We treat your inbox like our own.
      </p>
    </div>
  );
}
