"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArchiveIcon, RouteIcon, SimIcon, HomeIcon, SampleIcon } from "./Icons";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { href: "/", label: "בית", Icon: HomeIcon },
  { href: "/route", label: "המסלול", Icon: RouteIcon },
  { href: "/simulations", label: "סימולציות", Icon: SimIcon },
  { href: "/run?mode=sample", label: "בוחן לדוגמה", Icon: SampleIcon },
  { href: "/past", label: "שנים קודמות", Icon: ArchiveIcon },
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
            <img src="/icons/icon-dark-192.png" alt="" width={40} height={40} className="h-10 w-10" />
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
          <div className="mr-auto md:mr-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="mt-8 bg-field text-field-ink pb-24 md:pb-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/icon-dark-192.png" alt="" width={44} height={44} className="h-11 w-11" />
                <span>
                  <span className="block text-lg font-extrabold">מסלול לבוחן</span>
                  <span className="block text-sm text-field-ink/60">תקשורת נתונים 214.2900</span>
                </span>
              </div>
              <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-field-ink/65">
                שאלות עם הסבר לכל תשובה, סימולציות עם שעון ועוזר שמכיר את חומר הקורס. עובד גם בלי אינטרנט.
              </p>
            </div>

            <nav aria-label="ניווט בתחתית">
              <h2 className="mb-3 text-xs font-bold tracking-wide text-gold">תרגול</h2>
              <ul className="space-y-2 text-sm">
                {NAV.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-field-ink/75 transition-colors hover:text-field-ink">
                      {label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/run?mode=mixed" className="text-field-ink/75 transition-colors hover:text-field-ink">
                    תרגול מעורב
                  </Link>
                </li>
              </ul>
            </nav>

            <div>
              <h2 className="mb-3 text-xs font-bold tracking-wide text-gold">הבוחן</h2>
              <dl className="space-y-2 text-sm text-field-ink/75">
                <div className="flex gap-2"><dt className="text-field-ink/50">מועד</dt><dd>יום שישי 27.11, 09:00</dd></div>
                <div className="flex gap-2"><dt className="text-field-ink/50">משך</dt><dd>90 דקות</dd></div>
                <div className="flex gap-2"><dt className="text-field-ink/50">חומר</dt><dd>סגור, דף עזר אחד</dd></div>
              </dl>
            </div>
          </div>

          <div className="flex flex-col-reverse items-start justify-between gap-4 border-t border-field-ink/10 py-6 sm:flex-row sm:items-center">
            <p className="text-xs text-field-ink/45">ההתקדמות נשמרת במכשיר שלך בלבד.</p>
            <a href="https://github.com/lzbedat3/Networking" target="_blank" rel="noreferrer" dir="ltr" className="group inline-flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/darb-tile-dark-96.png" alt="Darb" width={40} height={40} className="h-10 w-10" />
              <span className="leading-tight">
                <span className="block text-[0.65rem] font-medium tracking-[0.2em] text-field-ink/50 uppercase">Crafted by</span>
                <span className="block text-lg font-bold tracking-wide text-field-ink transition-colors group-hover:text-gold">Darb</span>
              </span>
            </a>
          </div>
        </div>
      </footer>

      {/* mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-safe backdrop-blur-md md:hidden" aria-label="ניווט ראשי">
        <div className="grid grid-cols-5">
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
