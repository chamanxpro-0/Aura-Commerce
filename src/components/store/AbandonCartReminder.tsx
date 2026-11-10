"use client";

import * as React from "react";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { useStore, cartCount } from "@/lib/store";

/**
 * Shows a "still thinking?" toast once per session when the user revisits the
 * storefront with a non-empty cart they haven't looked at in a while.
 */
export function AbandonCartReminder() {
  const cart = useStore((s) => s.cart);
  const lastCartSeen = useStore((s) => s.lastCartSeen);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const markCartSeen = useStore((s) => s.markCartSeen);
  const shownRef = React.useRef(false);

  React.useEffect(() => {
    if (shownRef.current) return;
    if (cart.length === 0) return;
    // only remind if cart has been idle for > 30s (or never seen)
    const idle = lastCartSeen ? Date.now() - lastCartSeen > 30_000 : true;
    if (!idle) return;

    const t = setTimeout(() => {
      shownRef.current = true;
      const count = cartCount(cart);
      toast(`Your bag is waiting (${count})`, {
        description: "Pick up where you left off — your pieces are saved.",
        icon: <ShoppingBag className="h-4 w-4" />,
        duration: 8000,
        action: {
          label: "View bag",
          onClick: () => {
            setCartOpen(true);
            markCartSeen();
          },
        },
        cancel: {
          label: "Not now",
          onClick: () => markCartSeen(),
        },
        onDismiss: () => markCartSeen(),
      });
    }, 2500);

    return () => clearTimeout(t);
  }, [cart, lastCartSeen, setCartOpen, markCartSeen]);

  return null;
}
