import type { Channel, CommStatus, CommType, Tone } from "./data"

export const commTypeStyles: Record<CommType, string> = {
  "Internal Email": "bg-chart-1/15 text-chart-1",
  "External Email": "bg-chart-2/15 text-chart-2",
  "Press Release": "bg-chart-3/15 text-chart-3",
  "Press Note": "bg-chart-4/15 text-chart-4",
  "Executive Memo": "bg-chart-5/15 text-chart-5",
  Newsletter: "bg-chart-2/15 text-chart-2",
  "Social Post": "bg-chart-1/15 text-chart-1",
  "Crisis Statement": "bg-destructive/10 text-destructive",
}

export const commStatusStyles: Record<CommStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  "In Review": "bg-warning/10 text-warning",
  Approved: "bg-chart-2/15 text-chart-2",
  Scheduled: "bg-chart-1/15 text-chart-1",
  Published: "bg-success/10 text-success",
  Archived: "bg-muted text-muted-foreground",
}

export const commStatusDots: Record<CommStatus, string> = {
  Draft: "bg-muted-foreground",
  "In Review": "bg-warning",
  Approved: "bg-chart-2",
  Scheduled: "bg-chart-1",
  Published: "bg-success",
  Archived: "bg-muted-foreground",
}

export const toneStyles: Record<Tone, string> = {
  Formal: "bg-chart-5/15 text-chart-5",
  Neutral: "bg-muted text-muted-foreground",
  Warm: "bg-chart-4/15 text-chart-4",
  Urgent: "bg-destructive/10 text-destructive",
  Celebratory: "bg-success/10 text-success",
}

export const channelStyles: Record<Channel, string> = {
  Email: "bg-chart-1/15 text-chart-1",
  Intranet: "bg-chart-2/15 text-chart-2",
  Newsroom: "bg-chart-3/15 text-chart-3",
  LinkedIn: "bg-chart-4/15 text-chart-4",
  Teams: "bg-chart-5/15 text-chart-5",
  "Press wire": "bg-chart-3/15 text-chart-3",
}
