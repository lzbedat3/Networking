"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ALL_QUESTIONS } from "./bank";
import { ExamStats, Stats, loadExamStats, loadStats } from "./stats";

/** progress lives in localStorage; every page reads it through this hook */
export function useProgress() {
  const [stats, setStats] = useState<Stats>({});
  const [examStats, setExamStats] = useState<ExamStats>({});
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setStats(loadStats());
    setExamStats(loadExamStats());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onStorage);
    };
  }, [refresh]);

  const mistakes = useMemo(() => ALL_QUESTIONS.filter((q) => stats[q.id] && stats[q.id].lastScore < 1), [stats]);
  return { stats, examStats, mistakes, refresh, ready };
}
