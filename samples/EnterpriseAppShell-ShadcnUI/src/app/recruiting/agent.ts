import type { Interview, TranscriptAnalysis } from "./data"

// Stand-ins for two Power Automate flows. Swap the bodies for real
// invocations; the inputs and the run receipts are the contract.
export const ANALYSIS_FLOW = "Analyse-Interview-Transcript"
export const SCHEDULING_FLOW = "Find-Interview-Slots"

export type AgentStep = {
  id: string
  label: string
  detail: string
  ms: number
}

export const ANALYSIS_STEPS: AgentStep[] = [
  {
    id: "fetch",
    label: "Fetching transcript",
    detail: "Pulling the recording and diarised transcript from Teams",
    ms: 700,
  },
  {
    id: "scorecard",
    label: "Loading the scorecard",
    detail: "Reading the competencies defined on the requisition",
    ms: 600,
  },
  {
    id: "evidence",
    label: "Matching evidence to competencies",
    detail: "Attaching timestamped quotes to each scorecard line",
    ms: 1400,
  },
  {
    id: "signal",
    label: "Weighing signal against noise",
    detail: "Separating claims from demonstrated behaviour",
    ms: 1100,
  },
  {
    id: "draft",
    label: "Drafting the summary",
    detail: "Writing up the evidence for the panel to weigh",
    ms: 900,
  },
]

export type AnalysisResult = {
  runId: string
  durationMs: number
  analysis: TranscriptAnalysis
}

export type SlotProposal = {
  id: string
  start: string
  durationMins: number
  panel: string[]
  room: string
  score: number
  rationale: string[]
  conflicts: string[]
}

export const SCHEDULING_STEPS: AgentStep[] = [
  {
    id: "panel",
    label: "Resolving the panel",
    detail: "Checking who is required versus optional for this stage",
    ms: 600,
  },
  {
    id: "calendars",
    label: "Reading calendars",
    detail: "Free/busy across the panel for the next ten working days",
    ms: 1200,
  },
  {
    id: "candidate",
    label: "Applying candidate availability",
    detail: "Honouring the windows the candidate gave us",
    ms: 800,
  },
  {
    id: "rank",
    label: "Ranking the options",
    detail: "Weighing panel focus time, rooms and time-to-decision",
    ms: 1000,
  },
]

let runCounter = 8100

function nextRunId(prefix: string) {
  runCounter += 1
  return `${prefix}-${runCounter}`
}

function runSteps(steps: AgentStep[], onStep: (index: number, step: AgentStep) => void) {
  let elapsed = 0
  const timers: number[] = []
  steps.forEach((step, index) => {
    elapsed += step.ms
    timers.push(window.setTimeout(() => onStep(index, step), elapsed))
  })
  return { elapsed, timers }
}

/**
 * Replays the transcript analysis flow, reporting each step as it lands and
 * resolving with the curated analysis held against the interview.
 */
export function analyseTranscript(
  interview: Interview,
  onStep: (index: number, step: AgentStep) => void
): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    if (!interview.insight) {
      reject(new Error("No transcript is attached to this interview"))
      return
    }
    const { elapsed } = runSteps(ANALYSIS_STEPS, onStep)
    window.setTimeout(
      () =>
        resolve({
          runId: nextRunId("RUN"),
          durationMs: elapsed,
          analysis: interview.insight as TranscriptAnalysis,
        }),
      elapsed + 350
    )
  })
}

const slotLibrary: Record<string, SlotProposal[]> = {
  default: [
    {
      id: "slot-a",
      start: "2026-09-07T10:00",
      durationMins: 60,
      panel: [],
      room: "Kestrel · London",
      score: 94,
      rationale: [
        "Whole panel free with a 30-minute buffer either side",
        "Two clear days before Wednesday's hiring review, so scores can be written up properly",
        "Nobody on the panel has an interview immediately before it",
      ],
      conflicts: [],
    },
    {
      id: "slot-b",
      start: "2026-09-08T14:30",
      durationMins: 60,
      panel: [],
      room: "Remote · Teams",
      score: 81,
      rationale: [
        "Gives the candidate the full weekend to prepare",
        "Panel has no other interviews that afternoon",
      ],
      conflicts: [
        "Leaves the panel a single day to write up scores before the hiring review",
      ],
    },
    {
      id: "slot-c",
      start: "2026-09-03T16:00",
      durationMins: 60,
      panel: [],
      room: "Peregrine · Manchester",
      score: 68,
      rationale: ["Fastest possible turnaround — tomorrow afternoon"],
      conflicts: [
        "One panel member has a soft conflict and would need to move a 1:1",
        "Fourth interview of the day for the panel — fatigue risk on scoring",
        "Barely a day's notice for the candidate",
      ],
    },
  ],
}

/**
 * Replays the scheduling flow and returns three ranked proposals.
 * The panel is stamped onto each proposal so the caller can render it.
 */
export function findSlots(
  panel: string[],
  onStep: (index: number, step: AgentStep) => void
): Promise<{ runId: string; durationMs: number; slots: SlotProposal[] }> {
  return new Promise((resolve) => {
    const { elapsed } = runSteps(SCHEDULING_STEPS, onStep)
    window.setTimeout(
      () =>
        resolve({
          runId: nextRunId("RUN"),
          durationMs: elapsed,
          slots: slotLibrary.default.map((slot) => ({ ...slot, panel })),
        }),
      elapsed + 350
    )
  })
}
