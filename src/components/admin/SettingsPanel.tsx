"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Coins,
  Palette,
  Ticket,
  Plus,
  Trash2,
  Power,
  RotateCcw,
  Sparkles,
  Check,
  Mail,
  Copy,
  Users,
  Search,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { Coupon } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ACCENTS = [
  { id: "gold", label: "Gold", color: "#d4af37" },
  { id: "emerald", label: "Emerald", color: "#10b981" },
  { id: "rose", label: "Rose", color: "#f43f5e" },
  { id: "terracotta", label: "Terracotta", color: "#c2410c" },
] as const;

const CURRENCIES = ["$", "€", "£", "¥", "₹", "A$"];

export function SettingsPanel() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const coupons = useStore((s) => s.coupons);
  const addCoupon = useStore((s) => s.addCoupon);
  const toggleCoupon = useStore((s) => s.toggleCoupon);
  const deleteCoupon = useStore((s) => s.deleteCoupon);
  const resetAll = useStore((s) => s.resetAll);
  const subscribers = useStore((s) => s.subscribers);
  const removeSubscriber = useStore((s) => s.removeSubscriber);

  const [draft, setDraft] = React.useState<Coupon>({
    code: "",
    type: "percent",
    value: 10,
    description: "",
    active: true,
  });

  const createCoupon = () => {
    const code = draft.code.trim().toUpperCase();
    if (!code) {
      toast.error("Enter a coupon code");
      return;
    }
    if (coupons.some((c) => c.code.toUpperCase() === code)) {
      toast.error("That code already exists");
      return;
    }
    addCoupon({ ...draft, code, description: draft.description || `${draft.value}${draft.type === "percent" ? "%" : "$"} off` });
    toast.success(`Coupon ${code} created`);
    setDraft({ code: "", type: "percent", value: 10, description: "", active: true });
  };

  const randomCode = () => {
    const c = "AURA" + Math.random().toString(36).slice(2, 7).toUpperCase();
    setDraft({ ...draft, code: c });
  };

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold transition-colors";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight font-display">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your storefront — changes are reflected live across the app.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Store identity */}
        <Panel icon={Store} title="Store identity">
          <Field label="Store name">
            <input
              className={inputCls}
              value={settings.storeName}
              onChange={(e) => updateSettings({ storeName: e.target.value })}
            />
          </Field>
          <Field label="Free shipping threshold">
            <div className="flex items-center gap-2">
              <input
                type="number"
                className={inputCls}
                value={settings.freeShippingThreshold}
                onChange={(e) => updateSettings({ freeShippingThreshold: Number(e.target.value) })}
              />
              <span className="text-sm text-muted-foreground">{settings.currency}</span>
            </div>
          </Field>
          <div className="mt-2 rounded-lg border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <Sparkles className="mr-1 inline h-3 w-3 text-gold" />
            Store name appears in the navbar and footer in real time.
          </div>
        </Panel>

        {/* Currency */}
        <Panel icon={Coins} title="Currency">
          <Field label="Symbol">
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  onClick={() => updateSettings({ currency: c })}
                  className={cn(
                    "grid h-10 w-12 place-items-center rounded-lg border text-sm font-semibold transition-colors",
                    settings.currency === c
                      ? "border-gold bg-gold/10 text-gold-deep dark:text-gold"
                      : "border-border hover:bg-accent"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>
          <div className="mt-2 text-xs text-muted-foreground">
            Applied across products, cart, and checkout. Prices are display-only.
          </div>
        </Panel>

        {/* Accent */}
        <Panel icon={Palette} title="Accent theme">
          <div className="grid grid-cols-2 gap-3">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => updateSettings({ accent: a.id })}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl border p-3 transition-all",
                  settings.accent === a.id ? "border-foreground ring-1 ring-foreground/30" : "border-border hover:bg-accent"
                )}
              >
                <span className="h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-card" style={{ backgroundColor: a.color, boxShadow: `0 0 0 2px ${a.color}40` }} />
                <span className="text-sm font-medium">{a.label}</span>
                {settings.accent === a.id && (
                  <Check className="ml-auto h-4 w-4 text-foreground" />
                )}
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Visual preview only — wire this to your design tokens for production theming.
          </div>
        </Panel>

        {/* Reset */}
        <Panel icon={RotateCcw} title="Data & reset">
          <p className="text-xs text-muted-foreground">
            Reset all products, orders, cart, wishlist and coupons back to the original
            demo seed. This cannot be undone.
          </p>
          <button
            onClick={() => {
              if (confirm("Reset all data to the original demo state?")) {
                resetAll();
                toast.success("All data reset to defaults");
              }
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
          >
            <RotateCcw className="h-4 w-4" /> Reset to demo data
          </button>
        </Panel>
      </div>

      {/* Coupon manager */}
      <Panel icon={Ticket} title="Coupon codes">
        {/* create */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Create coupon
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <Field label="Code">
              <div className="flex gap-1">
                <input
                  className={inputCls}
                  value={draft.code}
                  onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER20"
                />
                <button onClick={randomCode} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border hover:bg-accent" aria-label="Generate">
                  <Sparkles className="h-4 w-4 text-gold" />
                </button>
              </div>
            </Field>
            <Field label="Type">
              <select className={inputCls} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as Coupon["type"] })}>
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </Field>
            <Field label="Value">
              <input type="number" className={inputCls} value={draft.value} onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })} />
            </Field>
            <div className="flex items-end">
              <button
                onClick={createCoupon}
                className="inline-flex h-[42px] items-center gap-1.5 rounded-lg gold-gradient px-4 text-sm font-semibold text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> Create
              </button>
            </div>
          </div>
        </div>

        {/* list */}
        <div className="mt-4 space-y-2">
          <AnimatePresence initial={false}>
            {coupons.map((c) => (
              <motion.div
                key={c.code}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-gold/10 text-gold">
                    <Ticket className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold">{c.code}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", c.active ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.type === "percent" ? `${c.value}% off` : `${settings.currency}${c.value} off`} · {c.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleCoupon(c.code)}
                    className={cn("grid h-8 w-8 place-items-center rounded-full", c.active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground hover:bg-accent")}
                    aria-label="Toggle active"
                  >
                    <Power className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      deleteCoupon(c.code);
                      toast(`Coupon ${c.code} deleted`);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Panel>

      {/* Subscribers */}
      <Panel icon={Mail} title="Newsletter subscribers">
        <SubscribersView
          subscribers={subscribers}
          onRemove={(email) => {
            removeSubscriber(email);
            toast(`Removed ${email}`);
          }}
        />
      </Panel>
    </div>
  );
}

function SubscribersView({
  subscribers,
  onRemove,
}: {
  subscribers: { email: string; ts: number }[];
  onRemove: (email: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter((s) => s.email.includes(q));
  }, [subscribers, query]);

  const copyAll = () => {
    const text = subscribers.map((s) => s.email).join(", ");
    navigator.clipboard?.writeText(text);
    toast.success(`Copied ${subscribers.length} email${subscribers.length === 1 ? "" : "s"}`);
  };

  if (subscribers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-10 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-3 text-sm font-medium">No subscribers yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Sign-ups from the storefront footer newsletter will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subscribers…"
            className="w-full rounded-full border border-border bg-background py-2 pl-8 pr-3 text-xs outline-none focus:border-gold"
          />
        </div>
        <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold">
          {subscribers.length}
        </span>
        <button
          onClick={copyAll}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-medium hover:bg-accent"
        >
          <Copy className="h-3.5 w-3.5" /> Copy all
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto thin-scrollbar rounded-xl border border-border">
        <AnimatePresence initial={false}>
          {filtered.map((s, i) => (
            <motion.div
              key={s.email}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: Math.min(i * 0.02, 0.15) }}
              className="group flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-0 hover:bg-accent/40"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full gold-gradient text-xs font-bold text-primary-foreground">
                {s.email[0]?.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{s.email}</div>
                <div className="text-[10px] text-muted-foreground">
                  Subscribed {new Date(s.ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(s.email);
                  toast(`Copied ${s.email}`);
                }}
                className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100"
                aria-label="Copy email"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onRemove(s.email)}
                className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-rose-500/10 hover:text-rose-500 group-hover:opacity-100"
                aria-label="Remove subscriber"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="py-6 text-center text-xs text-muted-foreground">No matches for “{query}”.</div>
        )}
      </div>
    </div>
  );
}


function Panel({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Store;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold/10 text-gold">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
