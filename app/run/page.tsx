"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Results from "@/components/Results";
import Runner, { Finished, Session } from "@/components/Runner";
import { ALL_QUESTIONS, EXAM_2026, PAST_QUESTIONS, findQuestion, scoreQuestion, shuffle } from "@/lib/bank";
import { pastExam } from "@/lib/past/sets";
import { EXAM_MINUTES, SIM_EXAMS } from "@/lib/exams";
import { topicQueue } from "@/lib/mastery";
import { loadStats, recordExam } from "@/lib/stats";
import { Question, TOPICS, TOPIC_LABEL, Topic } from "@/lib/types";

/**
 * /run?mode=topic&t=dns · /run?mode=mixed · /run?mode=mistakes · /run?mode=sample · /run?sim=1 · /run?q=<id>
 * past-years bank: /run?bank=past&mode=all|new|mistakes|exam · &mode=topic&t=… · &mode=year&y=…
 */
function buildSession(p: URLSearchParams): { session: Session; back: string } | null {
  const stats = loadStats();
  const q = findQuestion(p.get("q"));
  if (q) return { session: { kind: "practice", title: "תרגול", questions: [q] }, back: q.source === "past" ? "/past" : "/route" };
  if (p.get("bank") === "past") return buildPast(p, stats);
  const sim = SIM_EXAMS.find((s) => s.id === `sim${p.get("sim")}`);
  if (sim) return { session: { kind: "exam", title: sim.title, questions: sim.questions, examId: sim.id, minutes: EXAM_MINUTES }, back: "/simulations" };
  const mode = p.get("mode");
  if (mode === "sample") return { session: { kind: "practice", title: "בוחן לדוגמה", questions: EXAM_2026 }, back: "/" };
  if (mode === "mixed") return { session: { kind: "practice", title: "תרגול מעורב", questions: topicQueue(null, stats) }, back: "/route" };
  if (mode === "mistakes") {
    const ms = ALL_QUESTIONS.filter((x) => stats[x.id] && stats[x.id].lastScore < 1);
    return ms.length ? { session: { kind: "practice", title: "חזרה על טעויות", questions: shuffle(ms) }, back: "/route" } : null;
  }
  const t = p.get("t") as Topic | null;
  if (mode === "topic" && t && t in TOPICS) return { session: { kind: "practice", title: TOPIC_LABEL[t], questions: topicQueue(t, stats) }, back: "/route" };
  return null;
}

function buildPast(p: URLSearchParams, stats: ReturnType<typeof loadStats>): { session: Session; back: string } | null {
  const back = "/past";
  const mode = p.get("mode");
  const practice = (title: string, qs: Question[]) => (qs.length ? { session: { kind: "practice" as const, title, questions: qs }, back } : null);
  if (mode === "all") return practice("מאגר שנים קודמות", shuffle(PAST_QUESTIONS));
  if (mode === "new") return practice("שאלות שעוד לא פתרת", shuffle(PAST_QUESTIONS.filter((x) => !stats[x.id])));
  if (mode === "mistakes") return practice("טעויות במאגר שנים קודמות", shuffle(PAST_QUESTIONS.filter((x) => stats[x.id] && stats[x.id].lastScore < 1)));
  if (mode === "topic") {
    const t = p.get("t") as Topic | null;
    if (t && t in TOPIC_LABEL) return practice(`שנים קודמות: ${TOPIC_LABEL[t]}`, shuffle(PAST_QUESTIONS.filter((x) => x.topic === t)));
  }
  if (mode === "year") {
    const y = p.get("y");
    if (y) return practice(`שנים קודמות: ${y}`, PAST_QUESTIONS.filter((x) => (x.year ?? "ללא שנה") === y));
  }
  if (mode === "exam") {
    const qs = pastExam(Number(p.get("seed")) || Date.now());
    return qs.length ? { session: { kind: "exam", title: "מבחן משנים קודמות", questions: qs, minutes: EXAM_MINUTES }, back } : null;
  }
  return null;
}

function RunInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<{ session: Session; back: string; key: number; result?: Finished } | null>(null);

  useEffect(() => {
    const built = buildSession(new URLSearchParams(params.toString()));
    if (!built) {
      router.replace("/");
      return;
    }
    setState({ ...built, key: Date.now() });
    window.scrollTo({ top: 0 });
  }, [params, router]);

  if (!state) return <div className="min-h-dvh" />;
  const { session, back } = state;

  if (state.result) {
    return (
      <Results
        session={session}
        result={state.result}
        onHome={() => router.push(back)}
        onRetry={() => {
          const again = session.kind === "practice" && !session.examId ? { ...session, questions: shuffle(session.questions) } : session;
          setState({ session: again, back, key: Date.now() });
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  return (
    <Runner
      key={state.key}
      session={session}
      onStatsChange={() => {}}
      onExit={() => router.push(back)}
      onFinish={(result) => {
        if (session.examId) {
          const pct = Math.round((session.questions.reduce((a, qq, i) => a + scoreQuestion(qq, result.answers[i]), 0) / session.questions.length) * 100);
          recordExam(session.examId, pct);
        }
        setState((s) => (s ? { ...s, result } : s));
        window.scrollTo({ top: 0 });
      }}
    />
  );
}

export default function RunPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <RunInner />
    </Suspense>
  );
}
