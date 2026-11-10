import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Currency } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* ------------------------------------------------------------------ */
/* Multi-currency helpers                                              */
/* ------------------------------------------------------------------ */

/** FX rates relative to 1 USD (the catalog base currency). */
export const CURRENCY_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 152,
  AED: 3.67,
};

/** Symbols + locale conventions for the currency switcher. */
export const CURRENCY_META: Record<
  Currency,
  { symbol: string; label: string; flag: string; locale: string; decimals: number }
> = {
  USD: { symbol: "$", label: "US Dollar", flag: "🇺🇸", locale: "en-US", decimals: 2 },
  EUR: { symbol: "€", label: "Euro", flag: "🇪🇺", locale: "de-DE", decimals: 2 },
  GBP: { symbol: "£", label: "British Pound", flag: "🇬🇧", locale: "en-GB", decimals: 2 },
  JPY: { symbol: "¥", label: "Japanese Yen", flag: "🇯🇵", locale: "ja-JP", decimals: 0 },
  AED: { symbol: "AED", label: "UAE Dirham", flag: "🇦🇪", locale: "ar-AE", decimals: 2 },
};

/**
 * Convert a USD list price to the active currency and format it.
 * `baseCurrency` (optional) lets callers override the symbol when the
 * source data already carries its own (kept for backward compat).
 */
export function formatPrice(
  usdPrice: number,
  currency: Currency,
  opts?: { compact?: boolean }
): string {
  const rate = CURRENCY_RATES[currency] ?? 1;
  const meta = CURRENCY_META[currency];
  const converted = usdPrice * rate;

  if (opts?.compact && converted >= 1000) {
    const k = converted / 1000;
    return `${meta.symbol}${k.toFixed(k >= 10 ? 0 : 1)}k`;
  }

  return new Intl.NumberFormat(meta.locale, {
    style: "currency",
    currency: currency === "GBP" ? "GBP" : currency === "EUR" ? "EUR" : currency === "JPY" ? "JPY" : currency === "AED" ? "AED" : "USD",
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  }).format(converted);
}

/** Symbol-only prefix (for tight inline price displays). */
export function currencySymbol(currency: Currency): string {
  return CURRENCY_META[currency].symbol;
}
