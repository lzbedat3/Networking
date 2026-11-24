import { Fragment } from "react";

/**
 * Bidirectional text for mixed Hebrew / Arabic / English content.
 *
 * - Each line gets its own direction: RTL when it contains Hebrew or Arabic, LTR otherwise.
 * - Inside an RTL line, every Latin run (terms, numbers, formulas) is isolated in an LTR <bdi>,
 *   so punctuation, units and operators stay in reading order instead of jumping around.
 * - Short formulas stay inline as a chip; long ones (several "=" or several statements)
 *   move to their own left-to-right line, one statement per line.
 */

const RTL = /[֐-׿؀-ۿ]/;
const OPENERS: Record<string, string> = { "(": ")", "[": "]", '"': '"', "'": "'" };
const CLOSERS: Record<string, string> = { ")": "(", "]": "[", '"': '"', "'": "'" };
const MATH = /[=≈≤≥×→←]|\d\s*[+*/−-]\s*[\d(]|\)\s*[+*/−-]\s*\(/;

type Seg = { kind: "text"; s: string } | { kind: "latin"; s: string; math: boolean };

const count = (s: string, c: string) => s.split(c).length - 1;

/** trim boundary punctuation that belongs to the surrounding RTL sentence, keeping balanced pairs */
function trimRun(run: string): [string, string, string] {
  let a = 0;
  let b = run.length;
  for (;;) {
    const c = run[a];
    if (a >= b) break;
    if (c === " " || c === "-" || c === "," || c === ":" || c === ";" || c === "." ) {
      a++;
      continue;
    }
    if (c in OPENERS) {
      const inner = run.slice(a + 1, b);
      const close = OPENERS[c];
      if (close === c ? count(inner, c) % 2 === 1 : count(inner, close) > count(inner, c)) break;
      a++;
      continue;
    }
    break;
  }
  for (;;) {
    const c = run[b - 1];
    if (b <= a) break;
    if (c === " " || c === "," || c === ":" || c === ";" || c === "?" || c === "!" || c === "." || c === "-") {
      b--;
      continue;
    }
    if (c in CLOSERS) {
      const inner = run.slice(a, b - 1);
      const open = CLOSERS[c];
      if (open === c ? count(inner, c) % 2 === 1 : count(inner, open) > count(inner, c)) break;
      b--;
      continue;
    }
    break;
  }
  return [run.slice(0, a), run.slice(a, b), run.slice(b)];
}

/**
 * A parenthesis whose partner sits in the Hebrew text ("(תרגול 1): d = …") belongs to the sentence,
 * so the run is cut right after an unmatched ")" and right before an unmatched "(".
 */
function splitUnbalanced(run: string): string[] {
  const cuts = new Set<number>();
  const open: number[] = [];
  for (let i = 0; i < run.length; i++) {
    if (run[i] === "(") open.push(i);
    else if (run[i] === ")") {
      if (open.length) open.pop();
      else cuts.add(i + 1);
    }
  }
  for (const i of open) cuts.add(i);
  const out: string[] = [];
  let from = 0;
  for (const c of [...cuts].sort((a, b) => a - b)) {
    if (c > from) out.push(run.slice(from, c));
    from = c;
  }
  out.push(run.slice(from));
  return out.filter(Boolean);
}

export function segments(line: string): Seg[] {
  const out: Seg[] = [];
  // a run is everything between two RTL characters
  const re = /[^֐-׿؀-ۿ]+/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const push = (s: string) => {
    if (!s) return;
    const prev = out[out.length - 1];
    if (prev?.kind === "text") prev.s += s;
    else out.push({ kind: "text", s });
  };
  while ((m = re.exec(line))) {
    push(line.slice(last, m.index));
    for (const piece of splitUnbalanced(m[0])) {
      const [lead, core, tail] = trimRun(piece);
      push(lead);
      if (/[A-Za-z0-9α-ωΑ-Ω]/.test(core)) out.push({ kind: "latin", s: core, math: MATH.test(core) });
      else push(core);
      push(tail);
    }
    last = m.index + m[0].length;
  }
  push(line.slice(last));
  return out;
}

/** long formulas get their own lines, one statement each */
function isBlockMath(s: string) {
  return count(s, "=") + count(s, "≈") >= 3 || (s.length > 34 && /[=≈]/.test(s)) || /[=≈][^.]*\.\s+\S[^.]*[=≈]/.test(s);
}
function statements(s: string) {
  return s
    .split(/(?<=[^\d\s.])\.\s+|(?<=\d)\.\s+(?=[A-Za-z])|;\s+/)
    .flatMap(splitList)
    .map((x) => x.trim())
    .filter(Boolean);
}

/** "a = 1, b = 2, c = 3" → one assignment per line, when the line is long; commas inside parentheses stay */
function splitList(s: string): string[] {
  if (s.length <= 36) return [s];
  const parts: string[] = [];
  let depth = 0;
  let from = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (c === "," && depth === 0 && /^\s*[A-Za-z_][\w ]{0,30}?\s*[=≈]/.test(s.slice(i + 1)) && /[=≈]|\d/.test(s.slice(from, i))) {
      parts.push(s.slice(from, i));
      from = i + 1;
    }
  }
  parts.push(s.slice(from));
  return parts;
}

/** a statement that ends in an operator continues in the Hebrew text ("ACK = הבית הבא"), so it is not a formula line */
const standalone = (st: string) => MATH.test(st) && !/[=+\-−×/≈]\s*$/.test(st);

export function RtlInline({ line, givens = false }: { line: string; givens?: boolean }) {
  const segs = segments(line);
  // in a question prompt with several given values, each "x = y" goes on its own line
  // a given is lifted only when it is complete: followed by a comma, a period, "ו-" or the end, not by a Hebrew unit like "בתים"
  const liftable = (i: number) => {
    const g = segs[i];
    if (g.kind !== "latin" || !/[=≈]/.test(g.s) || /[=+\-−×/≈]\s*$/.test(g.s)) return false;
    const after = segs[i + 1];
    return !after || after.kind !== "text" || /^\s*(?:[,.;:?]|ו-?(?=\s|$)|$)/.test(after.s);
  };
  const liftSet = new Set(givens ? segs.map((_, i) => i).filter(liftable) : []);
  if (liftSet.size < 2) liftSet.clear();
  const nodes: (React.ReactNode | string[])[] = [];
  const blocks = new Map<number, string[]>();
  for (let i = 0; i < segs.length; i++) {
    const g = segs[i];
    if (g.kind === "text") {
      const between = blocks.has(nodes.length - 1) && liftSet.has(i + 1) && /^[\s,.;:]*(?:ו-?)?[\s,]*$/.test(g.s);
      nodes.push(between || !g.s ? null : <Fragment key={i}>{g.s}</Fragment>);
      continue;
    }
    const prev = segs[i - 1];
    const next = segs[i + 1];
    if (g.math && (isBlockMath(g.s) || liftSet.has(i))) {
      // punctuation that ended the formula would dangle once the formula moves to its own line
      // only the statements that are formulas move to the block; a plain phrase before or after stays in the sentence
      const sts = statements(g.s);
      const head: string[] = [];
      const tail: string[] = [];
      while (sts.length > 1 && !standalone(sts[0])) head.push(sts.shift()!);
      while (sts.length > 1 && !standalone(sts[sts.length - 1])) tail.unshift(sts.pop()!);
      // keep the punctuation that separated the plain phrase from the formula ("80 Mbps." / "80 Mbps,")
      if (head.length) {
        const last = head[head.length - 1];
        const sep = g.s.slice(g.s.indexOf(last) + last.length).match(/^\s*([.,;:])/)?.[1] ?? "";
        nodes.push(
          <span key={`${i}h`} className="whitespace-nowrap">
            <bdi dir="ltr" className="lat">
              {head.join(", ")}
            </bdi>
            {sep}{" "}
          </span>,
        );
      }
      if (next?.kind === "text") next.s = next.s.replace(/^[\s.,;:]+/, tail.length ? " " : "");
      const prevBlock = blocks.get(nodes.length - 1) ?? (nodes[nodes.length - 1] === null ? blocks.get(nodes.length - 2) : undefined);
      if (prevBlock) {
        // two formulas joined only by "ו-" or a comma share one block
        prevBlock.push(...sts);
      } else {
        blocks.set(nodes.length, sts);
        nodes.push(sts);
      }
      if (tail.length)
        nodes.push(
          <bdi key={`${i}t`} dir="ltr" className="lat">
            {tail.join(". ")}
          </bdi>,
        );
      continue;
    }
    // keep a Hebrew prefix ("ה-", "ו-", "כ-") and the following punctuation on the same line as the term
    let pre = "";
    let post = "";
    if (prev?.kind === "text") {
      const m = prev.s.match(/(?:^|\s)([֐-׿]{1,3}-)$/);
      if (m) {
        pre = m[1];
        const rest = prev.s.slice(0, prev.s.length - pre.length);
        nodes[nodes.length - 1] = rest ? <Fragment key={`${i - 1}r`}>{rest}</Fragment> : null;
      }
    }
    if (next?.kind === "text") {
      const m = next.s.match(/^[.,;:?!)]+/);
      if (m) {
        post = m[0];
        next.s = next.s.slice(post.length);
      }
    }
    const term = g.math ? (
      <bdi dir="ltr" className="fx">
        {g.s}
      </bdi>
    ) : (
      <bdi dir="ltr" className={g.s.length <= 24 ? "lat whitespace-nowrap" : "lat"}>
        {g.s}
      </bdi>
    );
    nodes.push(
      pre || post ? (
        <span key={i} className="whitespace-nowrap">
          {pre}
          {term}
          {post}
        </span>
      ) : (
        <Fragment key={i}>{term}</Fragment>
      ),
    );
  }
  return (
    <>
      {nodes.map((n, k) =>
        Array.isArray(n) ? (
          <span key={`b${k}`} dir="ltr" className="fx-block">
            {n.map((st, j) => (
              <span key={j} className="fx-st">
                {st}
              </span>
            ))}
          </span>
        ) : (
          n
        ),
      )}
    </>
  );
}

function LtrLine({ line }: { line: string }) {
  const math = MATH.test(line);
  if (math && isBlockMath(line))
    return (
      <span dir="ltr" className="fx-block">
        {statements(line).map((st, j) => (
          <span key={j} className="fx-st">
            {st}
          </span>
        ))}
      </span>
    );
  return (
    <span dir="ltr" className={`block text-left ${math ? "fx-line" : ""}`}>
      {line}
    </span>
  );
}

export type Marks = { ask: string[]; cond?: string[] };

/** cut a line into plain and marked pieces; longer phrases win when two overlap */
function markPieces(line: string, marks: Marks) {
  const hits: { a: number; b: number; kind: "ask" | "cond" }[] = [];
  const all = [...marks.ask.map((p) => ({ p, kind: "ask" as const })), ...(marks.cond ?? []).map((p) => ({ p, kind: "cond" as const }))].sort(
    (x, y) => y.p.length - x.p.length,
  );
  for (const { p, kind } of all) {
    if (!p) continue;
    for (let at = line.indexOf(p); at !== -1; at = line.indexOf(p, at + p.length)) {
      const end = at + p.length;
      if (!hits.some((h) => at < h.b && end > h.a)) hits.push({ a: at, b: end, kind });
    }
  }
  hits.sort((x, y) => x.a - y.a);
  const out: { s: string; kind?: "ask" | "cond" }[] = [];
  let from = 0;
  for (const h of hits) {
    if (h.a > from) out.push({ s: line.slice(from, h.a) });
    out.push({ s: line.slice(h.a, h.b), kind: h.kind });
    from = h.b;
  }
  if (from < line.length) out.push({ s: line.slice(from) });
  return out;
}

function Line({ line, givens, marks }: { line: string; givens: boolean; marks?: Marks }) {
  if (!RTL.test(line)) return <LtrLine line={line} />;
  if (!marks) return <RtlInline line={line} givens={givens} />;
  return (
    <>
      {markPieces(line, marks).map((pc, i) =>
        pc.kind ? (
          <mark key={i} className={pc.kind === "ask" ? "q-ask" : "q-cond"}>
            <RtlInline line={pc.s} />
          </mark>
        ) : (
          <RtlInline key={i} line={pc.s} givens={givens} />
        ),
      )}
    </>
  );
}

/**
 * Renders a string with per-line direction and isolated LTR runs. Use inside a block element.
 * `givens` lifts given values onto their own lines; `marks` underlines what the question asks and its key conditions.
 */
export default function BidiText({ text, givens = false, marks }: { text: string; givens?: boolean; marks?: Marks }) {
  const lines = text.split("\n");
  if (lines.length === 1) return <Line line={lines[0]} givens={givens} marks={marks} />;
  return (
    <>
      {lines.map((l, i) =>
        !l.trim() ? (
          <span key={i} className="block h-2" />
        ) : RTL.test(l) ? (
          <span key={i} dir="rtl" className="block">
            <Line line={l} givens={givens} marks={marks} />
          </span>
        ) : (
          <LtrLine key={i} line={l} />
        ),
      )}
    </>
  );
}

export const hasRtl = (s: string) => RTL.test(s);
