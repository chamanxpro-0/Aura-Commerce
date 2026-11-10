"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Package,
  AlertTriangle,
  CheckCircle2,
  Upload,
} from "lucide-react";
import type { Product, Category, ProductStatus } from "@/lib/types";
import { useStore } from "@/lib/store";
import { ALL_CATEGORIES } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { StarRating } from "@/components/shared/StarRating";
import { toast } from "sonner";

const blankProduct = (): Product => ({
  id: `aura-${Math.random().toString(36).slice(2, 7)}`,
  name: "",
  brand: "AURA Atelier",
  tagline: "",
  description: "",
  price: 0,
  currency: "$",
  category: "Electronics",
  tags: [],
  images: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
  ],
  colors: [{ name: "Default", hex: "#888888" }],
  sizes: ["One Size"],
  rating: 0,
  reviewCount: 0,
  stock: 10,
  sales: 0,
  featured: false,
  badge: undefined,
  reviews: [],
});

export function ProductManager() {
  const products = useStore((s) => s.products);
  const addProduct = useStore((s) => s.addProduct);
  const updateProduct = useStore((s) => s.updateProduct);
  const deleteProduct = useStore((s) => s.deleteProduct);

  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ProductStatus | "All">("All");
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [isNew, setIsNew] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  const filtered = React.useMemo(() => {
    let list = [...products];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") {
      list = list.filter((p) => statusOf(p) === statusFilter);
    }
    return list;
  }, [products, query, statusFilter]);

  const onSave = (p: Product) => {
    if (isNew) {
      addProduct(p);
      toast.success(`“${p.name}” added to the catalogue`);
    } else {
      updateProduct(p.id, p);
      toast.success(`“${p.name}” updated`);
    }
    setEditing(null);
    setIsNew(false);
  };

  const onDelete = (p: Product) => {
    deleteProduct(p.id);
    toast(`“${p.name}” deleted`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight font-display">Products</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} items · changes persist in your browser
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(blankProduct());
            setIsNew(true);
          }}
          className="inline-flex items-center gap-2 rounded-full gold-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-gold/20"
        >
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      {/* filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm outline-none focus:border-gold"
          />
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
          {(["All", "In Stock", "Low Stock", "Out of Stock"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === s
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : (
        <div className="overflow-x-auto thin-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Rating</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((p) => {
                  const status = statusOf(p);
                  return (
                    <motion.tr
                      key={p.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="border-b border-border last:border-0 transition-colors hover:bg-accent/40"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-border" />
                          <div className="min-w-0">
                            <div className="truncate font-medium">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{p.category}</td>
                      <td className="px-4 py-3 font-semibold">{p.currency}{p.price}</td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <StarRating value={p.rating} size={12} showValue />
                      </td>
                      <td className="px-4 py-3">{p.stock}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditing(p);
                              setIsNew(false);
                            }}
                            className="grid h-8 w-8 place-items-center rounded-full hover:bg-accent"
                            aria-label="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(p)}
                            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <Package className="h-8 w-8" />
              <p className="text-sm">No products match your search.</p>
            </div>
          )}
        </div>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <ProductFormModal
            product={editing}
            isNew={isNew}
            onClose={() => {
              setEditing(null);
              setIsNew(false);
            }}
            onSave={onSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function statusOf(p: Product): ProductStatus {
  if (p.stock === 0) return "Out of Stock";
  if (p.stock <= 5) return "Low Stock";
  return "In Stock";
}

function StatusBadge({ status }: { status: ProductStatus }) {
  const map: Record<ProductStatus, string> = {
    "In Stock": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    "Low Stock": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    "Out of Stock": "bg-muted text-muted-foreground",
  };
  const icon =
    status === "In Stock" ? (
      <CheckCircle2 className="h-3 w-3" />
    ) : status === "Low Stock" ? (
      <AlertTriangle className="h-3 w-3" />
    ) : (
      <Package className="h-3 w-3" />
    );
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", map[status])}>
      {icon}
      {status}
    </span>
  );
}

function ProductFormModal({
  product,
  isNew,
  onClose,
  onSave,
}: {
  product: Product;
  isNew: boolean;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [form, setForm] = React.useState<Product>(product);
  const [tagInput, setTagInput] = React.useState("");

  React.useEffect(() => setForm(product), [product]);

  // Close on Escape
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (patch: Partial<Product>) => setForm((f) => ({ ...f, ...patch }));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) set({ tags: [...form.tags, t] });
    setTagInput("");
  };

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold transition-colors";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-background/70 backdrop-blur-sm"
      />
      <div className="fixed inset-0 z-[71] flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gold" />
              <h2 className="text-base font-semibold">{isNew ? "Add product" : "Edit product"}</h2>
            </div>
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto thin-scrollbar px-6 py-5">
            <GalleryField form={form} set={set} inputCls={inputCls} />

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <input className={inputCls} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Aether Headphones" />
              </Field>
              <Field label="Brand">
                <input className={inputCls} value={form.brand} onChange={(e) => set({ brand: e.target.value })} />
              </Field>
            </div>

            <Field label="Tagline">
              <input className={inputCls} value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} />
            </Field>

            <Field label="Description">
              <textarea
                className={cn(inputCls, "min-h-20 resize-y")}
                value={form.description}
                onChange={(e) => set({ description: e.target.value })}
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Price">
                <input type="number" className={inputCls} value={form.price} onChange={(e) => set({ price: Number(e.target.value) })} />
              </Field>
              <Field label="Compare at">
                <input type="number" className={inputCls} value={form.compareAtPrice ?? ""} onChange={(e) => set({ compareAtPrice: e.target.value ? Number(e.target.value) : undefined })} />
              </Field>
              <Field label="Stock">
                <input type="number" className={inputCls} value={form.stock} onChange={(e) => set({ stock: Number(e.target.value) })} />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Category">
                <select className={inputCls} value={form.category} onChange={(e) => set({ category: e.target.value as Category })}>
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Badge">
                <select
                  className={inputCls}
                  value={form.badge ?? ""}
                  onChange={(e) => set({ badge: e.target.value || undefined })}
                >
                  <option value="">None</option>
                  <option value="Bestseller">Bestseller</option>
                  <option value="New">New</option>
                  <option value="Limited">Limited</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </Field>
            </div>

            <Field label="Tags">
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs">
                    {t}
                    <button
                      onClick={() => set({ tags: form.tags.filter((x) => x !== t) })}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="add tag"
                    className="w-20 rounded border border-border bg-background px-2 py-0.5 text-xs outline-none focus:border-gold"
                  />
                </div>
              </div>
            </Field>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.featured}
                onChange={(e) => set({ featured: e.target.checked })}
                className="h-4 w-4 accent-[var(--gold)]"
              />
              Feature on storefront
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
            <button onClick={onClose} className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-accent">
              Cancel
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onSave(form)}
              disabled={!form.name || form.price <= 0}
              className="rounded-full gold-gradient px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-gold/20 disabled:opacity-50"
            >
              {isNew ? "Create product" : "Save changes"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
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

function GalleryField({
  form,
  set,
  inputCls,
}: {
  form: Product;
  set: (patch: Partial<Product>) => void;
  inputCls: string;
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 6)
      .map((f) => URL.createObjectURL(f));
    if (urls.length === 0) return;
    set({ images: [...form.images, ...urls] });
    toast.success(`Added ${urls.length} image${urls.length === 1 ? "" : "s"} to gallery`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeImage = (idx: number) => {
    const next = form.images.filter((_, i) => i !== idx);
    if (next.length === 0) {
      toast.error("At least one image is required");
      return;
    }
    set({ images: next });
  };

  const makePrimary = (idx: number) => {
    if (idx === 0) return;
    const next = [...form.images];
    const [picked] = next.splice(idx, 1);
    next.unshift(picked);
    set({ images: next });
  };

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Image gallery
        </span>
        <span className="text-[10px] text-muted-foreground">{form.images.length} image(s)</span>
      </div>

      {/* primary preview + URL */}
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-border">
          <img src={form.images[0]} alt="" className="h-full w-full object-cover" />
          <span className="absolute left-1 top-1 rounded bg-gold px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-primary-foreground">
            Cover
          </span>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Cover image URL
          </label>
          <input
            className={inputCls}
            value={form.images[0]}
            onChange={(e) => set({ images: [e.target.value, ...form.images.slice(1)] })}
            placeholder="https://images.unsplash.com/…"
          />
        </div>
      </div>

      {/* drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={cn(
          "mt-3 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-5 text-center transition-colors",
          dragOver ? "border-gold bg-gold/10" : "border-border hover:border-foreground/30 hover:bg-accent/40"
        )}
      >
        <Upload className="h-5 w-5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Click to upload</span> or drag & drop
        </p>
        <p className="text-[10px] text-muted-foreground/70">PNG, JPG up to 6 images</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* thumbnail grid */}
      {form.images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {form.images.map((img, idx) => (
            <div
              key={idx}
              className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-border"
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
              {idx === 0 ? (
                <span className="absolute left-1 top-1 rounded bg-gold px-1 py-0.5 text-[8px] font-bold uppercase text-primary-foreground">
                  Cover
                </span>
              ) : (
                <button
                  onClick={() => makePrimary(idx)}
                  className="absolute left-1 top-1 hidden rounded bg-background/90 px-1 py-0.5 text-[8px] font-bold uppercase text-foreground backdrop-blur group-hover:block hover:text-gold"
                  title="Make cover"
                >
                  Set
                </button>
              )}
              <button
                onClick={() => removeImage(idx)}
                className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-background/90 text-muted-foreground backdrop-blur opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TableSkeleton({ rows = 6, cols = 7 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-border">
      <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="shimmer h-3 flex-1 rounded" style={{ maxWidth: `${100 / cols}%` }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-3 px-4 py-3.5">
          <div className="shimmer h-10 w-10 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <div className="shimmer h-3 w-1/2 rounded" />
            <div className="shimmer h-2.5 w-1/3 rounded" />
          </div>
          <div className="hidden flex-1 sm:block"><div className="shimmer h-3 w-16 rounded" /></div>
          <div className="shimmer h-3 w-12 rounded" />
          <div className="shimmer h-3 w-10 rounded" />
          <div className="shimmer h-5 w-20 rounded-full" />
          <div className="shimmer h-7 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}
