import type { Focus } from "../questions/focus";
import { Question } from "../types";
import { focusA, partA } from "./partA";
import { focusB, partB } from "./partB";
import { focusC, partC } from "./partC";
import { focusD, partD } from "./partD";
import { focusE, partE } from "./partE";

/** the same question was photographed more than once; these copies are left out */
const DUPLICATES = new Set([
  "pyB-5", // = pyA-3, who assigns a port
  "pyB-6", // = pyA-2, open and close capture
  "pyB-9", // = pyC-10, Alice's second lesson
  "pyB-10", // = pyA-5, 1000 TCP connections
  "pyB-11", // = pyA-6, two-army problem
  "pyC-1", // = pyB-2, frame fields
  "pyC-2", // = pyA-4, next Seq is m+1
  "pyC-3", // = pyB-7, cloud paradigm
  "pyC-7", // = pyA-10, nested loops
  "pyD-56", // = pyA-4
  "pyD-70", // = pyC-8, non-blocking server
  "pyD-71", // = pyB-4, .edu TLD
  "pyE-5", // = pyD-35, socket definition
  "pyE-28", // = pyD-2, congWin variable
  "pyE-38", // = pyD-29, DNS order
  "pyE-65", // = pyD-25, /26 redefined
]);

/** The past-years bank (2020–2025): a separate pool from the course practice questions. */
export const PAST_QUESTIONS: Question[] = [...partA, ...partB, ...partC, ...partD, ...partE].filter((q) => !DUPLICATES.has(q.id));
export const PAST_FOCUS: Record<string, Focus> = { ...focusA, ...focusB, ...focusC, ...focusD, ...focusE };
