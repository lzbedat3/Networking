"use client";

import { useEffect, useRef } from "react";

export type ConfirmSpec = {
  title: string;
  body?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => void;
};

/** Accessible confirm dialog: bottom sheet on phones, centred modal on wider screens. */
export default function ConfirmDialog({ spec, onClose }: { spec: ConfirmSpec | null; onClose: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!spec) return;
    const prev = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey, true);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [spec, onClose]);

  if (!spec) return null;
  const danger = spec.tone === "danger";
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="presentation">
      <div className="absolute inset-0 bg-[var(--scrim)]" onClick={onClose} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dlg-title"
        className="anim-sheet relative w-full max-w-md rounded-t-3xl border border-line bg-surface p-6 pb-safe shadow-2xl sm:rounded-3xl sm:pb-6"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line sm:hidden" />
        <h2 id="dlg-title" className="text-xl font-extrabold">{spec.title}</h2>
        {spec.body && <div className="mt-2 leading-relaxed text-muted">{spec.body}</div>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-start">
          <button
            ref={cancelRef}
            onClick={onClose}
            className="h-12 rounded-xl border border-line-strong px-5 font-semibold transition-colors hover:border-ink-2"
          >
            {spec.cancelLabel ?? "ביטול"}
          </button>
          <button
            onClick={() => {
              onClose();
              spec.onConfirm();
            }}
            className={`h-12 rounded-xl px-5 font-bold transition-opacity hover:opacity-90 ${danger ? "bg-l4 text-surface" : "bg-route text-route-ink"}`}
          >
            {spec.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
