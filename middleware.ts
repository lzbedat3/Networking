import { NextRequest, NextResponse } from "next/server";
import { GATE_COOKIE, gateToken } from "./lib/gate";

/**
 * Passcode gate for the whole app. When APP_PASSCODE is set, every page, asset, screenshot and API call
 * needs the gate cookie; without it pages redirect to /gate and API calls get 401.
 * Left open: the gate itself, its stylesheet and fonts, and the PWA manifest and icons.
 */
const OPEN = [/^\/gate$/, /^\/api\/gate$/, /^\/_next\/static\/(css|media)\//, /^\/icons\//, /^\/(icon|apple-icon)\.png$/, /^\/favicon\.ico$/, /^\/manifest\.webmanifest$/];

export async function middleware(req: NextRequest) {
  const code = process.env.APP_PASSCODE;
  if (!code) return NextResponse.next();
  const { pathname, search } = req.nextUrl;
  if (OPEN.some((r) => r.test(pathname))) return NextResponse.next();

  if (req.cookies.get(GATE_COOKIE)?.value === (await gateToken(code))) return NextResponse.next();

  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "נדרש קוד כניסה" }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = "/gate";
  url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: "/:path*" };
