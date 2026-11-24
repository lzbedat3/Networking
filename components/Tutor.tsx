"use client";

import { ChevronDown } from "lucide-react";
import { HintIcon } from "./Icons";
import { useState } from "react";
import Chat, { Turn } from "./Chat";

/** "Ask Claude about this question", collapsible, lives under each question. */
export default function Tutor({ questionId, picked, answerVisible }: { questionId: string; picked: number[]; answerVisible: boolean }) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);

  return (
    <section className="rounded-2xl border border-route/25 bg-route-soft/50">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-right"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-route text-route-ink" aria-hidden>
          <HintIcon className="h-7 w-7" />
        </span>
        <span className="flex-1">
          <span className="block font-bold">צריך עזרה בשאלה?</span>
          <span className="block text-sm text-muted">
            {answerVisible ? "שאלו את Claude כל דבר על השאלה ועל ההסבר" : "Claude יסביר ויתן רמזים, בלי לגלות את התשובה"}
          </span>
        </span>
        <ChevronDown className={`h-5 w-5 text-muted transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div className="border-t border-route/20 px-4 py-4">
          <Chat
            questionId={questionId}
            picked={picked}
            answerVisible={answerVisible}
            turns={turns}
            setTurns={setTurns}
            compact
            placeholder="מה לא ברור בשאלה?"
            suggestions={
              answerVisible
                ? ["למה התשובה שלי שגויה?", "תסביר את העיקרון בפשטות", "תן לי שאלה דומה לתרגול"]
                : ["מה השאלה בעצם שואלת?", "תן לי רמז", "תסביר את המושגים בשאלה", "דוגמה דומה עם מספרים אחרים"]
            }
          />
        </div>
      )}
    </section>
  );
}
