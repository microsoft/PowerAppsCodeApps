import * as React from "react"
import {
  ArrowLeftIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
} from "lucide-react"
import { Link, useParams } from "react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

import {
  deliveriesBySupplier,
  formatCurrency,
  invoicesBySupplier,
  isOpenOrder,
  orderTotal,
  requisitionsBySupplier,
} from "./data"
import {
  deliveryStatusStyles,
  invoiceStatusStyles,
  orderStatusStyles,
  ratingStyle,
  requisitionStageStyles,
  supplierStatusStyles,
} from "./status"
import { useOrders, useSupplierById } from "./store"
import { SupplierFormSheet } from "./components/supplier-form"

export default function ProcurementSupplierDetailsPage() {
  const { supplierId } = useParams()
  const supplier = useSupplierById(supplierId)
  const allOrders = useOrders()
  const [formOpen, setFormOpen] = React.useState(false)

  if (!supplier) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground">
          We couldn&apos;t find a supplier called “{supplierId}”.
        </p>
        <Button asChild variant="outline">
          <Link to="/procurement/suppliers">Back to suppliers</Link>
        </Button>
      </div>
    )
  }

  const orders = allOrders.filter((order) => order.supplierId === supplier.id)
  const openOrders = orders.filter(isOpenOrder)
  const openValue = openOrders.reduce((sum, order) => sum + orderTotal(order), 0)
  const receivedValue = orders
    .filter((order) => order.status === "Received")
    .reduce((sum, order) => sum + orderTotal(order), 0)
  const supplierInvoices = invoicesBySupplier(supplier.id)
  const outstanding = supplierInvoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0)
  const timeline = deliveriesBySupplier(supplier.id)
  const supplierRequisitions = requisitionsBySupplier(supplier.id)

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Button asChild variant="ghost" size="sm" className="w-fit -ml-2">
        <Link to="/procurement/suppliers">
          <ArrowLeftIcon />
          Back to suppliers
        </Link>
      </Button>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardDescription className="flex flex-wrap items-center gap-2">
                <span>{supplier.category}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="size-3.5" />
                  {supplier.location}
                </span>
              </CardDescription>
              <CardTitle className="text-2xl">{supplier.name}</CardTitle>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className={supplierStatusStyles[supplier.status]}
                >
                  {supplier.status}
                </Badge>
                <Badge
                  variant="secondary"
                  className={ratingStyle(supplier.rating)}
                >
                  Score {supplier.rating}
                </Badge>
                <Badge variant="outline">{orders.length} orders</Badge>
                <Badge variant="outline">{supplier.paymentTerms}</Badge>
              </div>
              <CardAction className="row-span-3 self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFormOpen(true)}
                >
                  <PencilIcon />
                  Edit supplier
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                {supplier.description}
              </p>
              <div className="grid gap-3 @2xl/main:grid-cols-3">
                <a
                  href={`mailto:${supplier.contactEmail}`}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary/40"
                >
                  <MailIcon className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex min-w-0 flex-col">
                    <span className="text-xs text-muted-foreground">
                      {supplier.contactName}
                    </span>
                    <span className="truncate text-sm font-medium">
                      {supplier.contactEmail}
                    </span>
                  </div>
                </a>
                <a
                  href={`tel:${supplier.phone}`}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary/40"
                >
                  <PhoneIcon className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex min-w-0 flex-col">
                    <span className="text-xs text-muted-foreground">Phone</span>
                    <span className="truncate text-sm font-medium">
                      {supplier.phone}
                    </span>
                  </div>
                </a>
                <a
                  href={`https://${supplier.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary/40"
                >
                  <GlobeIcon className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex min-w-0 flex-col">
                    <span className="text-xs text-muted-foreground">Website</span>
                    <span className="truncate text-sm font-medium">
                      {supplier.website}
                    </span>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Purchase orders</CardTitle>
              <CardDescription>
                {formatCurrency(openValue)} open ·{" "}
                {formatCurrency(receivedValue)} received
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/procurement/orders/${order.id}`}
                  className="flex items-start justify-between gap-2 rounded-lg border p-3 transition-colors hover:border-primary/40"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{order.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {order.id} · {order.requester} · expected{" "}
                      {order.expectedDate}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm tabular-nums">
                      {formatCurrency(orderTotal(order))}
                    </span>
                    <Badge
                      variant="secondary"
                      className={orderStatusStyles[order.status]}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </Link>
              ))}
              {orders.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No orders placed with this supplier yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery history</CardTitle>
              <CardDescription>
                Receipts booked against {supplier.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {timeline.map((delivery) => (
                <div key={delivery.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1.5 size-2 rounded-full bg-primary" />
                    <span className="w-px flex-1 bg-border" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={deliveryStatusStyles[delivery.status]}
                      >
                        {delivery.status}
                      </Badge>
                      <span className="text-sm font-medium">
                        {delivery.subject}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {delivery.date} · {delivery.time} · {delivery.carrier} ·{" "}
                      {delivery.items} items
                    </span>
                  </div>
                </div>
              ))}
              {timeline.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No deliveries recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Commercials</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <DetailRow
                label="Annual spend"
                value={formatCurrency(supplier.annualSpend)}
              />
              <Separator />
              <DetailRow label="Open orders" value={formatCurrency(openValue)} />
              <Separator />
              <DetailRow
                label="Outstanding invoices"
                value={formatCurrency(outstanding)}
              />
              <Separator />
              <DetailRow label="Payment terms" value={supplier.paymentTerms} />
              <Separator />
              <DetailRow label="Contract ends" value={supplier.contractEnds} />
              <Separator />
              <DetailRow label="Supplier since" value={supplier.since} />
              <Separator />
              <DetailRow label="Buyer" value={supplier.buyer} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Scorecard</span>
                  <span className="font-medium tabular-nums">
                    {supplier.rating}/100
                  </span>
                </div>
                <Progress value={supplier.rating} />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">On-time delivery</span>
                  <span className="font-medium tabular-nums">
                    {supplier.onTimeRate}%
                  </span>
                </div>
                <Progress value={supplier.onTimeRate} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                {supplierInvoices.length} on record
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {supplierInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between gap-2 rounded-lg border p-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{invoice.id}</span>
                    <span className="text-xs text-muted-foreground">
                      due {invoice.dueOn}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm tabular-nums">
                      {formatCurrency(invoice.amount)}
                    </span>
                    <Badge
                      variant="secondary"
                      className={invoiceStatusStyles[invoice.status]}
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {supplierInvoices.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No invoices on record.
                </p>
              )}
            </CardContent>
          </Card>

          {supplierRequisitions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requisitions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {supplierRequisitions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-lg border p-3"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">
                        {item.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(item.amount)} · {item.department}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={requisitionStageStyles[item.stage]}
                    >
                      {item.stage}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <SupplierFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        supplier={supplier}
      />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
