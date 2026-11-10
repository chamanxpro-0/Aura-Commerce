"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The Aether headphones replaced a pair that cost twice as much. The build quality is the closest thing to a Leica I've held in audio gear.",
    author: "Eleanor V.",
    role: "Creative Director, London",
    avatar: "https://i.pravatar.cc/120?img=47",
    rating: 5,
  },
  {
    quote:
      "I've bought a lot of 'luxury' online. AURA is the first that actually delivered on the promise — the packaging alone is worth the unboxing video.",
    author: "Marcus L.",
    role: "Architect, Berlin",
    avatar: "https://i.pravatar.cc/120?img=12",
    rating: 5,
  },
  {
    quote:
      "The Meridian watch runs +2 seconds a day. My watchmaker nodded approvingly and asked where I got it. That's the highest praise there is.",
    author: "Daniel C.",
    role: "Collector, Singapore",
    avatar: "https://i.pravatar.cc/120?img=15",
    rating: 5,
  },
  {
    quote:
      "The Solace espresso machine pulled a shot that genuinely surprised my barista friend. The walnut handle is the detail that sells it.",
    author: "Sofia R.",
    role: "Food writer, Milan",
    avatar: "https://i.pravatar.cc/120?img=5",
    rating: 5,
  },
  {
    quote:
      "I was nervous buying a coat online. It arrived, I tried it on, and I haven't taken it off since. The cashmere is obscenely soft.",
    author: "Amara O.",
    role: "Editor, Lagos",
    avatar: "https://i.pravatar.cc/120?img=32",
    rating: 5,
  },
];

export function Testimonials() {
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(1);

  // vertical auto-advance: down → up
  React.useEffect(() => {
    const t = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  const go = (dir: number) => {
    setDirection(dir);
    setIndex((i) => (i + dir + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const active = TESTIMONIALS[index];

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,oklch(0.7_0.13_75_/_0.18),transparent)] blur-2xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-stretch gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* LEFT — fixed side text */}
          <div className="flex flex-col justify-center">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="eyebrow text-gold"
            >
              The Inner Circle Speaks
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-5 text-balance font-display text-4xl font-medium leading-[1.05] tracking-display sm:text-5xl"
              style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}
            >
              1,200+ happy owners. <span className="gold-text italic">Zero</span> compromises.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-5 max-w-sm text-sm text-muted-foreground sm:text-base"
            >
              A few words from the people who keep our atelier in business —
              not paid, not prompted, just honest.
            </motion.p>

            {/* rating summary */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <div className="text-sm">
                <span className="font-semibold">4.8</span>
                <span className="text-muted-foreground"> / 5 · 1,243 reviews</span>
              </div>
            </div>

            {/* vertical progress rail of dots */}
            <div className="mt-8 flex items-center gap-2.5">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className="group relative h-12 w-px overflow-hidden bg-border"
                  aria-label={`Go to testimonial ${i + 1}`}
                >
                  <motion.span
                    className="absolute inset-0 gold-gradient origin-bottom"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: i === index ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — vertical slider (down→up) */}
          <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-12">
            <Quote className="absolute right-8 top-8 h-16 w-16 text-gold/10" />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                initial={{ opacity: 0, y: direction > 0 ? 60 : -60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: direction > 0 ? -60 : 60 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex h-full flex-col justify-center"
              >
                <div className="mb-5 flex items-center gap-0.5">
                  {Array.from({ length: active.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                  ))}
                </div>

                <blockquote
                  className="font-display text-2xl font-medium leading-[1.3] tracking-tight sm:text-3xl"
                  style={{ fontVariationSettings: '"SOFT" 80, "WONK" 0, "opsz" 96' }}
                >
                  “{active.quote}”
                </blockquote>

                <div className="mt-8 flex items-center gap-4">
                  <img
                    src={active.avatar}
                    alt={active.author}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-gold/30"
                  />
                  <div>
                    <div className="font-medium">{active.author}</div>
                    <div className="text-sm text-muted-foreground">{active.role}</div>
                  </div>
                  <div className="ml-auto font-mono text-xs text-muted-foreground/60">
                    {String(index + 1).padStart(2, "0")} / {String(TESTIMONIALS.length).padStart(2, "0")}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* vertical nav arrows */}
            <div className="absolute bottom-8 right-8 flex flex-col gap-1.5">
              <button
                onClick={() => go(-1)}
                className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background/70 backdrop-blur transition-colors hover:bg-accent"
                aria-label="Previous"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
              </button>
              <button
                onClick={() => go(1)}
                className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background/70 backdrop-blur transition-colors hover:bg-accent"
                aria-label="Next"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
