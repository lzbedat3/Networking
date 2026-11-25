import { Question } from "./types";
import { exam2026 } from "./questions/exam2026";
import { appQuestions } from "./questions/app";
import { transportQuestions } from "./questions/transport";
import { PAST_QUESTIONS } from "./past";

export const ALL_QUESTIONS: Question[] = [...exam2026, ...appQuestions, ...transportQuestions];
export const EXAM_2026 = exam2026;
export { PAST_QUESTIONS };

/** any question, from either bank */
export const findQuestion = (id: string | null | undefined) =>
  id ? (ALL_QUESTIONS.find((q) => q.id === id) ?? PAST_QUESTIONS.find((q) => q.id === id)) : undefined;

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Moodle-style scoring: single = all or nothing; multi = (right picks / #right) − (wrong picks / #wrong), floored at 0. */
export function scoreQuestion(q: Question, picked: number[]): number {
  const correctIdx = q.options.map((op, i) => (op.correct ? i : -1)).filter((i) => i >= 0);
  if (!q.multi) return picked.length === 1 && q.options[picked[0]].correct ? 1 : 0;
  const nRight = correctIdx.length;
  const nWrong = q.options.length - nRight;
  const right = picked.filter((i) => q.options[i].correct).length;
  const wrong = picked.length - right;
  const s = right / nRight - (nWrong ? wrong / nWrong : 0);
  return Math.max(0, Math.round(s * 100) / 100);
}

/** Simulated quiz: 14 questions, spread across topics, always mixing in some real-exam ones. */
export function buildSimulation(n = 14): Question[] {
  const byTopic = new Map<string, Question[]>();
  for (const q of shuffle(ALL_QUESTIONS)) {
    if (!byTopic.has(q.topic)) byTopic.set(q.topic, []);
    byTopic.get(q.topic)!.push(q);
  }
  const picked: Question[] = [];
  const pools = shuffle([...byTopic.values()]);
  while (picked.length < n && pools.some((p) => p.length)) {
    for (const p of pools) {
      if (picked.length >= n) break;
      const q = p.shift();
      if (q) picked.push(q);
    }
  }
  return shuffle(picked);
}
