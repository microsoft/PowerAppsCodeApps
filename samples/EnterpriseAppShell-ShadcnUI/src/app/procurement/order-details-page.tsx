import {
  ArrowLeftIcon,
  CalendarIcon,
  PackageIcon,
  PencilIcon,
  UserIcon,
} from "lucide-react"
import * as React from "react"
import { Link, useParams } from "react-router"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  deliveriesByOrder,
  formatCurrency,
  invoicesByOrder,
  orderTotal,
} from "./data"
import { OrderFormSheet } from "./components/order-form"
import {
  deliveryStatusStyles,
  initials,
  invoiceStatusStyles,
  orderStatusStyles,
  supplierStatusStyles,
} from "./status"
import { useOrderById, useSupplierById } from "./store"

export default function ProcurementOrderDetailsPage() {
  const { orderId } = useParams()
  const order = useOrderById(orderId)
  const supplier = useSupplierById(order?.supplierId)
  const [formOpen, setFormOpen] = React.useState(false)

  if (!order) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground">
          We couldn&apos;t find an order called “{orderId}”.
        </p>
        <Button asChild variant="outline">
          <Link to="/procurement/orders">Back to orders</Link>
        </Button>
      </div>
    )
  }

  const total = orderTotal(order)
  const orderInvoices = invoicesByOrder(order.id)
  const orderDeliveries = deliveriesByOrder(order.id)
  const invoiced = orderInvoices.reduce((sum, item) => sum + item.amount, 0)
  const units = order.lines.reduce((sum, line) => sum + line.quantity, 0)

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Button asChild variant="ghost" size="sm" className="w-fit -ml-2">
        <Link to="/procurement/orders">
          <ArrowLeftIcon />
          Back to orders
        </Link>
      </Button>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardDescription className="flex flex-wrap items-center gap-2">
                <span>{order.id}</span>
                <span>·</span>
                <span>{order.category}</span>
              </CardDescription>
              <CardTitle className="text-2xl">{order.title}</CardTitle>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className={orderStatusStyles[order.status]}
                >
                  {order.status}
                </Badge>
                <Badge variant="outline">{order.lines.length} line items</Badge>
                <Badge variant="outline">{units} units</Badge>
              </div>
              <CardAction className="row-span-3 self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFormOpen(true)}
                >
                  <PencilIcon />
                  Edit order
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-3 @2xl/main:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <UserIcon className="size-4 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-col">
                  <span className="text-xs text-muted-foreground">Requester</span>
                  <span className="truncate text-sm font-medium">
                    {order.requester}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-col">
                  <span className="text-xs text-muted-foreground">Ordered</span>
                  <span className="truncate text-sm font-medium">
                    {order.orderedOn}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <PackageIcon className="size-4 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-col">
                  <span className="text-xs text-muted-foreground">Expected</span>
                  <span className="truncate text-sm font-medium">
                    {order.expectedDate}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line items</CardTitle>
              <CardDescription>
                {order.lines.length} lines · {units} units
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit price</TableHead>
                    <TableHead className="pr-6 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.lines.map((line) => (
                    <TableRow key={line.description}>
                      <TableCell className="pl-6 font-medium">
                        {line.description}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {line.quantity}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatCurrency(line.unitPrice)}
                      </TableCell>
                      <TableCell className="pr-6 text-right tabular-nums">
                        {formatCurrency(line.quantity * line.unitPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="pl-6 font-medium" colSpan={3}>
                      Order total
                    </TableCell>
                    <TableCell className="pr-6 text-right font-semibold tabular-nums">
                      {formatCurrency(total)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deliveries</CardTitle>
              <CardDescription>Scheduled and completed receipts</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {orderDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-start justify-between gap-2 rounded-lg border p-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{delivery.subject}</span>
                    <span className="text-xs text-muted-foreground">
                      {delivery.date} · {delivery.time} · {delivery.carrier} ·{" "}
                      {delivery.items} items
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={deliveryStatusStyles[delivery.status]}
                  >
                    {delivery.status}
                  </Badge>
                </div>
              ))}
              {orderDeliveries.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No deliveries booked against this order.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Financials</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <DetailRow label="Order total" value={formatCurrency(total)} />
              <Separator />
              <DetailRow label="Invoiced" value={formatCurrency(invoiced)} />
              <Separator />
              <DetailRow
                label="Outstanding"
                value={formatCurrency(Math.max(total - invoiced, 0))}
              />
              <Separator />
              <DetailRow
                label="Payment terms"
                value={supplier?.paymentTerms ?? "—"}
              />
            </CardContent>
          </Card>

          {supplier && (
            <Card>
              <CardHeader>
                <CardTitle>Supplier</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Link
                  to={`/procurement/suppliers/${supplier.id}`}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary/40"
                >
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs">
                      {initials(supplier.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {supplier.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {supplier.contactName} · {supplier.location}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={supplierStatusStyles[supplier.status]}
                  >
                    {supplier.status}
                  </Badge>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>{orderInvoices.length} received</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {orderInvoices.map((invoice) => (
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
                  <div className="flex shrink-0 items-center gap-2">
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
              {orderInvoices.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No invoices received yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <OrderFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        order={order}
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
