import type { Focus } from "../questions/focus";
import { Question } from "../types";
import { focusA, partA, srcA } from "./partA";
import { focusB, partB, srcB } from "./partB";
import { focusC, partC, srcC } from "./partC";
import { focusD, partD, srcD } from "./partD";
import { focusE, partE, srcE } from "./partE";

/** the same question was photographed more than once: copy → the question that is kept */
const DUPLICATES: Record<string, string> = {
  "pyB-5": "pyA-3",
  "pyB-6": "pyA-2",
  "pyB-9": "pyC-10",
  "pyB-10": "pyA-5",
  "pyB-11": "pyA-6",
  "pyC-1": "pyB-2",
  "pyC-2": "pyA-4",
  "pyC-3": "pyB-7",
  "pyC-7": "pyA-10",
  "pyD-56": "pyA-4",
  "pyD-70": "pyC-8",
  "pyD-71": "pyB-4",
  "pyE-5": "pyD-35",
  "pyE-28": "pyD-2",
  "pyE-38": "pyD-29",
  "pyE-65": "pyD-25",
};

/** The past-years bank (2020–2025): a separate pool from the course practice questions. */
export const PAST_QUESTIONS: Question[] = [...partA, ...partB, ...partC, ...partD, ...partE].filter((q) => !(q.id in DUPLICATES));
/** the original photos each question was transcribed from (sanitized copies in public/past/src) */
const RAW_SOURCES: Record<string, string[]> = { ...srcA, ...srcB, ...srcC, ...srcD, ...srcE };
export const PAST_SOURCES: Record<string, string[]> = { ...RAW_SOURCES };
for (const [copy, kept] of Object.entries(DUPLICATES))
  PAST_SOURCES[kept] = [...new Set([...(PAST_SOURCES[kept] ?? []), ...(RAW_SOURCES[copy] ?? [])])];

export const PAST_FOCUS: Record<string, Focus> = { ...focusA, ...focusB, ...focusC, ...focusD, ...focusE };
