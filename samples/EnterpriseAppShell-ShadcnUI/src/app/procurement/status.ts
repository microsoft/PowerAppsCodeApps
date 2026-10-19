import type {
  DeliveryStatus,
  InvoiceStatus,
  OrderStatus,
  Priority,
  RequisitionStage,
  SupplierStatus,
} from "./data"

export const supplierStatusStyles: Record<SupplierStatus, string> = {
  Preferred: "bg-success/10 text-success",
  Approved: "bg-primary/10 text-primary",
  "Under review": "bg-warning/10 text-warning",
  Suspended: "bg-destructive/10 text-destructive",
}

export const orderStatusStyles: Record<OrderStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  "Pending approval": "bg-warning/10 text-warning",
  Approved: "bg-primary/10 text-primary",
  Shipped: "bg-chart-4/15 text-chart-4",
  Received: "bg-success/10 text-success",
  Cancelled: "bg-destructive/10 text-destructive",
}

export const requisitionStageStyles: Record<RequisitionStage, string> = {
  Submitted: "bg-muted text-muted-foreground",
  "In Review": "bg-warning/10 text-warning",
  Approved: "bg-primary/10 text-primary",
  Ordered: "bg-success/10 text-success",
  Rejected: "bg-destructive/10 text-destructive",
}

export const requisitionStageDots: Record<RequisitionStage, string> = {
  Submitted: "bg-muted-foreground",
  "In Review": "bg-warning",
  Approved: "bg-primary",
  Ordered: "bg-success",
  Rejected: "bg-destructive",
}

export const invoiceStatusStyles: Record<InvoiceStatus, string> = {
  Pending: "bg-muted text-muted-foreground",
  Matched: "bg-primary/10 text-primary",
  Approved: "bg-chart-4/15 text-chart-4",
  Disputed: "bg-destructive/10 text-destructive",
  Paid: "bg-success/10 text-success",
}

export const deliveryStatusStyles: Record<DeliveryStatus, string> = {
  Scheduled: "bg-primary/10 text-primary",
  "In transit": "bg-chart-4/15 text-chart-4",
  Delivered: "bg-success/10 text-success",
  Delayed: "bg-destructive/10 text-destructive",
}

export const priorityStyles: Record<Priority, string> = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-warning/10 text-warning",
  Low: "bg-muted text-muted-foreground",
}

export function ratingStyle(rating: number) {
  if (rating >= 85) return "bg-success/10 text-success"
  if (rating >= 70) return "bg-warning/10 text-warning"
  return "bg-destructive/10 text-destructive"
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
