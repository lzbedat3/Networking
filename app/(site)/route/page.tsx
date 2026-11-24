"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDialog, { ConfirmSpec } from "@/components/ConfirmDialog";
import RouteView from "@/components/RouteView";
import { EXAM_MINUTES, SIM_EXAMS } from "@/lib/exams";
import { resetStats } from "@/lib/stats";
import { useProgress } from "@/lib/useProgress";

export default function RoutePage() {
  const router = useRouter();
  const { stats, examStats, mistakes, refresh } = useProgress();
  const [dialog, setDialog] = useState<ConfirmSpec | null>(null);

  return (
    <>
      <RouteView
        stats={stats}
        examStats={examStats}
        mistakesCount={mistakes.length}
        onTopic={(t) => router.push(t ? `/run?mode=topic&t=${t}` : "/run?mode=mixed")}
        onReal={() => router.push("/run?mode=sample")}
        onMistakes={() => router.push("/run?mode=mistakes")}
        onSim={(id) => {
          const sim = SIM_EXAMS.find((s) => s.id === id)!;
          setDialog({
            title: `להתחיל את ${sim.title}?`,
            body: (
              <ul className="mt-1 space-y-1">
                <li>{sim.questions.length} שאלות, {EXAM_MINUTES} דקות על השעון.</li>
                <li>אפשר לדלג בין שאלות ולסמן לבדיקה חוזרת.</li>
                <li>בשאלות רב-ברירה, סימון שגוי מוריד ניקוד.</li>
              </ul>
            ),
            confirmLabel: "להתחיל את המבחן",
            cancelLabel: "לא עכשיו",
            tone: "primary",
            onConfirm: () => router.push(`/run?sim=${sim.no}`),
          });
        }}
        onReset={() =>
          setDialog({
            title: "לאפס את כל ההתקדמות?",
            body: <p>יימחקו הציונים של כל השאלות ושל הסימולציות במכשיר הזה. אי אפשר לשחזר אותם.</p>,
            confirmLabel: "לאפס הכול",
            cancelLabel: "להשאיר",
            tone: "danger",
            onConfirm: () => {
              resetStats();
              refresh();
            },
          })
        }
      />
      <ConfirmDialog spec={dialog} onClose={() => setDialog(null)} />
    </>
  );
}
