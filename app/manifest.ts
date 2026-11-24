import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "מסלול לבוחן · תקשורת נתונים",
    short_name: "מסלול לבוחן",
    description: "תרגול לבוחן בתקשורת נתונים: שאלות עם הסברים, סימולציות עם שעון ועוזר קורס.",
    lang: "he",
    dir: "rtl",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#f3f5f8",
    theme_color: "#0b2f23",
    categories: ["education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/logo.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    shortcuts: [
      { name: "המסלול", url: "/route", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "סימולציות", url: "/simulations", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "בוחן לדוגמה", url: "/run?mode=sample", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
