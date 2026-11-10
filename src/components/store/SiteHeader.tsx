"use client";

import * as React from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { Navbar } from "./Navbar";

/**
 * Fixed-header-stack replacement:
 * the announcement bar lives in normal flow (it scrolls away like on LV/Gucci
 * storefronts) and only the navbar is sticky — so the two can never overlap
 * and page content always starts right below them.
 */
export function SiteHeader() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
    </>
  );
}
