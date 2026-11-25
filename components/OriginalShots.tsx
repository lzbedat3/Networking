"use client";

import { ChevronDown, ImageIcon, Maximize2 } from "lucide-react";
import { useState } from "react";

/** Past-years bank: show / hide the original photo(s) of the question under its transcribed text. */
export default function OriginalShots({ srcs }: { srcs: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-line bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-right font-semibold text-ink-2 transition-colors hover:text-ink"
      >
        <ImageIcon className="h-5 w-5 shrink-0 text-route" aria-hidden />
        <span className="flex-1">{open ? "הסתרת השאלה המקורית" : "הצגת השאלה המקורית"}</span>
        <span className="text-sm font-normal text-muted">{srcs.length > 1 ? `${srcs.length} תמונות` : "תמונה"}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div className="anim-reveal space-y-3 border-t border-line p-3">
          <p className="text-sm text-muted">כך השאלה הופיעה במקור. סימונים בתמונה לא בהכרח נכונים.</p>
          {srcs.map((src, i) => (
            <a key={src} href={src} target="_blank" rel="noreferrer" className="group relative block overflow-hidden rounded-lg border border-line bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`השאלה המקורית${srcs.length > 1 ? `, תמונה ${i + 1}` : ""}`} loading="lazy" className="mx-auto block max-h-[70vh] w-full object-contain" />
              <span className="absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-lg bg-surface/90 text-ink-2 opacity-0 shadow transition-opacity group-hover:opacity-100">
                <Maximize2 className="h-4 w-4" aria-hidden />
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
