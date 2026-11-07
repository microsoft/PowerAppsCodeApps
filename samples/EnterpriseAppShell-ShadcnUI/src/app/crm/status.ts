import type {
  ActivityType,
  CompanyStatus,
  ContactStatus,
  DealStage,
  LeadStatus,
} from "./data"

export const companyStatusStyles: Record<CompanyStatus, string> = {
  Customer: "bg-success/10 text-success",
  Prospect: "bg-primary/10 text-primary",
  Churned: "bg-destructive/10 text-destructive",
}

export const contactStatusStyles: Record<ContactStatus, string> = {
  Active: "bg-success/10 text-success",
  New: "bg-primary/10 text-primary",
  Cold: "bg-muted text-muted-foreground",
}

export const dealStageStyles: Record<DealStage, string> = {
  Qualified: "bg-primary/10 text-primary",
  Proposal: "bg-warning/10 text-warning",
  Negotiation: "bg-chart-4/15 text-chart-4",
  "Closed Won": "bg-success/10 text-success",
  "Closed Lost": "bg-destructive/10 text-destructive",
}

export const dealStageDots: Record<DealStage, string> = {
  Qualified: "bg-primary",
  Proposal: "bg-warning",
  Negotiation: "bg-chart-4",
  "Closed Won": "bg-success",
  "Closed Lost": "bg-destructive",
}

export const leadStatusStyles: Record<LeadStatus, string> = {
  New: "bg-primary/10 text-primary",
  Contacted: "bg-warning/10 text-warning",
  Qualified: "bg-success/10 text-success",
  Unqualified: "bg-muted text-muted-foreground",
}

export const activityTypeStyles: Record<ActivityType, string> = {
  Call: "bg-primary/10 text-primary",
  Meeting: "bg-chart-4/15 text-chart-4",
  Email: "bg-warning/10 text-warning",
  Task: "bg-muted text-muted-foreground",
}

export function scoreStyle(score: number) {
  if (score >= 80) return "bg-success/10 text-success"
  if (score >= 60) return "bg-warning/10 text-warning"
  return "bg-muted text-muted-foreground"
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}
