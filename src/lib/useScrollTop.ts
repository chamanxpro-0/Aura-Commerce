"use client";

import * as React from "react";

/**
 * Deterministically pins the page to the top once a view mounts.
 * Sets `history.scrollRestoration = "manual"` and re-asserts `scrollTo(0,0)`
 * across every frame where Chromium might perform scroll restoration —
 * including the `load` event, which fires after async resources settle and
 * is the last moment a stale scroll position can be re-applied.
 */
export function useScrollTop() {
  React.useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const top = () => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

    top();
    const raf = requestAnimationFrame(top);
    const t1 = setTimeout(top, 150);
    const t2 = setTimeout(top, 450);
    const t3 = setTimeout(top, 900);

    // Chromium performs scroll restoration as the document finishes loading.
    const onLoad = () => {
      top();
      // some engines restore a tick *after* load — beat that too
      requestAnimationFrame(top);
      setTimeout(top, 80);
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("load", onLoad);
    };
  }, []);
}
