import type {
  ActionStage,
  CheckResult,
  IncidentStatus,
  IncidentType,
  Severity,
  WalkStatus,
} from "./data"

export const severityStyles: Record<Severity, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-warning/10 text-warning",
  High: "bg-chart-4/15 text-chart-4",
  Critical: "bg-destructive/10 text-destructive",
}

export const severityDots: Record<Severity, string> = {
  Low: "bg-muted-foreground",
  Medium: "bg-warning",
  High: "bg-chart-4",
  Critical: "bg-destructive",
}

/** Heat-map fill for the 5x5 risk matrix. */
export const severityCells: Record<Severity, string> = {
  Low: "bg-success/15 text-success",
  Medium: "bg-warning/15 text-warning",
  High: "bg-chart-4/20 text-chart-4",
  Critical: "bg-destructive/20 text-destructive",
}

export const incidentStatusStyles: Record<IncidentStatus, string> = {
  Reported: "bg-muted text-muted-foreground",
  Investigating: "bg-primary/10 text-primary",
  "Actions pending": "bg-warning/10 text-warning",
  Closed: "bg-success/10 text-success",
}

export const incidentTypeStyles: Record<IncidentType, string> = {
  Injury: "bg-destructive/10 text-destructive",
  "Near miss": "bg-warning/10 text-warning",
  "Property damage": "bg-chart-4/15 text-chart-4",
  Environmental: "bg-chart-2/15 text-chart-2",
  Hazard: "bg-primary/10 text-primary",
}

export const actionStageStyles: Record<ActionStage, string> = {
  Open: "bg-muted text-muted-foreground",
  "In Progress": "bg-primary/10 text-primary",
  Blocked: "bg-destructive/10 text-destructive",
  Verify: "bg-warning/10 text-warning",
  Done: "bg-success/10 text-success",
}

export const actionStageDots: Record<ActionStage, string> = {
  Open: "bg-muted-foreground",
  "In Progress": "bg-primary",
  Blocked: "bg-destructive",
  Verify: "bg-warning",
  Done: "bg-success",
}

export const walkStatusStyles: Record<WalkStatus, string> = {
  Scheduled: "bg-muted text-muted-foreground",
  "In progress": "bg-primary/10 text-primary",
  Completed: "bg-success/10 text-success",
}

export const checkResultStyles: Record<CheckResult, string> = {
  Pass: "bg-success/10 text-success",
  Fail: "bg-destructive/10 text-destructive",
  "N/A": "bg-muted text-muted-foreground",
}

export function walkScoreStyle(score: number) {
  if (score >= 90) return "bg-success/10 text-success"
  if (score >= 70) return "bg-warning/10 text-warning"
  return "bg-destructive/10 text-destructive"
}
