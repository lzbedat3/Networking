export type Topic =
  | "delays"
  | "apps"
  | "http"
  | "cookies"
  | "dns"
  | "transport"
  | "rdt"
  | "tcp"
  | "congestion"
  | "sockets";

export const TOPICS: Record<Topic, string> = {
  delays: "השהיות וחישובי זמן",
  apps: "שכבת האפליקציה ושכבות",
  http: "HTTP",
  cookies: "Cookies ו-Proxy",
  dns: "DNS",
  transport: "שכבת התעבורה, UDP ו-Mux",
  rdt: "העברה אמינה: Stop&Wait ו-GBN",
  tcp: "TCP: Seq/ACK, טיימרים, Flow",
  congestion: "בקרת עומס",
  sockets: "תכנות Sockets",
};

/** each topic borrows one of Wireshark's default coloring rules */
export const TOPIC_COLOR: Record<Topic, { bg: string; fg: string }> = {
  delays: { bg: "var(--ws-routing)", fg: "var(--ws-ink)" },
  apps: { bg: "var(--ws-arp)", fg: "var(--ws-ink)" },
  http: { bg: "var(--ws-http)", fg: "var(--ws-ink)" },
  cookies: { bg: "var(--ws-smb)", fg: "var(--ws-ink)" },
  dns: { bg: "var(--ws-udp)", fg: "var(--ws-ink)" },
  transport: { bg: "var(--ws-icmp)", fg: "var(--ws-ink)" },
  rdt: { bg: "var(--ws-syn)", fg: "var(--ws-ink)" },
  tcp: { bg: "var(--ws-tcp)", fg: "var(--ws-ink)" },
  congestion: { bg: "var(--ws-bad-bg)", fg: "var(--ws-bad-fg)" },
  sockets: { bg: "#e0f2f1", fg: "var(--ws-ink)" },
};

export type Option = {
  text: string;
  correct: boolean;
  /** why this option is right / wrong */
  why: string;
};

export type Table = { headers: string[]; rows: string[][]; filter?: string };

export type Img = { src: string; alt: string; caption?: string };

/** arrow between two hosts (R = left→right, L = right→left), or a side note */
export type SeqStep =
  | { dir: "R" | "L"; label: string; lost?: boolean; dim?: boolean }
  | { note: string; side: "L" | "R" | "C"; tone?: "bad" | "good" | "muted" };

export type Diagram =
  | { kind: "seq"; left: string; right: string; steps: SeqStep[]; caption?: string }
  | {
      kind: "tree";
      nodes: { id: string; label: string; sub?: string; x: number; y: number; tone?: "accent" | "good" | "muted" }[];
      edges: [string, string][];
      caption?: string;
    }
  | { kind: "delay"; procA: string; trans: string; prop: string; procB: string; total?: string; caption?: string }
  | { kind: "cwnd"; values: number[]; thresholds?: { from: number; to: number; value: number }[]; caption?: string };

export type Question = {
  id: string;
  topic: Topic;
  /** "exam2026" = taken from the real past quiz */
  source: "exam2026" | "practice";
  multi?: boolean;
  prompt: string;
  code?: string;
  table?: Table;
  /** extra context lines shown LTR (headers, captures, etc.) */
  pre?: string;
  /** screenshots shown with the question (like in the real quiz) */
  images?: Img[];
  /** drawn diagram shown with the question */
  diagram?: Diagram;
  /** drawn diagram shown only after answering, as part of the explanation */
  explainDiagram?: Diagram;
  explainImages?: Img[];
  options: Option[];
  /** the big-picture explanation shown after answering */
  explanation: string;
};

export const o = (text: string, correct: boolean, why: string): Option => ({ text, correct, why });
