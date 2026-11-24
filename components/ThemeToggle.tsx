"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Mode = "system" | "light" | "dark";
const KEY = "net-quiz-theme";

/** inline in <head>: applies the saved theme before first paint, so there is no flash */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");
  useEffect(() => {
    try {
      const t = localStorage.getItem(KEY);
      if (t === "light" || t === "dark") setMode(t);
    } catch {
      /* ignore */
    }
  }, []);

  const apply = (m: Mode) => {
    setMode(m);
    const el = document.documentElement;
    if (m === "system") delete el.dataset.theme;
    else el.dataset.theme = m;
    try {
      if (m === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, m);
    } catch {
      /* ignore */
    }
  };

  const opts: { m: Mode; label: string; Icon: typeof Sun }[] = [
    { m: "light", label: "בהיר", Icon: Sun },
    { m: "system", label: "לפי המכשיר", Icon: Monitor },
    { m: "dark", label: "כהה", Icon: Moon },
  ];
  return (
    <div role="radiogroup" aria-label="ערכת צבעים" className="inline-flex rounded-lg border border-line bg-sunken p-0.5">
      {opts.map(({ m, label, Icon }) => (
        <button
          key={m}
          role="radio"
          aria-checked={mode === m}
          aria-label={label}
          title={label}
          onClick={() => apply(m)}
          className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${mode === m ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
