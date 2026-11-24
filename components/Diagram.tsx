"use client";

import { Diagram as D, SeqStep } from "@/lib/types";
import BidiText from "./BidiText";

const INK = "var(--ink)";
const MUTED = "var(--muted)";
const BAD = "var(--bad)";
const GOOD = "var(--good)";
const ACCENT = "var(--accent)";
const CARD = "var(--surface)";

function Frame({ children, caption, w, h }: { children: React.ReactNode; caption?: string; w: number; h: number }) {
  return (
    <figure className="rounded-2xl border border-line bg-surface p-3">
      <div className="-mx-1 overflow-x-auto px-1" dir="ltr">
      <svg direction="ltr" viewBox={`0 0 ${w} ${h}`} className="mx-auto block w-full" style={{ maxWidth: w }} role="img" aria-label={caption}>
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={INK} />
          </marker>
          <marker id="arr-dim" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={MUTED} />
          </marker>
        </defs>
        {children}
      </svg>
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-xs leading-relaxed text-muted">
          <BidiText text={caption} />
        </figcaption>
      )}
    </figure>
  );
}

const label = (x: number, y: number, text: string, color = INK, anchor: "middle" | "start" | "end" = "middle", size = 15) => (
  <text
    x={x}
    y={y}
    textAnchor={anchor}
    fontSize={size}
    fontFamily="var(--font-ubuntu-mono), ui-monospace, monospace"
    fill={color}
    stroke={CARD}
    strokeWidth={4}
    paintOrder="stroke"
  >
    {text}
  </text>
);

function Seq({ left, right, steps, caption }: { left: string; right: string; steps: SeqStep[]; caption?: string }) {
  const W = 460;
  const xL = 100;
  const xR = 360;
  let y = 58;
  const items: React.ReactNode[] = [];
  steps.forEach((s, i) => {
    if ("note" in s) {
      const color = s.tone === "bad" ? BAD : s.tone === "good" ? GOOD : s.tone === "muted" ? MUTED : ACCENT;
      // side margins fit ~24 chars; longer notes go centred (each note has its own row, so nothing overlaps)
      const side = [...s.note].length > 12 ? "C" : s.side;
      const x = side === "L" ? xL - 12 : side === "R" ? xR + 12 : (xL + xR) / 2;
      const anchor = side === "L" ? "end" : side === "R" ? "start" : "middle";
      items.push(<g key={i}>{label(x, y + 4, s.note, color, anchor, 14)}</g>);
      y += 26;
      return;
    }
    const toRight = s.dir === "R";
    const x0 = toRight ? xL : xR;
    const x1 = toRight ? xR : xL;
    const y0 = y;
    const y1 = y + 30;
    const color = s.lost ? BAD : s.dim ? MUTED : INK;
    if (s.lost) {
      const t = 0.62;
      const xm = x0 + (x1 - x0) * t;
      const ym = y0 + (y1 - y0) * t;
      items.push(
        <g key={i}>
          <line x1={x0} y1={y0} x2={xm} y2={ym} stroke={BAD} strokeWidth={1.8} />
          <path d={`M${xm - 8},${ym - 8} L${xm + 8},${ym + 8} M${xm + 8},${ym - 8} L${xm - 8},${ym + 8}`} stroke={BAD} strokeWidth={2.5} />
          {label((x0 + xm) / 2, (y0 + ym) / 2 - 6, s.label, BAD)}
        </g>,
      );
    } else {
      items.push(
        <g key={i}>
          <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={color} strokeWidth={1.8} markerEnd={s.dim ? "url(#arr-dim)" : "url(#arr)"} />
          {label((x0 + x1) / 2, (y0 + y1) / 2 - 6, s.label, color)}
        </g>,
      );
    }
    y += 44;
  });
  const H = y + 10;
  return (
    <Frame caption={caption} w={W} h={H}>
      <text x={xL} y={22} textAnchor="middle" fontSize={14} fontWeight={700} fill={INK}>{left}</text>
      <text x={xR} y={22} textAnchor="middle" fontSize={14} fontWeight={700} fill={INK}>{right}</text>
      <line x1={xL} y1={34} x2={xL} y2={H - 6} stroke={INK} strokeWidth={3} />
      <line x1={xR} y1={34} x2={xR} y2={H - 6} stroke={INK} strokeWidth={3} />
      {items}
      <text x={W - 8} y={H - 8} textAnchor="end" fontSize={11} fill={MUTED}>time ↓</text>
    </Frame>
  );
}

function Tree({ nodes, edges, caption }: Extract<D, { kind: "tree" }>) {
  const W = Math.max(...nodes.map((n) => n.x)) + Math.max(...nodes.map((n) => Math.max(n.label.length, n.sub?.length ?? 0) * 4.5 + 14));
  const H = Math.max(...nodes.map((n) => n.y)) + 46;
  const pos = new Map(nodes.map((n) => [n.id, n]));
  return (
    <Frame caption={caption} w={W} h={H}>
      {edges.map(([a, b]) => {
        const A = pos.get(a)!;
        const B = pos.get(b)!;
        return <line key={a + b} x1={A.x} y1={A.y + 16} x2={B.x} y2={B.y - 16} stroke={MUTED} strokeWidth={1.5} />;
      })}
      {nodes.map((n) => {
        const fill = n.tone === "accent" ? "var(--accent-soft)" : n.tone === "good" ? "var(--good-soft)" : "var(--code-bg)";
        const stroke = n.tone === "accent" ? ACCENT : n.tone === "good" ? GOOD : "var(--line)";
        const w = Math.max(n.label.length, n.sub?.length ?? 0) * 9 + 22;
        return (
          <g key={n.id}>
            <rect x={n.x - w / 2} y={n.y - 16} width={w} height={n.sub ? 40 : 32} rx={8} fill={fill} stroke={stroke} strokeWidth={1.5} />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={15} fontFamily="var(--font-ubuntu-mono), monospace" fill={INK}>{n.label}</text>
            {n.sub && <text x={n.x} y={n.y + 19} textAnchor="middle" fontSize={12} fill={MUTED}>{n.sub}</text>}
          </g>
        );
      })}
    </Frame>
  );
}

function Delay({ procA, trans, prop, procB, total, caption }: Extract<D, { kind: "delay" }>) {
  const W = 470;
  const xA = 140;
  const xB = 320;
  const t0 = 50, t1 = 95, t2 = 150, shift = 95;
  const t3 = t2 + shift, t4 = t3 + 45;
  const H = t4 + 40;
  const brace = (x: number, ya: number, yb: number, text: string, side: "L" | "R", color = ACCENT) => {
    const dx = side === "L" ? -10 : 10;
    return (
      <g>
        <path d={`M${x},${ya} L${x + dx},${ya} L${x + dx},${yb} L${x},${yb}`} fill="none" stroke={color} strokeWidth={1.5} />
        {label(x + dx * 1.6, (ya + yb) / 2 + 4, text, color, side === "L" ? "end" : "start", 15)}
      </g>
    );
  };
  return (
    <Frame caption={caption} w={W} h={H}>
      <text x={xA} y={22} textAnchor="middle" fontSize={14} fontWeight={700} fill={INK}>Host A</text>
      <text x={xB} y={22} textAnchor="middle" fontSize={14} fontWeight={700} fill={INK}>Host B</text>
      <line x1={xA} y1={34} x2={xA} y2={H - 8} stroke={INK} strokeWidth={3} />
      <line x1={xB} y1={34} x2={xB} y2={H - 8} stroke={INK} strokeWidth={3} />
      <rect x={xA - 9} y={t0} width={18} height={t1 - t0} fill="var(--flag-soft)" stroke={MUTED} />
      <polygon points={`${xA},${t1} ${xA},${t2} ${xB},${t2 + shift} ${xB},${t1 + shift}`} fill="var(--accent-soft)" stroke={ACCENT} strokeWidth={1.2} />
      {label((xA + xB) / 2, (t1 + t2 + shift) / 2 + 4, "packet", ACCENT, "middle", 14)}
      <rect x={xB - 9} y={t3} width={18} height={t4 - t3} fill="var(--flag-soft)" stroke={MUTED} />
      {brace(xA - 12, t0, t1, procA, "L")}
      {brace(xA - 12, t1, t2, trans, "L")}
      {brace(xB + 12, t1, t1 + shift, prop, "R")}
      {brace(xB + 12, t3, t4, procB, "R")}
      <line x1={xA} y1={t1} x2={xB} y2={t1 + shift} stroke={ACCENT} strokeDasharray="4 3" />
      {total && label(W / 2, H - 10, total, GOOD, "middle", 14)}
    </Frame>
  );
}

function Cwnd({ values, thresholds, caption }: Extract<D, { kind: "cwnd" }>) {
  const W = 440, H = 280;
  const pl = 36, pr = 10, pt = 16, pb = 44;
  const maxY = Math.ceil((Math.max(...values) + 2) / 4) * 4;
  const n = values.length;
  const x = (i: number) => pl + ((i - 0.5) * (W - pl - pr)) / n;
  const y = (v: number) => pt + (1 - v / maxY) * (H - pt - pb);
  const ticks = Array.from({ length: maxY / 4 + 1 }, (_, i) => i * 4);
  return (
    <Frame caption={caption} w={W} h={H}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="var(--line)" />
          <text x={pl - 8} y={y(t) + 4} textAnchor="end" fontSize={13} fill={MUTED}>{t}</text>
        </g>
      ))}
      {values.map((_, i) => (
        <text key={i} x={x(i + 1)} y={H - pb + 16} textAnchor="middle" fontSize={13} fill={MUTED}>{i + 1}</text>
      ))}
      <text x={(W + pl) / 2} y={H - 6} textAnchor="middle" fontSize={12} fill={MUTED}>Transmission round</text>
      <text x={14} y={H / 2} textAnchor="middle" fontSize={12} fill={MUTED} transform={`rotate(-90 14 ${H / 2})`}>cwnd (MSS)</text>
      {thresholds?.map((t, i) => (
        <g key={i}>
          <line x1={x(t.from) - 8} x2={x(t.to) + 8} y1={y(t.value)} y2={y(t.value)} stroke={BAD} strokeDasharray="5 4" />
          {label(x(t.to) + 10, y(t.value) - 4, `ssthresh=${t.value}`, BAD, "end", 13)}
        </g>
      ))}
      <polyline points={values.map((v, i) => `${x(i + 1)},${y(v)}`).join(" ")} fill="none" stroke={ACCENT} strokeWidth={2.2} />
      {values.map((v, i) => (
        <g key={i}>
          <circle cx={x(i + 1)} cy={y(v)} r={4} fill={ACCENT} />
          {label(x(i + 1), y(v) - 9, String(v), INK, "middle", 12.5)}
        </g>
      ))}
    </Frame>
  );
}

export default function Diagram({ d }: { d: D }) {
  if (d.kind === "seq") return <Seq {...d} />;
  if (d.kind === "tree") return <Tree {...d} />;
  if (d.kind === "delay") return <Delay {...d} />;
  return <Cwnd {...d} />;
}
