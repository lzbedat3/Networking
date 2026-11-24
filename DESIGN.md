---
name: מסלול לבוחן (Data Communications Quiz Practice)
description: A Hebrew RTL quiz trainer drawn as a traceroute to Quiz 1, where every weak topic shows up as latency.
colors:
  ground: "#f3f5f8"
  surface: "#ffffff"
  sunken: "#eaeef3"
  ink: "#0e1a2b"
  ink-2: "#33435a"
  muted: "#627189"
  line: "#dde3eb"
  line-strong: "#c3ccd8"
  route: "#0b63ce"
  route-ink: "#ffffff"
  route-soft: "#e3edfb"
  latency-0-fast: "#1d8a55"
  latency-1: "#5a9e35"
  latency-2: "#b97f0e"
  latency-3: "#d65523"
  latency-4-timeout: "#c2362b"
  latency-0-soft: "#e1f2e8"
  latency-2-soft: "#fbf0d9"
  latency-4-soft: "#fbe5e2"
  code-bg: "#eef1f5"
typography:
  display:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "clamp(5.5rem, 12vw, 7.5rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.025em"
    fontFeature: "\"tnum\" 1"
  headline:
    fontFamily: "Heebo, Calibri, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.33
  title:
    fontFamily: "Heebo, Calibri, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.4
  prompt:
    fontFamily: "Heebo, Calibri, system-ui, sans-serif"
    fontSize: "clamp(1.2rem, 2.2vw, 1.35rem)"
    fontWeight: 600
    lineHeight: 1.7
  body:
    fontFamily: "Heebo, Calibri, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    fontFeature: "\"tnum\" 1"
  meta:
    fontFamily: "Heebo, Calibri, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label-mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "-0.01em"
    fontFeature: "\"tnum\" 1"
rounded:
  chip: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  sheet: "24px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  page-x: "16px"
  page-x-wide: "24px"
  control: "40px"
  control-lg: "48px"
  column: "768px"
components:
  button-primary:
    backgroundColor: "{colors.route}"
    textColor: "{colors.route-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "48px"
  button-commit:
    backgroundColor: "{colors.latency-0-fast}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "48px"
  button-continue:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "48px"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "48px"
  button-header:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "40px"
  next-hop-row:
    backgroundColor: "{colors.route}"
    textColor: "{colors.route-ink}"
    rounded: "{rounded.md}"
    padding: "16px 4px"
  hop-row:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 4px"
  hop-row-next:
    backgroundColor: "{colors.route-soft}"
  answer-option:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  answer-option-picked:
    backgroundColor: "{colors.route-soft}"
  answer-option-hit:
    backgroundColor: "{colors.latency-0-soft}"
  answer-option-wrong:
    backgroundColor: "{colors.latency-4-soft}"
  chip-suggestion:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  input-chat:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  sheet:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sheet}"
    padding: "24px"
---

# Design System: מסלול לבוחן

## Overview

**Creative North Star: "Traceroute to the Quiz"**

The app is drawn as `tracert` output on cool paper. The ten syllabus topics are hops on one vertical route line. Each hop sends three probes (the student's last three answers) and reports a round-trip time: strong topics answer fast and weak topics crawl. Topics the student hasn't touched yet are dashed and read `* * *`, like a timed-out hop. The route ends at a station, "בוחן 1", where the six simulations sit along the last segment. Results put the same latency colors on every question. One geometry and one color ramp encode state on every screen.

It is an operating tool for one student in the last days before a quiz, so density is moderate. A single 768px column holds the content, every row is tappable, and the screen leads with a large countdown and one full-width next action instead of a dashboard. The interface is Hebrew right-to-left. Technical material (TCP, Seq/ACK, code, captures) sits in left-to-right islands set in mono.

The world rejects a greeting header, a "continue" card, and grids of progress-bar cards. Readiness reads down the route line, not across tiles.

**Key Characteristics:**
- A cool paper ground (#f3f5f8) with navy ink (#0e1a2b) and one route blue (#0b63ce) for action and the current position.
- One 5-step latency ramp, from fast green to timeout red, that encodes every mastery, score, and verdict state.
- Heebo for words. Tabular Geist Mono only for latency, hop numbers, timers, scores, and protocol data.
- Flat surfaces separated by hairlines and tonal steps. Shadows appear only on sheets that float above a scrim.
- Light and dark themes that share the same token names.

## Colors

The palette is a quiet cool neutral that carries one blue for action and one warm-to-cool ramp for state. Light values are canonical. Dark values swap in under `prefers-color-scheme: dark` with the same names (see the sidecar).

### Primary
- **Route Blue** (#0b63ce; dark #4d9bf2): the route itself. It fills the next-hop row and primary buttons, colors links and the active answer, and supplies the focus ring, text selection, caret, and the current-question dot on the progress rail. Nothing decorative uses it.
- **Route Ink** (#ffffff; dark #06101d): text and icons placed on Route Blue.
- **Route Soft** (#e3edfb; dark #13294a): the picked-answer fill, the highlight on the recommended hop row, and the tint on the tutor panel.

### Latency Ramp (state)
- **Fast** (#1d8a55): mastered, correct, full score, and the submit-exam commit button.
- **Good** (#5a9e35): solid but not mastered.
- **Middling** (#b97f0e): borderline. It also marks exam flags, the timer below 10 minutes, the 2026 quiz row, and the tutor's "reveal answer" action.
- **Weak** (#d65523): weak.
- **Timeout** (#c2362b): needs work, wrong picks, the timer below 5 minutes, and destructive actions (reset progress).
- **Soft fills** (#e1f2e8 fast, #fbf0d9 middling, #fbe5e2 timeout): option backgrounds after reveal, the timer warning, and the 2026 row.

Thresholds come from `levelOf` in `lib/mastery.ts`: at least 0.85 is Fast, 0.70 Good, 0.55 Middling, 0.35 Weak, and anything lower is Timeout. Latency in ms is `6 + (1 − score)^1.5 × 480`.

Good, Middling, and Weak are deliberately darker than the direction contract's hexes (#5fa33a / #c98a12 / #dc5b26) because they are also used as text. On the light ground they reach about 3.0 (Good), 3.2 (Middling), and 3.7 (Weak) to 1. That clears the 3:1 bar for graphics and large text only. It does not clear 4.5:1 for body text (see Do's and Don'ts). In dark mode every ramp step is above 6:1.

### Neutral
- **Cool Paper** (#f3f5f8; dark #0a111c): the page ground. Hop rows sit directly on it.
- **Surface** (#ffffff; dark #111b2a): headers, answer options, sheets, chat bubbles, and row hover.
- **Sunken** (#eaeef3; dark #0d1622): the explanation panel, empty probe slots, unanswered result chips, and table heads.
- **Navy Ink** (#0e1a2b; dark #e7edf5): primary text. It also draws the station segment of the route and the simulation platform nodes, and fills the "continue" button and the active filter tab.
- **Ink 2** (#33435a): secondary prose (explanations, the subline under the countdown).
- **Muted** (#627189; 4.5:1 on ground): metadata, hop numbers, column heads, and the `* * *` timeout mark.
- **Line** (#dde3eb) / **Line Strong** (#c3ccd8): hairline dividers and borders. Line Strong also draws the untested route segments and outlined controls.
- **Code** (#eef1f5): background for `pre` blocks and diagram nodes.
- **Scrim** (rgb(9 16 28 / 0.55); dark 0.7): behind sheets and dialogs.

### Scoped: Wireshark coloring rules
The `--ws-*` tokens (TCP #e7e6ff, HTTP #e4ffc7, UDP/DNS #daeeff, bad #12272e on #f78787, ink #12272e, and others) appear **only inside capture tables**. They copy Wireshark's default coloring rules so that a capture looks the way it does in the tool. The capture chrome uses fixed light greys in both themes for the same reason.

### Named Rules
**The One Ramp Rule.** Mastery, score, verdict, and urgency are all drawn from the five latency steps and their soft fills. Never add a second status palette.

**The Route Is Blue Rule.** Route Blue means "where you are and what to do next": the current hop, the picked answer, the primary action, and focus. Don't use it for decoration or for status.

**The Capture Island Rule.** Wireshark colors live only inside capture tables. They never leave them and never theme.

## Typography

**Body Font:** Heebo (fallbacks Calibri, system-ui, sans-serif), with Hebrew and Latin subsets.
**Data Font:** Geist Mono (fallbacks ui-monospace, monospace).

**Character:** Heebo is a sturdy Hebrew sans that carries every word at weights from 400 to 800. Geist Mono marks anything that is a measurement or a protocol: it is the voice of terminal output. The body sets `tabular-nums` globally so numbers inside Hebrew also line up.

### Hierarchy
- **Display** (Geist Mono 800, 5.5rem rising to 7.5rem at sm, line-height 0.9, tight tracking): the countdown number. On results, the score uses 6rem rising to 8rem and is colored by its latency level. Next to the countdown, the Hebrew unit is Heebo 800 at 2.25rem rising to 3.75rem, and the hours are Heebo 700 Muted at 1.5rem rising to 1.875rem.
- **Headline** (Heebo 800, 1.5rem): section heads such as "המסלול שלך".
- **Title** (Heebo 800, 1.25rem): sheet and dialog titles, the station name, and results section heads. Hop and simulation names use Heebo 700 at 1rem, and the next-hop title uses 1.125rem rising to 1.25rem.
- **Prompt** (Heebo 600, 1.2rem rising to 1.35rem, line-height 1.7, max 68ch): the question text.
- **Body** (Heebo 400, 1rem, relaxed leading, max 62 to 70ch): explanations and descriptions.
- **Meta** (Heebo 400, 0.875rem, Muted): hop metadata and helper lines.
- **Label Mono** (Geist Mono 600, 0.75rem, Muted): the column heads `hop / probes / rtt`, hop numbers, topic sources such as "Tirgul 2, Ch.2", and keyboard hints.

### Named Rules
**The Mono Means Data Rule.** Geist Mono is used only for numbers and protocol text: latency, hop and question numbers, timers, scores, percentages, source references, code, and captures. Hebrew words are never set in mono.

**The LTR Island Rule.** Any English or technical run inside RTL text gets `dir="ltr"`. Options with no Hebrew in them switch to left-aligned medium weight.

## Layout

There is one centered column, 768px wide (`max-w-3xl`), with 16px side padding that grows to 24px at sm. The home screen stacks a countdown, the route, and secondary links. The question runner stacks a sticky 56px header with a question-progress rail, the question, and a fixed bottom action bar. Main content keeps 160px of bottom padding so the fixed bar never covers it, and the bar respects the safe-area inset (at least 12px).

The route is a 5-column grid: hop number (2rem) | node (1.75rem) | body (flexible) | probes (auto) | rtt (5.5rem). Below sm the rtt column is dropped and its value moves into the probes column. Column gaps are 12px. The route line is a 3px rail positioned through the center of the node column. Its x position is calculated from the grid, so every row, including the next-hop row, the hops, the station, and the simulations, shares one axis.

Spacing follows a 4px step. Rows use 12px vertical padding (16px for the next-hop row). Sections are separated by 40px. Controls are 40px tall in headers and 48px in the action bar and sheets. Sheets are bottom sheets on phones and become centered modals at sm. The course assistant becomes a full-height side panel at sm.

## Elevation & Depth

The system is flat at rest. Depth comes from tonal steps: Sunken sits below Ground, which sits below Surface. Hairline borders (Line) and a translucent Surface with backdrop blur separate the sticky header and bottom bar. A shadow appears only where a layer floats over a scrim: bottom sheets, modal dialogs, and the assistant panel use the framework's largest shadow. The image-expand affordance uses a small hover shadow.

### Shadow Vocabulary
- **Sheet** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)`): bottom sheets, dialogs, and the assistant panel, always over the Scrim.
- **Defined but unused** (`--shadow: 0 1px 2px rgb(14 26 43 / 0.06), 0 8px 24px -12px rgb(14 26 43 / 0.18)`): no component reads this token yet.

### Named Rules
**The Float-Only Shadow Rule.** Rows, options, and panels never cast shadows. Only a layer that sits over a scrim gets one.

## Shapes

Corners are gently curved, with a 12px radius on almost everything a finger presses: rows, buttons, options, inputs, figures, and code blocks. Panels (the explanation, tutor, and review cards) use 16px. Sheets use 24px on their top corners on phones and on all four corners as modals. Small inner pieces use 8px, and result chips use 6px. Pills are reserved for suggestion chips, the score badge, and the legend.

The route has its own glyph set:
- A hop node is a 16px ring with a 3px border. It is filled with its latency color when the level is established, hollow and Muted while provisional, and dashed in Line Strong when the topic is untested.
- The next-hop node is Route Blue with a halo.
- The station is a 28px navy rounded square holding the route icon.
- Simulation platforms are 12px navy squares with 3px corners.
- A probe is an 8×20px bar, colored by its level or left as an empty Sunken slot.

Answer markers are circles for single choice and 6px-rounded squares for multiple choice. Unanswered states use a dashed border, as in "correct, not picked" options and empty result chips.

## Components

### Buttons
- **Shape:** gently curved (12px). They are 48px tall in action bars and sheets and 40px in headers. Every button has a lucide line icon of 16 to 20px.
- **Primary:** Route Blue with Route Ink text, weight 700, 24px horizontal padding. Hover lowers opacity to 0.9. Disabled lowers it to 0.35.
- **Commit:** Fast green with Surface text. Used only to submit an exam, the final "send the packet" action.
- **Continue:** Navy Ink with Surface text. Used for "next question" after a reveal.
- **Outline:** Surface background, a 1px Line Strong border, and weight 600. On hover the border shifts to Ink 2 (Route Blue on header buttons).
- **Danger:** Timeout red with Surface text, used only inside confirm dialogs. The inline reset is a red text link.
- **Focus:** a 2.5px Route Blue outline offset by 2px, applied globally.

### Next-hop Row (signature)
The first row on the route is a full-width Route Blue button. It shows hop `00`, a haloed node, the recommended action and why it was chosen, and a Route Ink "להתחיל" pill with an arrow. On hover the pill nudges 2px toward the arrow. It is the only saturated block on the home screen.

### Hop Row (signature)
This is a transparent row on Ground that gains Surface on hover. When the row is the recommended topic it rests on Route Soft. It shows a mono hop number, a node, the topic name over meta (mono source · count · level label), three probe bars, and an rtt value: bold in the latency color with a Muted "ms" when established, "~N ms" in Muted while provisional, and a widely tracked Muted `* * *` when untested. The rail segment entering a hop takes that hop's color. Probes and rtt fade up with a stagger of 120ms plus 70ms per row.

### Answer Option
- **Style:** full-width, 12px radius, 2px border, 12 to 16px padding, with a 28px marker that shows its number (1 to 9) in mono.
- **States:** idle is Surface with a Line border and a Route-tinted hover. Picked is a Route border on Route Soft with a filled marker. Hit is a Fast border on Fast Soft with a check. Missed is a dashed Fast border on Surface. Wrong is a Timeout border on Timeout Soft with an X. Neutral sits at 75% opacity. After reveal, each option shows a bold verdict in its ramp color followed by the reason in Ink 2.

### Chips
- **Suggestion:** a pill with a Line Strong border on Surface and 14px text. On hover the border and text turn Route Blue.
- **Result chip:** a 28px mono number in a 6px-rounded square, filled with its latency color and Surface text. If unanswered it is Sunken with an inset Line Strong ring.
- **Score badge:** a pill on Surface with its text in the latency color.

### Cards / Containers
- **Explanation panel:** Sunken, 16px radius, 16 to 20px padding, no border, with a Middling lightbulb icon.
- **Tutor panel:** Route Soft at 50% with a Route border at 25%, 16px radius, and a 40px Route icon tile.
- **Review card:** Surface with a Line border, 16px radius, and 16 to 24px padding.
- **Shadow Strategy:** none (see Elevation).

### Inputs / Fields
- **Style:** a textarea, at least 48px tall, on Surface with a 1px Line Strong border and 12px radius.
- **Focus:** the border turns Route Blue and a 2px Route ring at 20% appears.

### Navigation
- **Header:** 56px, Surface at 80 to 95% opacity with backdrop blur and a bottom Line border. Holds the route icon, the app name, and outline actions.
- **Question rail:** a 2px Line Strong track with a Route Blue fill showing progress, and dots for each question. A dot is filled Route when answered, filled with its ramp color after a practice reveal, and Middling when flagged in an exam. The current dot is 14px with a Route halo.
- **Bottom bar:** fixed, Surface at 95% with blur and a top Line border. Holds previous (48px square), flag, and the primary action at the far end.
- **Timer:** a mono bold pill on Sunken. It turns Middling Soft at 10 minutes and solid Timeout at 5 minutes.

### Capture Table (signature)
This is a Wireshark replica, laid out left-to-right in mono at 11.5px. It has a filter bar (green when a filter is applied) and rows tinted by Wireshark's default coloring rules. It is always light, in both themes.

### Motion
- **Sheet up:** 240ms, `cubic-bezier(0.16, 1, 0.3, 1)`, rising 24px.
- **Reveal:** 220ms with the same curve, rising 6px.
- **Probe pulse:** 1.1s, while the assistant is drawing.
- **Route trace:** stroke-dashoffset on diagram lines.
- **Reduced motion:** everything collapses to 1ms.

## Do's and Don'ts

### Do:
- **Do** encode every status with the five latency steps (#1d8a55, #5a9e35, #b97f0e, #d65523, #c2362b) and their soft fills.
- **Do** put any new progress or readiness view on the route grid and rail, or show it as hops or chips in ramp colors.
- **Do** show "not yet tested" as dashed strokes and `* * *` in Muted, and keep it separate from a low score.
- **Do** set numbers, timers, latency, and protocol text in Geist Mono with tabular figures, and wrap them in `dir="ltr"` islands inside Hebrew.
- **Do** keep tap targets at 40px or more (48px in action bars) and keep the 12px radius on pressable elements.
- **Do** use ramp colors as text only at large or bold-large sizes, or next to a word that already states the level. For small text, the Fast (#1d8a55, 4.0:1) and Timeout (#c2362b, 5.0:1) steps are the most legible.

### Don't:
- **Don't** build card grids, progress-bar tiles, a greeting header, or a "continue where you left off" card. The route replaces all of them.
- **Don't** introduce a second accent or a status color outside the ramp.
- **Don't** use Route Blue for anything that isn't current position, a primary action, or focus.
- **Don't** let `--ws-*` capture colors appear outside a capture table.
- **Don't** add shadows to rows, options, or panels. Shadows belong only to layers over a scrim.
- **Don't** treat the Good and Middling steps (#5a9e35 at about 3.0:1, #b97f0e at about 3.2:1 on ground) as body-text colors. They pass 3:1, not 4.5:1.
