"use client";

/**
 * StoryPage — AURA's cinematic, scroll-driven "atelier film".
 *
 * Five pinned/parallaxed movements — Overture, Origins, Materials, Craft,
 * Numbers — closed by a full-bleed finale CTA. The page reads like a brand
 * film: letterbox bars settle in, kinetic type rises through masks, a
 * horizontal material gallery glides on Y-scroll, craft steps crossfade in
 * quartiles, counters tally the ledger, and a chapter rail tracks progress.
 *
 * All motion respects `useReducedMotion` (fade-only fallbacks, no pinning).
 */

import * as React from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionProps,
  type MotionValue,
} from "framer-motion";
import { ArrowRight, MoveDown } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { useScrollTop } from "@/lib/useScrollTop";
import { BrandMark } from "@/components/shared/BrandMark";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */

const INK = "bg-[oklch(0.155_0.012_60)]";
const CREAM = "text-[oklch(0.96_0.008_80)]";

/** Fraunces display-serif variation used across the site for big type. */
const DISPLAY_FONT: React.CSSProperties = {
  fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144',
};

type StageRef = React.RefObject<HTMLDivElement | null>;

/* ------------------------------------------------------------------ */
/* Imagery (known-good remote URLs)                                    */
/* ------------------------------------------------------------------ */

const IMAGES = {
  atelier:
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ad6805beb3f4.jpg",
  watchmaker:
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/704f0c809e07.jpg",
  leatherWorkshop:
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/18cb5a37eb3c.jpg",
  metal:
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80",
  stitching:
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e55eb7a6f9a9.jpg",
  bench:
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
  leatherTexture:
    "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=1200&q=80",
  aluminum:
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/540bf36f3c07.jpg",
  glass:
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80",
  brass:
    "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=80",
  portrait:
    "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/274db4309f84.jpg",
} as const;

/* ------------------------------------------------------------------ */
/* Chapter content                                                     */
/* ------------------------------------------------------------------ */

type Material = {
  index: string;
  name: string;
  desc: string;
  img: string;
  alt: string;
};

type CraftStep = {
  num: string;
  title: string;
  desc: string;
  img: string;
  alt: string;
};

const MATERIALS: Material[] = [
  {
    index: "01",
    name: "Full-grain leather",
    desc: "Vegetable-tanned in Tuscany. It records every year you own it.",
    img: IMAGES.leatherTexture,
    alt: "Close-up of full-grain vegetable-tanned leather with a rich patina",
  },
  {
    index: "02",
    name: "Anodized aluminum",
    desc: "Aerospace grade, hand-beaded to a satin finish.",
    img: IMAGES.aluminum,
    alt: "Brushed anodized aluminum sheet with a satin finish",
  },
  {
    index: "03",
    name: "Hand-blown glass",
    desc: "Opal diffusers shaped by a glassblower in Murano.",
    img: IMAGES.glass,
    alt: "Hand-blown opal glass diffuser glowing with soft light",
  },
  {
    index: "04",
    name: "Recycled brass",
    desc: "Salvaged fittings, refinished to jewelry tolerances.",
    img: IMAGES.brass,
    alt: "Recycled brass fittings refinished to a high polish",
  },
];

const CRAFT_STEPS: CraftStep[] = [
  {
    num: "01",
    title: "Sourcing",
    desc: "We buy hides, billets and blanks from ateliers we can visit.",
    img: IMAGES.leatherWorkshop,
    alt: "Artisan cutting vegetable-tanned leather on a workshop table",
  },
  {
    num: "02",
    title: "Shaping",
    desc: "CNC precision meets hand-filing. The machine roughs; the hand finishes.",
    img: IMAGES.watchmaker,
    alt: "Gloved hands adjusting a precision movement for hand-finishing",
  },
  {
    num: "03",
    title: "Finishing",
    desc: "Seven stages of polish. The last one is patience.",
    img: IMAGES.stitching,
    alt: "Hands saddle-stitching leather with needle and thread",
  },
  {
    num: "04",
    title: "Assembly",
    desc: "Each object is signed inside by the artisan who closed it.",
    img: IMAGES.bench,
    alt: "Bench assembly of a finished object under a work lamp",
  },
];

const ORIGIN_STATEMENTS: React.ReactNode[] = [
  <>
    It began in a <em className="gold-text">two-bench workshop</em> above a
    Paris bookbinder.
  </>,
  <>
    One rule: make nothing you wouldn&rsquo;t keep for{" "}
    <em className="gold-text">a lifetime</em>.
  </>,
  <>
    Ten years later, the rule hasn&rsquo;t changed.{" "}
    <em className="gold-text">The benches have.</em>
  </>,
];

const STATS = [
  { to: 14, suffix: "", label: "Ateliers across Europe" },
  { to: 120, suffix: "", label: "Artisans at the bench" },
  { to: 98, suffix: "%", label: "Recycled inputs" },
  { to: 10, suffix: "yr", label: "Guarantee on every object" },
];

const AURA_LETTERS = ["A", "U", "R", "A"];
const FINALE_WORDS = ["Objects", "worth", "keeping."];
const MARQUEE_REPEAT = 6;

/**
 * Scroll-quartile windows for the pinned Craft chapter.
 * Images crossfade symmetrically (sum of opacity ≈ 1 at every frame);
 * text blocks swap on overlapping rise/fade windows.
 */
const CRAFT_IMG_IN: number[][] = [
  [0, 0.215, 0.285],
  [0.215, 0.285, 0.465, 0.535],
  [0.465, 0.535, 0.715, 0.785],
  [0.715, 0.785, 1],
];
const CRAFT_IMG_OUT: number[][] = [
  [1, 1, 0],
  [0, 1, 1, 0],
  [0, 1, 1, 0],
  [0, 1, 1],
];
const CRAFT_TEXT_IN: number[][] = [
  [0, 0.07, 0.18, 0.245],
  [0.245, 0.32, 0.43, 0.495],
  [0.495, 0.57, 0.68, 0.745],
  [0.745, 0.82],
];
const CRAFT_TEXT_OUT: number[][] = [
  [0, 1, 1, 0],
  [0, 1, 1, 0],
  [0, 1, 1, 0],
  [0, 1],
];
const CRAFT_TEXT_Y_OUT: number[][] = [
  [52, 0, 0, -52],
  [52, 0, 0, -52],
  [52, 0, 0, -52],
  [52, 0],
];

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */

/** whileInView reveal — fade-only when the user prefers reduced motion. */
const fadeUp = (reduced: boolean, delay = 0): MotionProps =>
  reduced
    ? {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.6, delay },
      }
    : {
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
      };

/** The AURA wordmark — per-letter masked reveal on load. */
function AuraLetters({ reduced }: { reduced: boolean }) {
  return (
    <>
      {AURA_LETTERS.map((letter, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-block overflow-hidden pb-[0.09em] -mb-[0.09em]"
        >
          <motion.span
            className="gold-text inline-block will-change-transform"
            initial={reduced ? { opacity: 0 } : { y: "115%" }}
            animate={reduced ? { opacity: 1 } : { y: "0%" }}
            transition={{
              duration: reduced ? 0.5 : 1.15,
              delay: reduced ? i * 0.07 : 0.25 + i * 0.11,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {letter}
          </motion.span>
        </span>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Fixed chrome — chapter rail                                         */
/* ------------------------------------------------------------------ */

type ChapterLink = { id: string; label: string; ref: StageRef };

function ChapterRail({
  chapters,
  reduced,
}: {
  chapters: ChapterLink[];
  reduced: boolean;
}) {
  const [active, setActive] = React.useState<string | null>(null);

  return (
    <nav
      aria-label="Story chapters"
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-1 lg:flex"
    >
      {chapters.map((chapter) => (
        <RailDot
          key={chapter.id}
          chapter={chapter}
          active={active === chapter.id}
          reduced={reduced}
          onActivate={setActive}
        />
      ))}
    </nav>
  );
}

function RailDot({
  chapter,
  active,
  reduced,
  onActivate,
}: {
  chapter: ChapterLink;
  active: boolean;
  reduced: boolean;
  onActivate: (id: string) => void;
}) {
  // Track the chapter via its sticky stage so tall pinned sections register.
  const inView = useInView(chapter.ref, { amount: 0.4 });

  React.useEffect(() => {
    if (inView) onActivate(chapter.id);
  }, [inView, chapter.id, onActivate]);

  return (
    <button
      type="button"
      aria-label={`Jump to chapter — ${chapter.label}`}
      aria-current={active ? "true" : undefined}
      onClick={() => {
        document
          .getElementById(chapter.id)
          ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      }}
      className="group flex cursor-pointer items-center gap-3 py-2.5"
    >
      <span
        className={cn(
          "eyebrow whitespace-nowrap text-[9px] transition-all duration-300 [writing-mode:vertical-rl]",
          active
            ? "text-gold opacity-100"
            : "text-foreground/50 opacity-0 group-hover:opacity-100"
        )}
      >
        {chapter.label}
      </span>
      <span
        className={cn(
          "block rounded-full transition-all duration-300",
          active
            ? "h-2.5 w-2.5 bg-gold ring-4 ring-gold/15"
            : "h-1.5 w-1.5 bg-foreground/30 group-hover:bg-foreground/60"
        )}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 00 — Overture (pinned "video" opening)                       */
/* ------------------------------------------------------------------ */

function Overture({ reduced, stageRef }: { reduced: boolean; stageRef: StageRef }) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  const imgScale = useTransform(smooth, [0, 1], [1.25, 1.02]);
  const shadeOpacity = useTransform(smooth, [0, 0.5], [0.5, 0.16]);
  const barHeight = useTransform(
    smooth,
    [0, 0.3, 0.94, 1],
    ["0vh", "7vh", "7vh", "0vh"]
  );
  const wordScale = useTransform(smooth, [0, 0.85], [1, 1.16]);
  const wordOpacity = useTransform(smooth, [0.4, 0.8], [1, 0]);
  const wordY = useTransform(smooth, [0.4, 0.85], ["0vh", "-12vh"]);
  const eyebrowOpacity = useTransform(
    smooth,
    [0.12, 0.22, 0.5, 0.58],
    [0, 1, 1, 0]
  );
  const cueOpacity = useTransform(smooth, [0, 0.15], [1, 0]);
  const tagOpacity = useTransform(smooth, [0.06, 0.16], [0, 1]);

  if (reduced) {
    return (
      <section id="chapter-overture" aria-label="Overture" ref={sectionRef} className={cn("relative", INK)}>
        <div
          ref={stageRef}
          className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24"
        >
          <img
            src={IMAGES.atelier}
            alt="Sunlit atelier interior with workbenches and hand tools"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/75" />
          <div aria-hidden="true" className="absolute inset-x-0 top-0 z-20 h-[7vh] bg-black" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-20 h-[7vh] bg-black" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <p className="eyebrow text-gold">Chapter 00 — Overture</p>
            <h1
              aria-label="AURA"
              className="mt-6 select-none font-display text-[16vw] font-semibold leading-none tracking-display md:text-[13vw]"
              style={DISPLAY_FONT}
            >
              <AuraLetters reduced={reduced} />
            </h1>
            <p className="eyebrow mt-8 text-[oklch(0.96_0.008_80_/0.8)]">
              An atelier story in five movements
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="chapter-overture"
      aria-label="Overture"
      ref={sectionRef}
      className="relative h-[300vh]"
    >
      <div ref={stageRef} className="sticky top-0 h-screen overflow-hidden">
        {/* full-bleed atelier plate — settles and brightens as you scroll */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ scale: imgScale }}
        >
          <img
            src={IMAGES.atelier}
            alt="Sunlit atelier interior with workbenches and hand tools"
            className="h-full w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/30 to-black/70" />
        <motion.div className="absolute inset-0 bg-black" style={{ opacity: shadeOpacity }} />

        {/* letterbox bars — the film settles into frame */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-20 bg-black will-change-transform"
          style={{ height: barHeight }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 z-20 bg-black will-change-transform"
          style={{ height: barHeight }}
        />

        {/* chapter marker */}
        <motion.p style={{ opacity: tagOpacity }} className="absolute left-6 top-28 z-10 md:left-12">
          <span className="eyebrow text-gold">Chapter 00</span>
          <span className="eyebrow text-[oklch(0.96_0.008_80_/0.6)]"> — Overture</span>
        </motion.p>

        {/* kinetic wordmark */}
        <motion.div
          style={{ scale: wordScale, opacity: wordOpacity, y: wordY }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6"
        >
          <h1
            aria-label="AURA"
            className="select-none text-center font-display text-[16vw] font-semibold leading-none tracking-display md:text-[22vw]"
            style={DISPLAY_FONT}
          >
            <AuraLetters reduced={reduced} />
          </h1>
          <motion.p
            style={{ opacity: eyebrowOpacity }}
            className="eyebrow mt-6 text-center text-[oklch(0.96_0.008_80_/0.85)] md:mt-10"
          >
            An atelier story in five movements
          </motion.p>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          style={{ opacity: cueOpacity }}
          className="absolute bottom-[14vh] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          <span className="eyebrow text-[oklch(0.96_0.008_80_/0.65)]">Scroll to begin</span>
          <span
            className={cn(
              "grid h-9 w-9 animate-bounce place-items-center rounded-full border border-white/20",
              CREAM
            )}
          >
            <MoveDown className="h-4 w-4" aria-hidden="true" />
          </span>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 01 — Origins (sticky text sequence)                         */
/* ------------------------------------------------------------------ */

function OriginsLine({
  progress,
  enter,
  exit,
  children,
}: {
  progress: MotionValue<number>;
  enter: [number, number];
  exit: [number, number] | null;
  children: React.ReactNode;
}) {
  const keys = exit ? [enter[0], enter[1], exit[0], exit[1]] : [enter[0], enter[1], 1.001];
  const opacity = useTransform(progress, keys, exit ? [0, 1, 1, 0] : [0, 1, 1]);
  const y = useTransform(progress, keys, exit ? [70, 0, 0, -70] : [70, 0, 0]);
  const filter = useTransform(
    progress,
    keys,
    exit
      ? ["blur(14px)", "blur(0px)", "blur(0px)", "blur(14px)"]
      : ["blur(14px)", "blur(0px)", "blur(0px)"]
  );

  return (
    <motion.div
      style={{ opacity, y, filter }}
      className="absolute inset-0 z-10 flex items-center justify-center px-6"
    >
      <p
        className="max-w-4xl text-balance text-center font-display text-3xl font-medium leading-[1.18] tracking-display sm:text-5xl lg:text-6xl"
        style={DISPLAY_FONT}
      >
        {children}
      </p>
    </motion.div>
  );
}

function Origins({ reduced, stageRef }: { reduced: boolean; stageRef: StageRef }) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  const bgY = useTransform(smooth, [0, 1], ["-6%", "6%"]);
  const ghostX = useTransform(smooth, [0, 1], ["12vw", "-12vw"]);

  return (
    <section
      id="chapter-origins"
      aria-label="Origins"
      ref={sectionRef}
      className={cn("relative overflow-hidden", INK, CREAM)}
    >
      {/* watchmaker plate — slow parallax at low opacity (full section height) */}
      <motion.div
        className="absolute inset-0 h-full w-full will-change-transform"
        style={{ y: bgY }}
      >
        <img
          src={IMAGES.watchmaker}
          alt="A watchmaker's hands adjusting a brass movement"
          loading="lazy"
          className="h-full w-full object-cover opacity-[0.16]"
        />
      </motion.div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[oklch(0.155_0.012_60)] via-transparent to-[oklch(0.155_0.012_60)]"
      />

      {/* ghost numeral */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <motion.span
          style={{ x: ghostX }}
          className="select-none font-display text-[30vw] font-semibold leading-none tracking-display opacity-[0.05]"
        >
          01
        </motion.span>
      </div>

      <div ref={stageRef} className="relative z-10 mx-auto max-w-5xl px-6">
        {/* chapter marker */}
        <div className="py-28 text-center md:py-40">
          <p className="eyebrow text-gold">Chapter 01</p>
          <span className="eyebrow text-[oklch(0.96_0.008_80_/0.6)]"> — Origins</span>
        </div>

        {/* sequential statements — each in its own min-h-screen panel */}
        <div>
          {ORIGIN_STATEMENTS.map((statement, i) => (
            <div
              key={i}
              className="flex min-h-[70vh] items-center justify-center py-12 md:min-h-[80vh]"
            >
              <motion.div
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 80, filter: "blur(16px)" }}
                whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <p
                  className="mx-auto max-w-4xl text-balance text-center font-display text-3xl font-medium leading-[1.18] tracking-display sm:text-4xl lg:text-5xl"
                  style={DISPLAY_FONT}
                >
                  {statement}
                </p>
              </motion.div>
            </div>
          ))}
        </div>

        {/* closing caption */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-3 py-28"
        >
          <BrandMark size={30} className="text-gold" />
          <span className="font-display text-2xl font-semibold tracking-display" style={DISPLAY_FONT}>
            AURA
          </span>
          <span className="eyebrow text-gold">Origins</span>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 02 — Materials (horizontal scroll gallery)                  */
/* ------------------------------------------------------------------ */

function MaterialCard({
  material,
  index,
  wide,
}: {
  material: Material;
  index: number;
  wide?: boolean;
}) {
  return (
    <article className={cn(wide ? "w-full" : "w-[80vw] shrink-0 md:w-[55vw] md:max-w-xl")}>
      <div className="flex items-end justify-between gap-4">
        <span
          className="gold-text font-display text-7xl font-semibold leading-none tracking-display md:text-8xl"
          style={DISPLAY_FONT}
        >
          {material.index}
        </span>
        <span className="eyebrow pb-2 text-muted-foreground/50">0{index + 1} / 04</span>
      </div>
      <h3 className="mt-5 font-display text-2xl font-medium tracking-tight md:text-3xl">
        {material.name}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
        {material.desc}
      </p>
      <div className="group mt-5 overflow-hidden rounded-[2rem] border border-border bg-card">
        <img
          src={material.img}
          alt={material.alt}
          loading="lazy"
          className="h-44 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] sm:h-48 md:h-52 lg:h-56"
        />
      </div>
    </article>
  );
}

function Materials({
  reduced,
  isDesktop,
  stageRef,
}: {
  reduced: boolean;
  isDesktop: boolean;
  stageRef: StageRef;
}) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const stacked = reduced || !isDesktop;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  const trackRef = React.useRef<HTMLDivElement>(null);
  const [range, setRange] = React.useState(0);
  const [activeMaterial, setActiveMaterial] = React.useState(0);

  // Horizontal travel derived directly from scroll progress.
  const x = useTransform(smooth, (p: number) => -p * range);

  // Measure the horizontal travel so the last card lands fully in view.
  React.useEffect(() => {
    if (stacked) return;
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setRange(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [stacked]);

  // Drive the transform manually from the MotionValue — avoids Framer Motion's
  // variant propagation from the parent page transition which sets opacity: 0
  // on child motion.divs.
  React.useEffect(() => {
    if (stacked) return;
    const unsub = x.on("change", (v) => {
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${v}px, 0, 0)`;
      }
    });
    // Set initial value
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${x.get()}px, 0, 0)`;
    }
    return unsub;
  }, [x, stacked]);

  // Progress dots (cheap state — updates guarded by the equality check).
  useMotionValueEvent(smooth, "change", (p) => {
    const next = p < 0.24 ? 0 : p < 0.5 ? 1 : p < 0.76 ? 2 : 3;
    setActiveMaterial((prev) => (prev === next ? prev : next));
  });

  if (stacked) {
    return (
      <section
        id="chapter-materials"
        aria-label="Materials"
        ref={sectionRef}
        className="relative scroll-mt-24 bg-background py-24"
      >
        <div ref={stageRef} className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp(reduced)}>
            <p className="eyebrow text-gold">Chapter 02 · Materials</p>
            <h2
              className="mt-5 font-display text-4xl font-medium leading-[1.05] tracking-display sm:text-5xl md:text-6xl"
              style={DISPLAY_FONT}
            >
              Four materials. <em className="gold-text">Zero</em> compromise.
            </h2>
          </motion.div>
          <div className="mt-16 grid gap-12 sm:grid-cols-2 sm:gap-8 lg:gap-14">
            {MATERIALS.map((material, i) => (
              <motion.div
                key={material.name}
                {...fadeUp(reduced, 0.08 + i * 0.08)}
                className={cn(i % 2 === 1 && "sm:mt-14")}
              >
                <MaterialCard material={material} index={i} wide />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="chapter-materials"
      aria-label="Materials"
      ref={sectionRef}
      className="relative h-[480vh] bg-background"
    >
      <div ref={stageRef} className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div
          ref={trackRef}
          className="flex w-max items-center gap-12 pl-[6vw] pr-16 will-change-transform md:gap-16"
        >
          {/* intro panel */}
          <div className="w-[80vw] shrink-0 md:w-[40vw]">
            <p className="eyebrow text-gold">Chapter 02 · Materials</p>
            <h2
              className="mt-5 font-display text-4xl font-medium leading-[1.05] tracking-display md:text-6xl"
              style={DISPLAY_FONT}
            >
              Four materials.
              <br />
              <em className="gold-text">Zero</em> compromise.
            </h2>
            <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
              Keep scrolling
              <motion.span
                className="text-gold"
                animate={{ x: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </motion.span>
            </p>
          </div>

          {MATERIALS.map((material, i) => (
            <MaterialCard key={material.name} material={material} index={i} />
          ))}
        </div>

        {/* progress dots */}
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5">
          {MATERIALS.map((material, i) => (
            <span
              key={material.name}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all duration-300",
                i === activeMaterial ? "scale-150 bg-gold" : "bg-foreground/25"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 03 — Craft (pinned step sequence)                            */
/* ------------------------------------------------------------------ */

function CraftImage({
  step,
  index,
  progress,
}: {
  step: CraftStep;
  index: number;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, CRAFT_IMG_IN[index], CRAFT_IMG_OUT[index]);
  const start = index * 0.25;
  const scale = useTransform(progress, [start, start + 0.25], [1.1, 1.0]);

  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <motion.img
        src={step.img}
        alt={step.alt}
        loading="lazy"
        style={{ scale }}
        className="h-full w-full object-cover will-change-transform"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[oklch(0.155_0.012_60)] via-transparent to-[oklch(0.155_0.012_60)]"
      />
      <motion.p
        style={{ opacity }}
        className="eyebrow absolute bottom-10 left-10 text-[oklch(0.96_0.008_80_/0.55)]"
      >
        Fig. {step.num} — {step.title}
      </motion.p>
    </motion.div>
  );
}

function CraftStepText({
  step,
  index,
  progress,
}: {
  step: CraftStep;
  index: number;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, CRAFT_TEXT_IN[index], CRAFT_TEXT_OUT[index]);
  const y = useTransform(progress, CRAFT_TEXT_IN[index], CRAFT_TEXT_Y_OUT[index]);

  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col justify-center">
      <p className="eyebrow text-gold">{step.num} / 04</p>
      <h3
        className="mt-4 font-display text-4xl font-medium leading-none tracking-display md:text-6xl"
        style={DISPLAY_FONT}
      >
        {step.title}
      </h3>
      <p className="mt-5 max-w-md text-base leading-relaxed text-[oklch(0.96_0.008_80_/0.7)]">
        {step.desc}
      </p>
    </motion.div>
  );
}

function Craft({
  reduced,
  isDesktop,
  stageRef,
}: {
  reduced: boolean;
  isDesktop: boolean;
  stageRef: StageRef;
}) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const stacked = reduced || !isDesktop;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });
  const tagOpacity = useTransform(smooth, [0.02, 0.1], [0, 1]);

  if (stacked) {
    return (
      <section
        id="chapter-craft"
        aria-label="Craft"
        ref={sectionRef}
        className={cn("relative scroll-mt-24 py-24", INK)}
      >
        <div ref={stageRef} className={cn("mx-auto max-w-5xl px-4 sm:px-6", CREAM)}>
          <motion.div {...fadeUp(reduced)}>
            <p className="eyebrow text-gold">Chapter 03 · Craft</p>
            <h2
              className="mt-5 font-display text-4xl font-medium leading-[1.05] tracking-display sm:text-5xl md:text-6xl"
              style={DISPLAY_FONT}
            >
              From blank to heirloom.
            </h2>
          </motion.div>
          <div className="mt-16 grid gap-14 md:grid-cols-2 md:gap-10">
            {CRAFT_STEPS.map((step, i) => (
              <motion.article
                key={step.num}
                {...fadeUp(reduced, 0.06 + i * 0.07)}
                className="flex flex-col gap-5"
              >
                <div className="overflow-hidden rounded-[2rem] border border-white/10">
                  <img
                    src={step.img}
                    alt={step.alt}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
                <div>
                  <p className="eyebrow text-gold">{step.num} / 04</p>
                  <h3 className="mt-3 font-display text-2xl font-medium md:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[oklch(0.96_0.008_80_/0.65)]">
                    {step.desc}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="chapter-craft"
      aria-label="Craft"
      ref={sectionRef}
      className={cn("relative h-[440vh]", INK)}
    >
      <div ref={stageRef} className={cn("sticky top-0 h-screen overflow-hidden", CREAM)}>
        <div className="grid h-full lg:grid-cols-[1.05fr_1fr]">
          {/* left — crossfading image stack */}
          <div className="relative hidden overflow-hidden lg:block">
            {CRAFT_STEPS.map((step, i) => (
              <CraftImage key={step.num} step={step} index={i} progress={smooth} />
            ))}
          </div>

          {/* right — crossfading step text */}
          <div className="relative flex items-center px-8 md:px-14">
            {/* vertical gold progress line */}
            <div
              aria-hidden="true"
              className="absolute left-0 top-1/2 hidden h-[42vh] w-px -translate-y-1/2 bg-white/10 lg:block"
            >
              <motion.div style={{ scaleY: smooth }} className="h-full w-full origin-top gold-gradient" />
            </div>

            <motion.p
              style={{ opacity: tagOpacity }}
              className="eyebrow absolute left-8 top-28 text-gold md:left-14"
            >
              Chapter 03 · Craft
            </motion.p>

            <div className="relative h-[46vh] w-full max-w-lg">
              {CRAFT_STEPS.map((step, i) => (
                <CraftStepText key={step.num} step={step} index={i} progress={smooth} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Chapter 04 — Numbers (animated counters)                             */
/* ------------------------------------------------------------------ */

function Counter({
  to,
  suffix = "",
  started,
  reduced,
}: {
  to: number;
  suffix?: string;
  started: boolean;
  reduced: boolean;
}) {
  const count = useMotionValue(0);
  const [display, setDisplay] = React.useState(reduced ? to : 0);

  React.useEffect(() => {
    if (reduced) {
      setDisplay(to);
      return;
    }
    if (!started) return;
    const controls = animate(count, to, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [reduced, started, to, count]);

  return (
    <span aria-label={`${to}${suffix}`}>
      {display}
      {suffix ? <span className="text-[0.45em]">{suffix}</span> : null}
    </span>
  );
}

function Numbers({ reduced, stageRef }: { reduced: boolean; stageRef: StageRef }) {
  const started = useInView(stageRef, { once: true, amount: 0.3 });

  return (
    <section
      id="chapter-numbers"
      aria-label="Numbers"
      className="relative scroll-mt-24 bg-background py-24 md:py-32"
    >
      <div ref={stageRef} className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* editorial column */}
          <div>
            <motion.p {...fadeUp(reduced)} className="eyebrow text-gold">
              Chapter 04 · Numbers
            </motion.p>
            <motion.h2
              {...fadeUp(reduced, 0.08)}
              className="mt-5 font-display text-4xl font-medium leading-[1.05] tracking-display sm:text-5xl lg:text-6xl"
              style={DISPLAY_FONT}
            >
              The ledger after ten years.
            </motion.h2>
            <motion.p
              {...fadeUp(reduced, 0.16)}
              className="mt-6 max-w-md text-pretty text-base leading-relaxed text-muted-foreground"
            >
              Every object we have ever made is still in service. That is the
              only number we answer to — the rest simply prove it.
            </motion.p>
            <motion.div {...fadeUp(reduced, 0.24)} className="mt-10">
              <div className="group overflow-hidden rounded-[2rem] border border-border">
                <img
                  src={IMAGES.portrait}
                  alt="Portrait of a master artisan of the AURA atelier"
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
              <p className="eyebrow mt-4 text-muted-foreground/60">Every number has a name</p>
            </motion.div>
          </div>

          {/* stat ledger */}
          <div className="grid content-center gap-4 sm:grid-cols-2 lg:gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                {...fadeUp(reduced, 0.1 + i * 0.08)}
                whileHover={{ y: -6 }}
                className="glass-strong group rounded-3xl p-8 transition-colors duration-300 hover:border-gold/50"
              >
                <div
                  className="gold-text font-display text-6xl font-semibold leading-none tracking-display md:text-7xl"
                  style={DISPLAY_FONT}
                >
                  <Counter to={stat.to} suffix={stat.suffix} started={started} reduced={reduced} />
                </div>
                <p className="mt-5 text-sm text-muted-foreground">{stat.label}</p>
                <p className="eyebrow mt-6 text-muted-foreground/40">0{i + 1}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* Store Locator — atelier addresses with stylized map cards           */
/* ------------------------------------------------------------------ */

const ATELIERS = [
  {
    city: "Paris",
    country: "France",
    address: "12 Rue de Rivoli, 75004",
    phone: "+33 1 42 78 09 12",
    hours: "Tue–Sat · 10:00–19:00",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    featured: true,
  },
  {
    city: "Milan",
    country: "Italy",
    address: "Via Montenapoleone 8, 20121",
    phone: "+39 02 7600 4321",
    hours: "Mon–Sat · 10:00–20:00",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80",
    featured: false,
  },
  {
    city: "Kyoto",
    country: "Japan",
    address: "362-1 Hanamikoji, Higashiyama",
    phone: "+81 75 533 0088",
    hours: "Wed–Sun · 11:00–18:00",
    image:
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80",
    featured: false,
  },
] as const;

function StoreLocator({ reduced }: { reduced: boolean }) {
  const [active, setActive] = React.useState(0);
  const sectionRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const headY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      id="chapter-locator"
      aria-label="Ateliers & showrooms"
      ref={sectionRef}
      className={cn("relative py-24", INK, CREAM)}
    >
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,oklch(0.7_0.13_70_/_0.18),transparent)] blur-2xl" />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,oklch(0.6_0.1_80_/_0.12),transparent)] blur-2xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <motion.div style={reduced ? undefined : { y: headY }} className="mb-12 text-center">
          <p className="eyebrow text-gold">Visit the atelier</p>
          <h2
            className="mt-4 text-balance font-display text-4xl font-medium leading-tight tracking-display sm:text-5xl lg:text-6xl"
            style={DISPLAY_FONT}
          >
            Three rooms where
            <br />
            <span className="gold-text italic">the work is kept.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-sm text-[oklch(0.96_0.008_80_/0.7)] sm:text-base">
            Book a private viewing. Hold the objects. Meet the hands behind them.
          </p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          {/* featured atelier card */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="group relative overflow-hidden rounded-3xl border border-white/10"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img
                  src={ATELIERS[active].image}
                  alt={`${ATELIERS[active].city} atelier`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* city tabs */}
            <div className="absolute left-5 top-5 z-10 flex gap-1.5">
              {ATELIERS.map((a, i) => (
                <button
                  key={a.city}
                  onClick={() => setActive(i)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur transition-all",
                    active === i
                      ? "gold-gradient text-primary-foreground"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                  )}
                >
                  {a.city}
                </button>
              ))}
            </div>

            {/* address overlay */}
            <div className="relative z-10 flex h-full min-h-[340px] flex-col justify-end p-6 sm:p-8">
              <motion.div
                key={active + "-info"}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  {ATELIERS[active].featured && (
                    <span className="rounded-full bg-gold/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary-foreground">
                      Flagship
                    </span>
                  )}
                  <span className="eyebrow text-[oklch(0.96_0.008_80_/0.6)]">
                    {ATELIERS[active].country}
                  </span>
                </div>
                <h3
                  className="mt-2 font-display text-4xl font-semibold tracking-display sm:text-5xl"
                  style={DISPLAY_FONT}
                >
                  {ATELIERS[active].city}
                </h3>
                <div className="mt-4 grid gap-2 text-sm text-[oklch(0.96_0.008_80_/0.85)] sm:grid-cols-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-white/50">Address</div>
                    <div className="mt-0.5">{ATELIERS[active].address}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-white/50">Hours</div>
                    <div className="mt-0.5">{ATELIERS[active].hours}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-white/50">Telephone</div>
                    <div className="mt-0.5">{ATELIERS[active].phone}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-white/50">By appointment</div>
                    <div className="mt-0.5">Private viewings daily</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* side list */}
          <div className="flex flex-col gap-3">
            {ATELIERS.map((a, i) => (
              <motion.button
                key={a.city}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setActive(i)}
                className={cn(
                  "group flex items-center gap-4 rounded-2xl border p-3 text-left transition-all",
                  active === i
                    ? "border-gold/60 bg-gold/10"
                    : "border-white/10 bg-white/[0.03] hover:border-white/25"
                )}
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  <img
                    src={a.image}
                    alt={a.city}
                    className={cn(
                      "h-full w-full object-cover transition-transform duration-500",
                      active === i ? "scale-110" : "group-hover:scale-105"
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        "font-display text-xl font-semibold tracking-display",
                        active === i ? "gold-text" : "text-white"
                      )}
                      style={DISPLAY_FONT}
                    >
                      {a.city}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-white/40">
                      {a.country}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[oklch(0.96_0.008_80_/0.6)]">
                    {a.address}
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/40">{a.hours}</p>
                </div>
                <ArrowRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-all",
                    active === i ? "text-gold translate-x-0" : "text-white/30 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                  )}
                />
              </motion.button>
            ))}

            {/* booking CTA */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-1 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-4 text-center"
            >
              <p className="font-display text-sm font-medium text-[oklch(0.96_0.008_80_/0.9)]">
                Book a private viewing
              </p>
              <p className="mt-1 text-[11px] text-[oklch(0.96_0.008_80_/0.6)]">
                90 minutes with an atelier curator. Complimentary.
              </p>
              <button
                onClick={() => {
                  toast.success(`Booking requested for ${ATELIERS[active].city}`, {
                    description: "We'll confirm your private viewing within 24 hours.",
                  });
                }}
                className="mt-3 inline-flex items-center gap-2 rounded-full gold-gradient px-5 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                Request appointment
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Finale — full-viewport ink CTA                                       */
/* ------------------------------------------------------------------ */

function FinaleWord({
  progress,
  from,
  to,
  children,
}: {
  progress: MotionValue<number>;
  from: number;
  to: number;
  children: string;
}) {
  const y = useTransform(progress, [from, to], ["115%", "0%"]);
  return (
    <span className="mr-[0.26em] inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] last:mr-0">
      <motion.span className="inline-block will-change-transform" style={{ y }}>
        {children}
      </motion.span>
    </span>
  );
}

function Finale({ reduced }: { reduced: boolean }) {
  const setView = useStore((s) => s.setView);
  const sectionRef = React.useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });
  const ghostY = useTransform(smooth, [0, 1], ["7%", "-7%"]);
  const headOpacity = useTransform(smooth, [0.04, 0.12], [0, 1]);

  return (
    <section
      aria-label="Finale"
      ref={sectionRef}
      className={cn("relative flex min-h-screen flex-col overflow-hidden", INK)}
    >
      {/* ghost wordmark — slow parallax */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <motion.span
          style={reduced ? undefined : { y: ghostY }}
          className="select-none font-display text-[26vw] font-semibold leading-none tracking-display text-white opacity-[0.04]"
        >
          AURA
        </motion.span>
      </div>

      {/* center content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-28 text-center">
        <motion.p style={{ opacity: headOpacity }} className="eyebrow text-gold">
          The final frame
        </motion.p>
        <h2
          className="mt-8 font-display text-5xl font-medium leading-[1.04] tracking-display sm:text-6xl lg:text-7xl xl:text-8xl"
          style={DISPLAY_FONT}
        >
          {FINALE_WORDS.map((word, i) =>
            reduced ? (
              <span
                key={word}
                className="mr-[0.26em] inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] last:mr-0"
              >
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                >
                  {word}
                </motion.span>
              </span>
            ) : (
              <FinaleWord
                key={word}
                progress={smooth}
                from={0.1 + i * 0.07}
                to={0.18 + i * 0.07}
              >
                {word}
              </FinaleWord>
            )
          )}
        </h2>

        <motion.div {...fadeUp(reduced, 0.5)} className="mt-14">
          <motion.button
            type="button"
            onClick={() => setView("shop")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="gold-gradient gold-glow group inline-flex items-center gap-3 rounded-full px-10 py-5 text-primary-foreground"
          >
            <span className="font-display text-lg tracking-tight">Enter the atelier</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </motion.button>
        </motion.div>
      </div>

      {/* gold marquee strip — edges dissolve into the ink backdrop */}
      <div
        className="relative z-10 overflow-hidden gold-gradient py-4"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        }}
      >
        <div className={cn("flex w-max", !reduced && "animate-marquee")}>
          {[0, 1].map((half) => (
            <div key={half} aria-hidden={half === 1} className="flex shrink-0 items-center">
              {Array.from({ length: MARQUEE_REPEAT }, (_, i) => (
                <span
                  key={i}
                  className="eyebrow whitespace-nowrap px-8 text-[oklch(0.155_0.012_60)]"
                >
                  Hand-finished · Lifetime guarantee · Made to be kept ·
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Cinematic timecode overlay — bottom-left HUD                       */
/* ------------------------------------------------------------------ */

/** Format a 0..1 progress as a fake mm:ss / mm:ss "timecode". */
function formatTimecode(p: number, totalSeconds = 134): string {
  const t = Math.max(0, Math.min(1, p)) * totalSeconds;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function TimecodeOverlay({
  chapters,
  progress,
}: {
  chapters: ChapterLink[];
  progress: MotionValue<number>;
}) {
  const [active, setActive] = React.useState<string>("Overture");
  const [tc, setTc] = React.useState("00:00");
  const [totalTc, setTotalTc] = React.useState("02:14");
  const [visible, setVisible] = React.useState(false);

  // Track which chapter is currently in view
  React.useEffect(() => {
    const observers: IntersectionObserver[] = [];
    chapters.forEach((c) => {
      const el = document.getElementById(c.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting && e.intersectionRatio >= 0.35) setActive(c.label);
          });
        },
        { threshold: [0.35, 0.6] }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [chapters]);

  // Drive the timecode text from the scroll progress MotionValue
  React.useEffect(() => {
    const unsub = progress.on("change", (v) => {
      setTc(formatTimecode(v));
      setTotalTc(formatTimecode(1));
    });
    // Reveal after a beat so it doesn't pop in on first paint
    const t = setTimeout(() => setVisible(true), 600);
    return () => {
      unsub();
      clearTimeout(t);
    };
  }, [progress]);

  const chapterIdx = Math.max(
    0,
    chapters.findIndex((c) => c.label === active)
  );

  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none fixed bottom-5 left-5 z-40 hidden items-center gap-3 lg:flex"
    >
      {/* REC dot */}
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-70" />
        <span className="timecode-blink relative inline-flex h-2 w-2 rounded-full bg-gold" />
      </span>
      <div className="flex flex-col gap-0.5 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-md">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[oklch(0.96_0.008_80_/0.6)]">
          <span className="font-display text-gold">CH {String(chapterIdx).padStart(2, "0")}</span>
          <span className="text-white/30">·</span>
          <span className="text-[oklch(0.96_0.008_80_/0.85)]">{active}</span>
        </div>
        <div className="font-mono text-[11px] tabular-nums text-white/70">
          <span className="text-gold">{tc}</span>
          <span className="text-white/30"> / {totalTc}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* StoryPage                                                            */
/* ------------------------------------------------------------------ */

export function StoryPage() {
  const reduced = useReducedMotion() ?? false;
  const [isDesktop, setIsDesktop] = React.useState(false);

  // Whole-page progress for the fixed top bar.
  const { scrollYProgress } = useScroll();
  const barScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  // Sticky-stage refs — the chapter rail tracks these (not the tall sections).
  const overtureStage = React.useRef<HTMLDivElement>(null);
  const originsStage = React.useRef<HTMLDivElement>(null);
  const materialsStage = React.useRef<HTMLDivElement>(null);
  const craftStage = React.useRef<HTMLDivElement>(null);
  const numbersStage = React.useRef<HTMLDivElement>(null);

  const chapters: ChapterLink[] = [
    { id: "chapter-overture", label: "Overture", ref: overtureStage },
    { id: "chapter-origins", label: "Origins", ref: originsStage },
    { id: "chapter-materials", label: "Materials", ref: materialsStage },
    { id: "chapter-craft", label: "Craft", ref: craftStage },
    { id: "chapter-numbers", label: "Numbers", ref: numbersStage },
  ];

  // The story always begins at the top — and defeats browser scroll restoration.
  useScrollTop();

  // Desktop-only pinned variants (SSR-consistent: stacked by default).
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* fixed top progress bar */}
      <motion.div
        aria-hidden="true"
        className="gold-gradient fixed left-0 right-0 top-0 z-[70] h-[3px] origin-left"
        style={{ scaleX: reduced ? scrollYProgress : barScale }}
      />

      {/* film grain overlay */}
      <div
        aria-hidden="true"
        className="grain pointer-events-none fixed inset-0 z-[5] opacity-[0.06]"
      />

      {/* chapter rail (desktop) */}
      <ChapterRail chapters={chapters} reduced={reduced} />

      {/* cinematic timecode overlay (bottom-left) — sells the "film" metaphor */}
      <TimecodeOverlay
        chapters={chapters}
        progress={reduced ? scrollYProgress : barScale}
      />

      <main className="flex-1">
        <Overture reduced={reduced} stageRef={overtureStage} />
        <Origins reduced={reduced} stageRef={originsStage} />
        <Materials reduced={reduced} isDesktop={isDesktop} stageRef={materialsStage} />
        <Craft reduced={reduced} isDesktop={isDesktop} stageRef={craftStage} />
        <Numbers reduced={reduced} stageRef={numbersStage} />
        <StoreLocator reduced={reduced} />
        <Finale reduced={reduced} />
      </main>

      {/* minimal story footer strip */}
      <footer className={cn("mt-auto border-t border-white/10 px-6 py-6", INK)}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <BrandMark size={20} className="text-[oklch(0.96_0.008_80_/0.5)]" />
            <span className="font-display text-xs tracking-display text-[oklch(0.96_0.008_80_/0.5)]">
              AURA — The Atelier Film
            </span>
          </div>
          <p className="text-xs text-[oklch(0.96_0.008_80_/0.5)]">© 2025 The Story</p>
        </div>
      </footer>
    </div>
  );
}
