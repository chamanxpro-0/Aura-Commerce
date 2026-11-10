"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, ArrowUpRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { useScrollTop } from "@/lib/useScrollTop";
import { cn } from "@/lib/utils";
import {
  JOURNAL_ARTICLES,
  JOURNAL_CATEGORIES,
  type JournalArticleMeta,
  type JournalCategory,
} from "@/data/journalData";

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

const DISPLAY_FONT: React.CSSProperties = {
  fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144',
};

export function JournalPage() {
  useScrollTop();
  const openJournalArticle = useStore((s) => s.openJournalArticle);

  const [cat, setCat] = React.useState<JournalCategory | "All">("All");

  const featured = JOURNAL_ARTICLES.find((a) => a.featured) ?? JOURNAL_ARTICLES[0];
  const rest = JOURNAL_ARTICLES.filter((a) => a.slug !== featured.slug);

  const filtered = React.useMemo(() => {
    if (cat === "All") return rest;
    return rest.filter((a) => a.category === cat);
  }, [cat, rest]);

  const counts = React.useMemo(() => {
    const m: Record<string, number> = { All: JOURNAL_ARTICLES.length };
    for (const c of JOURNAL_CATEGORIES) m[c] = JOURNAL_ARTICLES.filter((a) => a.category === c).length;
    return m;
  }, []);

  return (
    <main className="flex-1">
      {/* masthead */}
      <section className="relative overflow-hidden pt-12 sm:pt-16">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 right-1/4 h-[360px] w-[640px] rounded-full bg-[radial-gradient(closest-side,oklch(0.86_0.1_80_/_0.4),transparent)] blur-2xl dark:bg-[radial-gradient(closest-side,oklch(0.4_0.06_70_/_0.5),transparent)]" />
          <div className="absolute inset-0 grain opacity-30" />
        </div>
        <div className="mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="eyebrow text-gold"
          >
            The Atelier Journal · {JOURNAL_ARTICLES.length} entries
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 max-w-3xl text-balance font-display text-5xl font-medium leading-[1.02] tracking-display sm:text-6xl lg:text-7xl"
            style={DISPLAY_FONT}
          >
            Field notes from <span className="gold-text italic">the bench</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg"
          >
            Essays on craft, materials, the people at the bench, and the slow
            business of making things that last. Updated when there is something
            worth saying.
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 h-px w-full max-w-md origin-left gold-gradient"
          />
        </div>
      </section>

      {/* featured article */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <motion.button
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => openJournalArticle(featured.slug)}
            className="group relative grid w-full overflow-hidden rounded-3xl border border-border bg-card text-left lg:grid-cols-[1.3fr_1fr]"
          >
            <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:h-full">
              <img
                src={featured.hero}
                alt={featured.title}
                className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/20" />
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <span className={cn("rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur", categoryTone(featured.category))}>
                  {featured.category}
                </span>
                <span className="rounded-full bg-background/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold backdrop-blur">
                  Featured
                </span>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-medium">{featured.author}</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span>{formatDate(featured.date)}</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {featured.readingTime} min
                </span>
              </div>
              <h2
                className="text-balance font-display text-3xl font-medium leading-[1.05] tracking-display sm:text-4xl lg:text-5xl"
                style={DISPLAY_FONT}
              >
                {featured.title}
              </h2>
              <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                {featured.dek}
              </p>
              <span className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-gold">
                Read the essay
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </motion.button>
        </div>
      </section>

      {/* category filter */}
      <section className="pb-4">
        <div className="mx-auto max-w-7xl px-4">
          <div className="no-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-1">
            {(["All", ...JOURNAL_CATEGORIES] as const).map((c) => {
              const active = cat === c;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c as JournalCategory | "All")}
                  className={cn(
                    "relative shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors",
                    active
                      ? "border-transparent text-primary-foreground"
                      : "border-border text-foreground/70 hover:bg-accent hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span layoutId="journal-cat-tab" className="absolute inset-0 rounded-full gold-gradient" />
                  )}
                  <span className="relative">
                    {c}{" "}
                    <span className={cn("text-[10px]", active ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {counts[c as string] ?? 0}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* article grid */}
      <section className="pb-20 pt-6">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((article, i) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  index={i}
                  onOpen={() => openJournalArticle(article.slug)}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No entries in this category yet. Check back soon.
            </div>
          )}

          {/* hairline + count */}
          <div className="mt-12 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
              {filtered.length} of {rest.length} essays · curated weekly
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>
      </section>
    </main>
  );
}

function ArticleCard({
  article,
  index,
  onOpen,
}: {
  article: JournalArticleMeta;
  index: number;
  onOpen: () => void;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      onClick={onOpen}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:luxury-shadow"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={article.hero}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute left-3 top-3">
          <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur", categoryTone(article.category))}>
            {article.category}
          </span>
        </div>
        <div className="absolute right-3 top-3 grid h-8 w-8 translate-y-2 place-items-center rounded-full bg-background/80 opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4 text-gold" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{formatDate(article.date)}</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {article.readingTime} min
          </span>
        </div>
        <h3
          className="text-pretty font-display text-xl font-medium leading-snug tracking-tight"
          style={DISPLAY_FONT}
        >
          {article.title}
        </h3>
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {article.dek}
        </p>
        <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs font-medium text-foreground/80">{article.author}</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Read <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}
