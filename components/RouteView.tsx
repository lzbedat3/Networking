"use client";

import { ArrowLeft, RotateCcw, Star } from "lucide-react";
import { RouteIcon } from "./Icons";
import { useMemo } from "react";
import { EXAM_2026 } from "@/lib/bank";
import { EXAM_MINUTES, SIM_EXAMS } from "@/lib/exams";
import { Hop, LEVEL_LABEL, LEVEL_VAR, MIN_EVIDENCE, NextStep, TOPIC_SOURCE, hops, latencyMs, levelOf, nextStep, readiness } from "@/lib/mastery";
import { ExamStats, Stats } from "@/lib/stats";
import { TOPIC_LABEL, Topic } from "@/lib/types";
import { openAssistant } from "./Assistant";


type Props = {
  stats: Stats;
  examStats: ExamStats;
  mistakesCount: number;
  onSim: (id: string) => void;
  onReal: () => void;
  onTopic: (topic: Topic | null) => void;
  onMistakes: () => void;
  onReset: () => void;
};

/*
 * One geometry: every row sits on the same grid, and the rail runs through the node column.
 * columns: hop no | node | body | probes | rtt
 */
const ROW = "grid grid-cols-[2rem_1.75rem_minmax(0,1fr)_auto] items-center gap-x-3 sm:grid-cols-[2rem_1.75rem_minmax(0,1fr)_auto_5.5rem]";
// rail x = row padding (0.25rem) + hop col (2rem) + gap (0.75rem) + half node col (0.875rem)
const RAIL = "absolute right-[calc(3.875rem-1.5px)] w-[3px]";

export default function RouteView({ stats, examStats, mistakesCount, onSim, onReal, onTopic, onMistakes, onReset }: Props) {

  const route = useMemo(() => hops(stats), [stats]);
  const next = useMemo(() => nextStep(stats, examStats), [stats, examStats]);
  const ready = useMemo(() => readiness(stats), [stats]);
  const answered = Object.keys(stats).length;
  const nextTopic = next.kind === "topic" ? next.topic : null;
  const goNext = (n: NextStep) => (n.kind === "real" ? onReal() : n.kind === "sim" ? onSim(n.simId) : onTopic(n.topic));

  return (
    <div className="min-h-dvh">
      <main className="mx-auto max-w-3xl px-4 pt-8 pb-16 sm:px-6 sm:pt-12">
        <section aria-labelledby="route-h">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h1 id="route-h" className="text-3xl font-extrabold sm:text-4xl">המסלול שלך</h1>
            <Ramp />
          </div>
          <p className="mb-5 max-w-[62ch] text-muted">
            כל נושא הוא hop בדרך לבוחן. ככל שהנושא חלש יותר, ה-latency שלו גבוה יותר. לחיצה על hop פותחת תרגול, קודם שאלות חדשות ואחר כך טעויות.
          </p>

          {/* table head, like tracert output */}
          <div className={`${ROW} border-b border-line px-1 pb-2 text-xs font-semibold text-muted`} aria-hidden>
            <span className="num">hop</span>
            <span />
            <span>נושא</span>
            <span className="num" dir="ltr">probes</span>
            <span className="num hidden text-left sm:block" dir="ltr">rtt</span>
          </div>

          <ol className="relative">
            {/* where you are now: the next hop to send */}
            <li className="relative">
              <span className={`${RAIL} top-1/2 bottom-0 bg-route`} aria-hidden />
              <button onClick={() => goNext(next)} className={`${ROW} group relative w-full rounded-xl bg-route px-1 py-4 text-right text-route-ink`}>
                <span className="num text-sm opacity-80">00</span>
                <span className="flex justify-center" aria-hidden>
                  <span className="h-4 w-4 rounded-full border-[3px] border-route-ink bg-route ring-4 ring-route-ink/30" />
                </span>
                <span className="min-w-0">
                  <span className="block text-lg leading-snug font-extrabold sm:text-xl">{next.title}</span>
                  <span className="mt-0.5 block text-[0.93rem] leading-snug opacity-85">{next.why}</span>
                </span>
                <span className="col-span-1 flex items-center justify-end pl-2 sm:col-span-2">
                  <ArrowLeft className="h-6 w-6 sm:hidden" aria-hidden />
                  <span className="hidden h-10 items-center gap-1.5 rounded-lg bg-route-ink px-3.5 text-sm font-bold text-route transition-transform group-hover:-translate-x-0.5 sm:inline-flex">
                    להתחיל
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                  </span>
                </span>
              </button>
            </li>

            {route.map((h, i) => (
              <HopRow key={h.topic} hop={h} i={i} isNext={h.topic === nextTopic} onClick={() => onTopic(h.topic)} />
            ))}

            <Station ready={ready} answered={answered} />

            {/* platforms of the last station */}
            {SIM_EXAMS.map((ex) => {
              const rec = examStats[ex.id];
              return (
                <li key={ex.id} className="relative">
                  <span className={`${RAIL} top-0 bottom-0 bg-ink`} aria-hidden />
                  <button onClick={() => onSim(ex.id)} className={`${ROW} relative w-full rounded-xl px-1 py-3 text-right transition-colors hover:bg-surface`}>
                    <span className="num text-sm text-muted">S{ex.no}</span>
                    <span className="flex justify-center" aria-hidden>
                      <span className="h-3 w-3 rounded-[3px] bg-ink" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-bold">{ex.title}</span>
                      <span className="block text-sm text-muted">
                        {ex.questions.length} שאלות, {EXAM_MINUTES} דק&apos;
                        {rec && `, נבחנת ${rec.attempts === 1 ? "פעם אחת" : `${rec.attempts} פעמים`}`}
                      </span>
                    </span>
                    <span className="num col-span-1 text-left text-sm sm:col-span-2" dir="ltr">
                      {rec ? (
                        <span className="text-lg font-bold" style={{ color: LEVEL_VAR[levelOf(rec.best / 100)] }}>
                          {rec.best}
                        </span>
                      ) : (
                        <span className="font-sans text-muted">עוד לא</span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
            <li className="relative">
              <span className={`${RAIL} top-0 h-1/2 bg-ink`} aria-hidden />
              <button onClick={onReal} className={`${ROW} relative w-full rounded-xl px-1 py-3 text-right transition-colors hover:bg-l2-soft`}>
                <span className="text-sm font-semibold text-l2">דוגמה</span>
                <span className="flex justify-center" aria-hidden>
                  <Star className="h-4.5 w-4.5 fill-l2 text-l2" />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold">בוחן לדוגמה</span>
                  <span className="block text-sm text-muted">{EXAM_2026.length} שאלות בדיוק בסגנון הבוחן, עם הסבר אחרי כל אחת</span>
                </span>
                <span className="col-span-1 flex justify-end pl-2 sm:col-span-2">
                  <ArrowLeft className="h-5 w-5 text-muted" aria-hidden />
                </span>
              </button>
            </li>
          </ol>

        </section>

        <nav aria-label="פעולות נוספות" className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6 font-semibold">
          <button onClick={() => onTopic(null)} className="text-route underline-offset-4 hover:underline">
            שאלות מעורבות מכל הנושאים
          </button>
          {mistakesCount > 0 && (
            <button onClick={onMistakes} className="text-route underline-offset-4 hover:underline">
              חזרה על {mistakesCount} טעויות
            </button>
          )}
          <button onClick={openAssistant} className="text-route underline-offset-4 hover:underline">
            לשאול את עוזר הקורס על ההרצאות והתרגולים
          </button>
        </nav>

        <p className="mt-6 text-sm leading-relaxed text-muted">
          במחשב: <kbd className="num rounded border border-line-strong px-1">1</kbd> עד <kbd className="num rounded border border-line-strong px-1">9</kbd> לבחירה,{" "}
          <kbd className="num rounded border border-line-strong px-1">Enter</kbd> לבדיקה, וחצים למעבר בין שאלות.
          {answered > 0 && (
            <button onClick={onReset} className="mr-2 inline-flex items-center gap-1 font-semibold text-l4 hover:underline">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              איפוס התקדמות
            </button>
          )}
        </p>
      </main>

    </div>
  );
}

function Ramp() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted" aria-label="מקרא: משולט עד חלש">
      <span>שולט</span>
      <span className="flex overflow-hidden rounded-full">
        {LEVEL_VAR.map((c) => (
          <span key={c} className="h-2 w-5" style={{ background: c }} />
        ))}
      </span>
      <span>חלש</span>
      <span className="num tracking-widest">* * *</span>
      <span>לא נבדק</span>
    </div>
  );
}

function HopRow({ hop, i, isNext, onClick }: { hop: Hop; i: number; isNext: boolean; onClick: () => void }) {
  const firm = hop.level !== null && !hop.provisional;
  const color = hop.level === null ? "var(--line-strong)" : firm ? LEVEL_VAR[hop.level] : "var(--muted)";
  const delay = { animationDelay: `${120 + i * 70}ms` };
  let meta: string;
  if (hop.seen === 0) meta = `${hop.total} שאלות, עוד לא תרגלת`;
  else if (!firm) meta = `${hop.seen} מתוך ${hop.total}, מוקדם לקבוע (צריך ${MIN_EVIDENCE} תשובות)`;
  else meta = `${hop.seen} מתוך ${hop.total}, ${LEVEL_LABEL[hop.level!]}`;

  return (
    <li className="relative">
      {/* the segment leading into this hop carries its level */}
      <span className={`${RAIL} top-0 bottom-0`} style={{ background: firm ? color : "var(--line-strong)" }} aria-hidden />
      <button
        onClick={onClick}
        className={`${ROW} relative w-full rounded-xl px-1 py-3 text-right transition-colors ${isNext ? "bg-route-soft" : "hover:bg-surface"}`}
        aria-label={`${TOPIC_LABEL[hop.topic]}: ${meta}`}
      >
        <span className="num text-sm text-muted">{String(hop.no).padStart(2, "0")}</span>
        <span className="flex justify-center" aria-hidden>
          <span
            className="h-4 w-4 rounded-full border-[3px]"
            style={{
              borderColor: color,
              borderStyle: hop.level === null ? "dashed" : "solid",
              background: firm ? color : "var(--surface)",
            }}
          />
        </span>
        <span className="min-w-0">
          <span className="block font-bold leading-snug">{TOPIC_LABEL[hop.topic]}</span>
          <span className="block text-sm text-muted">
            <span className="num hidden text-xs sm:inline" dir="ltr">{TOPIC_SOURCE[hop.topic]}</span>
            <span className="hidden sm:inline"> · </span>
            {meta}
          </span>
        </span>
        <span className="anim-reveal flex gap-1" style={delay} aria-hidden dir="ltr">
          {hop.probes.map((p, k) => (
            <span
              key={k}
              className="h-5 w-2 rounded-sm"
              style={{ background: p === null ? "var(--sunken)" : LEVEL_VAR[levelOf(p)], boxShadow: p === null ? "inset 0 0 0 1px var(--line-strong)" : undefined }}
            />
          ))}
        </span>
        <span className="num hidden text-left text-sm sm:block" dir="ltr">
          {hop.score === null ? (
            <span className="tracking-[0.3em] text-muted">* * *</span>
          ) : firm ? (
            <>
              <span className="font-bold" style={{ color }}>{latencyMs(hop.score)}</span>
              <span className="text-muted"> ms</span>
            </>
          ) : (
            <span className="text-muted">~{latencyMs(hop.score)} ms</span>
          )}
        </span>
      </button>
    </li>
  );
}

function Station({ ready, answered }: { ready: number; answered: number }) {
  const pct = Math.round(ready * 100);
  return (
    <li className="relative">
      <span className={`${RAIL} top-0 bottom-0 bg-ink`} aria-hidden />
      <div className={`${ROW} relative px-1 pt-5 pb-3`}>
        <span />
        <span className="flex justify-center" aria-hidden>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-surface">
            <RouteIcon className="h-4.5 w-4.5" />
          </span>
        </span>
        <span className="min-w-0">
          <span className="block text-xl font-extrabold">בוחן 1</span>
          <span className="block text-sm text-muted">
            {answered === 0 ? "המוכנות תחושב אחרי כמה תשובות" : "מוכנות משוערת. נושא שלא תרגלת נספר כ-0"}
          </span>
        </span>
        <span className="num col-span-1 text-left text-3xl font-extrabold sm:col-span-2" dir="ltr" style={{ color: answered ? LEVEL_VAR[levelOf(ready)] : "var(--muted)" }}>
          {answered ? `${pct}%` : "–"}
        </span>
      </div>
      <p className="pr-[4.75rem] pb-2 text-sm text-muted">
        סימולציות עם שעון של {EXAM_MINUTES} דקות, ניווט חופשי וסימון לבדיקה. ההסברים מוצגים אחרי ההגשה.
      </p>
    </li>
  );
}
