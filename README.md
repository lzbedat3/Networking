<p align="center">
  <img src="public/icons/icon-192.png" width="96" height="96" alt="מסלול לבוחן" />
</p>

<h1 align="center">מסלול לבוחן · תקשורת נתונים</h1>

<p align="center">
  A study app for the Data Communications course (214.2900).<br/>
  It has questions with an explanation for every answer, timed simulations, a sample quiz, and a course assistant.
</p>

<p align="center"><sub>Crafted by Darb</sub></p>

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Deploying to Vercel](#deploying-to-vercel)
- [Project structure](#project-structure)
- [Adding questions](#adding-questions)
- [PWA and offline](#pwa-and-offline)
- [Design](#design)

## Features

| Area | What it does |
|---|---|
| **Route** | The ten syllabus topics are shown as hops on a route. Each hop shows your mastery, the last three answers, and a latency score. A topic is marked "mastered" only after at least 3 answers. |
| **Practice** | One tap checks an answer. Every option gets its own explanation of why it is right or wrong, plus the principle behind the question. Diagrams, Wireshark captures and code are shown inline. |
| **Simulations** | Six fixed exams of 15 to 22 questions each, with a 90-minute timer, free navigation, flag-for-review, and a question map. Scores and explanations appear only after you submit. |
| **Past years** | A separate bank of 167 questions from 2020–2025 exams and quizzes, with its own page (`/past`): practice by topic or year, a random timed exam, unsolved and mistakes queues. Progress there stays out of the route and the simulations. |
| **Sample quiz** | 14 questions in the exact style of the real quiz, including the original screenshots. |
| **Tutor** | Sits under every question. It explains the question and gives hints. It reveals the answer only when the student explicitly asks for it in the chat. |
| **Course assistant** | A floating bubble you can drag anywhere on the screen. It answers from the full course material (lectures, tirgulim, homework, code) and draws real tables, timing diagrams and SVG sketches. |
| **Progress** | Stored on the device: per-question results, best score per simulation, and a mistakes review queue. |
| **Cheat sheet** | A dense two-sided A4 summary of the quiz 1 material: `public/cheatsheet.html` (source) and `public/cheatsheet.pdf` (print), linked in the footer. |
| **PWA** | Installable on phone and desktop. Works offline after the first visit (the assistant still needs a connection). |

## Tech stack

- **Next.js 15** (App Router) and **React 19**
- **Tailwind CSS 4**, with design tokens in `app/globals.css`
- **Anthropic SDK** for the tutor and the assistant, with streamed responses
- **Fonts:** Ubuntu (Latin), Heebo (Hebrew), Cairo (Arabic). Each font is loaded only for its own script, so mixed-language text keeps each script in its own font.

## Getting started

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

## Environment variables

| Name | Required | Default | Description |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | yes | | API key for the tutor and the course assistant |
| `TUTOR_MODEL` | no | `claude-opus-5-5` | Model id. `claude-sonnet-5-5` is a cheaper option. |
| `TUTOR_RATE_PER_HOUR` | no | `40` | Maximum assistant messages per visitor per hour |
| `APP_PASSCODE` | no | | Locks the whole app behind a passcode screen (`/gate`). Pages, screenshots, the PDF and the API all need it. Changing it signs everyone out. Unset = open. |

## Deploying to Vercel

1. Import the repository in Vercel. The Next.js preset needs no extra build settings.
2. Add the environment variables above under **Project → Settings → Environment Variables**.
3. Deploy.

`next.config.ts` bundles `knowledge/` and `public/exam/` with the `/api/tutor` function, so the assistant can read the course material at runtime.

## Project structure

```
app/
  (site)/              home, route and simulations pages, inside the site shell
  run/                 quiz runner: practice, simulations and results
  api/tutor/           streaming endpoint for the tutor and the assistant
  manifest.ts          PWA manifest
components/            UI: runner, question view, diagrams, chat, floating assistant
lib/
  questions/           the question bank
  past/                the past-years bank (separate pool)
  mastery.ts           readiness, topic levels, next-step logic
  exams.ts             the six fixed simulations
  stats.ts             local progress storage
knowledge/             course material in text form, used by the assistant
public/
  exam/                screenshots used by the questions
  icons/               app icons
  sw.js                service worker
```

## Adding questions

Questions live in `lib/questions/*.ts`. Each one has a topic, the prompt, and options. Every option needs its own explanation:

```ts
{
  id: "t9",
  topic: "tcp",
  source: "practice",
  multi: false,
  prompt: "…",
  options: [
    o("option text", true, "why this is correct"),
    o("option text", false, "why this is wrong"),
  ],
  explanation: "the principle behind the question",
}
```

Optional fields:

- `table`: a Wireshark-style capture
- `code`: a code snippet
- `images`: screenshots
- `diagram`: shown with the question
- `explainDiagram`: shown after answering

A diagram is one of `seq`, `tree`, `delay` or `cwnd`.

To mark what a question asks, add an entry to `lib/questions/focus.ts`. Phrases in `ask` get a gold underline, and phrases in `cond` (conditions that change the answer) get a dotted one. Each phrase must appear exactly as written in the prompt.

## PWA and offline

The service worker (`public/sw.js`) caches build assets, icons and screenshots the first time they are loaded. Pages are fetched from the network first, and the cached copy is served when offline. API calls are never cached.

## Design

`DESIGN.md` describes the visual system: palette, type, the latency ramp, and the component rules. `PRODUCT.md` describes the users, the purpose, and the product principles.
