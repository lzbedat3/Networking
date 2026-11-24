"use client";

import { Check, ChevronDown, Lightbulb, Maximize2, X } from "lucide-react";
import { LEVEL_VAR, levelOf } from "@/lib/mastery";
import { Img, Question, Table } from "@/lib/types";
import Diagram from "./Diagram";

const HEBREW = /[֐-׿]/;

type Props = {
  q: Question;
  picked: number[];
  revealed: boolean;
  score?: number;
  onToggle?: (i: number) => void;
  number?: number;
};

export default function QuestionView({ q, picked, revealed, score, onToggle }: Props) {
  return (
    <div className="space-y-6">
      <p className="max-w-[68ch] text-[1.2rem] leading-[1.7] font-semibold sm:text-[1.35rem]">{q.prompt}</p>

      {q.images?.map((img) => <Shot key={img.src} img={img} />)}
      {q.diagram && <Diagram d={q.diagram} />}

      {q.images?.length && (q.pre || q.code || q.table) ? (
        <details className="group rounded-xl border border-line bg-surface text-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-ink-2">
            התמונה לא ברורה? תמליל נקי
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <div className="space-y-3 border-t border-line p-3">
            <Context q={q} />
          </div>
        </details>
      ) : (
        <Context q={q} />
      )}

      <div>
        <p className="mb-2.5 text-sm font-semibold text-muted">
          {q.multi ? "סמנו את כל התשובות הנכונות. סימון שגוי מוריד ניקוד." : "בחרו תשובה אחת."}
        </p>
        <ol className="space-y-2" role={q.multi ? "group" : "radiogroup"}>
          {q.options.map((op, i) => {
            const on = picked.includes(i);
            let state: "idle" | "picked" | "hit" | "missed" | "wrong" | "neutral" = on ? "picked" : "idle";
            if (revealed) state = op.correct ? (on ? "hit" : "missed") : on ? "wrong" : "neutral";
            const box = {
              idle: "border-line bg-surface hover:border-route/60 hover:bg-route-soft/40",
              picked: "border-route bg-route-soft",
              hit: "border-l0 bg-l0-soft",
              missed: "border-l0 border-dashed bg-surface",
              wrong: "border-l4 bg-l4-soft",
              neutral: "border-line bg-surface",
            }[state];
            const verdict = {
              hit: ["נכון, וסימנת", "text-l0"],
              missed: ["נכון, ולא סימנת", "text-l0"],
              wrong: ["לא נכון, וסימנת", "text-l4"],
              neutral: ["לא נכון", "text-muted"],
            } as const;
            const ltr = !HEBREW.test(op.text);
            return (
              <li key={i}>
                <button
                  type="button"
                  role={q.multi ? "checkbox" : "radio"}
                  aria-checked={on}
                  disabled={revealed || !onToggle}
                  onClick={() => onToggle?.(i)}
                  className={`w-full rounded-xl border-2 px-3.5 py-3 text-right transition-[border-color,background-color] duration-150 disabled:cursor-default sm:px-4 ${box} ${revealed && state === "neutral" ? "opacity-75" : ""}`}
                >
                  <span className="flex items-start gap-3">
                    <Marker multi={!!q.multi} state={state} n={i + 1} />
                    <span dir={ltr ? "ltr" : "rtl"} className={`flex-1 pt-0.5 leading-relaxed ${ltr ? "text-left font-medium" : ""}`}>
                      {op.text}
                    </span>
                  </span>
                  {revealed && state !== "idle" && state !== "picked" && (
                    <span className="anim-reveal mt-2 block pr-10 text-[0.95rem] leading-relaxed">
                      <b className={verdict[state][1]}>{verdict[state][0]}. </b>
                      <span className="text-ink-2">{op.why}</span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {revealed && (
        <section className="anim-reveal rounded-2xl bg-sunken p-4 sm:p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-bold">
              <Lightbulb className="h-4.5 w-4.5 text-l2" aria-hidden />
              העיקרון שמאחורי השאלה
            </h3>
            {score !== undefined && <ScoreBadge score={score} />}
          </div>
          <p className="max-w-[70ch] leading-relaxed text-ink-2">{q.explanation}</p>
          {(q.explainDiagram || q.explainImages) && (
            <div className="mt-4 space-y-3">
              {q.explainImages?.map((img) => <Shot key={img.src} img={img} />)}
              {q.explainDiagram && <Diagram d={q.explainDiagram} />}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const c = LEVEL_VAR[levelOf(score)];
  const txt = score === 1 ? "ניקוד מלא" : score > 0 ? `ניקוד חלקי ${Math.round(score * 100)}%` : "0 נקודות";
  return (
    <span className="shrink-0 rounded-full px-3 py-1 text-sm font-bold" style={{ color: c, background: "var(--surface)" }}>
      {txt}
    </span>
  );
}

function Marker({ multi, state, n }: { multi: boolean; state: string; n: number }) {
  const shape = multi ? "rounded-md" : "rounded-full";
  const cls: Record<string, string> = {
    idle: "border-line-strong text-muted",
    picked: "border-route bg-route text-route-ink",
    hit: "border-l0 bg-l0 text-surface",
    missed: "border-l0 text-l0",
    wrong: "border-l4 bg-l4 text-surface",
    neutral: "border-line-strong text-muted",
  };
  return (
    <span className={`num flex h-7 w-7 shrink-0 items-center justify-center border-2 text-sm font-bold ${shape} ${cls[state]}`} aria-hidden>
      {state === "hit" || state === "missed" ? <Check className="h-4 w-4" strokeWidth={3} /> : state === "wrong" ? <X className="h-4 w-4" strokeWidth={3} /> : n}
    </span>
  );
}

function Shot({ img }: { img: Img }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-surface">
      <a href={img.src} target="_blank" rel="noreferrer" aria-label={`${img.alt}: פתח בגודל מלא`} className="group relative block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.src} alt={img.alt} className="mx-auto block max-h-[440px] w-full object-contain" />
        <span className="absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-lg bg-surface/90 text-ink-2 opacity-0 shadow transition-opacity group-hover:opacity-100">
          <Maximize2 className="h-4 w-4" aria-hidden />
        </span>
      </a>
      {img.caption && <figcaption className="border-t border-line px-3 py-2 text-xs text-muted">{img.caption}</figcaption>}
    </figure>
  );
}

function rowColor(proto: string, info: string): { bg: string; fg: string } {
  if (/Dup ACK|Retransmission|lost segment|ACKed unseen/i.test(info)) return { bg: "var(--ws-bad-bg)", fg: "var(--ws-bad-fg)" };
  if (/SYN|FIN/.test(info) && /TCP/i.test(proto)) return { bg: "#a0a0a0", fg: "var(--ws-ink)" };
  if (/HTTP/i.test(proto)) return { bg: "var(--ws-http)", fg: "var(--ws-ink)" };
  if (/DNS|UDP/i.test(proto)) return { bg: "var(--ws-udp)", fg: "var(--ws-ink)" };
  return { bg: "var(--ws-tcp)", fg: "var(--ws-ink)" };
}

function WiresharkTable({ t }: { t: Table }) {
  const pi = t.headers.findIndex((h) => /^proto/i.test(h));
  const ii = t.headers.findIndex((h) => /^info/i.test(h));
  return (
    <div dir="ltr" className="overflow-hidden rounded-xl border border-[#a9b0bc] bg-white text-left">
      <div className="flex items-center gap-2 border-b border-[#cfd4dc] bg-[#eef0f3] px-2 py-1.5">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path d="M3 17c4-1 6-6 9-12 1 4 3 7 9 9-6 1-10 3-18 3z" fill="#1a6fb5" />
        </svg>
        <div
          className={`flex-1 truncate rounded border px-2 py-0.5 font-mono text-[11px] ${
            t.filter ? "border-[#7ccf7c] bg-[#d9f5d9] text-[#12272e]" : "border-[#cfd4dc] bg-white text-[#8a8f98]"
          }`}
        >
          {t.filter ?? "Apply a display filter … <Ctrl-/>"}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-[11.5px] text-[#12272e]">
          <thead className="bg-[#e4e7ec]">
            <tr>
              {t.headers.map((h) => (
                <th key={h} className="border-r border-[#cfd4dc] px-2 py-1 text-left font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.rows.map((r, i) => {
              const c = rowColor(pi >= 0 ? r[pi] : "TCP", ii >= 0 ? r[ii] : r[r.length - 1]);
              return (
                <tr key={i} style={{ background: c.bg, color: c.fg }}>
                  {r.map((cell, j) => (
                    <td key={j} className="px-2 py-[3px] whitespace-nowrap">{cell}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Context({ q }: { q: Question }) {
  return (
    <>
      {q.pre && (
        <pre dir="ltr" className="overflow-x-auto rounded-xl bg-code p-4 text-left font-mono text-[13px] leading-relaxed">
          {q.pre}
        </pre>
      )}
      {q.code && (
        <pre dir="ltr" className="overflow-x-auto rounded-xl border border-line bg-code p-4 text-left font-mono text-[13px] leading-relaxed">
          <code>{q.code}</code>
        </pre>
      )}
      {q.table && <WiresharkTable t={q.table} />}
    </>
  );
}
