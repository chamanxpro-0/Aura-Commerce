import type {
  Product,
  Order,
  Coupon,
  Review,
  StoreSettings,
} from "@/lib/types";

// ---- Reviews (shared pool) ----
// Deterministic IDs (no Math.random) — module-level randomness breaks SSR hydration
// because the server and client each generate different values.
let reviewSeq = 0;
const r = (rev: Omit<Review, "id">): Review => {
  reviewSeq += 1;
  return {
    id: `rev-${String(reviewSeq).padStart(3, "0")}`,
    ...rev,
  };
};

const sharedReviews: Review[] = [
  r({
    author: "Eleanor V.",
    rating: 5,
    date: "2025-03-12",
    title: "Quietly exceptional",
    body: "The craftsmanship is unmistakable. Packaging felt like opening a piece of art. Worth every penny.",
    verified: true,
  }),
  r({
    author: "Marcus L.",
    rating: 4,
    date: "2025-02-28",
    title: "Great, minor nitpick",
    body: "Beautiful object, exactly as photographed. The only thing I'd change is the cable length — otherwise flawless.",
    verified: true,
  }),
  r({
    author: "Priya S.",
    rating: 5,
    date: "2025-02-04",
    title: "My new daily",
    body: "I've replaced three other items with this one. The finish is gorgeous and it's held up perfectly.",
    verified: false,
  }),
];

// ---- Products (10 luxury items w/ Unsplash imagery) ----
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "aura-01",
    name: "Aether Wireless Headphones",
    brand: "AURA Audio",
    tagline: "Studio-grade silence, sculpted in aluminum.",
    description:
      "Hand-finished anodized aluminum meets adaptive noise cancellation. 40mm beryllium drivers deliver a soundstage that breathes. 36-hour battery, USB-C fast charge, and a leather-trimmed headband that ages beautifully.",
    price: 489,
    compareAtPrice: 549,
    currency: "$",
    category: "Electronics",
    tags: ["Audio", "Premium", "New"],
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: [
      { name: "Graphite", hex: "#2b2b2e" },
      { name: "Champagne", hex: "#e4c8a0" },
      { name: "Sand", hex: "#d8c4a8" },
    ],
    sizes: ["One Size"],
    rating: 4.8,
    reviewCount: 312,
    stock: 18,
    sales: 1840,
    featured: true,
    badge: "Bestseller",
    reviews: sharedReviews,
  },
  {
    id: "aura-02",
    name: "Meridian Mechanical Watch",
    brand: "AURA Horology",
    tagline: "A 28,800 bph heartbeat on your wrist.",
    description:
      "Sapphire crystal over a sunburst guilloché dial. The Meridian's automatic movement is visible through an exhibition caseback. 50m water resistance and a brushed-steel bracelet that catches light like liquid.",
    price: 1290,
    compareAtPrice: 1450,
    currency: "$",
    category: "Accessories",
    tags: ["Timepiece", "Heritage", "Limited"],
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: [
      { name: "Steel", hex: "#9aa0a6" },
      { name: "Midnight", hex: "#1c1f2a" },
    ],
    sizes: ["40mm", "42mm"],
    rating: 4.9,
    reviewCount: 148,
    stock: 6,
    sales: 420,
    featured: true,
    badge: "Limited",
    reviews: sharedReviews,
  },
  {
    id: "aura-03",
    name: "Lumen Smart Lamp",
    brand: "AURA Living",
    tagline: "Circadian light, cast in brass.",
    description:
      "A solid-brass smart lamp that mirrors the sun. Tunable from candle-warm 1800K to focussed 5000K, with hand-blown opal glass. App + voice control, thread mesh networking, and a presence sensor that lights the way before you ask.",
    price: 320,
    currency: "$",
    category: "Home Tech",
    tags: ["Lighting", "Smart Home", "Design"],
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: [
      { name: "Brass", hex: "#c2a36b" },
      { name: "Matte Black", hex: "#1a1a1a" },
    ],
    sizes: ["Table", "Floor"],
    rating: 4.6,
    reviewCount: 87,
    stock: 24,
    sales: 612,
    featured: false,
    badge: "New",
    reviews: sharedReviews,
  },
  {
    id: "aura-04",
    name: "Atelier Cashmere Coat",
    brand: "AURA Atelier",
    tagline: "Grade-A Mongolian cashmere, tailored.",
    description:
      "A double-faced, unstructured overcoat cut from 100% Grade-A Mongolian cashmere. Falls at mid-thigh with a relaxed drop-shoulder silhouette. Hand-finished horn buttons and a satin-bound interior seam.",
    price: 890,
    compareAtPrice: 980,
    currency: "$",
    category: "Apparel",
    tags: ["Outerwear", "Cashmere", "Seasonal"],
    images: [
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: [
      { name: "Camel", hex: "#c19a6b" },
      { name: "Charcoal", hex: "#36454f" },
      { name: "Ivory", hex: "#f4ecd8" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    rating: 4.7,
    reviewCount: 203,
    stock: 3,
    sales: 540,
    featured: true,
    badge: "Low Stock",
    reviews: sharedReviews,
  },
  {
    id: "aura-05",
    name: "Vesper Camera",
    brand: "AURA Optics",
    tagline: "Full-frame, film-grade soul.",
    description:
      "A 33MP back-illuminated sensor wrapped in a magnesium body clad in vegetable-tanned leather. Discrete tactile dials, no menu-diving. Captures 4K/60 with AURA Color science straight from the sensor.",
    price: 2490,
    currency: "$",
    category: "Electronics",
    tags: ["Photography", "Pro", "New"],
    images: [
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: [
      { name: "Black", hex: "#111111" },
      { name: "Silver", hex: "#c0c0c0" },
    ],
    sizes: ["Body", "Kit"],
    rating: 4.9,
    reviewCount: 64,
    stock: 9,
    sales: 188,
    featured: false,
    badge: "New",
    reviews: sharedReviews,
  },
  {
    id: "aura-06",
    name: "Nocturne Leather Weekender",
    brand: "AURA Atelier",
    tagline: "Vegetable-tanned, built for decades.",
    description:
      "A 42L travel companion in full-grain vegetable-tanned leather that develops a patina with every journey. Solid brass hardware, canvas lining, and a shoe compartment that hides away discreetly.",
    price: 640,
    compareAtPrice: 720,
    currency: "$",
    category: "Accessories",
    tags: ["Travel", "Leather", "Heritage"],
    images: [
      "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: [
      { name: "Tan", hex: "#b87333" },
      { name: "Espresso", hex: "#3b2f23" },
    ],
    sizes: ["42L"],
    rating: 4.8,
    reviewCount: 119,
    stock: 12,
    sales: 360,
    featured: false,
    badge: "Bestseller",
    reviews: sharedReviews,
  },
  {
    id: "aura-07",
    name: "Solace Espresso Machine",
    brand: "AURA Living",
    tagline: "Café-grade pressure, countertop jewel.",
    description:
      "A rotary-pump espresso machine in mirror-polished stainless with a walnut steam wand handle. PID temperature stability, 58mm commercial group head, and pre-infusion that learns your beans.",
    price: 1450,
    currency: "$",
    category: "Home Tech",
    tags: ["Coffee", "Design", "Premium"],
    images: [
      "https://images.unsplash.com/photo-1610889556528-9a770e32642f?auto=format&fit=crop&w=1200&q=80",
      "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/774b90a44cae.jpg",
      "https://images.unsplash.com/photo-1524350876685-274059332603?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: [
      { name: "Polished", hex: "#c7c7cc" },
      { name: "Black", hex: "#1c1c1e" },
    ],
    sizes: ["Standard"],
    rating: 4.7,
    reviewCount: 76,
    stock: 5,
    sales: 240,
    featured: true,
    badge: "Low Stock",
    reviews: sharedReviews,
  },
  {
    id: "aura-08",
    name: "Drift Sunglasses",
    brand: "AURA Optics",
    tagline: "Hand-polished acetate, polarized.",
    description:
      "Italian Mazzucchelli acetate frames, hand-polished over three days. Polarized Zeiss lenses cut 99.9% of glare. A timeless teardrop silhouette that flatters every face.",
    price: 285,
    compareAtPrice: 320,
    currency: "$",
    category: "Accessories",
    tags: ["Eyewear", "Summer", "Polarized"],
    images: [
      "https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1200&q=80",
      "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/52f64f052404.jpg",
    ],
    colors: [
      { name: "Tortoise", hex: "#6b4423" },
      { name: "Crystal", hex: "#e8e8e8" },
      { name: "Onyx", hex: "#0d0d0d" },
    ],
    sizes: ["One Size"],
    rating: 4.5,
    reviewCount: 98,
    stock: 40,
    sales: 720,
    featured: false,
    badge: "New",
    reviews: sharedReviews,
  },
  {
    id: "aura-09",
    name: "Halo Desk Speaker",
    brand: "AURA Audio",
    tagline: "Room-filling sound, monolithic form.",
    description:
      "A single-piece aluminum billet houses a 6.5\" woofer and silk-dome tweeter. DSP room correction tunes itself to your space in under a minute. AptX Adaptive streaming over Wi-Fi.",
    price: 760,
    currency: "$",
    category: "Electronics",
    tags: ["Audio", "Design", "Smart"],
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1610465299996-30f240ac2b1c?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: [
      { name: "Graphite", hex: "#2b2b2e" },
      { name: "Champagne", hex: "#e4c8a0" },
    ],
    sizes: ["One Size"],
    rating: 4.6,
    reviewCount: 54,
    stock: 0,
    sales: 310,
    featured: false,
    badge: "Out of Stock",
    reviews: sharedReviews,
  },
  {
    id: "aura-10",
    name: "Linen Resort Shirt",
    brand: "AURA Atelier",
    tagline: "Belgian linen, lived-in elegance.",
    description:
      "Cut from 100% Belgian linen with a relaxed camp collar. Garment-dyed in small batches for soft, sun-faded color. Mother-of-pearl buttons and a single chest pocket.",
    price: 195,
    compareAtPrice: 230,
    currency: "$",
    category: "Apparel",
    tags: ["Shirts", "Linen", "Summer"],
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
    ],
    colors: [
      { name: "Sand", hex: "#d8c4a8" },
      { name: "Olive", hex: "#708238" },
      { name: "Sky", hex: "#a3c1ad" },
    ],
    sizes: ["S", "M", "L", "XL"],
    rating: 4.4,
    reviewCount: 142,
    stock: 33,
    sales: 980,
    featured: false,
    badge: "Bestseller",
    reviews: sharedReviews,
  },
];

// ---- Orders (7 mock customers) ----
export const MOCK_ORDERS: Order[] = [
  {
    id: "AUR-10421",
    customer: "Olivia Bennett",
    email: "olivia.b@example.com",
    avatar: "https://i.pravatar.cc/100?img=47",
    date: "2025-04-18",
    status: "Processing",
    items: [
      {
        productId: "aura-01",
        name: "Aether Wireless Headphones",
        image: MOCK_PRODUCTS[0].images[0],
        price: 489,
        qty: 1,
        variant: { color: "Graphite", size: "One Size" },
      },
      {
        productId: "aura-08",
        name: "Drift Sunglasses",
        image: MOCK_PRODUCTS[7].images[0],
        price: 285,
        qty: 1,
        variant: { color: "Tortoise", size: "One Size" },
      },
    ],
    total: 774,
    currency: "$",
    shippingAddress: "221B Baker St, London, UK",
    paymentMethod: "Visa •• 4291",
  },
  {
    id: "AUR-10420",
    customer: "Daniel Cho",
    email: "daniel.cho@example.com",
    avatar: "https://i.pravatar.cc/100?img=12",
    date: "2025-04-17",
    status: "Shipped",
    items: [
      {
        productId: "aura-02",
        name: "Meridian Mechanical Watch",
        image: MOCK_PRODUCTS[1].images[0],
        price: 1290,
        qty: 1,
        variant: { color: "Steel", size: "40mm" },
      },
    ],
    total: 1290,
    currency: "$",
    shippingAddress: "12 Harbor View, Singapore",
    paymentMethod: "Amex •• 1003",
  },
  {
    id: "AUR-10419",
    customer: "Amara Okafor",
    email: "amara.o@example.com",
    avatar: "https://i.pravatar.cc/100?img=32",
    date: "2025-04-16",
    status: "Delivered",
    items: [
      {
        productId: "aura-07",
        name: "Solace Espresso Machine",
        image: MOCK_PRODUCTS[6].images[0],
        price: 1450,
        qty: 1,
        variant: { color: "Polished", size: "Standard" },
      },
    ],
    total: 1450,
    currency: "$",
    shippingAddress: "9 Yaba Rd, Lagos, NG",
    paymentMethod: "Mastercard •• 7781",
  },
  {
    id: "AUR-10418",
    customer: "Sofia Rossi",
    email: "sofia.rossi@example.com",
    avatar: "https://i.pravatar.cc/100?img=5",
    date: "2025-04-15",
    status: "Pending",
    items: [
      {
        productId: "aura-04",
        name: "Atelier Cashmere Coat",
        image: MOCK_PRODUCTS[3].images[0],
        price: 890,
        qty: 1,
        variant: { color: "Camel", size: "M" },
      },
      {
        productId: "aura-10",
        name: "Linen Resort Shirt",
        image: MOCK_PRODUCTS[9].images[0],
        price: 195,
        qty: 2,
        variant: { color: "Sand", size: "M" },
      },
    ],
    total: 1280,
    currency: "$",
    shippingAddress: "Via Roma 44, Milano, IT",
    paymentMethod: "PayPal",
  },
  {
    id: "AUR-10417",
    customer: "Kenji Tanaka",
    email: "kenji.t@example.com",
    avatar: "https://i.pravatar.cc/100?img=15",
    date: "2025-04-14",
    status: "Delivered",
    items: [
      {
        productId: "aura-05",
        name: "Vesper Camera",
        image: MOCK_PRODUCTS[4].images[0],
        price: 2490,
        qty: 1,
        variant: { color: "Black", size: "Kit" },
      },
    ],
    total: 2490,
    currency: "$",
    shippingAddress: "3-2 Shibuya, Tokyo, JP",
    paymentMethod: "Visa •• 8810",
  },
  {
    id: "AUR-10416",
    customer: "Maya Lindqvist",
    email: "maya.l@example.com",
    avatar: "https://i.pravatar.cc/100?img=20",
    date: "2025-04-13",
    status: "Cancelled",
    items: [
      {
        productId: "aura-06",
        name: "Nocturne Leather Weekender",
        image: MOCK_PRODUCTS[5].images[0],
        price: 640,
        qty: 1,
        variant: { color: "Espresso", size: "42L" },
      },
    ],
    total: 640,
    currency: "$",
    shippingAddress: "Storgatan 5, Stockholm, SE",
    paymentMethod: "Klarna",
  },
  {
    id: "AUR-10415",
    customer: "Lucas Moreau",
    email: "lucas.m@example.com",
    avatar: "https://i.pravatar.cc/100?img=33",
    date: "2025-04-12",
    status: "Shipped",
    items: [
      {
        productId: "aura-03",
        name: "Lumen Smart Lamp",
        image: MOCK_PRODUCTS[2].images[0],
        price: 320,
        qty: 2,
        variant: { color: "Brass", size: "Table" },
      },
    ],
    total: 640,
    currency: "$",
    shippingAddress: "14 Rue de Rivoli, Paris, FR",
    paymentMethod: "Mastercard •• 5520",
  },
];

// ---- Coupons ----
export const MOCK_COUPONS: Coupon[] = [
  {
    code: "DISCOUNT10",
    type: "percent",
    value: 10,
    description: "10% off your entire order",
    active: true,
  },
  {
    code: "WELCOME25",
    type: "percent",
    value: 25,
    description: "Welcome — 25% off (first order)",
    active: true,
  },
  {
    code: "FREESHIP",
    type: "fixed",
    value: 15,
    description: "$15 flat shipping discount",
    active: true,
  },
  {
    code: "AURA50",
    type: "fixed",
    value: 50,
    description: "$50 off orders over $500",
    active: false,
  },
];

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "AURA Commerce",
  currency: "$",
  accent: "gold",
  freeShippingThreshold: 250,
};

// 30-day revenue trend for the analytics sparklines + chart
// Deterministic pseudo-random noise (seeded by index) — keeps SSR and client HTML identical.
export const REVENUE_TREND: { day: string; revenue: number; orders: number }[] =
  Array.from({ length: 30 }).map((_, i) => {
    const base = 4200 + Math.round(Math.sin(i / 3) * 900 + i * 60);
    const h = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1; // stable hash → [0,1)
    const noise = Math.round((h - 0.5) * 480);
    const revenue = Math.max(1800, base + noise);
    const orders = Math.round(revenue / (220 + (i % 5) * 12));
    const d = new Date(2025, 2, 1 + i);
    return {
      day: `${d.getMonth() + 1}/${d.getDate()}`,
      revenue,
      orders,
    };
  });

// Category split for the analytics donut
export const CATEGORY_SPLIT: { name: string; value: number; color: string }[] = [
  { name: "Electronics", value: 38, color: "var(--chart-1)" },
  { name: "Apparel", value: 24, color: "var(--chart-2)" },
  { name: "Accessories", value: 22, color: "var(--chart-3)" },
  { name: "Home Tech", value: 16, color: "var(--chart-4)" },
];

export const ALL_CATEGORIES: Product["category"][] = [
  "Electronics",
  "Apparel",
  "Accessories",
  "Home Tech",
];

export const ALL_TAGS: string[] = Array.from(
  new Set(MOCK_PRODUCTS.flatMap((p) => p.tags))
).sort();
