import * as React from "react"

import {
  candidates as seedCandidates,
  interviews as seedInterviews,
  roles as seedRoles,
  type Candidate,
  type Interview,
  type Role,
  type Stage,
  type TranscriptLine,
} from "./data"

// Session store standing in for Dataverse. Pages read through the hooks below so
// edits made in one screen are visible everywhere without a reload.
export type RecruitingState = {
  roles: Role[]
  candidates: Candidate[]
  interviews: Interview[]
}

let state: RecruitingState = {
  roles: seedRoles.map((role) => ({ ...role })),
  candidates: seedCandidates.map((candidate) => ({ ...candidate })),
  interviews: seedInterviews.map((interview) => ({ ...interview })),
}

const listeners = new Set<() => void>()

function setState(next: Partial<RecruitingState>) {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return state
}

export function useRecruiting() {
  return React.useSyncExternalStore(subscribe, getSnapshot)
}

export function useRoles() {
  return useRecruiting().roles
}

export function useCandidates() {
  return useRecruiting().candidates
}

export function useInterviews() {
  return useRecruiting().interviews
}

export function useRoleById(roleId?: string) {
  return useRoles().find((role) => role.id === roleId)
}

export function useCandidateById(candidateId?: string) {
  return useCandidates().find((candidate) => candidate.id === candidateId)
}

export function useInterviewsFor(candidateId?: string) {
  const interviews = useInterviews()
  return interviews
    .filter((interview) => interview.candidateId === candidateId)
    .sort((a, b) => a.start.localeCompare(b.start))
}

function nextId(prefix: string, existing: string[]) {
  const highest = existing.reduce((max, id) => {
    const value = Number(id.split("-")[1])
    return Number.isFinite(value) && value > max ? value : max
  }, 0)
  return `${prefix}-${highest + 1}`
}

export function newRoleId() {
  return nextId("ROL", state.roles.map((role) => role.id))
}

export function newCandidateId() {
  return nextId("CAN", state.candidates.map((candidate) => candidate.id))
}

export function newInterviewId() {
  return nextId("INT", state.interviews.map((interview) => interview.id))
}

export function saveRole(role: Role) {
  const exists = state.roles.some((item) => item.id === role.id)
  setState({
    roles: exists
      ? state.roles.map((item) => (item.id === role.id ? role : item))
      : [role, ...state.roles],
  })
}

export function saveCandidate(candidate: Candidate) {
  const previous = state.candidates.find((item) => item.id === candidate.id)
  if (!previous) {
    setState({ candidates: [candidate, ...state.candidates] })
    return
  }
  const timeline =
    previous.stage === candidate.stage
      ? candidate.timeline
      : [
          ...candidate.timeline,
          {
            at: new Date().toISOString().slice(0, 10),
            label: `Moved to ${candidate.stage}`,
            detail: `From ${previous.stage}`,
          },
        ]
  setState({
    candidates: state.candidates.map((item) =>
      item.id === candidate.id ? { ...candidate, timeline } : item
    ),
  })
}

export function moveCandidate(candidateId: string, stage: Stage) {
  const candidate = state.candidates.find((item) => item.id === candidateId)
  if (!candidate || candidate.stage === stage) return
  saveCandidate({ ...candidate, stage })
}

export function saveInterview(interview: Interview) {
  const exists = state.interviews.some((item) => item.id === interview.id)
  setState({
    interviews: exists
      ? state.interviews.map((item) =>
          item.id === interview.id ? interview : item
        )
      : [...state.interviews, interview],
  })
}

export function deleteInterview(interviewId: string) {
  setState({
    interviews: state.interviews.filter((item) => item.id !== interviewId),
  })
}

/** Splits a one-per-line textarea into a clean list. */
export function toLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

/**
 * Turns pasted "Speaker: line" text into the structured transcript the insights
 * agent reads. Anything without a speaker prefix joins the previous line.
 */
export function parseTranscript(
  raw: string,
  candidateName: string
): TranscriptLine[] {
  const lines: TranscriptLine[] = []
  const surname = candidateName.split(" ").slice(-1)[0]?.toLowerCase() ?? ""
  const forename = candidateName.split(" ")[0]?.toLowerCase() ?? ""

  for (const line of raw.split("\n")) {
    const text = line.trim()
    if (!text) continue

    const match = text.match(/^(?:\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*)?([^:]{2,40}):\s*(.+)$/)
    if (!match) {
      const last = lines[lines.length - 1]
      if (last) last.text = `${last.text} ${text}`
      continue
    }

    const [, at, speaker, body] = match
    const name = speaker.trim()
    const lower = name.toLowerCase()
    lines.push({
      at: at ?? "",
      speaker: name,
      role:
        lower.includes(forename) || lower.includes(surname)
          ? "Candidate"
          : "Interviewer",
      text: body.trim(),
    })
  }

  return lines
}
