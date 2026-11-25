/* Service worker: the app works offline after the first visit (except the Claude assistant). */
const VERSION = "v5";
const STATIC = `static-${VERSION}`;
const PAGES = `pages-${VERSION}`;
// pages are cached as they are visited (after the passcode gate), never precached: a locked visit would cache the gate
const PRECACHE = ["/icons/icon-dark-192.png", "/icons/icon-dark-512.png"];
/** only real, unredirected answers are cached (a gate redirect or a 401 must never replace a page) */
const cacheable = (res) => res.ok && !res.redirected && res.type === "basic";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => ![STATIC, PAGES].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // the assistant always needs the network

  // hashed build assets, fonts, exam screenshots, icons: cache first
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/exam/") || url.pathname.startsWith("/past/") || url.pathname.startsWith("/icons/")) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (cacheable(res)) {
              const copy = res.clone();
              caches.open(STATIC).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // pages: network first, fall back to the cached copy when offline
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (cacheable(res) && url.pathname !== "/gate") {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(url.pathname, copy));
          }
          return res;
        })
        .catch(() => caches.match(url.pathname).then((hit) => hit || caches.match("/"))),
    );
  }
});
