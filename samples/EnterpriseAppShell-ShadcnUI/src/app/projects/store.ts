import * as React from "react"

import { allProjects as seedProjects, projectSlug, type Project } from "./data"

// Session store standing in for Dataverse. Pages read through the hooks below so
// an edit made on the details screen shows up on the dashboard and list too.
let projects: Project[] = seedProjects.map((project) => ({ ...project }))

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return projects
}

export function useProjects() {
  return React.useSyncExternalStore(subscribe, getSnapshot)
}

export function useProject(slug: string | undefined) {
  return useProjects().find((project) => projectSlug(project) === slug)
}

export function saveProject(next: Project) {
  projects = projects.map((project) =>
    project.id === next.id ? next : project
  )
  listeners.forEach((listener) => listener())
}
