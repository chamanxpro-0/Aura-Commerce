"use client";

/**
 * SizeGuideModal — a luxury-brand style size guide with:
 *  - a minimalist body diagram with measurement anchors
 *  - a US / EU / UK / JP conversion table for apparel + accessories
 *  - a "How to measure" accordion with chest, waist, hip, inseam tips
 *
 * Designed to be triggered from a ProductDetail "Size guide" link.
 */
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ruler, ChevronDown, Shirt, Watch, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";

type SizeGuideProps = {
  open: boolean;
  onClose: () => void;
  /** Which table to lead with — inferred from product category. */
  kind?: "apparel" | "accessories" | "footwear";
};

const APPAREL_ROWS = [
  { size: "XS", us: "0–2", eu: "32–34", uk: "4–6", jp: "5–7", chest: "82–86" },
  { size: "S", us: "4–6", eu: "36–38", uk: "8–10", jp: "9–11", chest: "88–92" },
  { size: "M", us: "8–10", eu: "40–42", uk: "12–14", jp: "13–15", chest: "94–98" },
  { size: "L", us: "12–14", eu: "44–46", uk: "16–18", jp: "17–19", chest: "100–104" },
  { size: "XL", us: "16–18", eu: "48–50", uk: "20–22", jp: "21–23", chest: "106–112" },
];

const ACCESSORY_ROWS = [
  { size: "XS", us: '5⅞"', eu: "47mm", uk: 'L"', jp: "15" },
  { size: "S", us: '6¼"', eu: "50mm", uk: 'M"', jp: "16" },
  { size: "M", us: '6½"', eu: "52mm", uk: 'N"', jp: "17" },
  { size: "L", us: '6¾"', eu: "54mm", uk: 'O"', jp: "18" },
  { size: "XL", us: '7"', eu: "56mm", uk: 'P"', jp: "19" },
];

const MEASUREMENT_TIPS = [
  {
    title: "Chest",
    body: "Wrap a soft tape under your arms, around the fullest part of your chest. Keep the tape parallel to the floor and breathe normally.",
  },
  {
    title: "Waist",
    body: "Measure around your natural waistline — the narrowest part of your torso, usually just above the navel. Don't pull the tape too tight.",
  },
  {
    title: "Hip",
    body: "Stand with your feet together and measure around the fullest part of your hips and seat, approximately 8\" below your natural waist.",
  },
  {
    title: "Inseam",
    body: "Measure from the top of your inner thigh down to your ankle bone. If between sizes, round up for a relaxed fit.",
  },
];

export function SizeGuideModal({ open, onClose, kind = "apparel" }: SizeGuideProps) {
  const [tab, setTab] = React.useState<"apparel" | "accessories">(kind === "accessories" ? "accessories" : "apparel");
  const [openTip, setOpenTip] = React.useState<string | null>("Chest");

  // Lock body scroll while open
  React.useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed left-0 top-0 z-[90] flex h-[100dvh] w-screen items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Size guide"
        >
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/15 text-gold">
                  <Ruler className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold tracking-tight">
                    Size guide
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Atelier-standard measurements · cm / inches
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close size guide"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* scrollable body */}
            <div className="flex-1 overflow-y-auto thin-scrollbar px-6 py-5">
              {/* tab switch */}
              <div className="mb-5 inline-flex rounded-full border border-border bg-muted/40 p-1">
                <TabButton active={tab === "apparel"} onClick={() => setTab("apparel")} icon={Shirt} label="Apparel" />
                <TabButton active={tab === "accessories"} onClick={() => setTab("accessories")} icon={Watch} label="Accessories" />
              </div>

              <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                {/* body diagram */}
                <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-muted/50 to-background p-4">
                  <BodyDiagram kind={tab} />
                </div>

                {/* conversion table */}
                <div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <h3 className="text-sm font-semibold">
                      {tab === "apparel" ? "Apparel — international" : "Wrist — circumference"}
                    </h3>
                    <span className="text-[11px] text-muted-foreground">All measurements in cm unless noted</span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/60 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">Size</th>
                          {tab === "apparel" ? (
                            <>
                              <th className="px-3 py-2 text-left font-medium">US</th>
                              <th className="px-3 py-2 text-left font-medium">EU</th>
                              <th className="px-3 py-2 text-left font-medium">UK</th>
                              <th className="px-3 py-2 text-left font-medium">JP</th>
                              <th className="px-3 py-2 text-right font-medium">Chest (cm)</th>
                            </>
                          ) : (
                            <>
                              <th className="px-3 py-2 text-left font-medium">US (in)</th>
                              <th className="px-3 py-2 text-left font-medium">EU (mm)</th>
                              <th className="px-3 py-2 text-left font-medium">UK</th>
                              <th className="px-3 py-2 text-right font-medium">JP</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {(tab === "apparel" ? APPAREL_ROWS : ACCESSORY_ROWS).map((row, i) => (
                          <tr
                            key={row.size}
                            className={cn(
                              "border-t border-border transition-colors hover:bg-accent/50",
                              i % 2 === 1 && "bg-muted/20"
                            )}
                          >
                            <td className="px-3 py-2.5 font-semibold text-gold">{row.size}</td>
                            {tab === "apparel" ? (
                              <>
                                <td className="px-3 py-2.5">{(row as typeof APPAREL_ROWS[number]).us}</td>
                                <td className="px-3 py-2.5">{(row as typeof APPAREL_ROWS[number]).eu}</td>
                                <td className="px-3 py-2.5">{(row as typeof APPAREL_ROWS[number]).uk}</td>
                                <td className="px-3 py-2.5">{(row as typeof APPAREL_ROWS[number]).jp}</td>
                                <td className="px-3 py-2.5 text-right font-medium">{(row as typeof APPAREL_ROWS[number]).chest}</td>
                              </>
                            ) : (
                              <>
                                <td className="px-3 py-2.5">{(row as typeof ACCESSORY_ROWS[number]).us}</td>
                                <td className="px-3 py-2.5">{(row as typeof ACCESSORY_ROWS[number]).eu}</td>
                                <td className="px-3 py-2.5">{(row as typeof ACCESSORY_ROWS[number]).uk}</td>
                                <td className="px-3 py-2.5 text-right font-medium">{(row as typeof ACCESSORY_ROWS[number]).jp}</td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* how to measure accordion */}
                  <div className="mt-5">
                    <h3 className="mb-2 text-sm font-semibold">How to measure</h3>
                    <div className="overflow-hidden rounded-xl border border-border">
                      {MEASUREMENT_TIPS.map((tip, i) => {
                        const isOpen = openTip === tip.title;
                        return (
                          <div key={tip.title} className={cn(i > 0 && "border-t border-border")}>
                            <button
                              onClick={() => setOpenTip(isOpen ? null : tip.title)}
                              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-accent/40"
                              aria-expanded={isOpen}
                            >
                              <span className="flex items-center gap-2">
                                <span className="grid h-6 w-6 place-items-center rounded-full bg-gold/15 text-[10px] font-bold text-gold">
                                  {i + 1}
                                </span>
                                {tip.title}
                              </span>
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 text-muted-foreground transition-transform",
                                  isOpen && "rotate-180"
                                )}
                              />
                            </button>
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden"
                                >
                                  <p className="px-4 pb-3 text-xs leading-relaxed text-muted-foreground">
                                    {tip.body}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="border-t border-border bg-muted/30 px-6 py-3">
              <p className="text-[11px] text-muted-foreground">
                Between sizes? Size up for a relaxed cut, size down for tailored. Free returns within 30 days.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
        active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {active && (
        <motion.span
          layoutId="sizeguide-tab"
          className="absolute inset-0 rounded-full gold-gradient"
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
        />
      )}
      <Icon className="relative h-3.5 w-3.5" />
      <span className="relative">{label}</span>
    </button>
  );
}

/* Minimalist body diagram — line-art torso with measurement anchors.
   Pure SVG so it stays crisp at any size and respects the active theme. */
function BodyDiagram({ kind }: { kind: "apparel" | "accessories" }) {
  if (kind === "accessories") {
    return (
      <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-4">
        <svg viewBox="0 0 200 200" className="h-44 w-44" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="100" cy="100" r="58" className="stroke-border" />
          <circle cx="100" cy="100" r="48" className="stroke-gold" strokeDasharray="3 4" />
          <circle cx="100" cy="100" r="6" className="fill-gold stroke-gold" />
          <line x1="100" y1="20" x2="100" y2="42" className="stroke-gold" />
          <line x1="100" y1="158" x2="100" y2="180" className="stroke-gold" />
          <text x="100" y="14" textAnchor="middle" className="fill-muted-foreground text-[9px] font-medium">
            wrist
          </text>
        </svg>
        <p className="text-center text-[11px] text-muted-foreground">
          Wrap a soft tape around your wrist bone. Match the cm to the table.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3">
      <svg viewBox="0 0 200 280" className="h-[260px]" fill="none" stroke="currentColor" strokeWidth="1.3">
        {/* head */}
        <circle cx="100" cy="28" r="16" className="stroke-border" />
        {/* neck */}
        <line x1="100" y1="44" x2="100" y2="56" className="stroke-border" />
        {/* shoulders */}
        <line x1="62" y1="58" x2="138" y2="58" className="stroke-border" />
        {/* torso */}
        <path d="M62 58 L70 140 L130 140 L138 58" className="stroke-border" />
        {/* waist */}
        <line x1="70" y1="140" x2="130" y2="140" className="stroke-gold" />
        {/* hips */}
        <line x1="72" y1="160" x2="128" y2="160" className="stroke-gold" />
        {/* legs */}
        <line x1="78" y1="160" x2="78" y2="260" className="stroke-border" />
        <line x1="122" y1="160" x2="122" y2="260" className="stroke-border" />
        {/* chest measurement anchor */}
        <line x1="40" y1="98" x2="60" y2="98" className="stroke-gold" strokeDasharray="2 3" />
        <line x1="140" y1="98" x2="160" y2="98" className="stroke-gold" strokeDasharray="2 3" />
        <text x="36" y="102" textAnchor="end" className="fill-gold text-[8px] font-semibold">
          CHEST
        </text>
        <text x="164" y="102" className="fill-gold text-[8px] font-semibold">
          88–98
        </text>
        {/* waist label */}
        <text x="36" y="144" textAnchor="end" className="fill-gold text-[8px] font-semibold">
          WAIST
        </text>
        <text x="164" y="144" className="fill-gold text-[8px] font-semibold">
          72–84
        </text>
        {/* hip label */}
        <text x="36" y="164" textAnchor="end" className="fill-gold text-[8px] font-semibold">
          HIP
        </text>
        <text x="164" y="164" className="fill-gold text-[8px] font-semibold">
          92–104
        </text>
        {/* inseam */}
        <line x1="78" y1="200" x2="58" y2="200" className="stroke-gold" strokeDasharray="2 3" />
        <text x="54" y="204" textAnchor="end" className="fill-gold text-[8px] font-semibold">
          INSEAM
        </text>
      </svg>
      <p className="text-center text-[11px] text-muted-foreground">
        Anchors show where each measurement sits on the body.
      </p>
    </div>
  );
}
