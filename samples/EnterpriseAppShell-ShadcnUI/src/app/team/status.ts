import type { DealStatus, MemberStatus } from "./data"

export const memberStatusStyles: Record<MemberStatus, string> = {
  Active: "bg-success",
  Away: "bg-warning",
  Offline: "bg-muted-foreground",
}

export const memberBadgeStyles: Record<MemberStatus, string> = {
  Active: "bg-success/10 text-success",
  Away: "bg-warning/10 text-warning",
  Offline: "bg-muted text-muted-foreground",
}

export const dealStatusStyles: Record<DealStatus, string> = {
  Ongoing: "bg-primary/10 text-primary",
  Closed: "bg-success/10 text-success",
  "On Hold": "bg-destructive/10 text-destructive",
  Cancelled: "bg-warning/10 text-warning",
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}
