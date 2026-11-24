"use client";

import { useEffect, useRef, useState } from "react";
import Markdown from "./Markdown";

export type Turn = { role: "user" | "assistant"; content: string; reveal?: boolean };

type Props = {
  /** omit for the general course assistant */
  questionId?: string;
  picked?: number[];
  /** answer already shown on screen (after checking): the tutor may discuss it freely */
  answerVisible?: boolean;
  suggestions: string[];
  placeholder: string;
  turns: Turn[];
  setTurns: (fn: (t: Turn[]) => Turn[]) => void;
  compact?: boolean;
};

export default function Chat({ questionId, picked, answerVisible, suggestions, placeholder, turns, setTurns, compact }: Props) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (turns.length) endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [turns]);
  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const history: Turn[] = [...turns, { role: "user", content }];
    setTurns(() => [...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ac.signal,
        body: JSON.stringify({
          questionId,
          picked,
          answerVisible: !!answerVisible,
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: `שגיאה ${res.status}` }));
        throw new Error(err.error ?? "שגיאה");
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        const snapshot = acc;
        setTurns((t) => [...t.slice(0, -1), { role: "assistant", content: snapshot }]);
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setTurns((t) => [...t.slice(0, -1), { role: "assistant", content: `שגיאה: ${(e as Error).message}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {turns.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-line-strong bg-surface px-3.5 py-2 text-sm transition-colors hover:border-route hover:text-route"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {turns.length > 0 && (
        <div className={`space-y-3 overflow-y-auto ${compact ? "max-h-[60vh]" : ""}`} aria-live="polite">
          {turns.map((t, i) =>
            t.role === "user" ? (
              <div key={i} className="flex justify-start">
                <div className={`max-w-[85%] rounded-2xl rounded-tr-md px-3.5 py-2 bg-route text-route-ink`}>
                  {t.content}
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-end">
                <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-line bg-surface px-3.5 py-2">
                  {t.content ? <Markdown text={t.content} /> : <Dots />}
                </div>
              </div>
            ),
          )}
          <div ref={endRef} />
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation(); // don't trigger the quiz's 1-9 / Enter shortcuts
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder={placeholder}
          aria-label={placeholder}
          className="max-h-40 min-h-12 flex-1 resize-none rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 leading-relaxed outline-none focus:border-route focus:ring-2 focus:ring-route/20"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="h-12 shrink-0 rounded-xl bg-route px-5 font-bold text-route-ink transition-opacity hover:opacity-90 disabled:opacity-35"
        >
          שליחה
        </button>
      </form>

    </div>
  );
}

function Dots() {
  return (
    <span className="inline-flex gap-1 py-1.5" aria-label="כותב תשובה">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-2 w-2 animate-pulse rounded-full bg-muted" style={{ animationDelay: `${i * 200}ms` }} />
      ))}
    </span>
  );
}
