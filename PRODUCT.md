# Product


## Platform

web

## Users
One student in "תקשורת נתונים" (Data Communications, 214.2900, University of Haifa, 2026-27), preparing for Quiz 1 on Friday 27.11.2026 at 09:00, with Quiz 2 on 6.1.2027 later. They study in Hebrew, on phone and laptop equally: short sessions on the phone, longer sit-down runs on the laptop. The real quiz is taken on a university lab computer.

## Product Purpose
Get the student to pass (55+) and ideally ace Quiz 1 in the few days left. Three jobs, all first-class:
1. **Guided plan**: the app tells them what to do next (weak topics, the next simulation) until quiz day.
2. **Free practice**: by topic, with an explanation after every answer: why each option is right or wrong.
3. **Exam simulation**: timed runs, 90 minutes, 15–22 questions, results and explanations only after submitting, like the real quiz.
Success means a visible sense of readiness: knowing which topics are mastered and which are weak.

## Positioning
Built from this course's own material: its lectures, tirgulim, homework, syllabus conventions (e.g. total delay = proc(A) + L/R + prop + proc(B)), and the real 2026 Quiz 1 with its original screenshots. It is not a generic networking quiz.

## Operating Context
- Hebrew RTL interface, while the technical content (TCP, ACK, Seq, code, Wireshark) is LTR English.
- Questions include Wireshark captures, code snippets, timing diagrams, delay calculations, and multi-select questions where wrong picks cost points.
- The Claude tutor sits under each question: it explains and hints but never reveals the answer until the student explicitly asks.
- The course assistant chat should know the lectures, tirgulim, homework and the past quiz, so the student can ask about any of them.
- Runs locally (Next.js dev server). The Claude API key lives in `.env.local`.

## Capabilities and Constraints
- 91 questions across 10 topics; 6 fixed simulations (15–22 questions, 90 minutes); the real 2026 quiz (14 questions); a mistakes review.
- Progress is stored per question and per simulation in localStorage on that device.
- The question bank and all content must be preserved through any redesign.
- No accounts, no backend beyond the tutor API route.

## Evidence on Hand
- Course materials in `../Lectures and Practices/` (lectures, Tirgul 1–7 and 11, EX_01, SWS, syllabus, `2026 exam A.pdf`).
- Cropped screenshots of the real quiz in `public/exam/`.
- No testimonials, users, or stats beyond this one student's own progress. Do not fabricate any.

## Product Principles
1. **Always know the next step.** Opening the app answers "what should I do now?" in one glance.
2. **Readiness is visible.** Topic mastery and simulation scores are the spine of the home screen, not an afterthought.
3. **Answering is frictionless.** Pick, check, understand, next. With the thumb on a phone, with the keyboard on a laptop.
4. **Exam realism where it counts.** Simulations behave like the real quiz: timer, navigation, flags, no help until submit.
5. **Learning over scoring.** Explanations and the tutor exist to build understanding. The tutor never gives answers away uninvited.

## Accessibility & Inclusion
Full RTL correctness with LTR islands for technical content; keyboard operable (1–9 to pick, Enter to check or move on); visible focus; reduced motion respected; light and dark themes.
