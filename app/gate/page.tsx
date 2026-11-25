import type { Metadata } from "next";
import { safeNext } from "@/lib/gate";

export const metadata: Metadata = { title: "כניסה · מסלול לבוחן" };

const ERRORS: Record<string, string> = {
  wrong: "הקוד שגוי. נסו שוב.",
  wait: "יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.",
};

/** Passcode screen. Plain HTML form, so it works before any app script is allowed to load. */
export default async function Gate({ searchParams }: { searchParams: Promise<{ next?: string; e?: string }> }) {
  const { next, e } = await searchParams;
  const error = e ? ERRORS[e] : undefined;
  return (
    <main className="flex min-h-dvh items-center justify-center bg-field px-4 text-field-ink">
      <form method="post" action="/api/gate" className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-dark-192.png" alt="" width={72} height={72} className="h-18 w-18 rounded-2xl" />
        <h1 className="mt-6 text-3xl font-extrabold">מסלול לבוחן</h1>
        <p className="mt-1 text-field-ink/70">תקשורת נתונים 214.2900. הכניסה עם קוד.</p>

        <input type="hidden" name="next" value={safeNext(next)} />
        <label htmlFor="passcode" className="mt-8 block text-sm font-semibold text-field-ink/80">
          קוד כניסה
        </label>
        <input
          id="passcode"
          name="passcode"
          type="password"
          inputMode="text"
          autoComplete="current-password"
          autoFocus
          required
          aria-invalid={!!error}
          aria-describedby={error ? "gate-error" : undefined}
          className="mt-2 h-13 w-full rounded-xl border border-white/20 bg-white/5 px-4 text-lg tracking-widest text-field-ink outline-none placeholder:text-field-ink/40 focus:border-gold focus:ring-2 focus:ring-gold/30"
        />
        {error && (
          <p id="gate-error" role="alert" className="mt-2 text-sm font-semibold text-[#ff9b8f]">
            {error}
          </p>
        )}
        <button type="submit" className="mt-5 h-13 w-full rounded-xl bg-gold text-lg font-bold text-ink transition-opacity hover:opacity-90">
          כניסה
        </button>
        <p dir="ltr" className="mt-10 text-center text-xs text-field-ink/50">
          Crafted by <b className="font-bold text-field-ink/70">Darb</b>
        </p>
      </form>
    </main>
  );
}
