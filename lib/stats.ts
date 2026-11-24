export type QStat = { attempts: number; lastScore: number; wrongCount: number; lastAt?: number };
export type Stats = Record<string, QStat>;
export type ExamRecord = { best: number; last: number; attempts: number };
export type ExamStats = Record<string, ExamRecord>;

const KEY = "net-quiz-stats-v1";
const EXAM_KEY = "net-quiz-exams-v1";

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: progress just won't persist */
  }
}

export const loadStats = (): Stats => read<Stats>(KEY) ?? {};
export const loadExamStats = (): ExamStats => read<ExamStats>(EXAM_KEY) ?? {};

export function recordResult(id: string, score: number): Stats {
  const s = loadStats();
  const prev = s[id] ?? { attempts: 0, lastScore: 0, wrongCount: 0 };
  s[id] = { attempts: prev.attempts + 1, lastScore: score, wrongCount: prev.wrongCount + (score < 1 ? 1 : 0), lastAt: Date.now() };
  write(KEY, s);
  return s;
}

export function recordExam(id: string, pct: number): ExamStats {
  const s = loadExamStats();
  const prev = s[id];
  s[id] = { best: Math.max(prev?.best ?? 0, pct), last: pct, attempts: (prev?.attempts ?? 0) + 1 };
  write(EXAM_KEY, s);
  return s;
}

export function resetStats() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(EXAM_KEY);
  } catch {
    /* ignore */
  }
}
