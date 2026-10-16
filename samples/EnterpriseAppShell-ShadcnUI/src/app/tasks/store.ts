import * as React from "react"

import { tasks as seedTasks, type Task } from "./data"

// Session store standing in for Dataverse. Pages read through the hooks below so
// edits made in one screen are visible everywhere without a reload.
let state: Task[] = seedTasks.map((task) => ({ ...task }))

const listeners = new Set<() => void>()

function setState(next: Task[]) {
  state = next
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

export function useTasks() {
  return React.useSyncExternalStore(subscribe, getSnapshot)
}

export function useTask(id: string | undefined) {
  return useTasks().find((task) => task.id === id)
}

export function saveTask(task: Task) {
  const exists = state.some((item) => item.id === task.id)
  setState(
    exists ? state.map((item) => (item.id === task.id ? task : item)) : [...state, task]
  )
}

export function newTaskId() {
  const highest = state.reduce((max, task) => {
    const value = Number(task.id.split("-")[1])
    return Number.isFinite(value) && value > max ? value : max
  }, 0)
  return `TSK-${highest + 1}`
}

/** Splits a one-per-line textarea into a clean list. */
export function toLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}
