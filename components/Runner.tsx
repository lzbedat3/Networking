"use client";

import { ArrowLeft, ArrowRight, Flag, LayoutGrid, Send, Star, X } from "lucide-react";
import { AssistantIcon } from "./Icons";
import { useCallback, useEffect, useState } from "react";
import { scoreQuestion } from "@/lib/bank";
import { LEVEL_VAR, levelOf } from "@/lib/mastery";
import { recordResult } from "@/lib/stats";
import { Question, TOPIC_LABEL } from "@/lib/types";
import { openAssistant } from "./Assistant";
import ConfirmDialog, { ConfirmSpec } from "./ConfirmDialog";
import QuestionView from "./QuestionView";
import Tutor from "./Tutor";

export type Session = {
  kind: "exam" | "practice";
  title: string;
  questions: Question[];
  examId?: string;
  minutes?: number;
};

export type Finished = { answers: number[][]; secondsUsed: number; timeUp: boolean };

type Props = { session: Session; onExit: () => void; onFinish: (f: Finished) => void; onStatsChange: () => void };

export default function Runner({ session, onExit, onFinish, onStatsChange }: Props) {
  const { questions: qs, kind } = session;
  const exam = kind === "exam";
  const total = (session.minutes ?? 0) * 60;

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[][]>(() => qs.map(() => []));
  const [revealed, setRevealed] = useState<boolean[]>(() => qs.map(() => false));
  const [flags, setFlags] = useState<boolean[]>(() => qs.map(() => false));
  const [left, setLeft] = useState(total);
  const [dialog, setDialog] = useState<ConfirmSpec | null>(null);
  const [mapOpen, setMapOpen] = useState(false);

  const q = qs[idx];
  const answered = answers.filter((a) => a.length).length;
  const flagged = flags.filter(Boolean).length;
  const isRevealed = revealed[idx];

  const go = useCallback(
    (i: number) => {
      setIdx(Math.max(0, Math.min(qs.length - 1, i)));
      setMapOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [qs.length],
  );

  const submit = useCallback(
    (timeUp = false) => {
      if (exam) qs.forEach((qq, i) => recordResult(qq.id, scoreQuestion(qq, answers[i])));
      onStatsChange();
      onFinish({ answers, secondsUsed: total - Math.max(0, left), timeUp });
    },
    [exam, qs, answers, onFinish, onStatsChange, total, left],
  );

  useEffect(() => {
    if (!exam || !total) return;
    const t = setInterval(() => setLeft((x) => x - 1), 1000);
    return () => clearInterval(t);
  }, [exam, total]);
  useEffect(() => {
    if (exam && total && left <= 0) submit(true);
  }, [left, exam, total, submit]);

  const reveal = useCallback(
    (picked: number[]) => {
      setRevealed((prev) => prev.map((r, i) => (i === idx ? true : r)));
      recordResult(q.id, scoreQuestion(q, picked));
      onStatsChange();
    },
    [idx, q, onStatsChange],
  );

  const toggle = useCallback(
    (i: number) => {
      if (revealed[idx] || i >= q.options.length) return;
      const cur = answers[idx];
      const nextPick = q.multi ? (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i].sort()) : [i];
      setAnswers((prev) => prev.map((a, k) => (k === idx ? nextPick : a)));
      // practice + single choice: one tap answers and explains
      if (!exam && !q.multi) reveal(nextPick);
    },
    [q, idx, revealed, answers, exam, reveal],
  );

  const check = useCallback(() => {
    if (!answers[idx].length || revealed[idx]) return;
    reveal(answers[idx]);
  }, [answers, idx, revealed, reveal]);

  const askSubmit = useCallback(() => {
    const missing = qs.length - answered;
    setDialog({
      title: "להגיש את המבחן?",
      body:
        missing || flagged ? (
          <>
            {missing > 0 && (
              <p>
                נשארו <b className="text-ink">{missing} שאלות בלי תשובה</b>. שאלה בלי תשובה מקבלת 0.
              </p>
            )}
            {flagged > 0 && <p className="mt-1">{flagged} שאלות מסומנות אצלך לבדיקה חוזרת.</p>}
          </>
        ) : (
          <p>ענית על כל {qs.length} השאלות. אחרי ההגשה יוצגו הציון וההסברים, ואי אפשר לשנות תשובות.</p>
        ),
      confirmLabel: "להגיש",
      cancelLabel: "לחזור לשאלות",
      tone: "primary",
      onConfirm: () => submit(false),
    });
  }, [qs.length, answered, flagged, submit]);

  const askExit = () => {
    if (exam) {
      setDialog({
        title: "לצאת מהמבחן?",
        body: <p>המבחן לא יוגש והתשובות שסימנת לא יישמרו.</p>,
        confirmLabel: "לצאת בלי להגיש",
        cancelLabel: "להמשיך במבחן",
        tone: "danger",
        onConfirm: onExit,
      });
    } else onExit(); // practice progress is already saved on every answer
  };

  const next = useCallback(() => {
    if (idx < qs.length - 1) go(idx + 1);
    else if (exam) askSubmit();
    else onFinish({ answers, secondsUsed: 0, timeUp: false });
  }, [idx, qs.length, exam, askSubmit, onFinish, answers, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (dialog || mapOpen) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (e.key >= "1" && e.key <= "9") toggle(Number(e.key) - 1);
      else if (e.key === "Enter") {
        if (!exam && !revealed[idx]) check();
        else next();
      } else if (e.key === "ArrowLeft") go(idx + 1);
      else if (e.key === "ArrowRight") go(idx - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const mm = Math.floor(Math.max(0, left) / 60);
  const ss = String(Math.max(0, left) % 60).padStart(2, "0");
  const timerTone = left < 300 ? "bg-l4 text-surface" : left < 600 ? "bg-l2-soft text-l2" : "bg-sunken text-ink";

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-3 sm:px-6">
          <button
            onClick={askExit}
            aria-label={exam ? "יציאה מהמבחן" : "חזרה לדף הבית"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-sunken hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm leading-tight font-bold">{session.title}</p>
            <p className="flex items-center gap-1.5 truncate text-xs text-muted">
              <span className="num">{idx + 1}/{qs.length}</span>
              {!exam && <span>{TOPIC_LABEL[q.topic]}</span>}
              {q.source === "exam2026" && (
                <span className="inline-flex items-center gap-0.5 font-semibold text-l2">
                  <Star className="h-3 w-3 fill-current" aria-hidden />
                  בוחן לדוגמה
                </span>
              )}
            </p>
          </div>
          {exam && (
            <>
              <span className={`num rounded-lg px-2.5 py-1.5 text-base font-bold ${timerTone}`} dir="ltr" aria-label="זמן שנותר">
                {mm}:{ss}
              </span>
              <button
                onClick={() => setMapOpen(true)}
                aria-label="מפת שאלות"
                className="flex h-10 items-center gap-1.5 rounded-xl border border-line-strong px-2.5 text-sm font-semibold transition-colors hover:border-route"
              >
                <LayoutGrid className="h-4.5 w-4.5" aria-hidden />
                <span className="hidden sm:inline">מפה</span>
              </button>
            </>
          )}
          <button
            onClick={openAssistant}
            aria-label="עוזר הקורס"
            className="flex h-10 items-center gap-1.5 rounded-xl border border-line-strong px-2.5 text-sm font-semibold transition-colors hover:border-route"
          >
            <AssistantIcon className="h-5.5 w-5.5" />
            <span className="hidden sm:inline">עוזר הקורס</span>
          </button>
        </div>
        <TraceStrip qs={qs} idx={idx} answers={answers} revealed={revealed} flags={flags} exam={exam} onJump={go} />
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-7 pb-40 sm:px-6 sm:pt-10">
        <article key={q.id} className="anim-reveal">
          <QuestionView
            q={q}
            number={idx + 1}
            picked={answers[idx]}
            revealed={isRevealed}
            score={isRevealed ? scoreQuestion(q, answers[idx]) : undefined}
            onToggle={toggle}
          />
          <div className="mt-6">
            <Tutor key={q.id} questionId={q.id} picked={answers[idx]} answerVisible={isRevealed} />
          </div>
        </article>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pt-3 pb-safe backdrop-blur" aria-label="ניווט">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 sm:px-6">
          {exam ? (
            <>
              <button
                onClick={() => go(idx - 1)}
                disabled={idx === 0}
                aria-label="השאלה הקודמת"
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-line-strong transition-colors hover:border-ink-2 disabled:opacity-35"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => setFlags((f) => f.map((v, i) => (i === idx ? !v : v)))}
                aria-pressed={flags[idx]}
                className={`flex h-12 items-center gap-2 rounded-xl border px-3.5 font-semibold transition-colors ${
                  flags[idx] ? "border-l2 bg-l2-soft text-l2" : "border-line-strong hover:border-ink-2"
                }`}
              >
                <Flag className={`h-4.5 w-4.5 ${flags[idx] ? "fill-current" : ""}`} aria-hidden />
                {flags[idx] ? "מסומנת" : "לבדיקה"}
              </button>
              <span className="flex-1" />
              {idx < qs.length - 1 ? (
                <button onClick={() => go(idx + 1)} className="flex h-12 items-center gap-2 rounded-xl bg-route px-6 font-bold text-route-ink transition-opacity hover:opacity-90">
                  הבאה
                  <ArrowLeft className="h-5 w-5" aria-hidden />
                </button>
              ) : (
                <button onClick={askSubmit} className="flex h-12 items-center gap-2 rounded-xl bg-l0 px-6 font-bold text-surface transition-opacity hover:opacity-90">
                  <Send className="h-4.5 w-4.5" aria-hidden />
                  הגשה
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => go(idx - 1)}
                disabled={idx === 0}
                aria-label="השאלה הקודמת"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line-strong transition-colors hover:border-ink-2 disabled:opacity-35"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
              <span className="min-w-0 flex-1 text-sm leading-tight text-muted">
                {!isRevealed && (q.multi ? (answers[idx].length ? "אפשר לסמן עוד, ואז לבדוק" : "רב-ברירה: סמנו את כל הנכונות") : "הקישו על תשובה כדי לבדוק")}
              </span>
              {!isRevealed && q.multi && (
                <button
                  onClick={check}
                  disabled={!answers[idx].length}
                  className="h-12 shrink-0 rounded-xl bg-route px-6 font-bold text-route-ink transition-opacity hover:opacity-90 disabled:opacity-35"
                >
                  בדיקה
                </button>
              )}
              {isRevealed ? (
                <button onClick={next} className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-ink px-6 font-bold text-surface transition-opacity hover:opacity-90">
                  {idx < qs.length - 1 ? "הבאה" : "לסיכום"}
                  <ArrowLeft className="h-5 w-5" aria-hidden />
                </button>
              ) : (
                <button
                  onClick={() => (idx < qs.length - 1 ? go(idx + 1) : next())}
                  aria-label={idx < qs.length - 1 ? "דילוג לשאלה הבאה" : "לסיכום"}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line-strong transition-colors hover:border-ink-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
            </>
          )}
        </div>
      </nav>

      {mapOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center" role="presentation">
          <div className="absolute inset-0 bg-[var(--scrim)]" onClick={() => setMapOpen(false)} />
          <div role="dialog" aria-modal="true" aria-labelledby="map-title" className="anim-sheet relative w-full max-w-lg rounded-t-3xl border border-line bg-surface p-6 pb-safe shadow-2xl sm:rounded-3xl sm:pb-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 id="map-title" className="text-xl font-extrabold">מפת שאלות</h2>
              <button onClick={() => setMapOpen(false)} aria-label="סגירה" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-sunken">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-muted">
              ענית על {answered} מתוך {qs.length}
              {flagged > 0 && `, ${flagged} מסומנות לבדיקה`}.
            </p>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
              {qs.map((_, i) => {
                const cls = flags[i] ? "border-l2 bg-l2-soft text-l2" : answers[i].length ? "border-route bg-route text-route-ink" : "border-line-strong text-ink";
                return (
                  <button
                    key={i}
                    onClick={() => go(i)}
                    aria-label={`שאלה ${i + 1}`}
                    className={`num relative h-11 rounded-xl border-2 font-bold ${cls} ${i === idx ? "ring-2 ring-ink ring-offset-2 ring-offset-surface" : ""}`}
                  >
                    {i + 1}
                    {flags[i] && <Flag className="absolute -top-1.5 -left-1.5 h-3.5 w-3.5 fill-current" aria-hidden />}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                setMapOpen(false);
                askSubmit();
              }}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-l0 font-bold text-surface transition-opacity hover:opacity-90"
            >
              <Send className="h-4.5 w-4.5" aria-hidden />
              הגשת המבחן
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog spec={dialog} onClose={() => setDialog(null)} />
    </div>
  );
}

/** progress as a traceroute: one line, a node per question */
function TraceStrip({
  qs,
  idx,
  answers,
  revealed,
  flags,
  exam,
  onJump,
}: {
  qs: Question[];
  idx: number;
  answers: number[][];
  revealed: boolean[];
  flags: boolean[];
  exam: boolean;
  onJump?: (i: number) => void;
}) {
  const many = qs.length > 30;
  return (
    <div className="mx-auto max-w-3xl px-4 pb-2.5 sm:px-6">
      <div className="relative flex items-center justify-between" dir="rtl">
        <span className="absolute inset-x-1 top-1/2 h-[2px] -translate-y-1/2 bg-line-strong" aria-hidden />
        <span
          className="absolute top-1/2 right-1 h-[2px] -translate-y-1/2 bg-route transition-[width] duration-300"
          style={{ width: `calc(${(idx / Math.max(1, qs.length - 1)) * 100}% - 0.5rem)` }}
          aria-hidden
        />
        {(many ? qs.slice(0, 0) : qs).map((qq, i) => {
          let bg = "var(--surface)";
          let border = "var(--line-strong)";
          if (!exam && revealed[i]) {
            const c = LEVEL_VAR[levelOf(scoreQuestion(qq, answers[i]))];
            bg = c;
            border = c;
          } else if (exam && flags[i]) {
            bg = "var(--l2)";
            border = "var(--l2)";
          } else if (answers[i].length) {
            bg = "var(--route)";
            border = "var(--route)";
          } else if (i < idx) border = "var(--route)";
          const cur = i === idx;
          return (
            <button
              key={i}
              tabIndex={onJump ? 0 : -1}
              onClick={() => onJump?.(i)}
              aria-label={`שאלה ${i + 1}`}
              className={`relative rounded-full border-2 transition-transform ${cur ? "h-3.5 w-3.5 scale-110 ring-[3px] ring-route/25" : "h-2.5 w-2.5"} ${onJump ? "cursor-pointer hover:scale-125" : "cursor-default"}`}
              style={{ background: bg, borderColor: cur ? "var(--route)" : border }}
            />
          );
        })}
      </div>
    </div>
  );
}
