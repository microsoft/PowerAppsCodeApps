import type { ComponentType } from "react"
import {
  CircleDotIcon,
  ClipboardCheckIcon,
  HandshakeIcon,
  InboxIcon,
  PhoneCallIcon,
  UsersIcon,
  XIcon,
} from "lucide-react"

import type {
  InterviewKind,
  Priority,
  RoleStatus,
  Stage,
} from "./data"

export const stageStyles: Record<Stage, string> = {
  Applied: "bg-muted text-muted-foreground",
  Screening: "bg-chart-4/12 text-chart-4",
  Interview: "bg-chart-2/12 text-chart-2",
  Assessment: "bg-chart-3/12 text-chart-3",
  Offer: "bg-warning/12 text-warning",
  Hired: "bg-success/12 text-success",
  Rejected: "bg-destructive/10 text-destructive",
}

export const stageDots: Record<Stage, string> = {
  Applied: "bg-muted-foreground",
  Screening: "bg-chart-4",
  Interview: "bg-chart-2",
  Assessment: "bg-chart-3",
  Offer: "bg-warning",
  Hired: "bg-success",
  Rejected: "bg-destructive",
}

export const stageIcons: Record<Stage, ComponentType<{ className?: string }>> = {
  Applied: InboxIcon,
  Screening: PhoneCallIcon,
  Interview: UsersIcon,
  Assessment: ClipboardCheckIcon,
  Offer: HandshakeIcon,
  Hired: CircleDotIcon,
  Rejected: XIcon,
}

export const roleStatusStyles: Record<RoleStatus, string> = {
  Open: "bg-success/12 text-success",
  "On hold": "bg-warning/12 text-warning",
  Closed: "bg-muted text-muted-foreground",
}

export const priorityStyles: Record<Priority, string> = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-chart-4/12 text-chart-4",
  Low: "bg-muted text-muted-foreground",
}

export const kindStyles: Record<InterviewKind, string> = {
  Screen: "bg-chart-4/12 text-chart-4",
  Technical: "bg-chart-2/12 text-chart-2",
  Panel: "bg-chart-1/12 text-chart-1",
  Values: "bg-chart-5/12 text-chart-5",
  Final: "bg-chart-3/12 text-chart-3",
}

export const quoteTagStyles = {
  strength: "border-success/40 bg-success/5",
  concern: "border-destructive/40 bg-destructive/5",
  signal: "border-chart-2/40 bg-chart-2/5",
} as const

export const quoteTagLabels = {
  strength: "Strength",
  concern: "Concern",
  signal: "Signal",
} as const

export const accentRings: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "bg-chart-1/15 text-chart-1",
  2: "bg-chart-2/15 text-chart-2",
  3: "bg-chart-3/15 text-chart-3",
  4: "bg-chart-4/15 text-chart-4",
  5: "bg-chart-5/15 text-chart-5",
}

export function scoreColour(score: number) {
  if (score >= 4) return "text-success"
  if (score >= 3) return "text-warning"
  return "text-destructive"
}

export function scoreBar(score: number) {
  if (score >= 4) return "bg-success"
  if (score >= 3) return "bg-warning"
  return "bg-destructive"
}
