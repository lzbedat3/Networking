"use client";

import { ArrowLeft, CircleDashed, Clock, Shuffle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import ConfirmDialog, { ConfirmSpec } from "@/components/ConfirmDialog";
import { ArchiveIcon, RetryIcon } from "@/components/Icons";
import { EXAM_MINUTES } from "@/lib/exams";
import { LEVEL_VAR, levelOf } from "@/lib/mastery";
import { PAST_QUESTIONS } from "@/lib/past";
import { NO_YEAR, pastTopics, pastYears } from "@/lib/past/sets";
import { TOPIC_LABEL } from "@/lib/types";
import { useProgress } from "@/lib/useProgress";

export default function PastPage() {
  const router = useRouter();
  const { stats, ready } = useProgress();
  const [dialog, setDialog] = useState<ConfirmSpec | null>(null);

  const total = PAST_QUESTIONS.length;
  const done = PAST_QUESTIONS.filter((q) => stats[q.id]);
  const wrong = done.filter((q) => stats[q.id].lastScore < 1);
  const fresh = total - done.length;
  const avg = done.length ? Math.round((done.reduce((a, q) => a + stats[q.id].lastScore, 0) / done.length) * 100) : null;
  const topics = useMemo(pastTopics, []);
  const years = useMemo(pastYears, []);
  const examSize = Math.min(20, total);

  const startExam = () =>
    setDialog({
      title: "להתחיל מבחן משנים קודמות?",
      body: (
        <ul className="mt-1 space-y-1">
          <li>
            {examSize} שאלות אקראיות מהמאגר, מכל הנושאים, {EXAM_MINUTES} דקות על השעון.
          </li>
          <li>כל התחלה מגרילה מבחן חדש.</li>
          <li>רמזים מתחת לכל שאלה ועוזר הקורס בבועה זמינים גם כאן.</li>
        </ul>
      ),
      confirmLabel: "להתחיל",
      cancelLabel: "לא עכשיו",
      tone: "primary",
      onConfirm: () => router.push(`/run?bank=past&mode=exam&seed=${Date.now()}`),
    });

  return (
    <main>
      <section className="bg-field text-field-ink">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <ArchiveIcon className="h-14 w-14 text-gold" />
          <h1 className="mt-4 text-4xl font-extrabold sm:text-6xl">שנים קודמות</h1>
          <p className="mt-3 max-w-[58ch] text-lg text-field-ink/80">
            מאגר נפרד של שאלות ממבחנים ובחנים של 2020 עד 2025. ההתקדמות כאן לא נכנסת למסלול ולסימולציות.
          </p>
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            <Stat label="שאלות במאגר" value={total} />
            <Stat label="פתרת" value={ready ? done.length : "·"} />
            <Stat label="ממוצע" value={ready && avg !== null ? `${avg}%` : "·"} />
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/run?bank=past&mode=all" className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 font-bold text-ink">
              <Shuffle className="h-5 w-5" aria-hidden />
              לתרגל את כל המאגר
            </Link>
            <button
              onClick={startExam}
              disabled={!total}
              className="inline-flex items-center gap-2 rounded-xl border border-field-ink/25 px-5 py-3 font-bold hover:bg-white/5 disabled:opacity-40"
            >
              <Clock className="h-5 w-5" aria-hidden />
              מבחן אקראי, {EXAM_MINUTES} דקות
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-4 md:grid-cols-2">
          <Tile
            href={fresh ? "/run?bank=past&mode=new" : undefined}
            icon={<CircleDashed className="h-8 w-8" aria-hidden />}
            tone="bg-route-soft text-route"
            title="שאלות שעוד לא פתרת"
            body={fresh ? `${fresh} שאלות מחכות.` : "פתרת את כל המאגר."}
          />
          <Tile
            href={wrong.length ? "/run?bank=past&mode=mistakes" : undefined}
            icon={<RetryIcon className="h-8 w-8" />}
            tone="bg-l4-soft text-l4"
            title="חזרה על טעויות"
            body={wrong.length ? `${wrong.length} שאלות שטעית בהן בניסיון האחרון.` : "כשתטעו בשאלה מהמאגר היא תחכה כאן."}
          />
        </div>

        <h2 className="mt-12 text-2xl font-extrabold sm:text-3xl">לפי נושא</h2>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map(({ topic, count }) => {
            const solved = PAST_QUESTIONS.filter((q) => q.topic === topic && stats[q.id]);
            const score = solved.length ? solved.reduce((a, q) => a + stats[q.id].lastScore, 0) / solved.length : null;
            return (
              <Link
                key={topic}
                href={`/run?bank=past&mode=topic&t=${topic}`}
                className="group flex items-center gap-4 rounded-xl border border-line bg-surface px-4 py-3.5 transition-shadow hover:shadow-[var(--shadow)]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{TOPIC_LABEL[topic]}</span>
                  <span className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-sunken" aria-hidden>
                    <span
                      className="h-full"
                      style={{ width: `${(solved.length / count) * 100}%`, background: score === null ? "var(--line-strong)" : LEVEL_VAR[levelOf(score)] }}
                    />
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    {ready ? solved.length : 0} מתוך {count}
                  </span>
                </span>
                <ArrowLeft className="h-5 w-5 text-muted transition-transform group-hover:-translate-x-1" aria-hidden />
              </Link>
            );
          })}
        </div>

        {years.length > 1 && (
          <>
            <h2 className="mt-12 text-2xl font-extrabold sm:text-3xl">לפי שנה</h2>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {years.map(({ year, count }) => (
                <Link
                  key={year}
                  href={`/run?bank=past&mode=year&y=${encodeURIComponent(year)}`}
                  className="rounded-xl border border-line bg-surface px-4 py-2.5 font-bold transition-colors hover:border-route hover:text-route"
                >
                  <span className={year === NO_YEAR ? "" : "num"}>{year}</span>
                  <span className="mr-2 text-sm font-normal text-muted">{count}</span>
                </Link>
              ))}
            </div>
          </>
        )}

        <h2 className="mt-12 text-2xl font-extrabold sm:text-3xl">כל השאלות</h2>
        <p className="mt-1 text-muted">כל ריבוע הוא שאלה. הצבע מראה את התוצאה האחרונה שלך.</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {PAST_QUESTIONS.map((q, i) => {
            const s = ready ? stats[q.id] : undefined;
            return (
              <Link
                key={q.id}
                href={`/run?q=${q.id}`}
                title={`${i + 1}. ${TOPIC_LABEL[q.topic]}`}
                aria-label={`שאלה ${i + 1}, ${TOPIC_LABEL[q.topic]}${s ? `, ציון אחרון ${Math.round(s.lastScore * 100)}%` : ", לא נפתרה"}`}
                className="num flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-transform hover:scale-105"
                style={
                  s
                    ? { background: LEVEL_VAR[levelOf(s.lastScore)], color: "white" }
                    : { background: "var(--surface)", boxShadow: "inset 0 0 0 1px var(--line-strong)", color: "var(--muted)" }
                }
              >
                {i + 1}
              </Link>
            );
          })}
        </div>
      </section>
      <ConfirmDialog spec={dialog} onClose={() => setDialog(null)} />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-field-ink/70">{label}</dt>
      <dd className="num text-4xl font-bold">{value}</dd>
    </div>
  );
}

function Tile({ href, icon, tone, title, body }: { href?: string; icon: React.ReactNode; tone: string; title: string; body: string }) {
  const inner = (
    <>
      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${tone}`}>{icon}</span>
      <span className="flex-1">
        <span className="block text-xl font-extrabold">{title}</span>
        <span className="block text-muted">{body}</span>
      </span>
      {href && <ArrowLeft className="h-5 w-5 text-muted transition-transform group-hover:-translate-x-1" aria-hidden />}
    </>
  );
  const cls = "group flex items-center gap-4 rounded-xl border border-line bg-surface p-5";
  return href ? (
    <Link href={href} className={`${cls} transition-shadow hover:shadow-[var(--shadow)]`}>
      {inner}
    </Link>
  ) : (
    <div className={`${cls} opacity-70`}>{inner}</div>
  );
}
