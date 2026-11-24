import type { Metadata, Viewport } from "next";
import { Cairo, Heebo, Ubuntu, Ubuntu_Mono } from "next/font/google";
import { Suspense } from "react";
import AssistantBubble from "@/components/Assistant";
import Pwa from "@/components/Pwa";
import "./globals.css";

/*
 * Per-script fonts. Each face is loaded only for its own script (unicode-range) and without
 * a synthetic fallback, so in a mixed line every glyph resolves to its own face:
 * Latin → Ubuntu, Hebrew → Heebo, Arabic → Cairo. Nothing drops to the browser default.
 */
const ubuntu = Ubuntu({ variable: "--font-ubuntu", subsets: ["latin", "latin-ext"], weight: ["400", "500", "700"], adjustFontFallback: false, fallback: [] });
const heebo = Heebo({ variable: "--font-heebo", subsets: ["hebrew"], adjustFontFallback: false, fallback: [] });
const cairo = Cairo({ variable: "--font-cairo", subsets: ["arabic"], adjustFontFallback: false, fallback: [] });
const mono = Ubuntu_Mono({ variable: "--font-ubuntu-mono", subsets: ["latin"], weight: ["400", "700"], adjustFontFallback: false, fallback: [] });

export const metadata: Metadata = {
  title: "מסלול לבוחן · תקשורת נתונים",
  description: "תרגול לבוחן בתקשורת נתונים: שאלות עם הסברים, סימולציות עם שעון ועוזר קורס.",
  applicationName: "מסלול לבוחן",
  appleWebApp: { capable: true, title: "מסלול לבוחן", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  openGraph: { title: "מסלול לבוחן · תקשורת נתונים", description: "שאלות עם הסברים, סימולציות עם שעון ועוזר קורס.", images: ["/icons/icon-512.png"], locale: "he_IL", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111b2a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${ubuntu.variable} ${heebo.variable} ${cairo.variable} ${mono.variable} antialiased`}>
        {children}
        <Suspense>
          <AssistantBubble />
        </Suspense>
        <Pwa />
      </body>
    </html>
  );
}
