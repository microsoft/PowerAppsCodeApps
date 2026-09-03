import * as React from "react"

import { assignments, recommendations } from "./data"

export type DispatchEntry = {
  assignmentId: string
  technicianId: string
  rationale: string
  /** True once the dispatcher has overridden the recommendation. */
  overridden: boolean
}

type DispatchState = {
  entries: DispatchEntry[]
  committedCount: number
}

function seed(): DispatchState {
  return {
    entries: assignments.map((assignment) => {
      const recommendation = recommendations[assignment.id]
      return {
        assignmentId: assignment.id,
        technicianId: recommendation.technicianId,
        rationale: recommendation.rationale,
        overridden: false,
      }
    }),
    committedCount: 0,
  }
}

// Session store standing in for Dataverse. Dispatch edits made on the mapping
// board stay put while the user moves between the FieldOps screens.
let state: DispatchState = seed()

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return state
}

function emit(next: DispatchState) {
  state = next
  listeners.forEach((listener) => listener())
}

export function useDispatchState() {
  return React.useSyncExternalStore(subscribe, getSnapshot)
}

export function assignTechnician(assignmentId: string, technicianId: string) {
  const recommendation = recommendations[assignmentId]
  emit({
    committedCount: 0,
    entries: state.entries.map((entry) =>
      entry.assignmentId === assignmentId
        ? {
            ...entry,
            technicianId,
            overridden: technicianId !== recommendation.technicianId,
            rationale:
              technicianId === recommendation.technicianId
                ? recommendation.rationale
                : "Reassigned by the dispatcher, overriding the recommended match.",
          }
        : entry
    ),
  })
}

export function commitAssignments() {
  emit({ ...state, committedCount: state.entries.length })
}

export function resetDispatch() {
  emit(seed())
}
