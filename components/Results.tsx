"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import { useState } from "react";
import { scoreQuestion } from "@/lib/bank";
import { LEVEL_VAR, levelOf } from "@/lib/mastery";
import { TOPICS, Topic } from "@/lib/types";
import QuestionView from "./QuestionView";
import { Finished, Session } from "./Runner";
import Tutor from "./Tutor";

type Props = { session: Session; result: Finished; onRetry: () => void; onHome: () => void };
type Filter = "all" | "wrong" | "right";

export default function Results({ session, result, onRetry, onHome }: Props) {
  const [filter, setFilter] = useState<Filter>("wrong");
  const qs = session.questions;
  const answered = qs.map((_, i) => result.answers[i]?.length > 0);
  const scores = qs.map((q, i) => scoreQuestion(q, result.answers[i]));
  const exam = session.kind === "exam";
  // practice: only questions actually answered count
  const counted = exam ? qs.map(() => true) : answered;
  const n = counted.filter(Boolean).length || 1;
  const total = scores.reduce((a, s, i) => a + (counted[i] ? s : 0), 0);
  const pct = Math.round((total / n) * 100);
  const pass = pct >= 55;
  const lv = levelOf(pct / 100);
  const wrongCount = scores.filter((s, i) => counted[i] && s < 1).length;

  const byTopic = new Map<Topic, { s: number; n: number }>();
  qs.forEach((q, i) => {
    if (!counted[i]) return;
    const cur = byTopic.get(q.topic) ?? { s: 0, n: 0 };
    byTopic.set(q.topic, { s: cur.s + scores[i], n: cur.n + 1 });
  });
  const topicRows = [...byTopic.entries()].sort((a, b) => a[1].s / a[1].n - b[1].s / b[1].n);
  const shown = qs
    .map((q, i) => ({ q, i }))
    .filter(({ i }) => counted[i] && (filter === "wrong" ? scores[i] < 1 : filter === "right" ? scores[i] === 1 : true));
  const usedMin = Math.round(result.secondsUsed / 60);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-surface/80">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-3 sm:px-6">
          <button onClick={onHome} className="flex h-10 items-center gap-2 rounded-xl px-2 font-semibold text-muted hover:bg-sunken hover:text-ink">
            <ArrowRight className="h-5 w-5" aria-hidden />
            דף הבית
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
        <section className="mb-12">
          <p className="font-semibold text-muted">{session.title}</p>
          {result.timeUp && <p className="mt-2 inline-block rounded-lg bg-l2-soft px-3 py-1 text-sm font-semibold text-l2">הזמן נגמר, והמבחן הוגש אוטומטית</p>}
          <div className="mt-1 flex flex-wrap items-end gap-x-5 gap-y-2">
            <span className="num text-[6rem] leading-none font-extrabold tracking-tight sm:text-[8rem]" style={{ color: LEVEL_VAR[lv] }}>
              {pct}
            </span>
            <div className="pb-3">
              <p className="text-2xl font-extrabold">{pass ? "עובר" : "מתחת ל-55"}</p>
              <p className="text-muted">
                {total.toFixed(2).replace(/\.?0+$/, "")} נקודות מתוך {exam ? qs.length : n}
                {exam && usedMin > 0 && <>, תוך {usedMin} דקות</>}
              </p>
            </div>
          </div>

          {/* every question as a hop */}
          <div className="mt-6 flex flex-wrap gap-1.5" aria-label="תוצאה לפי שאלה">
            {qs.map((q, i) => (
              <span
                key={q.id}
                title={`שאלה ${i + 1}`}
                className="num flex h-7 min-w-7 items-center justify-center rounded-md px-1 text-xs font-bold"
                style={
                  counted[i]
                    ? { background: LEVEL_VAR[levelOf(scores[i])], color: "var(--surface)" }
                    : { background: "var(--sunken)", color: "var(--muted)", boxShadow: "inset 0 0 0 1px var(--line-strong)" }
                }
              >
                {i + 1}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            <button onClick={onRetry} className="flex h-12 items-center gap-2 rounded-xl bg-route px-6 font-bold text-route-ink transition-opacity hover:opacity-90">
              <RotateCcw className="h-4.5 w-4.5" aria-hidden />
              {exam ? "לעשות שוב" : "עוד סבב"}
            </button>
            <button onClick={onHome} className="h-12 rounded-xl border border-line-strong px-6 font-semibold transition-colors hover:border-ink-2">
              לדף הבית
            </button>
          </div>
        </section>

        {topicRows.length > 1 && (
          <section className="mb-12" aria-labelledby="by-topic">
            <h2 id="by-topic" className="mb-4 text-xl font-extrabold">לפי נושא, מהחלש לחזק</h2>
            <ul className="space-y-3">
              {topicRows.map(([t, { s, n: c }]) => {
                const p = Math.round((s / c) * 100);
                return (
                  <li key={t}>
                    <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-semibold">
                        {TOPICS[t]} <span className="font-normal text-muted">({c})</span>
                      </span>
                      <span className="num font-bold" style={{ color: LEVEL_VAR[levelOf(p / 100)] }}>{p}%</span>
                    </div>
                    <span className="block h-2 overflow-hidden rounded-full bg-sunken">
                      <span className="block h-full rounded-full" style={{ width: `${Math.max(3, p)}%`, background: LEVEL_VAR[levelOf(p / 100)] }} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section aria-labelledby="review">
          <div className="sticky top-0 z-20 -mx-4 mb-5 border-b border-line bg-ground/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <h2 id="review" className="mb-2 text-xl font-extrabold">סקירה עם הסברים</h2>
            <div className="flex gap-1" role="tablist">
              {(
                [
                  ["wrong", `לחזור עליהן (${wrongCount})`],
                  ["all", `הכול (${counted.filter(Boolean).length})`],
                  ["right", `נכונות (${counted.filter(Boolean).length - wrongCount})`],
                ] as [Filter, string][]
              ).map(([f, label]) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={filter === f}
                  onClick={() => setFilter(f)}
                  className={`h-9 rounded-lg px-3 text-sm font-semibold transition-colors ${filter === f ? "bg-ink text-surface" : "text-muted hover:bg-surface"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            {shown.map(({ q, i }) => (
              <article key={q.id} className="rounded-2xl border border-line bg-surface p-4 sm:p-6">
                <p className="mb-3 text-sm font-semibold text-muted">
                  שאלה {i + 1}, {TOPICS[q.topic]}
                </p>
                <QuestionView q={q} picked={result.answers[i]} revealed score={scores[i]} />
                <div className="mt-5">
                  <Tutor questionId={q.id} picked={result.answers[i]} answerVisible />
                </div>
              </article>
            ))}
            {shown.length === 0 && (
              <p className="rounded-2xl border border-dashed border-line-strong p-8 text-center text-muted">
                {filter === "wrong" ? "אין טעויות בסבב הזה. כל הכבוד!" : "אין שאלות בקטגוריה הזו."}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
