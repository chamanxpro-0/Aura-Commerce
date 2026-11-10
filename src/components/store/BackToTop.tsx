"use client";

import * as React from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [show, setShow] = React.useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileTap={{ scale: 0.9 }}
          whileHover={{ y: -2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group fixed bottom-5 right-5 z-40 grid h-11 w-11 place-items-center rounded-full border border-border bg-card/80 backdrop-blur shadow-lg transition-colors hover:bg-accent"
          aria-label="Back to top"
        >
          <span
            className="absolute inset-0 -z-10 rounded-full"
            style={{
              background: `conic-gradient(var(--gold) ${progress.get() * 360}deg, transparent 0deg)`,
              opacity: 0.25,
            }}
          />
          <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
