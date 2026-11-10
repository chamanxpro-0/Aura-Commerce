"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Product,
  Order,
  Coupon,
  StoreSettings,
  CartLine,
  View,
  AdminSection,
  OrderStatus,
  ActivityEntry,
  ActivityType,
  NewsletterSubscriber,
  Currency,
  Review,
} from "@/lib/types";
import {
  MOCK_PRODUCTS,
  MOCK_ORDERS,
  MOCK_COUPONS,
  DEFAULT_SETTINGS,
} from "@/data/mockData";

interface CouponState {
  code: string | null;
  discount: number; // computed absolute discount
  type: "percent" | "fixed" | null;
  label: string | null;
}

const emptyCoupon: CouponState = {
  code: null,
  discount: 0,
  type: null,
  label: null,
};

interface StoreState {
  // catalog + admin data (persisted)
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  settings: StoreSettings;

  // storefront UI state (persisted for delight)
  cart: CartLine[];
  wishlist: string[]; // product ids
  recentlyViewed: string[]; // product ids, most-recent first
  compareList: string[]; // product ids for compare (max 4)

  // ephemeral UI state (still persisted for convenience)
  view: View;
  productDetailId: string | null;
  journalArticleSlug: string | null;
  adminSection: AdminSection;
  cartOpen: boolean;
  searchOpen: boolean;
  wishlistOpen: boolean;

  // multi-currency switcher (persisted)
  currency: Currency;

  // engagement data (persisted)
  activity: ActivityEntry[];
  subscribers: NewsletterSubscriber[];
  announcementDismissed: string[]; // ids of dismissed announcements
  lastCartSeen: number | null; // epoch ms — drives abandon-cart reminder

  // derived helpers
  hydrated: boolean;

  // ---- actions ----
  setView: (v: View) => void;
  openProductDetail: (id: string) => void;
  closeProductDetail: () => void;
  openJournalArticle: (slug: string) => void;
  closeJournalArticle: () => void;
  setAdminSection: (s: AdminSection) => void;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setWishlistOpen: (open: boolean) => void;
  setCurrency: (c: Currency) => void;

  logActivity: (type: ActivityType, message: string, detail?: string) => void;
  clearActivity: () => void;
  subscribe: (email: string) => { ok: boolean; message: string };
  removeSubscriber: (email: string) => void;
  dismissAnnouncement: (id: string) => void;
  markCartSeen: () => void;

  addToCart: (line: CartLine) => void;
  updateQty: (productId: string, color: string | undefined, size: string | undefined, qty: number) => void;
  removeFromCart: (productId: string, color: string | undefined, size: string | undefined) => void;
  clearCart: () => void;

  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
  moveWishlistToCart: (productId: string) => void;

  // recently viewed + compare
  pushRecentlyViewed: (productId: string) => void;
  clearRecentlyViewed: () => void;
  toggleCompare: (productId: string) => void;
  clearCompare: () => void;

  // coupons
  appliedCoupon: CouponState;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;

  // product CRUD
  addProduct: (p: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addReview: (productId: string, review: { author: string; rating: number; title: string; body: string }) => void;

  // order mgmt
  setOrderStatus: (id: string, status: OrderStatus) => void;
  placeOrderFromCart: (customer: { name: string; email: string; address: string; payment: string }) => Order;
  reorder: (orderId: string) => void;

  // settings
  updateSettings: (patch: Partial<StoreSettings>) => void;
  addCoupon: (c: Coupon) => void;
  toggleCoupon: (code: string) => void;
  deleteCoupon: (code: string) => void;

  // dev
  resetAll: () => void;
}

const lineKey = (l: { productId: string; color?: string; size?: string }) =>
  `${l.productId}__${l.color ?? ""}__${l.size ?? ""}`;

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: MOCK_PRODUCTS,
      orders: MOCK_ORDERS,
      coupons: MOCK_COUPONS,
      settings: DEFAULT_SETTINGS,

      cart: [],
      wishlist: [],
      recentlyViewed: [],
      compareList: [],

      view: "home",
      productDetailId: null,
      journalArticleSlug: null,
      adminSection: "analytics",
      cartOpen: false,
      searchOpen: false,
      wishlistOpen: false,
      currency: "USD",

      activity: [],
      subscribers: [],
      announcementDismissed: [],
      lastCartSeen: null,

      hydrated: false,

      setView: (v) => set({ view: v }),
      openProductDetail: (id) => {
        set({ view: "product", productDetailId: id });
        get().pushRecentlyViewed(id);
      },
      closeProductDetail: () => set({ view: "shop", productDetailId: null }),
      openJournalArticle: (slug) => set({ view: "journalArticle", journalArticleSlug: slug }),
      closeJournalArticle: () => set({ view: "journal", journalArticleSlug: null }),
      setAdminSection: (s) => set({ adminSection: s }),
      setCartOpen: (open) => set({ cartOpen: open }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      setWishlistOpen: (open) => set({ wishlistOpen: open }),
      setCurrency: (c) => set({ currency: c }),

      logActivity: (type, message, detail) =>
        set((state) => ({
          activity: [
            {
              id: Math.random().toString(36).slice(2, 11),
              type,
              message,
              detail,
              ts: Date.now(),
            },
            ...state.activity,
          ].slice(0, 50),
        })),
      clearActivity: () => set({ activity: [] }),

      subscribe: (email) => {
        const e = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
          return { ok: false, message: "Please enter a valid email address." };
        }
        if (get().subscribers.some((s) => s.email === e)) {
          return { ok: false, message: "You're already on the list!" };
        }
        set((state) => ({
          subscribers: [{ email: e, ts: Date.now() }, ...state.subscribers],
        }));
        return { ok: true, message: "Welcome to the Inner Circle." };
      },

      removeSubscriber: (email) =>
        set((state) => ({
          subscribers: state.subscribers.filter((s) => s.email !== email),
        })),

      dismissAnnouncement: (id) =>
        set((state) =>
          state.announcementDismissed.includes(id)
            ? state
            : { announcementDismissed: [...state.announcementDismissed, id] }
        ),

      markCartSeen: () => set({ lastCartSeen: Date.now() }),

      addToCart: (line) => {
        const product = get().products.find((p) => p.id === line.productId);
        set((state) => {
          const key = lineKey(line);
          const existing = state.cart.find((l) => lineKey(l) === key);
          const max = product?.stock ?? 99;
          if (existing) {
            return {
              cart: state.cart.map((l) =>
                lineKey(l) === key
                  ? { ...l, qty: Math.min(max, l.qty + line.qty) }
                  : l
              ),
            };
          }
          return { cart: [...state.cart, { ...line, qty: Math.min(max, line.qty) }] };
        });
        if (product) {
          get().logActivity(
            "cart",
            `Added ${product.name} to bag`,
            `${line.qty} × ${line.color ?? ""} ${line.size ?? ""}`.trim()
          );
        }
      },

      updateQty: (productId, color, size, qty) =>
        set((state) => ({
          cart: state.cart
            .map((l) => {
              if (
                l.productId === productId &&
                (l.color ?? "") === (color ?? "") &&
                (l.size ?? "") === (size ?? "")
              ) {
                const product = state.products.find((p) => p.id === productId);
                const max = product?.stock ?? 99;
                return { ...l, qty: Math.max(0, Math.min(max, qty)) };
              }
              return l;
            })
            .filter((l) => l.qty > 0),
        })),

      removeFromCart: (productId, color, size) =>
        set((state) => ({
          cart: state.cart.filter(
            (l) =>
              !(
                l.productId === productId &&
                (l.color ?? "") === (color ?? "") &&
                (l.size ?? "") === (size ?? "")
              )
          ),
        })),

      clearCart: () => set({ cart: [], appliedCoupon: emptyCoupon }),

      toggleWishlist: (productId) => {
        const wasWishlisted = get().wishlist.includes(productId);
        const product = get().products.find((p) => p.id === productId);
        set((state) => ({
          wishlist: wasWishlisted
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        }));
        if (product) {
          get().logActivity(
            "wishlist",
            wasWishlisted ? `Removed ${product.name} from wishlist` : `Saved ${product.name} to wishlist`
          );
        }
      },

      isWishlisted: (productId) => get().wishlist.includes(productId),

      clearWishlist: () => {
        set({ wishlist: [] });
        get().logActivity("wishlist", "Cleared wishlist");
      },

      moveWishlistToCart: (productId) => {
        const product = get().products.find((p) => p.id === productId);
        if (!product) return;
        get().addToCart({
          productId,
          qty: 1,
          color: product.colors[0]?.name,
          size: product.sizes[0],
        });
      },

      pushRecentlyViewed: (productId) =>
        set((state) => ({
          recentlyViewed: [
            productId,
            ...state.recentlyViewed.filter((id) => id !== productId),
          ].slice(0, 8),
        })),
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),

      toggleCompare: (productId) => {
        const wasIn = get().compareList.includes(productId);
        const product = get().products.find((p) => p.id === productId);
        set((state) => {
          if (wasIn) {
            return { compareList: state.compareList.filter((id) => id !== productId) };
          }
          if (state.compareList.length >= 4) return {};
          return { compareList: [...state.compareList, productId] };
        });
        if (product && !wasIn) {
          get().logActivity("compare", `Added ${product.name} to compare`);
        }
      },
      clearCompare: () => {
        set({ compareList: [] });
        get().logActivity("compare", "Cleared compare list");
      },

      appliedCoupon: emptyCoupon,

      applyCoupon: (code) => {
        const upper = code.trim().toUpperCase();
        const coupon = get().coupons.find(
          (c) => c.code.toUpperCase() === upper && c.active
        );
        if (!coupon) {
          return { ok: false, message: "Invalid or expired coupon code." };
        }
        const subtotal = cartSubtotal(get().cart, get().products);
        const discount =
          coupon.type === "percent"
            ? (subtotal * coupon.value) / 100
            : Math.min(coupon.value, subtotal);
        set({
          appliedCoupon: {
            code: coupon.code,
            discount,
            type: coupon.type,
            label: `${coupon.code} — ${coupon.description}`,
          },
        });
        get().logActivity("coupon", `Applied coupon ${coupon.code}`, `−${discount.toFixed(2)}`);
        return { ok: true, message: `Coupon ${coupon.code} applied!` };
      },

      removeCoupon: () => set({ appliedCoupon: emptyCoupon }),

      addProduct: (p) => {
        set((s) => ({ products: [p, ...s.products] }));
        get().logActivity("product", `Created product "${p.name}"`, p.category);
      },
      updateProduct: (id, patch) => {
        const before = get().products.find((p) => p.id === id);
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }));
        if (before) {
          get().logActivity("product", `Updated "${before.name}"`, Object.keys(patch).join(", "));
        }
      },
      deleteProduct: (id) => {
        const before = get().products.find((p) => p.id === id);
        set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
        if (before) get().logActivity("product", `Deleted "${before.name}"`);
      },

      addReview: (productId, { author, rating, title, body }) => {
        set((s) => ({
          products: s.products.map((p) => {
            if (p.id !== productId) return p;
            const newReview: Review = {
              id: `rev-user-${Date.now()}`,
              author: author || "Anonymous",
              rating,
              title,
              body,
              date: new Date().toISOString().slice(0, 10),
              verified: false,
            };
            const reviews = [newReview, ...p.reviews];
            // recompute rating + count
            const sum = reviews.reduce((s, r) => s + r.rating, 0);
            const rating2 = Math.round((sum / reviews.length) * 10) / 10;
            return { ...p, reviews, rating: rating2, reviewCount: reviews.length };
          }),
        }));
        const product = get().products.find((p) => p.id === productId);
        if (product) get().logActivity("product", `New review on ${product.name}`, `${rating}★ · ${title}`);
      },

      setOrderStatus: (id, status) => {
        const order = get().orders.find((o) => o.id === id);
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        }));
        if (order) {
          get().logActivity("order", `Order ${id} → ${status}`, order.customer);
        }
      },

      placeOrderFromCart: ({ name, email, address, payment }) => {
        const state = get();
        const items = state.cart.map((l) => {
          const p = state.products.find((pr) => pr.id === l.productId)!;
          return {
            productId: l.productId,
            name: p.name,
            image: p.images[0],
            price: p.price,
            qty: l.qty,
            variant: { color: l.color, size: l.size },
          };
        });
        const subtotal = cartSubtotal(state.cart, state.products);
        const discount = state.appliedCoupon.discount;
        const total = Math.max(0, subtotal - discount);
        const order: Order = {
          id: `AUR-${10422 + state.orders.length}`,
          customer: name,
          email,
          date: new Date().toISOString().slice(0, 10),
          status: "Pending",
          items,
          total,
          currency: state.settings.currency,
          shippingAddress: address,
          paymentMethod: payment,
        };
        // decrement stock + bump sales
        const products = state.products.map((p) => {
          const line = state.cart.find((l) => l.productId === p.id);
          if (!line) return p;
          return {
            ...p,
            stock: Math.max(0, p.stock - line.qty),
            sales: p.sales + line.qty,
          };
        });
        set({
          orders: [order, ...state.orders],
          products,
          cart: [],
          appliedCoupon: emptyCoupon,
        });
        get().logActivity(
          "checkout",
          `Order ${order.id} placed`,
          `${order.currency}${order.total.toFixed(2)} · ${items.length} item(s)`
        );
        return order;
      },

      reorder: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return;
        // Add each line back to the cart, respecting current stock limits
        order.items.forEach((item) => {
          const product = get().products.find((p) => p.id === item.productId);
          if (!product || product.stock === 0) return;
          get().addToCart({
            productId: item.productId,
            qty: Math.min(item.qty, product.stock),
            color: item.variant?.color ?? product.colors[0]?.name,
            size: item.variant?.size ?? product.sizes[0],
          });
        });
        get().logActivity("order", `Reordered ${order.id}`, `${order.items.length} items`);
        get().setCartOpen(true);
      },

      updateSettings: (patch) => {
        set((s) => ({ settings: { ...s.settings, ...patch } }));
        get().logActivity("settings", `Updated store settings`, Object.keys(patch).join(", "));
      },

      addCoupon: (c) => {
        set((s) => ({ coupons: [c, ...s.coupons] }));
        get().logActivity("coupon", `Created coupon ${c.code}`);
      },
      toggleCoupon: (code) =>
        set((s) => ({
          coupons: s.coupons.map((c) =>
            c.code === code ? { ...c, active: !c.active } : c
          ),
        })),
      deleteCoupon: (code) => {
        set((s) => ({ coupons: s.coupons.filter((c) => c.code !== code) }));
        get().logActivity("coupon", `Deleted coupon ${code}`);
      },

      resetAll: () =>
        set({
          products: MOCK_PRODUCTS,
          orders: MOCK_ORDERS,
          coupons: MOCK_COUPONS,
          settings: DEFAULT_SETTINGS,
          cart: [],
          wishlist: [],
          recentlyViewed: [],
          compareList: [],
          activity: [],
          subscribers: [],
          announcementDismissed: [],
          lastCartSeen: null,
          appliedCoupon: emptyCoupon,
        }),
    }),
    {
      name: "aura-commerce-store-v2",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // SSR/hydration safety: never merge localStorage into the store during the
      // first client render — the server HTML and the hydrated tree must match.
      // page.tsx calls `useStore.persist.rehydrate()` once mounted.
      skipHydration: true,
      partialize: (s) => ({
        products: s.products,
        orders: s.orders,
        coupons: s.coupons,
        settings: s.settings,
        cart: s.cart,
        wishlist: s.wishlist,
        recentlyViewed: s.recentlyViewed,
        compareList: s.compareList,
        activity: s.activity,
        subscribers: s.subscribers,
        announcementDismissed: s.announcementDismissed,
        lastCartSeen: s.lastCartSeen,
        view: s.view,
        productDetailId: s.productDetailId,
        journalArticleSlug: s.journalArticleSlug,
        adminSection: s.adminSection,
        currency: s.currency,
      }),
      migrate: (persisted: unknown) => {
        const state = persisted as Record<string, unknown> | undefined;
        // v0 ("aura-commerce-store-v1") used the legacy single-page view name.
        if (state && typeof state === "object" && state.view === "storefront") {
          state.view = "home";
        }
        return state as unknown as StoreState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);

export function cartSubtotal(cart: CartLine[], products: Product[]): number {
  return cart.reduce((sum, line) => {
    const p = products.find((pr) => pr.id === line.productId);
    return sum + (p ? p.price * line.qty : 0);
  }, 0);
}

export function cartCount(cart: CartLine[]): number {
  return cart.reduce((sum, l) => sum + l.qty, 0);
}

// Selectors / derived pricing hook helpers
export function pricing(subtotal: number, discount: number, freeShipThreshold: number) {
  const shipping = subtotal === 0 || subtotal - discount >= freeShipThreshold ? 0 : 15;
  const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
  const total = Math.max(0, subtotal - discount + shipping + tax);
  return { shipping, tax, total };
}
