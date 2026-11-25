import { PAST_QUESTIONS } from ".";
import { Question, TOPIC_LABEL, Topic } from "../types";

export const NO_YEAR = "ללא שנה";

/** years in the bank, newest first; questions with no visible year are grouped last */
export function pastYears(): { year: string; count: number }[] {
  const m = new Map<string, number>();
  for (const q of PAST_QUESTIONS) m.set(q.year ?? NO_YEAR, (m.get(q.year ?? NO_YEAR) ?? 0) + 1);
  return [...m.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => (a.year === NO_YEAR ? 1 : b.year === NO_YEAR ? -1 : b.year.localeCompare(a.year)));
}

/** topics in the bank, in syllabus order */
export function pastTopics(): { topic: Topic; count: number }[] {
  const order = Object.keys(TOPIC_LABEL) as Topic[];
  return order
    .map((topic) => ({ topic, count: PAST_QUESTIONS.filter((q) => q.topic === topic).length }))
    .filter((t) => t.count > 0);
}

function rng(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 48271) % 2147483647) / 2147483647;
}

/** a timed exam drawn from the bank: up to 20 questions, spread across topics */
export function pastExam(seed: number, n = 20): Question[] {
  const r = rng(seed);
  const byTopic = new Map<Topic, Question[]>();
  for (const q of [...PAST_QUESTIONS].sort(() => r() - 0.5)) {
    if (!byTopic.has(q.topic)) byTopic.set(q.topic, []);
    byTopic.get(q.topic)!.push(q);
  }
  const pools = [...byTopic.values()];
  const out: Question[] = [];
  while (out.length < n && pools.some((p) => p.length)) for (const p of pools) if (out.length < n && p.length) out.push(p.shift()!);
  return out.sort(() => r() - 0.5);
}
