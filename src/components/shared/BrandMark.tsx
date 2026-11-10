"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Custom AURA monogram — a hand-crafted SVG mark, not a generic icon.
 * A circular seal with an interlocking "A" formed by a compass needle,
 * suggesting precision + atelier craft.
 */
export function BrandMark({
  className,
  size = 36,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* outer ring */}
      <circle
        cx="24"
        cy="24"
        r="22.5"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.35"
      />
      {/* inner seal ring */}
      <circle
        cx="24"
        cy="24"
        r="18"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.2"
      />
      {/* The "A" — two strokes forming a peak + needle */}
      <path
        d="M24 12 L33 36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M24 12 L15 36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* crossbar of the A */}
      <path
        d="M19 27 L29 27"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* compass dot at apex */}
      <circle cx="24" cy="12" r="1.6" fill="currentColor" />
      {/* base tick marks (atelier feel) */}
      <path
        d="M14 38 L34 38"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

/**
 * A refined wordmark — Fraunces display serif, custom kerned.
 */
export function BrandWordmark({
  name = "AURA",
  className,
}: {
  name?: string;
  className?: string;
}) {
  return (
    <span
      className={cn("font-display tracking-display font-semibold", className)}
      style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1, "opsz" 144' }}
    >
      {name}
    </span>
  );
}
