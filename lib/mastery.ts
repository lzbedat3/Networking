import { ALL_QUESTIONS } from "./bank";
import { SIM_EXAMS } from "./exams";
import { ExamStats, Stats } from "./stats";
import { Question, TOPICS, TOPIC_LABEL, Topic } from "./types";

export const TOPIC_ORDER = Object.keys(TOPICS) as Topic[];

/** 0 = fast (mastered) … 4 = timeout (weak); null = never probed */
export type Level = 0 | 1 | 2 | 3 | 4;
export const LEVEL_VAR = ["var(--l0)", "var(--l1)", "var(--l2)", "var(--l3)", "var(--l4)"] as const;
export const LEVEL_LABEL = ["שולט", "טוב", "בינוני", "חלש", "צריך עבודה"] as const;

export function levelOf(score: number): Level {
  if (score >= 0.85) return 0;
  if (score >= 0.7) return 1;
  if (score >= 0.55) return 2;
  if (score >= 0.35) return 3;
  return 4;
}

/** mastery rendered as a round-trip time: strong topics answer fast, weak ones crawl */
export const latencyMs = (score: number) => Math.round(6 + Math.pow(1 - score, 1.5) * 480);

export type Hop = {
  topic: Topic;
  no: number;
  total: number;
  seen: number;
  score: number | null;
  level: Level | null;
  /** last three answers in this topic, newest last: like traceroute's three probes */
  probes: (number | null)[];
  /** fewer than MIN_EVIDENCE answers: show the level as provisional */
  provisional: boolean;
};

export const MIN_EVIDENCE = 3;

/** where each topic is taught in the course: the hop's "host" */
export const TOPIC_SOURCE: Partial<Record<Topic, string>> = {
  delays: "Tirgul 1, Ch.1",
  apps: "Tirgul 2, Ch.2",
  http: "Tirgul 2, Ch.2",
  cookies: "Tirgul 3",
  dns: "Tirgul 3, Lecture 3",
  transport: "Tirgul 4, Ch.3",
  rdt: "Ch.3 lecture",
  tcp: "Ch.3 lecture, SWS",
  congestion: "Ch.3 lecture",
  sockets: "Tirgul 4, 6",
};

export function hops(stats: Stats): Hop[] {
  return TOPIC_ORDER.map((t, i) => {
    const qs = ALL_QUESTIONS.filter((q) => q.topic === t);
    const seenQs = qs.filter((q) => stats[q.id]);
    const score = seenQs.length ? seenQs.reduce((a, q) => a + stats[q.id].lastScore, 0) / seenQs.length : null;
    const recent = seenQs
      .map((q) => stats[q.id])
      .sort((a, b) => (a.lastAt ?? 0) - (b.lastAt ?? 0))
      .slice(-3)
      .map((s) => s.lastScore);
    const probes = [...Array(3 - recent.length).fill(null), ...recent];
    return { topic: t, no: i + 1, total: qs.length, seen: seenQs.length, score, level: score === null ? null : levelOf(score), probes, provisional: seenQs.length < MIN_EVIDENCE };
  });
}

/** readiness: unseen topics count as 0, weighted by how many questions each topic has */
export function readiness(stats: Stats): number {
  const hs = hops(stats);
  const w = hs.reduce((a, h) => a + h.total, 0);
  return hs.reduce((a, h) => a + (h.score ?? 0) * h.total, 0) / w;
}

/** practice queue for a topic: never-answered first, then mistakes, then the rest */
export function topicQueue(topic: Topic | null, stats: Stats): Question[] {
  const pool = ALL_QUESTIONS.filter((q) => !topic || q.topic === topic);
  const rank = (q: Question) => (!stats[q.id] ? 0 : stats[q.id].lastScore < 1 ? 1 : 2);
  return [...pool].sort((a, b) => rank(a) - rank(b) || Math.random() - 0.5);
}

export type NextStep =
  | { kind: "real"; title: string; why: string }
  | { kind: "topic"; topic: Topic; title: string; why: string }
  | { kind: "sim"; simId: string; title: string; why: string };

export function nextStep(stats: Stats, exams: ExamStats): NextStep {
  const hs = hops(stats);
  if (Object.keys(stats).length === 0) {
    return { kind: "real", title: "להתחיל מהבוחן לדוגמה", why: "14 שאלות בסגנון הבוחן, עם הסבר אחרי כל אחת. ככה נדע מאיפה מתחילים." };
  }
  const weak = hs.filter((h) => h.score !== null && h.score < 0.7).sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];
  if (weak) {
    return { kind: "topic", topic: weak.topic, title: `לחזק: ${TOPIC_LABEL[weak.topic]}`, why: `הנושא הכי חלש שלך כרגע (${Math.round((weak.score ?? 0) * 100)}%). קודם שאלות שעוד לא ענית עליהן, ואז הטעויות.` };
  }
  const unseen = hs.find((h) => h.seen === 0);
  if (unseen) {
    return { kind: "topic", topic: unseen.topic, title: `נושא חדש: ${TOPIC_LABEL[unseen.topic]}`, why: `עוד לא תרגלת אותו. ${unseen.total} שאלות.` };
  }
  const untaken = SIM_EXAMS.find((s) => !exams[s.id]);
  if (untaken) {
    return { kind: "sim", simId: untaken.id, title: `${untaken.title}, ${untaken.questions.length} שאלות`, why: "הנושאים במצב טוב. הגיע הזמן לבדוק את עצמך מול השעון, כמו בבוחן." };
  }
  const worst = [...SIM_EXAMS].sort((a, b) => (exams[a.id]?.best ?? 0) - (exams[b.id]?.best ?? 0))[0];
  return { kind: "sim", simId: worst.id, title: `לחזור על ${worst.title}`, why: `הציון הכי נמוך שלך בסימולציות (${exams[worst.id]?.best ?? 0}). נסו לשפר אותו.` };
}
