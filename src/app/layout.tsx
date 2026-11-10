import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AURA Commerce — Luxury Marketplace Template",
  description:
    "AURA Commerce: a commercial-grade, animation-rich e-commerce template with a seamless storefront-to-admin workflow. Built with Next.js, Framer Motion & Tailwind.",
  keywords: [
    "AURA Commerce",
    "ecommerce template",
    "Next.js commerce",
    "Framer Motion",
    "shadcn/ui",
    "luxury marketplace",
  ],
  authors: [{ name: "AURA Commerce" }],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "AURA Commerce — Luxury Marketplace Template",
    description: "Fluid micro-interactions, glassmorphism, and a seamless storefront-to-admin workflow.",
    siteName: "AURA Commerce",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AURA Commerce",
    description: "Luxury marketplace template with seamless storefront-to-admin workflow.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${fraunces.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          {/* toasts float below the sticky navbar so they never cover the nav */}
          <SonnerToaster position="top-center" offset="96px" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
