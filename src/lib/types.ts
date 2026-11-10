// AURA Commerce — core domain types

export type Category =
  | "Electronics"
  | "Apparel"
  | "Accessories"
  | "Home Tech";

export type ProductStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number; // 1..5
  date: string;
  title: string;
  body: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice?: number; // original price for showing discounts
  currency: string;
  category: Category;
  tags: string[];
  images: string[]; // gallery; [0] is primary
  colors: { name: string; hex: string }[];
  sizes: string[];
  rating: number; // 0..5
  reviewCount: number;
  stock: number;
  sales: number; // units sold — drives "popularity"
  featured?: boolean;
  badge?: string; // e.g. "Bestseller", "New"
  reviews: Review[];
}

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  variant?: { color?: string; size?: string };
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  avatar?: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  currency: string;
  shippingAddress: string;
  paymentMethod: string;
}

export interface CartLine {
  productId: string;
  qty: number;
  color?: string;
  size?: string;
}

export interface Coupon {
  code: string;
  type: "percent" | "fixed";
  value: number;
  description: string;
  active: boolean;
}

export interface StoreSettings {
  storeName: string;
  currency: string; // symbol
  accent: "gold" | "emerald" | "rose" | "terracotta";
  freeShippingThreshold: number;
}

// Hash-routed pages of the multi-page storefront.
// `#/` → home · `#/shop` → shop · `#/story` → story · `#/journal` → journal
// `#/product/<id>` → product · `#/journal/<slug>` → journal article · `#/admin` → admin
// `#/orders` → customer order history
export type View = "home" | "shop" | "story" | "journal" | "product" | "journalArticle" | "admin" | "orders";

export type AdminSection =
  | "analytics"
  | "products"
  | "orders"
  | "settings"
  | "activity";

export type ActivityType =
  | "cart"
  | "wishlist"
  | "compare"
  | "product"
  | "order"
  | "coupon"
  | "settings"
  | "checkout"
  | "newsletter";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  message: string;
  detail?: string;
  ts: number; // epoch ms
  icon?: string; // lucide icon name hint
}

export interface NewsletterSubscriber {
  email: string;
  ts: number;
}

/** Currencies supported by the multi-currency switcher. */
export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "AED";

export type LayoutMode = "grid-3" | "grid-4" | "list";

export type SortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "popularity"
  | "rating";
