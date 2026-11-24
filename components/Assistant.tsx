"use client";

import { X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Chat, { Turn } from "./Chat";
import { AssistantIcon } from "./Icons";

const CHAT_KEY = "net-quiz-assistant-v2";
const POS_KEY = "net-quiz-bubble-pos";
const SIZE = 64;
const EDGE = 14;

/** open the floating assistant from anywhere in the app */
export const openAssistant = () => window.dispatchEvent(new Event("open-assistant"));

type Pos = { x: number; y: number };

function clamp(p: Pos): Pos {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const bottomBar = w < 768 ? 76 : 0;
  return {
    x: Math.min(Math.max(EDGE, p.x), w - SIZE - EDGE),
    y: Math.min(Math.max(EDGE + 64, p.y), h - SIZE - EDGE - bottomBar),
  };
}

/** Draggable floating bubble; tap opens a chat window that sits next to it. Hidden during timed simulations. */
export default function AssistantBubble() {
  const path = usePathname();
  const params = useSearchParams();
  const hidden = path === "/run" && params.has("sim");

  const [pos, setPos] = useState<Pos | null>(null);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [turns, setTurnsState] = useState<Turn[]>([]);
  const drag = useRef<{ dx: number; dy: number; sx: number; sy: number; moved: boolean } | null>(null);

  useEffect(() => {
    let saved: Pos | null = null;
    try {
      saved = JSON.parse(localStorage.getItem(POS_KEY) ?? "null");
      const raw = localStorage.getItem(CHAT_KEY);
      if (raw) setTurnsState(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setPos(clamp(saved ?? { x: EDGE + 4, y: window.innerHeight - SIZE - 110 }));
    const onResize = () => setPos((p) => (p ? clamp(p) : p));
    const onOpen = () => setOpen(true);
    window.addEventListener("resize", onResize);
    window.addEventListener("open-assistant", onOpen);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("open-assistant", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const setTurns = useCallback(
    (fn: (t: Turn[]) => Turn[]) =>
      setTurnsState((prev) => {
        const next = fn(prev);
        try {
          localStorage.setItem(CHAT_KEY, JSON.stringify(next.slice(-40)));
        } catch {
          /* ignore */
        }
        return next;
      }),
    [],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (!pos) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y, sx: e.clientX, sy: e.clientY, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return;
    d.moved = true;
    setDragging(true);
    setPos(clamp({ x: e.clientX - d.dx, y: e.clientY - d.dy }));
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d) return;
    if (d.moved) {
      try {
        localStorage.setItem(POS_KEY, JSON.stringify(pos));
      } catch {
        /* ignore */
      }
    } else setOpen((o) => !o);
  };

  if (hidden || !pos) return null;

  // the window opens beside the bubble, on whichever side has room
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // phones: the window takes the screen above the tab bar and the bubble steps aside; wider screens: it opens beside the bubble
  const narrow = vw < 640;
  const pw = narrow ? vw - 16 : Math.min(420, vw - 24);
  const ph = narrow ? vh - 16 - 76 : Math.min(620, vh - 120);
  const left = narrow ? 8 : Math.min(Math.max(12, pos.x + SIZE / 2 < vw / 2 ? pos.x : pos.x + SIZE - pw), vw - pw - 12);
  const above = pos.y + SIZE / 2 > vh / 2;
  const top = narrow ? 8 : above ? Math.max(12, pos.y - ph - 12) : Math.min(pos.y + SIZE + 12, vh - ph - 12);
  const hideBubble = open && narrow;

  return (
    <>
      {open && (
        <section
          role="dialog"
          aria-label="עוזר הקורס"
          className="anim-sheet fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-line-strong bg-ground shadow-[0_16px_40px_-18px_rgb(9_16_28/0.4)]"
          style={{ left, top, width: pw, height: ph }}
        >
          <header className="flex items-center gap-3 bg-ink px-4 py-3 text-ground">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold" aria-hidden>
              <AssistantIcon className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-extrabold leading-tight">עוזר הקורס</h2>
              <p className="truncate text-xs opacity-75">מכיר את ההרצאות, התרגולים והבוחן לדוגמה</p>
            </div>
            {turns.length > 0 && (
              <button onClick={() => setTurns(() => [])} className="rounded-lg px-2 py-1 text-xs font-semibold opacity-80 hover:bg-white/10 hover:opacity-100">
                שיחה חדשה
              </button>
            )}
            <button onClick={() => setOpen(false)} aria-label="סגירה" className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {turns.length === 0 && (
              <div className="mb-4">
                <p className="text-lg font-bold">על מה נעבוד?</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  אפשר לשאול על כל הרצאה או תרגול, לבקש הסבר מחדש, שרטוט, טבלת השוואה, שאלות תרגול או עזרה בדף העזר.
                </p>
              </div>
            )}
            <Chat
              turns={turns}
              setTurns={setTurns}
              placeholder="שאלו על הקורס…"
              suggestions={[
                "תשרטט לי three-way handshake",
                "טבלה: flow control מול congestion control",
                "תסביר Go-Back-N עם תרשים",
                "מה היה בתרגול 3?",
                "תעזור לי לבנות דף עזר",
              ]}
            />
          </div>
        </section>
      )}

      {!hideBubble && (
      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        aria-label={open ? "סגירת עוזר הקורס" : "פתיחת עוזר הקורס (אפשר לגרור)"}
        aria-expanded={open}
        className={`fixed z-50 flex touch-none items-center justify-center rounded-full bg-ink text-gold shadow-[0_6px_16px_-6px_rgb(14_26_43/0.45)] ring-2 ring-surface transition-transform select-none ${
          dragging ? "scale-110 cursor-grabbing" : "cursor-grab hover:scale-105"
        }`}
        style={{ left: pos.x, top: pos.y, width: SIZE, height: SIZE }}
      >
        {open ? <X className="h-7 w-7" /> : <AssistantIcon className="h-8 w-8" />}
      </button>
      )}
    </>
  );
}
