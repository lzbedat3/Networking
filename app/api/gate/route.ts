import { NextResponse } from "next/server";
import { GATE_COOKIE, gateToken, safeNext } from "@/lib/gate";

export const runtime = "nodejs";

// slows down guessing: at most 10 wrong attempts per IP per 10 minutes (per instance)
const fails = new Map<string, number[]>();
const WINDOW = 10 * 60 * 1000;

export async function POST(req: Request) {
  const form = await req.formData();
  const next = safeNext(String(form.get("next") ?? ""));
  const code = process.env.APP_PASSCODE;
  const back = (q: string) => NextResponse.redirect(new URL(`/gate?${q}${next !== "/" ? `&next=${encodeURIComponent(next)}` : ""}`, req.url), 303);
  if (!code) return NextResponse.redirect(new URL(next, req.url), 303);

  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const now = Date.now();
  const recent = (fails.get(ip) ?? []).filter((t) => now - t < WINDOW);
  if (recent.length >= 10) return back("e=wait");

  if (String(form.get("passcode") ?? "").trim() !== code) {
    fails.set(ip, [...recent, now]);
    return back("e=wrong");
  }
  fails.delete(ip);
  const res = NextResponse.redirect(new URL(next, req.url), 303);
  res.cookies.set(GATE_COOKIE, await gateToken(code), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
