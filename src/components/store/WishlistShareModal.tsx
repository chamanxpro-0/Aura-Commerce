"use client";

/**
 * WishlistShareModal — generates a shareable URL for the current wishlist
 * with copy-to-clipboard + social share buttons (X, Facebook, Pinterest,
 * email). The "share code" is a deterministic, URL-safe token derived
 * from the wishlist product IDs (no server needed).
 */
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Twitter, Facebook, Mail, Link2, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

function encodeWishlist(ids: string[]): string {
  // Deterministic: sort to keep the same set produce the same code,
  // then base64-url-encode a comma-joined string.
  const sorted = [...ids].sort();
  const joined = sorted.join(",");
  // btoa on ASCII is safe; fall back to encodeURIComponent for safety
  try {
    return btoa(joined).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch {
    return encodeURIComponent(joined);
  }
}

export function WishlistShareModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const wishlist = useStore((s) => s.wishlist);
  const products = useStore((s) => s.products);
  const [copied, setCopied] = React.useState(false);

  const shareUrl = React.useMemo(() => {
    if (typeof window === "undefined") return "https://aura.shop";
    const code = encodeWishlist(wishlist);
    return `${window.location.origin}/#/wishlist/${code}`;
  }, [wishlist]);

  const items = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 4);

  React.useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2400);
    } catch {
      toast.error("Couldn't copy — long-press the link to copy manually.");
    }
  };

  const shareText = `My AURA wishlist — ${wishlist.length} hand-picked pieces worth keeping.`;

  const socials = [
    {
      label: "X",
      icon: Twitter,
      color: "hover:bg-foreground hover:text-background",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "Facebook",
      icon: Facebook,
      color: "hover:bg-[#1877F2] hover:text-white",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "Pinterest",
      icon: Sparkles,
      color: "hover:bg-[#E60023] hover:text-white",
      href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareText)}`,
    },
    {
      label: "Email",
      icon: Mail,
      color: "hover:bg-gold hover:text-primary-foreground",
      href: `mailto:?subject=${encodeURIComponent("My AURA wishlist")}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed left-0 top-0 z-[90] flex h-[100dvh] w-screen items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Share your wishlist"
        >
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full gold-gradient text-primary-foreground">
                  <Link2 className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold tracking-tight">Share your wishlist</h2>
                  <p className="text-[11px] text-muted-foreground">
                    {wishlist.length} hand-picked piece{wishlist.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close share dialog"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* preview */}
            {items.length > 0 && (
              <div className="border-b border-border px-6 py-4">
                <div className="eyebrow text-muted-foreground">Preview</div>
                <div className="mt-2 flex gap-2">
                  {items.map((p) => (
                    <img
                      key={p!.id}
                      src={p!.images[0]}
                      alt={p!.name}
                      className="h-16 w-16 rounded-xl object-cover ring-1 ring-border"
                    />
                  ))}
                  {wishlist.length > 4 && (
                    <div className="grid h-16 w-16 place-items-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                      +{wishlist.length - 4}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* link + copy */}
            <div className="px-6 py-4">
              <label className="eyebrow text-muted-foreground">Shareable link</label>
              <div className="mt-2 flex items-stretch gap-2">
                <div className="relative flex-1">
                  <input
                    readOnly
                    value={shareUrl}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="w-full truncate rounded-full border border-border bg-background px-4 py-2.5 pr-10 text-xs text-muted-foreground outline-none focus:border-gold"
                  />
                  <Link2 className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
                <button
                  onClick={copy}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full gold-gradient px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* social row */}
            <div className="px-6 pb-5">
              <div className="eyebrow mb-2 text-muted-foreground">Or share via</div>
              <div className="grid grid-cols-4 gap-2">
                {socials.map(({ label, icon: Icon, color, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex flex-col items-center gap-1.5 rounded-2xl border border-border px-2 py-3 text-[10px] font-medium transition-colors ${color}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </a>
                ))}
              </div>
              <p className="mt-4 text-center text-[10px] text-muted-foreground">
                Anyone with the link can view (not edit) your saved pieces.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
