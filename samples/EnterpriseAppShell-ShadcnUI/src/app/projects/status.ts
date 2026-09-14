import type { ProjectStatus } from "./data"

export const projectStatusStyles: Record<ProjectStatus, string> = {
  Completed: "bg-success/10 text-success",
  "In Progress": "bg-warning/10 text-warning",
  Pending: "bg-destructive/10 text-destructive",
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}
