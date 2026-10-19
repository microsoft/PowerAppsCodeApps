import * as React from "react"
import {
  BanknoteIcon,
  CheckCircle2Icon,
  CircleAlertIcon,
  LinkIcon,
  ThumbsUpIcon,
} from "lucide-react"
import { Link } from "react-router"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import {
  formatCurrency,
  getOrder,
  invoices as initialInvoices,
  orderTotal,
  supplierName,
  type Invoice,
  type InvoiceStatus,
} from "./data"
import { initials, invoiceStatusStyles } from "./status"

const tabs = [
  "All",
  "Pending",
  "Matched",
  "Approved",
  "Disputed",
  "Paid",
] as const

export default function ProcurementInvoicesPage() {
  const [items, setItems] = React.useState<Invoice[]>(initialInvoices)
  const [tab, setTab] = React.useState<(typeof tabs)[number]>("All")
  const [selectedId, setSelectedId] = React.useState(initialInvoices[0].id)

  const filtered =
    tab === "All" ? items : items.filter((invoice) => invoice.status === tab)
  const selected =
    items.find((invoice) => invoice.id === selectedId) ?? filtered[0] ?? null

  const outstanding = items
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0)

  function setStatus(id: string, status: InvoiceStatus, message: string) {
    setItems((prev) =>
      prev.map((invoice) =>
        invoice.id === id
          ? { ...invoice, status, matched: status === "Disputed" ? false : true }
          : invoice
      )
    )
    toast.success(message)
  }

  const linkedOrder = selected?.orderId ? getOrder(selected.orderId) : undefined
  const orderValue = linkedOrder ? orderTotal(linkedOrder) : undefined
  const variance =
    selected && orderValue !== undefined ? selected.amount - orderValue : undefined

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Invoices</h2>
          <p className="text-sm text-muted-foreground">
            {items.length} invoices · {formatCurrency(outstanding, true)}{" "}
            outstanding
          </p>
        </div>
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as (typeof tabs)[number])}
        >
          <TabsList>
            {tabs.map((item) => {
              const count =
                item === "All"
                  ? items.length
                  : items.filter((invoice) => invoice.status === item).length
              return (
                <TabsTrigger key={item} value={item}>
                  {item}
                  <Badge variant="secondary" className="ml-1.5">
                    {count}
                  </Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-2">
          {filtered.map((invoice) => (
            <button
              key={invoice.id}
              type="button"
              onClick={() => setSelectedId(invoice.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary/40",
                selected?.id === invoice.id && "border-primary ring-2 ring-primary/20"
              )}
            >
              <Avatar className="size-9">
                <AvatarFallback className="text-xs">
                  {initials(supplierName(invoice.supplierId))}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {supplierName(invoice.supplierId)}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {invoice.id} · {invoice.orderId ?? "No PO"} · due{" "}
                  {invoice.dueOn}
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-sm font-medium tabular-nums">
                  {formatCurrency(invoice.amount)}
                </span>
                <Badge
                  variant="secondary"
                  className={invoiceStatusStyles[invoice.status]}
                >
                  {invoice.status}
                </Badge>
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No invoices in this view.
              </CardContent>
            </Card>
          )}
        </div>

        {selected && (
          <Card className="h-fit @4xl/main:sticky @4xl/main:top-4">
            <CardHeader>
              <CardDescription>{selected.id}</CardDescription>
              <CardTitle className="text-xl">
                {formatCurrency(selected.amount)}
              </CardTitle>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className={invoiceStatusStyles[selected.status]}
                >
                  {selected.status}
                </Badge>
                <Badge variant="outline">
                  {selected.matched ? "3-way matched" : "Unmatched"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 text-sm">
                <Row label="Supplier">
                  <Link
                    to={`/procurement/suppliers/${selected.supplierId}`}
                    className="font-medium hover:underline"
                  >
                    {supplierName(selected.supplierId)}
                  </Link>
                </Row>
                <Separator />
                <Row label="Purchase order">
                  {selected.orderId ? (
                    <Link
                      to={`/procurement/orders/${selected.orderId}`}
                      className="flex items-center gap-1 font-medium hover:underline"
                    >
                      <LinkIcon className="size-3.5" />
                      {selected.orderId}
                    </Link>
                  ) : (
                    <span className="font-medium text-muted-foreground">
                      Not linked
                    </span>
                  )}
                </Row>
                <Separator />
                <Row label="Issued">
                  <span className="font-medium">{selected.issuedOn}</span>
                </Row>
                <Separator />
                <Row label="Due">
                  <span className="font-medium">{selected.dueOn}</span>
                </Row>
                <Separator />
                <Row label="Approver">
                  <span className="font-medium">{selected.approver}</span>
                </Row>
              </div>

              {variance !== undefined && (
                <div
                  className={cn(
                    "flex items-start gap-2 rounded-lg border p-3 text-sm",
                    variance === 0
                      ? "text-success"
                      : "border-destructive/40 text-destructive"
                  )}
                >
                  {variance === 0 ? (
                    <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
                  ) : (
                    <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
                  )}
                  <span>
                    {variance === 0
                      ? `Matches ${selected.orderId} exactly.`
                      : `${formatCurrency(Math.abs(variance))} ${
                          variance > 0 ? "over" : "under"
                        } ${selected.orderId} (${formatCurrency(orderValue ?? 0)}).`}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setStatus(
                      selected.id,
                      "Matched",
                      `${selected.id} matched to its order`
                    )
                  }
                >
                  <LinkIcon />
                  Match
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setStatus(selected.id, "Approved", `${selected.id} approved`)
                  }
                >
                  <ThumbsUpIcon />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setStatus(selected.id, "Disputed", `${selected.id} disputed`)
                  }
                >
                  <CircleAlertIcon />
                  Dispute
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    setStatus(
                      selected.id,
                      "Paid",
                      `${selected.id} marked as paid`
                    )
                  }
                >
                  <BanknoteIcon />
                  Mark paid
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}
