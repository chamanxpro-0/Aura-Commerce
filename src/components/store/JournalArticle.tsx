"use client";

import * as React from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowLeft, Clock, ArrowRight, ArrowUpRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { useScrollTop } from "@/lib/useScrollTop";
import { cn } from "@/lib/utils";
import {
  JOURNAL_ARTICLES,
  getJournalArticle,
  type ArticleBlock,
  type JournalArticleFull,
  type JournalCategory,
} from "@/data/journalData";

const DISPLAY_FONT: React.CSSProperties = {
  fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function categoryTone(cat: JournalCategory): string {
  switch (cat) {
    case "Craft":
      return "bg-gold/15 text-gold-deep dark:text-gold border-gold/30";
    case "Materials":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
    case "People":
      return "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30";
    case "Sustainability":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
  }
}

export function JournalArticle({ slug }: { slug: string }) {
  useScrollTop();
  const article = getJournalArticle(slug);
  const setView = useStore((s) => s.setView);
  const openJournalArticle = useStore((s) => s.openJournalArticle);

  const rootRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  if (!article) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 py-32">
        <p className="text-sm text-muted-foreground">Article not found.</p>
        <button
          onClick={() => setView("journal")}
          className="rounded-full gold-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Back to the journal
        </button>
      </main>
    );
  }

  // first paragraph index — for the drop cap
  const firstParagraphIdx = article.body.findIndex((b) => b.type === "paragraph");

  // related — same category first, then fill with others, exclude self
  const related = JOURNAL_ARTICLES.filter((a) => a.slug !== article.slug)
    .sort((a, b) => {
      const aMatch = a.category === article.category ? 0 : 1;
      const bMatch = b.category === article.category ? 0 : 1;
      return aMatch - bMatch;
    })
    .slice(0, 3);

  return (
    <>
      {/* reading progress bar — sits above the sticky navbar */}
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="gold-gradient fixed left-0 right-0 top-0 z-[71] h-[3px] origin-left"
      />

      <motion.main
        ref={rootRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -14 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 pt-6"
      >
        <div className="mx-auto max-w-3xl px-4">
          {/* breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <button onClick={() => setView("home")} className="hover:text-foreground">
              Home
            </button>
            <span className="text-muted-foreground/40">/</span>
            <button onClick={() => setView("journal")} className="hover:text-foreground">
              Journal
            </button>
            <span className="text-muted-foreground/40">/</span>
            <span className="truncate text-foreground/70">{article.category}</span>
          </nav>

          {/* back button */}
          <button
            onClick={() => setView("journal")}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" /> All entries
          </button>
        </div>

        {/* article head */}
        <article className="mx-auto max-w-3xl px-4">
          <div className="mt-8 flex items-center gap-3">
            <span className={cn("rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide", categoryTone(article.category))}>
              {article.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {article.readingTime} min read
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-balance font-display text-4xl font-medium leading-[1.05] tracking-display sm:text-5xl lg:text-6xl"
            style={DISPLAY_FONT}
          >
            {article.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-5 text-pretty font-display text-lg font-medium italic leading-relaxed text-muted-foreground sm:text-xl"
            style={{ fontVariationSettings: '"SOFT" 80, "WONK" 1, "opsz" 72' }}
          >
            {article.dek}
          </motion.p>

          {/* byline */}
          <div className="mt-7 flex items-center gap-3 border-y border-border py-4">
            <div className="grid h-10 w-10 place-items-center rounded-full gold-gradient text-sm font-semibold text-primary-foreground">
              {article.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{article.author}</div>
              <div className="text-xs text-muted-foreground">{article.authorRole}</div>
            </div>
            <div className="text-xs text-muted-foreground">{formatDate(article.date)}</div>
          </div>
        </article>

        {/* hero image */}
        <figure className="mx-auto mt-8 max-w-5xl px-4">
          <div className="overflow-hidden rounded-3xl border border-border bg-muted luxury-shadow">
            <img
              src={article.hero}
              alt={article.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        </figure>

        {/* body */}
        <div className="mx-auto mt-10 max-w-3xl px-4">
          {article.body.map((block, i) => (
            <BlockRenderer key={i} block={block} dropCap={i === firstParagraphIdx} />
          ))}

          {/* closing signature / CTA */}
          <div className="mt-12 rounded-3xl border border-border bg-gradient-to-br from-gold/5 via-transparent to-gold-deep/5 p-8 text-center">
            <p className="eyebrow text-gold">From the atelier</p>
            <h3
              className="mt-4 text-balance font-display text-2xl font-medium tracking-tight sm:text-3xl"
              style={DISPLAY_FONT}
            >
              See the objects these stories are made of.
            </h3>
            <button
              onClick={() => setView("shop")}
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.03]"
            >
              Enter the shop
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* author card */}
        <div className="mx-auto mt-10 max-w-3xl px-4">
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full gold-gradient text-base font-semibold text-primary-foreground">
              {article.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div className="font-display text-lg font-medium tracking-tight" style={DISPLAY_FONT}>
                {article.author}
              </div>
              <div className="text-sm text-muted-foreground">{article.authorRole}</div>
            </div>
          </div>
        </div>

        {/* more from the journal */}
        <section className="mx-auto mt-16 max-w-7xl px-4 pb-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-gold">Keep reading</p>
              <h2
                className="mt-2 font-display text-2xl font-medium tracking-tight sm:text-3xl"
                style={DISPLAY_FONT}
              >
                More from the journal
              </h2>
            </div>
            <button
              onClick={() => setView("journal")}
              className="group inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              All entries
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a: JournalArticleFull, i) => (
              <motion.button
                key={a.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                onClick={() => openJournalArticle(a.slug)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-shadow hover:luxury-shadow"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={a.hero}
                    alt={a.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.06]"
                  />
                  <span className={cn("absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur", categoryTone(a.category))}>
                    {a.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{formatDate(a.date)}</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {a.readingTime}m
                    </span>
                  </div>
                  <h3 className="text-pretty font-display text-lg font-medium leading-snug tracking-tight" style={DISPLAY_FONT}>
                    {a.title}
                  </h3>
                  <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">{a.dek}</p>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-gold opacity-0 transition-opacity group-hover:opacity-100">
                    Read <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      </motion.main>
    </>
  );
}

function BlockRenderer({ block, dropCap }: { block: ArticleBlock; dropCap: boolean }) {
  switch (block.type) {
    case "paragraph":
      if (dropCap) {
        // Drop-cap on the first paragraph: float the first letter, styled gold.
        const first = block.text[0];
        const rest = block.text.slice(1);
        return (
          <p className="mt-6 text-pretty font-display text-lg leading-[1.7] text-foreground/90 sm:text-xl" style={{ fontVariationSettings: '"SOFT" 50, "WONK" 0, "opsz" 18' }}>
            <span
              className="gold-text float-left mr-3 mt-1 font-display text-6xl font-semibold leading-[0.8] sm:text-7xl"
              style={DISPLAY_FONT}
              aria-hidden
            >
              {first}
            </span>
            {rest}
          </p>
        );
      }
      return (
        <p className="mt-6 text-pretty font-display text-lg leading-[1.7] text-foreground/90 sm:text-xl" style={{ fontVariationSettings: '"SOFT" 50, "WONK" 0, "opsz" 18' }}>
          {block.text}
        </p>
      );
    case "heading":
      return (
        <h2 className="mt-10 text-balance font-display text-2xl font-medium leading-tight tracking-tight sm:text-3xl" style={DISPLAY_FONT}>
          {block.text}
        </h2>
      );
    case "quote":
      return (
        <blockquote className="relative mt-8 border-l-2 border-gold pl-6 sm:pl-8">
          <span className="absolute -left-1 top-0 font-display text-5xl leading-none text-gold/30" aria-hidden>
            &ldquo;
          </span>
          <p className="text-pretty font-display text-xl font-medium italic leading-[1.4] text-foreground sm:text-2xl" style={{ fontVariationSettings: '"SOFT" 80, "WONK" 1, "opsz" 72' }}>
            {block.text}
          </p>
          {block.cite && (
            <cite className="mt-3 block text-sm not-italic text-muted-foreground">
              — {block.cite}
            </cite>
          )}
        </blockquote>
      );
    case "image":
      return (
        <figure className="mt-8">
          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            <img src={block.src} alt={block.alt} loading="lazy" className="w-full object-cover" />
          </div>
          {block.caption && (
            <figcaption className="mt-2 text-center text-xs text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "list":
      return (
        <ul className="mt-6 space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-pretty font-display text-lg leading-[1.6] text-foreground/90" style={{ fontVariationSettings: '"SOFT" 50, "WONK" 0, "opsz" 18' }}>
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full gold-gradient" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}
