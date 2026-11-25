/* Authored icons for the route world: one 24px grid, 1.75 stroke, round joins. */

type P = React.SVGProps<SVGSVGElement>;
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Course assistant: a conversation bubble carrying a small network, three nodes on one route */
export function AssistantIcon(p: P) {
  return (
    <svg {...base} {...p} aria-hidden>
      <path d="M4.5 5.5h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-4.2 3.2a.6.6 0 0 1-.96-.48V17.5H4.5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
      <path d="M8 13.5 12 9.5l4 4" />
      <circle cx="8" cy="13.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="9.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="16" cy="13.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Ask for a hint: a node sending a probe, echo arcs coming back */
export function HintIcon(p: P) {
  return (
    <svg {...base} {...p} aria-hidden>
      <circle cx="7" cy="17" r="2.4" />
      <path d="M10.5 13.5a5 5 0 0 1 0 7" transform="rotate(-45 7 17)" />
      <path d="M13.5 10.5a9.2 9.2 0 0 1 0 13" transform="rotate(-45 7 17)" />
      <path d="M15.5 4.5h4v4" />
      <path d="M19.5 4.5 14 10" />
    </svg>
  );
}

/** Route mark: two stations on a line */
export function RouteIcon(p: P) {
  return (
    <svg {...base} {...p} aria-hidden>
      <circle cx="6" cy="5.5" r="2.5" />
      <rect x="15.5" y="16" width="5" height="5" rx="1.2" fill="currentColor" stroke="none" />
      <path d="M6 8v4.5a3 3 0 0 0 3 3h6.5" />
    </svg>
  );
}

/** Home: a station building with a flag */
export function HomeIcon(p: P) {
  return (
    <svg {...base} {...p} aria-hidden>
      <path d="M3.5 10.5 12 4l8.5 6.5" />
      <path d="M5.5 9v10.5h13V9" />
      <path d="M10 19.5v-5h4v5" />
    </svg>
  );
}

/** Simulation: a stopwatch whose face is a route arc */
export function SimIcon(p: P) {
  return (
    <svg {...base} {...p} aria-hidden>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M10 3h4M12 3v3" />
      <path d="M12 13.5 15.5 10" />
      <circle cx="12" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
      <path d="M18.5 6.5 20 5" />
    </svg>
  );
}

/** Sample quiz: an exam sheet with a filled answer bubble */
export function SampleIcon(p: P) {
  return (
    <svg {...base} {...p} aria-hidden>
      <path d="M6.5 3h8l4 4v13.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V3.5A.5.5 0 0 1 6.5 3Z" />
      <path d="M14.5 3v4h4" />
      <circle cx="9.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="16.5" r="1.3" />
      <path d="M12.5 12h3.5M12.5 16.5h3.5" />
    </svg>
  );
}

/** Practice mix: two crossing routes */
export function MixIcon(p: P) {
  return (
    <svg {...base} {...p} aria-hidden>
      <path d="M3.5 7h4c3 0 4 10 7 10h6" />
      <path d="M3.5 17h4c3 0 4-10 7-10h6" />
      <path d="m18 4.5 2.5 2.5L18 9.5M18 14.5l2.5 2.5-2.5 2.5" />
    </svg>
  );
}

/** Mistakes review: a dropped packet with a retry arrow */
export function RetryIcon(p: P) {
  return (
    <svg {...base} {...p} aria-hidden>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M4 3.5v3.7h3.7" />
      <path d="m10 10 4 4M14 10l-4 4" />
    </svg>
  );
}

/** Past-years bank: an archive box with stacked exam sheets */
export function ArchiveIcon(p: P) {
  return (
    <svg {...base} {...p} aria-hidden>
      <path d="M7 9V4.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5V9" />
      <path d="M9.5 6.5h5" />
      <path d="M3.5 9h17v10.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V9Z" />
      <path d="M9.5 13h5" />
      <path d="M5 9 7 7.5M19 9l-2-1.5" />
    </svg>
  );
}
