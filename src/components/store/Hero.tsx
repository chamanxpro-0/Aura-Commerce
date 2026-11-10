"use client";

import * as React from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowDown, Play } from "lucide-react";
import { useStore } from "@/lib/store";
import { StarRating } from "@/components/shared/StarRating";
import { formatPrice } from "@/lib/utils";

const HERO_SLIDES = [
  {
    eyebrow: "Spring Edit · 2025",
    title: "Quiet Luxury,",
    accent: "Loudly Crafted",
    body: "Ten objects of desire — each hand-finished, each engineered to be kept for decades, not seasons.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80",
    product: "Aether Wireless Headphones",
    stat: "36-hour battery",
    fromPrice: 489,
  },
  {
    eyebrow: "The Atelier Series",
    title: "Worn In,",
    accent: "Never Worn Out",
    body: "Vegetable-tanned leather and Grade-A cashmere — materials that remember the hand that made them.",
    image:
      "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=1400&q=80",
    product: "Nocturne Leather Weekender",
    stat: "42L capacity",
    fromPrice: 1240,
  },
  {
    eyebrow: "Home, Reimagined",
    title: "Light That",
    accent: "Follows The Sun",
    body: "Brass and opal glass, circadian intelligence — the home as a living, breathing companion.",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1400&q=80",
    product: "Lumen Smart Lamp",
    stat: "1800K – 5000K tunable",
    fromPrice: 360,
  },
];

/** masked per-word reveal for the big serif line */
function MaskedLine({ text, accent = false, delay = 0 }: { text: string; accent?: boolean; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className="block">
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-1 align-bottom">
          <motion.span
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "-110%" }}
            transition={{ duration: 0.65, delay: delay + i * 0.055, ease: [0.22, 1, 0.36, 1] }}
            className={`inline-block ${accent ? "gold-text-sweep italic" : ""}`}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Magnetic CTA button — pulls toward the cursor while hovered. */
function MagneticButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    setPos({ x: x * 0.25, y: y * 0.35 });
  };
  const reset = () => setPos({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={reset}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 200, damping: 15, mass: 0.3 }}
      whileTap={{ scale: 0.96 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

/** Drifting gold dust particles — adds cinematic atmosphere. */
function DustField() {
  // deterministic so SSR === client
  const particles = React.useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: (i * 7.3) % 100,
        top: 60 + ((i * 13.7) % 40),
        size: 3 + (i % 4),
        delay: (i * 0.7) % 6,
        dur: 8 + (i % 5) * 1.6,
        dx: ((i % 3) - 1) * 30,
        dy: -80 - (i % 6) * 14,
      })),
    []
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="dust-particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            // CSS vars consumed by the keyframe
            ["--delay" as string]: `${p.delay}s`,
            ["--dur" as string]: `${p.dur}s`,
            ["--dx" as string]: `${p.dx}px`,
            ["--dy" as string]: `${p.dy}px`,
          }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const [i, setI] = React.useState(0);
  const setView = useStore((s) => s.setView);
  const currency = useStore((s) => s.currency);
  const slide = HERO_SLIDES[i];
  const heroRef = React.useRef<HTMLElement>(null);

  // subtle parallax on the showcase column as the hero scrolls away
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const archY = useTransform(scrollYProgress, [0, 1], [0, -64]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const archScale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);

  React.useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <section ref={heroRef} className="relative overflow-hidden pb-14 pt-10 sm:pt-14">
      {/* ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[460px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(0.86_0.1_80_/_0.5),transparent)] blur-2xl dark:bg-[radial-gradient(closest-side,oklch(0.4_0.06_70_/_0.55),transparent)]" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[420px] rounded-full bg-[radial-gradient(closest-side,oklch(0.7_0.13_40_/_0.25),transparent)] blur-2xl" />
        <div className="absolute inset-0 grain opacity-40" />
      </div>

      <DustField />

      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Left — copy */}
          <motion.div style={{ y: copyY }} className="relative">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-border bg-background/60 px-3.5 py-1.5 backdrop-blur"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold" />
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={slide.eyebrow}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="eyebrow text-muted-foreground"
                >
                  {slide.eyebrow}
                </motion.span>
              </AnimatePresence>
            </motion.div>

            <h1
              className="mt-6 text-balance font-display text-[12vw] font-medium leading-[0.95] tracking-display sm:text-7xl lg:text-8xl"
              style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}
            >
              <AnimatePresence mode="wait">
                <motion.span key={slide.title} className="block">
                  <MaskedLine text={slide.title} />
                  <MaskedLine text={slide.accent} accent delay={0.12} />
                </motion.span>
              </AnimatePresence>
            </h1>

            <AnimatePresence mode="wait">
              <motion.p
                key={slide.body}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="mt-6 max-w-md text-pretty text-base text-muted-foreground sm:text-lg"
              >
                {slide.body}
              </motion.p>
            </AnimatePresence>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <MagneticButton
                onClick={() => setView("shop")}
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background"
              >
                {/* shimmer sweep on hover */}
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
                <span className="relative">Shop the collection</span>
                <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </MagneticButton>

              <motion.button
                onClick={() => setView("story")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center gap-2.5 rounded-full border border-foreground/20 px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-gold/60 hover:text-gold"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full gold-gradient text-primary-foreground">
                  <Play className="ml-0.5 h-2.5 w-2.5 fill-current" />
                </span>
                Watch our story
              </motion.button>
            </div>

            {/* stats strip — hairline divider */}
            <div className="mt-12 flex items-stretch gap-8 border-t border-border pt-6">
              {[
                { k: "4.8", label: "Avg rating · 1,200+ reviews" },
                { k: "36mo", label: "Interest-free available" },
                { k: "∞", label: "Lifetime craftsmanship" },
              ].map((s, idx) => (
                <motion.div
                  key={s.k}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="flex-1"
                >
                  <div className="font-display text-2xl font-semibold tracking-display">{s.k}</div>
                  <div className="mt-1 text-[11px] leading-tight text-muted-foreground">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — arch-framed showcase with parallax */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ y: archY }}
              className="relative"
            >
              {/* offset outline echo */}
              <div
                aria-hidden
                className="absolute -inset-3 translate-x-4 translate-y-4 rounded-t-full rounded-b-[2rem] border border-gold/40"
              />

              {/* the arch */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-full rounded-b-[2rem] border border-border bg-muted luxury-shadow">
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={i}
                    src={slide.image}
                    alt={slide.product}
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.03 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    style={{ scale: archScale }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="eyebrow text-white/70">Featured</div>
                  <div className="mt-1 font-display text-xl font-medium tracking-tight">{slide.product}</div>
                  <div className="mt-0.5 text-xs text-white/70">{slide.stat}</div>
                </div>
              </div>

              {/* rotating circular badge — outside the arch so it never clips */}
              <div className="pointer-events-none absolute -left-12 top-20 hidden h-24 w-24 place-items-center rounded-full glass-strong shadow-xl lg:grid">
                <motion.svg
                  viewBox="0 0 100 100"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                  className="h-full w-full"
                >
                  <defs>
                    <path id="aura-circle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
                  </defs>
                  <text className="fill-foreground/60 text-[9px] font-medium uppercase" style={{ letterSpacing: "2.2px" }}>
                    <textPath href="#aura-circle">
                      est. 2015 · quiet luxury ·
                    </textPath>
                  </text>
                </motion.svg>
                <span className="absolute inset-0 grid place-items-center">
                  <StarRating value={5} size={9} />
                </span>
              </div>

              {/* floating index chip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="absolute -right-3 bottom-28 hidden rounded-full glass-strong px-4 py-2.5 text-center shadow-xl sm:block"
              >
                <div className="eyebrow text-muted-foreground">From</div>
                <div className="font-display text-lg font-semibold gold-text">
                  {formatPrice(slide.fromPrice, currency)}
                </div>
              </motion.div>
            </motion.div>

            {/* slide indicators + scroll cue */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setI(idx)}
                    className="group relative h-1 w-8 overflow-hidden rounded-full bg-border transition-all"
                    aria-label={`Slide ${idx + 1}`}
                  >
                    {idx === i && (
                      <motion.span layoutId="hero-dot" className="absolute inset-0 gold-gradient" />
                    )}
                  </button>
                ))}
              </div>
              <motion.button
                onClick={() => setView("story")}
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-gold"
              >
                Begin the story <ArrowDown className="h-3 w-3" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
