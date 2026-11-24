"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Results from "@/components/Results";
import Runner, { Finished, Session } from "@/components/Runner";
import { ALL_QUESTIONS, EXAM_2026, scoreQuestion, shuffle } from "@/lib/bank";
import { EXAM_MINUTES, SIM_EXAMS } from "@/lib/exams";
import { topicQueue } from "@/lib/mastery";
import { loadStats, recordExam } from "@/lib/stats";
import { TOPICS, Topic } from "@/lib/types";

/** /run?mode=topic&t=dns · /run?mode=mixed · /run?mode=mistakes · /run?mode=sample · /run?sim=1 · /run?q=<id> */
function buildSession(p: URLSearchParams): { session: Session; back: string } | null {
  const stats = loadStats();
  const q = ALL_QUESTIONS.find((x) => x.id === p.get("q"));
  if (q) return { session: { kind: "practice", title: "תרגול", questions: [q] }, back: "/route" };
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
  if (mode === "topic" && t && t in TOPICS) return { session: { kind: "practice", title: TOPICS[t], questions: topicQueue(t, stats) }, back: "/route" };
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
