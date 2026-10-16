import type { TaskColumn, TaskPriority } from "./data"

export const priorityStyles: Record<TaskPriority, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-primary/10 text-primary",
  High: "bg-warning/10 text-warning",
  Urgent: "bg-destructive/10 text-destructive",
}

export const columnStyles: Record<TaskColumn, string> = {
  Backlog: "bg-muted-foreground",
  "In Progress": "bg-primary",
  "In Review": "bg-warning",
  Done: "bg-success",
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}
