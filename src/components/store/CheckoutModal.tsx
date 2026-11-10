"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  X,
  MapPin,
  CreditCard,
  Check,
  ChevronRight,
  ChevronLeft,
  PartyPopper,
  Lock,
  ShieldCheck,
  Gift,
  Sparkles,
} from "lucide-react";
import { useStore, cartSubtotal, pricing } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";

const STEPS = ["Address", "Payment", "Review"] as const;

export function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cart = useStore((s) => s.cart);
  const products = useStore((s) => s.products);
  const settings = useStore((s) => s.settings);
  const currency = useStore((s) => s.currency);
  const appliedCoupon = useStore((s) => s.appliedCoupon);
  const placeOrderFromCart = useStore((s) => s.placeOrderFromCart);
  const setCartOpen = useStore((s) => s.setCartOpen);

  const [step, setStep] = React.useState(0);
  const [success, setSuccess] = React.useState(false);
  const [orderId, setOrderId] = React.useState("");

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    country: "United States",
    card: "",
    expiry: "",
    cvc: "",
  });

  // Gift wrap add-on (Review step)
  const [giftWrap, setGiftWrap] = React.useState(false);
  const [giftNote, setGiftNote] = React.useState("");
  const GIFT_WRAP_FEE = 12;

  React.useEffect(() => {
    if (open) {
      setStep(0);
      setSuccess(false);
      setGiftWrap(false);
      setGiftNote("");
    }
  }, [open]);

  const subtotal = cartSubtotal(cart, products);
  const base = pricing(
    subtotal,
    appliedCoupon.discount,
    settings.freeShippingThreshold
  );
  const giftWrapFee = giftWrap ? GIFT_WRAP_FEE : 0;
  const shipping = base.shipping;
  const tax = base.tax;
  const total = base.total + giftWrapFee;

  const next = () => setStep((s) => Math.min(2, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = () => {
    const order = placeOrderFromCart({
      name: form.name || "Guest Customer",
      email: form.email || "guest@aura.com",
      address: `${form.address}, ${form.city} ${form.zip}, ${form.country}`,
      payment: form.card ? `Card •• ${form.card.slice(-4)}` : "Simulated card",
    });
    setOrderId(order.id);
    setSuccess(true);
    fireConfetti();
  };

  const lines = cart
    .map((l) => ({ line: l, product: products.find((p) => p.id === l.productId)! }))
    .filter((x) => x.product);

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold transition-colors";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !success && onClose()}
            className="fixed inset-0 z-[90] bg-background/70 backdrop-blur-md"
          />
          <div className="fixed left-0 top-0 z-[91] flex h-[100dvh] w-screen items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
            >
              {success ? (
                <SuccessView
                  orderId={orderId}
                  total={total}
                  currency={currency}
                  giftWrap={giftWrap}
                  giftNote={giftNote}
                  onClose={() => {
                    onClose();
                    setCartOpen(false);
                  }}
                />
              ) : (
                <>
                  {/* header */}
                  <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-gold" />
                      <h2 className="text-base font-semibold">Secure Checkout</h2>
                    </div>
                    <button
                      onClick={onClose}
                      className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* step indicator */}
                  <div className="flex items-center gap-2 px-6 py-3">
                    {STEPS.map((label, idx) => (
                      <React.Fragment key={label}>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition-colors",
                              idx < step
                                ? "bg-emerald-500 text-white"
                                : idx === step
                                ? "gold-gradient text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {idx < step ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                          </div>
                          <span className={cn("text-xs", idx === step ? "font-semibold text-foreground" : "text-muted-foreground")}>
                            {label}
                          </span>
                        </div>
                        {idx < STEPS.length - 1 && (
                          <div className="h-px flex-1 bg-border">
                            <motion.div
                              className="h-full gold-gradient"
                              animate={{ width: idx < step ? "100%" : "0%" }}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="grid min-h-0 flex-1 gap-0 md:grid-cols-[1fr_260px]">
                    {/* form area */}
                    <div className="min-h-0 flex-1 overflow-y-auto thin-scrollbar px-6 py-4">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={step}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25 }}
                        >
                          {step === 0 && (
                            <div className="space-y-3">
                              <Field label="Full name">
                                <input
                                  className={inputCls}
                                  value={form.name}
                                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                                  placeholder="Olivia Bennett"
                                />
                              </Field>
                              <Field label="Email">
                                <input
                                  type="email"
                                  className={inputCls}
                                  value={form.email}
                                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                                  placeholder="olivia@example.com"
                                />
                              </Field>
                              <Field label="Street address">
                                <input
                                  className={inputCls}
                                  value={form.address}
                                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                                  placeholder="221B Baker Street"
                                />
                              </Field>
                              <div className="grid grid-cols-2 gap-3">
                                <Field label="City">
                                  <input
                                    className={inputCls}
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    placeholder="London"
                                  />
                                </Field>
                                <Field label="ZIP">
                                  <input
                                    className={inputCls}
                                    value={form.zip}
                                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                                    placeholder="NW1 6XE"
                                  />
                                </Field>
                              </div>
                              <Field label="Country">
                                <input
                                  className={inputCls}
                                  value={form.country}
                                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                                />
                              </Field>
                            </div>
                          )}

                          {step === 1 && (
                            <div className="space-y-3">
                              <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <ShieldCheck className="h-3.5 w-3.5 text-gold" /> Payment is simulated. No card is charged.
                                </span>
                              </div>
                              <Field label="Card number">
                                <input
                                  className={inputCls}
                                  value={form.card}
                                  onChange={(e) => setForm({ ...form, card: e.target.value.replace(/[^\d ]/g, "").slice(0, 19) })}
                                  placeholder="4242 4242 4242 4242"
                                />
                              </Field>
                              <div className="grid grid-cols-2 gap-3">
                                <Field label="Expiry">
                                  <input
                                    className={inputCls}
                                    value={form.expiry}
                                    onChange={(e) => setForm({ ...form, expiry: e.target.value.slice(0, 5) })}
                                    placeholder="04/27"
                                  />
                                </Field>
                                <Field label="CVC">
                                  <input
                                    className={inputCls}
                                    value={form.cvc}
                                    onChange={(e) => setForm({ ...form, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                                    placeholder="123"
                                  />
                                </Field>
                              </div>
                              <div className="flex items-center gap-2 pt-2">
                                {["Visa", "Mastercard", "Amex"].map((b) => (
                                  <span key={b} className="rounded border border-border bg-background px-2 py-1 text-[10px] font-medium">
                                    {b}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {step === 2 && (
                            <div className="space-y-3">
                              <div className="rounded-xl border border-border p-3">
                                <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                  Shipping to
                                </div>
                                <div className="mt-1 flex items-start gap-2 text-sm">
                                  <MapPin className="mt-0.5 h-4 w-4 text-gold" />
                                  <div>
                                    <div className="font-medium">{form.name || "Guest Customer"}</div>
                                    <div className="text-muted-foreground">
                                      {form.address || "—"}, {form.city} {form.zip}, {form.country}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="rounded-xl border border-border p-3">
                                <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                  Payment
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-sm">
                                  <CreditCard className="h-4 w-4 text-gold" />
                                  <span className="font-medium">
                                    {form.card ? `Card •• ${form.card.replace(/\s/g, "").slice(-4)}` : "Simulated card"}
                                  </span>
                                </div>
                              </div>

                              {/* Gift wrap add-on */}
                              <div className={cn(
                                "rounded-xl border p-3 transition-colors",
                                giftWrap ? "border-gold bg-gold/5" : "border-border"
                              )}>
                                <button
                                  type="button"
                                  onClick={() => setGiftWrap((v) => !v)}
                                  className="flex w-full items-center gap-3 text-left"
                                  aria-pressed={giftWrap}
                                >
                                  <span className={cn(
                                    "grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors",
                                    giftWrap ? "gold-gradient text-primary-foreground" : "bg-muted text-muted-foreground"
                                  )}>
                                    <Gift className="h-4 w-4" />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-sm font-semibold">Signature gift wrap</span>
                                      <span className="text-xs font-bold gold-text">+{formatPrice(GIFT_WRAP_FEE, currency)}</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                      Hand-tied silk ribbon, wax-sealed card, and a personalized note.
                                    </p>
                                  </div>
                                  <span className={cn(
                                    "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                                    giftWrap ? "bg-gold" : "bg-muted-foreground/30"
                                  )}>
                                    <motion.span
                                      layout
                                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                      className={cn(
                                        "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow",
                                        giftWrap ? "left-[18px]" : "left-0.5"
                                      )}
                                    />
                                  </span>
                                </button>
                                <AnimatePresence>
                                  {giftWrap && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.25 }}
                                      className="overflow-hidden"
                                    >
                                      <textarea
                                        value={giftNote}
                                        onChange={(e) => setGiftNote(e.target.value.slice(0, 180))}
                                        placeholder="Add a handwritten note (optional)…"
                                        rows={2}
                                        className="mt-3 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-gold"
                                      />
                                      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <Sparkles className="h-3 w-3 text-gold" />
                                          Sealed with a gold wax stamp
                                        </span>
                                        <span>{giftNote.length}/180</span>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              <div className="rounded-xl border border-border p-3">
                                <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-2">
                                  Order summary
                                </div>
                                <ul className="space-y-2">
                                  {lines.map(({ line, product }) => (
                                    <li key={`${line.productId}-${line.color}-${line.size}`} className="flex items-center gap-2 text-xs">
                                      <img src={product.images[0]} alt="" className="h-9 w-9 rounded object-cover" />
                                      <div className="flex-1">
                                        <div className="font-medium">{product.name}</div>
                                        <div className="text-muted-foreground">{line.color} · {line.size} · ×{line.qty}</div>
                                      </div>
                                      <div className="font-medium">{formatPrice(product.price * line.qty, currency)}</div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* order summary side */}
                    <div className="border-t border-border bg-muted/30 p-4 md:border-l md:border-t-0">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Total
                      </div>
                      <div className="mt-1 text-2xl font-bold gold-text">
                        {formatPrice(total, currency)}
                      </div>
                      <dl className="mt-3 space-y-1.5 text-xs">
                        <div className="flex justify-between text-muted-foreground">
                          <dt>Subtotal</dt>
                          <dd className="text-foreground">{formatPrice(subtotal, currency)}</dd>
                        </div>
                        {appliedCoupon.discount > 0 && (
                          <div className="flex justify-between text-gold-deep dark:text-gold">
                            <dt>Discount</dt>
                            <dd>−{formatPrice(appliedCoupon.discount, currency)}</dd>
                          </div>
                        )}
                        <div className="flex justify-between text-muted-foreground">
                          <dt>Shipping</dt>
                          <dd className={shipping === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}>
                            {shipping === 0 ? "Free" : formatPrice(shipping, currency)}
                          </dd>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <dt>Tax</dt>
                          <dd className="text-foreground">{formatPrice(tax, currency)}</dd>
                        </div>
                        {giftWrap && (
                          <div className="flex justify-between text-gold-deep dark:text-gold">
                            <dt className="flex items-center gap-1">
                              <Gift className="h-3 w-3" /> Gift wrap
                            </dt>
                            <dd>{formatPrice(GIFT_WRAP_FEE, currency)}</dd>
                          </div>
                        )}
                      </dl>

                      <div className="mt-4 flex gap-2">
                        {step > 0 && (
                          <button
                            onClick={back}
                            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-medium hover:bg-accent"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" /> Back
                          </button>
                        )}
                        {step < 2 ? (
                          <button
                            onClick={next}
                            className="inline-flex flex-1 items-center justify-center gap-1 rounded-full gold-gradient px-4 py-2 text-xs font-semibold text-primary-foreground"
                          >
                            Continue <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={submit}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full gold-gradient px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-gold/20"
                          >
                            <Lock className="h-3.5 w-3.5" /> Place order
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
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

function SuccessView({
  orderId,
  total,
  currency,
  giftWrap,
  giftNote,
  onClose,
}: {
  orderId: string;
  total: number;
  currency: import("@/lib/types").Currency;
  giftWrap: boolean;
  giftNote: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center overflow-y-auto thin-scrollbar px-6 py-10 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="grid h-20 w-20 place-items-center rounded-full gold-gradient text-primary-foreground shadow-xl shadow-gold/30"
      >
        <PartyPopper className="h-9 w-9" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-5 text-2xl font-bold tracking-tight"
      >
        Order confirmed!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mt-2 max-w-sm text-sm text-muted-foreground"
      >
        Thank you for your purchase. A confirmation has been sent to your email.
        Your order is now visible in the Admin → Orders panel.
      </motion.p>
      <div className="mt-5 grid w-full max-w-xs grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Order ID</div>
          <div className="mt-0.5 text-sm font-bold">{orderId}</div>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Total paid</div>
          <div className="mt-0.5 text-sm font-bold gold-text">
            {formatPrice(total, currency)}
          </div>
        </div>
      </div>

      {/* Gift wrap confirmation */}
      {giftWrap && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-3 w-full max-w-sm rounded-xl border border-gold/40 bg-gold/5 p-3 text-left"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-gold-deep dark:text-gold">
            <Gift className="h-4 w-4" />
            Signature gift wrap added
          </div>
          {giftNote.trim() && (
            <p className="mt-1.5 text-xs italic text-muted-foreground">
              &ldquo;{giftNote.trim()}&rdquo;
            </p>
          )}
          <p className="mt-1 text-[10px] text-muted-foreground">
            Hand-tied silk ribbon + wax-sealed card included.
          </p>
        </motion.div>
      )}

      {/* Trust badges with animated counters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mt-5 grid w-full max-w-sm grid-cols-3 gap-2"
      >
        <TrustBadge icon={ShieldCheck} value={10} suffix="yr" label="Guarantee" />
        <TrustBadge icon={Check} value={30} suffix="d" label="Returns" />
        <TrustBadge icon={Lock} value={256} suffix="bit" label="Secure" />
      </motion.div>

      <button
        onClick={onClose}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent"
      >
        Continue shopping
      </button>
    </div>
  );
}

/** Animated count-up badge for the success screen. */
function TrustBadge({
  icon: Icon,
  value,
  suffix,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  suffix: string;
  label: string;
}) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    const start = performance.now();
    const dur = 900;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div className="rounded-xl border border-border bg-card p-2.5 text-center">
      <Icon className="mx-auto h-4 w-4 text-gold" />
      <div className="mt-1 font-display text-base font-bold tabular-nums">
        {display}
        <span className="text-[10px] text-muted-foreground">{suffix}</span>
      </div>
      <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function fireConfetti() {
  const colors = ["#d4af37", "#e4c8a0", "#f4ecd8", "#b87333"];
  const burst = (particleRatio: number, opts: confetti.Options) =>
    confetti({
      origin: { y: 0.6 },
      colors,
      particleCount: Math.floor(200 * particleRatio),
      ...opts,
    });

  burst(0.25, { spread: 26, startVelocity: 55 });
  burst(0.2, { spread: 60 });
  burst(0.35, { spread: 100, decay: 0.91, scalar: 0.9 });
  burst(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  burst(0.1, { spread: 120, startVelocity: 45 });

  setTimeout(() => {
    confetti({
      particleCount: 80,
      startVelocity: 30,
      spread: 360,
      origin: { x: 0.5, y: 0.4 },
      colors,
    });
  }, 250);
}
