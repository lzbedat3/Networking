import { ALL_QUESTIONS } from "./bank";
import { Question } from "./types";

export const EXAM_MINUTES = 90;

export type SimExam = { id: string; no: number; title: string; questions: Question[] };

// small deterministic PRNG so every simulation always has the same questions (retakes are comparable)
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SIZES = [18, 15, 20, 16, 22, 17];

function build(no: number, size: number): SimExam {
  const rnd = mulberry32(no * 7919);
  const pools = new Map<string, Question[]>();
  for (const q of seededShuffle(ALL_QUESTIONS, rnd)) {
    if (!pools.has(q.topic)) pools.set(q.topic, []);
    pools.get(q.topic)!.push(q);
  }
  // round-robin over topics so every exam covers the whole syllabus
  const order = seededShuffle([...pools.values()], rnd);
  const picked: Question[] = [];
  while (picked.length < size) {
    for (const p of order) {
      if (picked.length >= size) break;
      const q = p.shift();
      if (q) picked.push(q);
    }
  }
  return { id: `sim${no}`, no, title: `סימולציה ${no}`, questions: seededShuffle(picked, rnd) };
}

export const SIM_EXAMS: SimExam[] = SIZES.map((n, i) => build(i + 1, n));
