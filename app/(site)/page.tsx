"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { openAssistant } from "@/components/Assistant";
import { ArchiveIcon, AssistantIcon, MixIcon, RetryIcon, RouteIcon, SampleIcon, SimIcon } from "@/components/Icons";
import { EXAM_2026, PAST_QUESTIONS } from "@/lib/bank";
import { EXAM_MINUTES, SIM_EXAMS } from "@/lib/exams";
import { Hop, LEVEL_VAR, NextStep, hops, levelOf, nextStep, readiness } from "@/lib/mastery";
import { TOPIC_LABEL } from "@/lib/types";
import { useProgress } from "@/lib/useProgress";

const QUIZ_AT = new Date("2026-11-27T09:00:00+02:00").getTime();

const nextHref = (n: NextStep) => (n.kind === "real" ? "/run?mode=sample" : n.kind === "sim" ? `/simulations` : `/run?mode=topic&t=${n.topic}`);

export default function HomePage() {
  const { stats, examStats, mistakes, ready: loaded } = useProgress();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const route = useMemo(() => hops(stats), [stats]);
  const next = useMemo(() => nextStep(stats, examStats), [stats, examStats]);
  const ready = readiness(stats);
  const answered = Object.keys(stats).length;
  const sampleDone = EXAM_2026.filter((q) => stats[q.id]);

  return (
    <main>
      {/* ─── hero: the countdown on a dark field, the route drawn live beside it ─── */}
      <section className="border-b border-line bg-surface">
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div>
            <Countdown now={now} />
            <span className="mt-5 block h-[3px] w-16 rounded-full bg-gold" aria-hidden />
            <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-ink-2">
              עד בוחן 1 בתקשורת נתונים, יום שישי 27.11 בשעה 09:00. {EXAM_MINUTES} דקות, חומר סגור ודף עזר אחד.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={nextHref(next)}
                className="group inline-flex h-14 items-center gap-3 rounded-lg bg-ink px-6 text-lg font-bold text-surface transition-colors hover:bg-ink-2"
              >
                {loaded ? next.title : "להתחיל"}
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" aria-hidden />
              </Link>
              <Link href="/simulations" className="inline-flex h-14 items-center gap-2 rounded-lg border border-line-strong px-5 font-semibold transition-colors hover:border-ink-2">
                <SimIcon className="h-5.5 w-5.5" />
                סימולציה מלאה
              </Link>
            </div>
            {loaded && <p className="mt-3 max-w-[52ch] text-sm text-muted">{next.why}</p>}
          </div>

          <TraceGraphic route={route} ready={ready} answered={answered} />
        </div>
      </section>

      {/* ─── the hub ─── */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="text-3xl font-extrabold sm:text-4xl">איך מתכוננים</h2>
        <p className="mt-2 max-w-[60ch] text-lg text-muted">תרגול לפי נושא עם הסבר מלא, סימולציות עם שעון, ובוחן לדוגמה. העוזר זמין בכל מסך, בבועה הצפה.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-6">
          {/* route */}
          <Link href="/route" className="group relative flex flex-col rounded-xl border border-line bg-surface p-6 transition-shadow hover:shadow-[var(--shadow)] md:col-span-4">
            <div className="flex items-start gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-ink text-gold">
                <RouteIcon className="h-9 w-9" />
              </span>
              <div className="flex-1">
                <h3 className="text-2xl font-extrabold">המסלול: תרגול לפי נושא</h3>
                <p className="mt-1 text-muted">10 נושאים, 91 שאלות. אחרי כל תשובה מוסבר למה כל אפשרות נכונה או שגויה.</p>
              </div>
              <ArrowLeft className="h-6 w-6 text-muted transition-transform group-hover:-translate-x-1" aria-hidden />
            </div>
            <div className="mt-6 grid grid-cols-5 gap-1.5 sm:grid-cols-10" aria-label="מצב לפי נושא">
              {route.map((h) => (
                <span key={h.topic} className="flex flex-col gap-1.5">
                  <span
                    className="h-2.5 rounded-sm"
                    style={{ background: h.level === null ? "var(--sunken)" : h.provisional ? "var(--line-strong)" : LEVEL_VAR[h.level], boxShadow: h.level === null ? "inset 0 0 0 1px var(--line-strong)" : undefined }}
                  />
                  <span className="line-clamp-2 text-[0.7rem] leading-tight text-muted">{TOPIC_LABEL[h.topic]}</span>
                </span>
              ))}
            </div>
          </Link>

          {/* simulations */}
          <Link href="/simulations" className="group relative flex flex-col overflow-hidden rounded-xl bg-violet p-6 text-white md:col-span-2">
            <SimIcon className="absolute -bottom-6 -left-6 h-36 w-36 opacity-15" />
            <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/15">
              <SimIcon className="h-9 w-9" />
            </span>
            <h3 className="mt-4 text-2xl font-extrabold">סימולציות</h3>
            <p className="mt-1 text-white/80">6 מבחנים של 15 עד 22 שאלות, {EXAM_MINUTES} דקות כל אחד.</p>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
              {SIM_EXAMS.map((s) => (
                <span key={s.id} className="num rounded-md bg-white/15 px-2 py-1 text-sm font-bold">
                  S{s.no} {examStats[s.id] ? examStats[s.id].best : "·"}
                </span>
              ))}
            </div>
          </Link>

          {/* sample quiz */}
          <Link href="/run?mode=sample" className="group relative flex flex-col overflow-hidden rounded-xl bg-amber p-6 text-amber-ink md:col-span-2">
            <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-amber-ink/10">
              <SampleIcon className="h-9 w-9" />
            </span>
            <h3 className="mt-4 text-2xl font-extrabold">בוחן לדוגמה</h3>
            <p className="mt-1 text-amber-ink/80">{EXAM_2026.length} שאלות בדיוק בסגנון הבוחן, עם צילומי Wireshark וקוד.</p>
            <div className="mt-auto flex flex-wrap gap-1 pt-5" aria-label={`ענית על ${sampleDone.length} מתוך ${EXAM_2026.length}`}>
              {EXAM_2026.map((q) => (
                <span
                  key={q.id}
                  className="h-3.5 w-3.5 rounded-[3px]"
                  style={{ background: stats[q.id] ? LEVEL_VAR[levelOf(stats[q.id].lastScore)] : "rgb(61 42 0 / 0.15)" }}
                />
              ))}
            </div>
          </Link>

          {/* mistakes */}
          <Link
            href={mistakes.length ? "/run?mode=mistakes" : "/route"}
            className="group flex flex-col rounded-xl border border-line bg-surface p-6 transition-shadow hover:shadow-[var(--shadow)] md:col-span-2"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-l4-soft text-l4">
              <RetryIcon className="h-9 w-9" />
            </span>
            <h3 className="mt-4 text-2xl font-extrabold">חזרה על טעויות</h3>
            <p className="mt-1 text-muted">
              {mistakes.length ? `${mistakes.length} שאלות שטעית בהן בניסיון האחרון מחכות לך.` : "כשתטעו בשאלה היא תחכה כאן לסיבוב נוסף."}
            </p>
            <span className="num mt-auto pt-5 text-5xl font-bold text-l4">{mistakes.length}</span>
          </Link>

          {/* mixed */}
          <Link href="/run?mode=mixed" className="group flex flex-col rounded-xl border border-line bg-surface p-6 transition-shadow hover:shadow-[var(--shadow)] md:col-span-2">
            <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-cyan/15 text-cyan">
              <MixIcon className="h-9 w-9" />
            </span>
            <h3 className="mt-4 text-2xl font-extrabold">תרגול מעורב</h3>
            <p className="mt-1 text-muted">שאלות מכל הנושאים, קודם כאלה שעוד לא ענית עליהן.</p>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-5 font-bold text-cyan">
              להתחיל
              <ArrowLeft className="h-4.5 w-4.5" aria-hidden />
            </span>
          </Link>

          {/* past-years bank */}
          <Link href="/past" className="group flex items-center gap-5 rounded-xl bg-field p-6 text-field-ink md:col-span-6">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold">
              <ArchiveIcon className="h-9 w-9" />
            </span>
            <span className="flex-1">
              <span className="block text-2xl font-extrabold">שנים קודמות</span>
              <span className="block text-field-ink/75">מאגר נפרד של {PAST_QUESTIONS.length} שאלות ממבחנים של 2020 עד 2025, עם הסבר לכל תשובה ועזרה מהעוזר.</span>
            </span>
            <ArrowLeft className="h-6 w-6 transition-transform group-hover:-translate-x-1" aria-hidden />
          </Link>

          {/* assistant */}
          <div className="relative overflow-hidden rounded-xl bg-field p-6 text-field-ink md:col-span-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-gold">
                <AssistantIcon className="h-11 w-11" />
              </span>
              <div className="flex-1">
                <h3 className="text-2xl font-extrabold">עוזר הקורס</h3>
                <p className="mt-1 max-w-[60ch] text-field-ink/75">
                  מכיר את כל ההרצאות, התרגולים, תרגיל הבית והבוחן לדוגמה. מסביר, משרטט תרשימים וטבלאות, וכותב שאלות תרגול. בתוך שאלה הוא נותן רמזים ולא מגלה את התשובה.
                </p>
              </div>
              <button onClick={openAssistant} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-white px-5 font-bold text-field">
                לפתוח את העוזר
                <ArrowLeft className="h-4.5 w-4.5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Countdown({ now }: { now: number | null }) {
  if (now === null) return <div className="h-[150px]" />;
  const ms = QUIZ_AT - now;
  if (ms <= 0) return <h1 className="text-6xl font-extrabold tracking-tight sm:text-8xl">יום הבוחן. בהצלחה!</h1>;
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  return (
    <h1 className="flex flex-wrap items-baseline gap-x-4 font-extrabold tracking-tight">
      <span className="num text-[7rem] leading-[0.85] sm:text-[10rem]">{days}</span>
      <span className="text-5xl sm:text-7xl">{days === 1 ? "יום" : "ימים"}</span>
      <span className="w-full text-2xl font-bold text-muted sm:w-auto sm:text-3xl">ו-{hours} שעות</span>
    </h1>
  );
}

/** the ten hops drawn as a live route on the hero field, ending at the quiz station */
function TraceGraphic({ route, ready, answered }: { route: Hop[]; ready: number; answered: number }) {
  const W = 440;
  const H = 360;
  // a meandering route: two rows of five, joined like a transit line
  const pts = route.map((_, i) => {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const x = row === 0 ? 40 + col * 82 : 40 + (4 - col) * 82;
    const y = 70 + row * 120;
    return { x, y };
  });
  const end = { x: 40, y: 310 };
  const d = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p, i) => (i === 4 ? `C ${pts[4].x + 60} ${pts[4].y}, ${p.x + 60} ${p.y}, ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ") + ` C ${pts[9].x - 50} ${pts[9].y}, ${end.x - 40} ${end.y - 40}, ${end.x} ${end.y}`;
  const pct = Math.round(ready * 100);
  return (
    <figure className="rounded-xl border border-line bg-ground p-4 sm:p-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="מצב הנושאים במסלול לבוחן" direction="ltr">
        <path d={d} fill="none" stroke="var(--line-strong)" strokeWidth="3" strokeLinecap="round" />
        {route.map((h, i) => {
          const c = h.level === null ? "var(--line-strong)" : h.provisional ? "var(--muted)" : LEVEL_VAR[h.level];
          return (
            <g key={h.topic}>
              <circle cx={pts[i].x} cy={pts[i].y} r="13" fill="var(--surface)" stroke={c} strokeWidth="4" strokeDasharray={h.level === null ? "4 3" : undefined} />
              {h.level !== null && !h.provisional && <circle cx={pts[i].x} cy={pts[i].y} r="6" fill={c} />}
              <text x={pts[i].x} y={pts[i].y + 34} textAnchor="middle" fontSize="13" fill="var(--muted)" fontFamily="var(--font-ubuntu-mono)">
                {String(h.no).padStart(2, "0")}
              </text>
            </g>
          );
        })}
        <rect x={end.x - 16} y={end.y - 16} width="32" height="32" rx="7" fill="var(--ink)" />
        <rect x={end.x - 6} y={end.y - 6} width="12" height="12" rx="2" fill="var(--gold)" />
        <text x={end.x + 30} y={end.y - 2} fontSize="15" fontWeight="700" fill="var(--ink)" fontFamily="var(--font-heebo)">בוחן 1</text>
        <text x={end.x + 30} y={end.y + 18} fontSize="12" fill="var(--muted)" fontFamily="var(--font-heebo)">מוכנות משוערת</text>
        <text x={W - 10} y={end.y + 14} textAnchor="end" fontSize="52" fontWeight="700" fill={answered ? LEVEL_VAR[levelOf(ready)] : "var(--muted)"} fontFamily="var(--font-ubuntu-mono)">
          {answered ? `${pct}%` : "—"}
        </text>
      </svg>
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: LEVEL_VAR[0] }} /> שולט</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: LEVEL_VAR[2] }} /> בינוני</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: LEVEL_VAR[4] }} /> חלש</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full border border-dashed border-muted" /> עוד לא תרגלת</span>
      </figcaption>
    </figure>
  );
}
