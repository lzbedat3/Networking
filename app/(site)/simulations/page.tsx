"use client";

import { ArrowLeft, Clock, Flag, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDialog, { ConfirmSpec } from "@/components/ConfirmDialog";
import { SampleIcon, SimIcon } from "@/components/Icons";
import { EXAM_2026 } from "@/lib/bank";
import { EXAM_MINUTES, SIM_EXAMS } from "@/lib/exams";
import { LEVEL_VAR, levelOf } from "@/lib/mastery";
import { TOPICS, Topic } from "@/lib/types";
import { useProgress } from "@/lib/useProgress";

export default function SimulationsPage() {
  const router = useRouter();
  const { examStats } = useProgress();
  const [dialog, setDialog] = useState<ConfirmSpec | null>(null);

  const start = (no: number) => {
    const sim = SIM_EXAMS[no - 1];
    setDialog({
      title: `להתחיל את ${sim.title}?`,
      body: (
        <ul className="mt-1 space-y-1">
          <li>{sim.questions.length} שאלות, {EXAM_MINUTES} דקות על השעון.</li>
          <li>אפשר לדלג בין שאלות ולסמן לבדיקה חוזרת.</li>
          <li>בשאלות רב-ברירה, סימון שגוי מוריד ניקוד.</li>
          <li>העוזר מוסתר בזמן המבחן, כמו בבוחן האמיתי.</li>
        </ul>
      ),
      confirmLabel: "להתחיל את המבחן",
      cancelLabel: "לא עכשיו",
      tone: "primary",
      onConfirm: () => router.push(`/run?sim=${no}`),
    });
  };

  return (
    <main>
      <section className="bg-violet text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <SimIcon className="h-14 w-14" />
          <h1 className="mt-4 text-4xl font-extrabold sm:text-6xl">סימולציות</h1>
          <p className="mt-3 max-w-[56ch] text-lg text-white/80">שישה מבחנים קבועים שמכסים את כל החומר. כל אחד בנוי כמו הבוחן במחשבי האוניברסיטה.</p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-white/90">
            <li className="inline-flex items-center gap-2"><Clock className="h-5 w-5" aria-hidden /> {EXAM_MINUTES} דקות עם שעון</li>
            <li className="inline-flex items-center gap-2"><LayoutGrid className="h-5 w-5" aria-hidden /> מעבר חופשי בין שאלות</li>
            <li className="inline-flex items-center gap-2"><Flag className="h-5 w-5" aria-hidden /> סימון לבדיקה חוזרת</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SIM_EXAMS.map((ex) => {
            const rec = examStats[ex.id];
            const topics = [...new Set(ex.questions.map((q) => q.topic))] as Topic[];
            return (
              <button
                key={ex.id}
                onClick={() => start(ex.no)}
                className="group flex flex-col rounded-xl border border-line bg-surface p-6 text-right transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[var(--shadow)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="num text-6xl leading-none font-bold text-violet">S{ex.no}</span>
                  {rec ? (
                    <span className="text-left">
                      <span className="num block text-4xl leading-none font-bold" style={{ color: LEVEL_VAR[levelOf(rec.best / 100)] }}>
                        {rec.best}
                      </span>
                      <span className="text-xs text-muted">הכי טוב, {rec.attempts === 1 ? "ניסיון אחד" : `${rec.attempts} ניסיונות`}</span>
                    </span>
                  ) : (
                    <span className="rounded-md bg-violet-soft px-2.5 py-1 text-sm font-bold text-violet">חדש</span>
                  )}
                </div>
                <h2 className="mt-4 text-xl font-extrabold">{ex.title}</h2>
                <p className="text-muted">
                  {ex.questions.length} שאלות, {EXAM_MINUTES} דקות
                </p>
                <p className="mt-3 line-clamp-2 text-sm text-muted">{topics.map((t) => TOPICS[t]).join(", ")}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 font-bold text-violet">
                  {rec ? "לנסות שוב" : "להתחיל"}
                  <ArrowLeft className="h-4.5 w-4.5 transition-transform group-hover:-translate-x-1" aria-hidden />
                </span>
              </button>
            );
          })}
        </div>

        <Link href="/run?mode=sample" className="group mt-6 flex items-center gap-5 rounded-xl bg-amber p-6 text-amber-ink">
          <SampleIcon className="h-14 w-14 shrink-0" />
          <span className="flex-1">
            <span className="block text-2xl font-extrabold">בוחן לדוגמה</span>
            <span className="block text-amber-ink/80">{EXAM_2026.length} שאלות בסגנון הבוחן, בלי שעון, עם הסבר אחרי כל תשובה.</span>
          </span>
          <ArrowLeft className="h-6 w-6 transition-transform group-hover:-translate-x-1" aria-hidden />
        </Link>
      </section>
      <ConfirmDialog spec={dialog} onClose={() => setDialog(null)} />
    </main>
  );
}
