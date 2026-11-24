"use client";

import { Maximize2, Minimize2, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Chat, { Turn } from "./Chat";
import { AssistantIcon } from "./Icons";

const CHAT_KEY = "net-quiz-assistant-v2";
const POS_KEY = "net-quiz-bubble-pos";
const SIZE_KEY = "net-quiz-assistant-size";
const MIN_W = 320;
const MIN_H = 380;
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
  const [full, setFull] = useState(false);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const resize = useRef<{ sx: number; sy: number; w: number; h: number; dirX: number; dirY: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [turns, setTurnsState] = useState<Turn[]>([]);
  const drag = useRef<{ dx: number; dy: number; sx: number; sy: number; moved: boolean } | null>(null);

  useEffect(() => {
    let saved: Pos | null = null;
    try {
      saved = JSON.parse(localStorage.getItem(POS_KEY) ?? "null");
      const sz = JSON.parse(localStorage.getItem(SIZE_KEY) ?? "null");
      if (sz && sz.w && sz.h) setBox(sz);
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (full) setFull(false);
      else setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, full]);

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
  const pw = narrow ? vw - 16 : Math.min(box?.w ?? 420, vw - 24);
  const ph = narrow ? vh - 16 - 76 : Math.min(box?.h ?? 620, vh - 24);
  const left = narrow ? 8 : Math.min(Math.max(12, pos.x + SIZE / 2 < vw / 2 ? pos.x : pos.x + SIZE - pw), vw - pw - 12);
  const above = pos.y + SIZE / 2 > vh / 2;
  const top = narrow ? 8 : above ? Math.max(12, pos.y - ph - 12) : Math.min(pos.y + SIZE + 12, vh - ph - 12);
  const hideBubble = open && (narrow || full);
  // the resize grip sits on the corner away from the bubble; dragging it grows the window outward
  const gripRight = pos.x + SIZE / 2 < vw / 2;
  const onGripDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    resize.current = { sx: e.clientX, sy: e.clientY, w: pw, h: ph, dirX: gripRight ? 1 : -1, dirY: above ? -1 : 1 };
  };
  const onGripMove = (e: React.PointerEvent) => {
    const r = resize.current;
    if (!r) return;
    setBox({
      w: Math.max(MIN_W, Math.min(vw - 24, r.w + (e.clientX - r.sx) * r.dirX)),
      h: Math.max(MIN_H, Math.min(vh - 24, r.h + (e.clientY - r.sy) * r.dirY)),
    });
  };
  const onGripUp = () => {
    resize.current = null;
    try {
      localStorage.setItem(SIZE_KEY, JSON.stringify(box));
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {open && (
        <section
          role="dialog"
          aria-label="עוזר הקורס"
          className="anim-sheet fixed z-50 flex flex-col overflow-hidden rounded-2xl border border-line-strong bg-ground shadow-[0_16px_40px_-18px_rgb(9_16_28/0.4)]"
          style={full && !narrow ? { left: 16, top: 16, right: 16, bottom: 16 } : { left, top, width: pw, height: ph }}
        >
          <header className="flex items-center gap-3 bg-field px-4 py-3 text-field-ink">
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
            {!narrow && (
              <button
                onClick={() => setFull((f) => !f)}
                aria-label={full ? "יציאה ממסך מלא" : "מסך מלא"}
                title={full ? "יציאה ממסך מלא" : "מסך מלא"}
                className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10"
              >
                {full ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
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
          {!narrow && !full && (
            <span
              role="separator"
              aria-label="שינוי גודל החלון"
              onPointerDown={onGripDown}
              onPointerMove={onGripMove}
              onPointerUp={onGripUp}
              className={`absolute ${above ? "top-0" : "bottom-0"} ${gripRight ? "right-0" : "left-0"} z-10 flex h-5 w-5 touch-none items-center justify-center text-muted ${
                gripRight === !above ? "cursor-nwse-resize" : "cursor-nesw-resize"
              }`}
            >
              <svg viewBox="0 0 10 10" className={`h-2.5 w-2.5 ${gripRight ? "" : "-scale-x-100"} ${above ? "-scale-y-100" : ""}`} aria-hidden>
                <path d="M9 3 3 9M9 6 6 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </span>
          )}
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
        className={`fixed z-50 flex touch-none items-center justify-center rounded-full bg-field text-gold shadow-[0_6px_16px_-6px_rgb(14_26_43/0.45)] ring-2 ring-surface transition-transform select-none ${
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
