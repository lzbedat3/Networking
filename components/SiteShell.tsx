"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RouteIcon, SimIcon, HomeIcon, SampleIcon } from "./Icons";

const NAV = [
  { href: "/", label: "בית", Icon: HomeIcon },
  { href: "/route", label: "המסלול", Icon: RouteIcon },
  { href: "/simulations", label: "סימולציות", Icon: SimIcon },
  { href: "/run?mode=sample", label: "בוחן לדוגמה", Icon: SampleIcon },
];

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href.split("?")[0]) && !href.startsWith("/run"));

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/logo.svg" alt="" className="h-10 w-10" />
            <span className="leading-tight">
              <span className="block font-extrabold">מסלול לבוחן</span>
              <span className="block text-xs text-muted">תקשורת נתונים 214.2900</span>
            </span>
          </Link>
          <nav className="mr-auto hidden items-center gap-1 md:flex" aria-label="ניווט ראשי">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3.5 py-2 text-[0.95rem] font-semibold transition-colors ${
                  active(href) ? "bg-route-soft text-route" : "text-ink-2 hover:bg-sunken hover:text-ink"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-line bg-surface pb-24 md:pb-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-6 text-sm text-muted sm:px-6">
          <span dir="ltr" className="inline-flex items-center gap-2 font-medium text-ink-2">
            <span className="h-1.5 w-1.5 rotate-45 bg-gold" aria-hidden />
            Crafted by <b className="font-bold text-ink">Darb</b>
          </span>
          <span>תקשורת נתונים 214.2900</span>
        </div>
      </footer>

      {/* mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-safe backdrop-blur-md md:hidden" aria-label="ניווט ראשי">
        <div className="grid grid-cols-4">
          {NAV.map(({ href, label, Icon }) => {
            const on = active(href);
            return (
              <Link key={href} href={href} className={`flex flex-col items-center gap-1 pt-2.5 pb-1 text-[0.7rem] font-semibold ${on ? "text-route" : "text-muted"}`}>
                <Icon className="h-6 w-6" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
