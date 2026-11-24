"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const DISMISS_KEY = "net-quiz-install-dismissed";

/** registers the service worker and offers a quiet, dismissible install card */
export default function Pwa() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* ignore */
    }
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone;
    if (dismissed || standalone) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    // iOS Safari has no install prompt: show a one-line hint instead
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua)) setIosHint(true);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    setDeferred(null);
    setIosHint(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  if (!deferred && !iosHint) return null;
  return (
    <div className="anim-sheet fixed inset-x-3 bottom-24 z-40 mx-auto flex max-w-md items-center gap-3 rounded-xl border border-line bg-surface p-3 shadow-[var(--shadow)] md:bottom-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="" className="h-11 w-11 rounded-[10px]" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-bold">להתקין את מסלול לבוחן</p>
        <p className="text-muted">{iosHint ? "בספארי: שיתוף ואז \"הוסף למסך הבית\"." : "פותח כמו אפליקציה ועובד גם בלי אינטרנט."}</p>
      </div>
      {deferred && (
        <button
          onClick={async () => {
            await deferred.prompt();
            await deferred.userChoice;
            dismiss();
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-ink px-3.5 text-sm font-bold text-surface"
        >
          <Download className="h-4 w-4" aria-hidden />
          התקנה
        </button>
      )}
      <button onClick={dismiss} aria-label="לא עכשיו" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-sunken">
        <X className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}
