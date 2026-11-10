"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Custom hand-drawn line-art marks — deliberately bespoke, not stock icons.
 * Each is a single-stroke figurative glyph drawn at 24×24.
 */

type IconProps = { className?: string; size?: number; strokeWidth?: number };

const base = (
  size: number,
  children: React.ReactNode,
  strokeWidth: number,
  className?: string
) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("shrink-0", className)}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

/** A hand — "made by hand" */
export function MarkHand({ className, size = 24, strokeWidth = 1.4 }: IconProps) {
  return base(
    size,
    <>
      <path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M11 11V5.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M14 11.5V7a1.5 1.5 0 0 1 3 0v6.5" />
      <path d="M8 13c-1.2 1-2 2.5-2 4a6 6 0 0 0 6 6h1a6 6 0 0 0 6-6v-3l-2-1" />
    </>,
    strokeWidth,
    className
  );
}

/** A cut gemstone — "honest materials" */
export function MarkGem({ className, size = 24, strokeWidth = 1.4 }: IconProps) {
  return base(
    size,
    <>
      <path d="M6 9 L12 3 L18 9 L12 21 Z" />
      <path d="M6 9 H18" />
      <path d="M9 9 L12 21" />
      <path d="M15 9 L12 21" />
      <path d="M12 3 L12 9" />
    </>,
    strokeWidth,
    className
  );
}

/** A feather — "quietly considered" */
export function MarkFeather({ className, size = 24, strokeWidth = 1.4 }: IconProps) {
  return base(
    size,
    <>
      <path d="M20 4c-9 0-14 6-14 12 0 2 1 4 3 4" />
      <path d="M20 4c0 7-5 12-11 12" />
      <path d="M9 20l-5-5" />
      <path d="M7 17l3 0" />
      <path d="M9 14l4 0" />
      <path d="M12 11l4 0" />
    </>,
    strokeWidth,
    className
  );
}

/** An infinity loop — "built to be kept" */
export function MarkInfinity({ className, size = 24, strokeWidth = 1.4 }: IconProps) {
  return base(
    size,
    <>
      <path d="M7 8c-2.8 0-4 2-4 4s1.2 4 4 4c4 0 5-8 10-8 2.8 0 4 2 4 4s-1.2 4-4 4c-5 0-6-8-10-8z" />
    </>,
    strokeWidth,
    className
  );
}

/** A flame — for the deal of the day */
export function MarkFlame({ className, size = 24, strokeWidth = 1.4 }: IconProps) {
  return base(
    size,
    <>
      <path d="M12 3c2 3 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3-1-3 1-6 1-8z" />
    </>,
    strokeWidth,
    className
  );
}

/** A clock face — for countdown */
export function MarkClock({ className, size = 24, strokeWidth = 1.4 }: IconProps) {
  return base(
    size,
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>,
    strokeWidth,
    className
  );
}

/** A compass — for explore/navigation */
export function MarkCompass({ className, size = 24, strokeWidth = 1.4 }: IconProps) {
  return base(
    size,
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 L13 13 L8.5 15.5 L11 11 Z" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </>,
    strokeWidth,
    className
  );
}

/** A seal / wax stamp — for guaranteed craftsmanship */
export function MarkSeal({ className, size = 24, strokeWidth = 1.4 }: IconProps) {
  return base(
    size,
    <>
      <circle cx="12" cy="10" r="6" />
      <path d="M9 10h6 M9 8h6 M9 12h4" />
      <path d="M9.5 15.5 L9 21 L12 19 L15 21 L14.5 15.5" />
    </>,
    strokeWidth,
    className
  );
}
