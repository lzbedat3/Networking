"use client";

import { Diagram as DiagramSpec } from "@/lib/types";
import { RtlInline, hasRtl } from "./BidiText";
import Diagram from "./Diagram";

/**
 * Renderer for tutor replies: paragraphs, lists, headings, **bold**, `code`,
 * real tables (GFM pipe tables), ```diagram {json}``` → native diagrams, ```svg``` → drawings.
 */
export default function Markdown({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = text.split("\n");
  let i = 0;
  let key = 0;
  const isTableRow = (l: string) => /^\s*\|.*\|\s*$/.test(l);
  const isListItem = (l: string) => /^\s*([-*•]|\d+[.)])\s+/.test(l);

  while (i < lines.length) {
    const line = lines[i];

    // fenced blocks
    const fence = line.trim().match(/^```\s*([\w-]*)/);
    if (fence) {
      const lang = fence[1].toLowerCase();
      const body: string[] = [];
      i++;
      let closed = false;
      while (i < lines.length) {
        if (lines[i].trim().startsWith("```")) {
          closed = true;
          i++;
          break;
        }
        body.push(lines[i++]);
      }
      const src = body.join("\n");
      if (lang === "diagram" || lang === "svg") {
        blocks.push(closed ? <Visual key={key++} lang={lang} src={src} /> : <Drawing key={key++} />);
      } else {
        blocks.push(
          <pre key={key++} dir="ltr" className="my-2 overflow-x-auto rounded-lg bg-code p-3 text-left font-mono text-[13px] leading-relaxed">
            {src}
          </pre>,
        );
      }
      continue;
    }

    // tables
    if (isTableRow(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const rows: string[][] = [];
      const cells = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const head = cells(line);
      i += 2;
      while (i < lines.length && isTableRow(lines[i])) rows.push(cells(lines[i++]));
      blocks.push(<Table key={key++} head={head} rows={rows} />);
      continue;
    }

    if (isListItem(line)) {
      const ordered = /^\s*\d+[.)]/.test(line);
      const start = ordered ? parseInt(line.trim(), 10) : undefined;
      const items: string[] = [];
      while (i < lines.length && isListItem(lines[i])) items.push(lines[i++].replace(/^\s*([-*•]|\d+[.)])\s+/, ""));
      const L = ordered ? "ol" : "ul";
      blocks.push(
        <L key={key++} start={start} className={`my-1.5 space-y-1 pr-5 ${ordered ? "list-decimal" : "list-disc"}`}>
          {items.map((it, j) => (
            <li key={j}>{inline(it)}</li>
          ))}
        </L>,
      );
      continue;
    }
    const h = line.match(/^#{1,4}\s+(.*)/);
    if (h) {
      blocks.push(<p key={key++} className="mt-3 mb-1 font-bold">{inline(h[1])}</p>);
      i++;
      continue;
    }
    if (!line.trim()) {
      i++;
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !isListItem(lines[i]) && !lines[i].trim().startsWith("```") && !/^#{1,4}\s/.test(lines[i]) && !isTableRow(lines[i]))
      para.push(lines[i++]);
    if (!para.length) {
      // stray table-looking line without a separator: show as text
      para.push(lines[i++]);
    }
    blocks.push(
      <p key={key++} className="my-1.5">
        {para.map((p, j) => (
          <span key={j} dir={hasRtl(p) ? "rtl" : "ltr"} className={`block ${hasRtl(p) ? "" : "text-left"}`}>
            {inline(p)}
          </span>
        ))}
      </p>,
    );
  }
  return <div className="leading-relaxed">{blocks}</div>;
}

const HEBREW = /[֐-׿]/;

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="my-3 overflow-x-auto rounded-xl border border-line">
      <table className="w-full border-collapse text-[0.92rem]">
        <thead className="bg-sunken">
          <tr>
            {head.map((c, j) => (
              <th key={j} className="border-b border-line px-3 py-2 text-right font-bold whitespace-nowrap">
                {inline(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, k) => (
            <tr key={k} className="border-b border-line last:border-b-0 even:bg-ground/50">
              {head.map((_, j) => (
                <td key={j} dir={HEBREW.test(r[j] ?? "") ? "rtl" : "auto"} className="px-3 py-2 align-top">
                  {inline(r[j] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Drawing() {
  return (
    <div className="my-3 flex h-28 items-center justify-center rounded-xl border border-dashed border-line-strong text-sm text-muted">
      <span className="anim-probe">משרטט…</span>
    </div>
  );
}

function Visual({ lang, src }: { lang: string; src: string }) {
  if (lang === "svg") {
    // rendered as an <img>, so scripts inside the SVG can never run
    const svg = src.trim().startsWith("<svg") ? src.trim() : "";
    if (!svg) return <Broken />;
    const withNs = svg.includes("xmlns=") ? svg : svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    return (
      <figure className="my-3 overflow-hidden rounded-xl border border-line bg-white p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/svg+xml;utf8,${encodeURIComponent(withNs)}`} alt="שרטוט" className="mx-auto block max-h-[520px] w-full object-contain" />
      </figure>
    );
  }
  try {
    const spec = JSON.parse(src) as DiagramSpec;
    if (!spec || !["seq", "tree", "delay", "cwnd"].includes(spec.kind)) return <Broken />;
    return (
      <div className="my-3">
        <Diagram d={spec} />
      </div>
    );
  } catch {
    return <Broken />;
  }
}

function Broken() {
  return <p className="my-2 rounded-lg bg-l4-soft px-3 py-2 text-sm text-l4">השרטוט לא הצליח להיטען.</p>;
}

function inline(s: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  // inside a Hebrew line, Latin runs and formulas are isolated so they keep their own order
  const rtl = hasRtl(s);
  const text = (t: string) => (rtl ? <RtlInline key={`t${k++}`} line={t} /> : t);
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(text(s.slice(last, m.index)));
    const t = m[0];
    if (t.startsWith("**")) out.push(<strong key={k++}>{t.slice(2, -2)}</strong>);
    else
      out.push(
        <code key={k++} dir="ltr" className="rounded bg-code px-1 py-0.5 font-mono text-[0.88em]">
          {t.slice(1, -1)}
        </code>,
      );
    last = m.index + t.length;
  }
  if (last < s.length) out.push(text(s.slice(last)));
  return out;
}
