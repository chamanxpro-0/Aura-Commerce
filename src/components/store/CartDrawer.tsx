"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Tag,
  ArrowRight,
  Truck,
  Sparkles,
} from "lucide-react";
import { useStore, cartSubtotal, cartCount, pricing } from "@/lib/store";
import { cn, formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export function CartDrawer({ onCheckout }: { onCheckout: () => void }) {
  const open = useStore((s) => s.cartOpen);
  const setOpen = useStore((s) => s.setCartOpen);
  const cart = useStore((s) => s.cart);
  const products = useStore((s) => s.products);
  const updateQty = useStore((s) => s.updateQty);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const settings = useStore((s) => s.settings);
  const currency = useStore((s) => s.currency);
  const appliedCoupon = useStore((s) => s.appliedCoupon);
  const applyCoupon = useStore((s) => s.applyCoupon);
  const removeCoupon = useStore((s) => s.removeCoupon);

  const [code, setCode] = React.useState("");

  const subtotal = cartSubtotal(cart, products);
  const count = cartCount(cart);
  const { shipping, tax, total } = pricing(
    subtotal,
    appliedCoupon.discount,
    settings.freeShippingThreshold
  );

  const handleApply = () => {
    if (!code.trim()) return;
    const res = applyCoupon(code);
    if (res.ok) {
      toast.success(res.message);
      setCode("");
    } else {
      toast.error(res.message);
    }
  };

  const lines = cart.map((l) => ({ line: l, product: products.find((p) => p.id === l.productId)! })).filter((x) => x.product);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[80] bg-background/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="fixed right-0 top-0 z-[81] flex h-[100dvh] w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <h2 className="text-base font-semibold">Your Bag</h2>
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold">
                  {count}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent"
                aria-label="Close cart"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* free shipping progress */}
            <div className="border-b border-border px-5 py-3">
              {subtotal >= settings.freeShippingThreshold || subtotal === 0 ? (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <Truck className="h-4 w-4" /> You've unlocked free shipping!
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5" /> Add{" "}
                      <span className="font-semibold text-foreground">
                        {settings.currency}
                        {settings.freeShippingThreshold - subtotal}
                      </span>{" "}
                      for free shipping
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full gold-gradient"
                      animate={{ width: `${Math.min(100, (subtotal / settings.freeShippingThreshold) * 100)}%` }}
                      transition={{ type: "spring", stiffness: 200, damping: 24 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* items */}
            <div className="flex-1 overflow-y-auto thin-scrollbar px-5 py-4">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="grid h-20 w-20 place-items-center rounded-full bg-accent">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Your bag is empty</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Discover objects worth keeping.
                    </p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="mt-2 rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-accent"
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {lines.map(({ line, product }) => (
                      <motion.li
                        key={`${line.productId}-${line.color}-${line.size}`}
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
                        className="flex gap-3 rounded-2xl border border-border p-3"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-20 w-20 shrink-0 rounded-xl object-cover ring-1 ring-border"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold">{product.name}</div>
                              <div className="mt-0.5 flex flex-wrap gap-1 text-[10px] text-muted-foreground">
                                {line.color && <span className="rounded bg-accent px-1.5 py-0.5">{line.color}</span>}
                                {line.size && <span className="rounded bg-accent px-1.5 py-0.5">{line.size}</span>}
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromCart(line.productId, line.color, line.size)}
                              className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                              aria-label="Remove"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center rounded-full border border-border">
                              <button
                                onClick={() => updateQty(line.productId, line.color, line.size, line.qty - 1)}
                                className="grid h-7 w-7 place-items-center rounded-l-full hover:bg-accent"
                                aria-label="Decrease"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-semibold">{line.qty}</span>
                              <button
                                onClick={() => updateQty(line.productId, line.color, line.size, line.qty + 1)}
                                disabled={line.qty >= product.stock}
                                className="grid h-7 w-7 place-items-center rounded-r-full hover:bg-accent disabled:opacity-40"
                                aria-label="Increase"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="text-sm font-semibold">
                              {formatPrice(product.price * line.qty, currency)}
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* footer: coupon + summary */}
            {lines.length > 0 && (
              <div className="border-t border-border px-5 py-4">
                {/* coupon */}
                <div className="mb-3">
                  {appliedCoupon.code ? (
                    <div className="flex items-center justify-between rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs">
                      <span className="flex items-center gap-1.5 text-gold-deep dark:text-gold">
                        <Tag className="h-3.5 w-3.5" /> {appliedCoupon.code}
                      </span>
                      <button
                        onClick={() => {
                          removeCoupon();
                          toast("Coupon removed");
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <input
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleApply()}
                          placeholder="Coupon code (try DISCOUNT10)"
                          className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-3 text-xs outline-none focus:border-gold"
                        />
                      </div>
                      <button
                        onClick={handleApply}
                        className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-accent"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                <dl className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Subtotal</dt>
                    <dd className="text-foreground">
                      {formatPrice(subtotal, currency)}
                    </dd>
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
                    <dt>Tax (est.)</dt>
                    <dd className="text-foreground">{formatPrice(tax, currency)}</dd>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between border-t border-border pt-2">
                    <dt className="text-sm font-semibold">Total</dt>
                    <dd className="text-xl font-bold gold-text">
                      {formatPrice(total, currency)}
                    </dd>
                  </div>
                </dl>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onCheckout}
                  className="group mt-3 flex w-full items-center justify-center gap-2 rounded-full gold-gradient py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-gold/20"
                >
                  <Sparkles className="h-4 w-4" /> Checkout
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
                <p className="mt-2 text-center text-[10px] text-muted-foreground">
                  Secure checkout · Encrypted payment simulation
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
