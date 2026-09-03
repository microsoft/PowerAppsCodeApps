import * as React from "react"
import { format, parseISO } from "date-fns"
import { CheckCircle2Icon, PackageIcon, TruckIcon } from "lucide-react"
import { Link } from "react-router"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

import {
  deliveries as initialDeliveries,
  supplierName,
  type Delivery,
} from "./data"
import { deliveryStatusStyles } from "./status"

const scopes = ["Day", "Open", "All"] as const

function toKey(date: Date) {
  return format(date, "yyyy-MM-dd")
}

export default function ProcurementDeliveriesPage() {
  const [items, setItems] = React.useState<Delivery[]>(initialDeliveries)
  const [date, setDate] = React.useState<Date | undefined>(
    parseISO("2026-09-02")
  )
  const [scope, setScope] = React.useState<(typeof scopes)[number]>("Day")

  const busyDays = items.map((delivery) => parseISO(delivery.date))

  const visible = items
    .filter((delivery) => {
      if (scope === "All") return true
      if (scope === "Open") return !delivery.done
      return date ? delivery.date === toKey(date) : false
    })
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))

  function toggle(delivery: Delivery) {
    setItems((prev) =>
      prev.map((entry) =>
        entry.id === delivery.id
          ? {
              ...entry,
              done: !entry.done,
              status: !entry.done ? "Delivered" : "Scheduled",
            }
          : entry
      )
    )
    toast.success(
      delivery.done
        ? `${delivery.subject} reopened`
        : `${delivery.subject} marked as received`
    )
  }

  const heading =
    scope === "Day"
      ? date
        ? format(date, "EEEE, dd MMMM yyyy")
        : "Pick a date"
      : scope === "Open"
        ? "Open deliveries"
        : "All deliveries"

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Deliveries</h2>
          <p className="text-sm text-muted-foreground">
            {items.filter((delivery) => !delivery.done).length} open receipts
            across {items.length} bookings
          </p>
        </div>
        <Button size="sm">
          <PackageIcon />
          Book Delivery
        </Button>
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Underlined days have receipts</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(value) => {
                setDate(value)
                setScope("Day")
              }}
              modifiers={{ busy: busyDays }}
              modifiersClassNames={{
                busy: "font-semibold underline decoration-primary decoration-2 underline-offset-4",
              }}
              captionLayout="dropdown"
              className="w-full p-0 [--cell-size:--spacing(8)]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{heading}</CardTitle>
            <CardDescription aria-live="polite" aria-atomic="true">
              {visible.length} {visible.length === 1 ? "delivery" : "deliveries"}
            </CardDescription>
            <CardAction>
              <div className="flex gap-1">
                {scopes.map((item) => (
                  <Button
                    key={item}
                    size="sm"
                    variant={scope === item ? "default" : "ghost"}
                    onClick={() => setScope(item)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {visible.map((delivery) => (
              <div
                key={delivery.id}
                className="flex items-start gap-3 rounded-xl border p-3"
              >
                <Checkbox
                  checked={delivery.done}
                  onCheckedChange={() => toggle(delivery)}
                  className="mt-1"
                  aria-label={`Mark ${delivery.subject} received`}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        delivery.done && "text-muted-foreground line-through"
                      )}
                    >
                      {delivery.subject}
                    </span>
                    <Badge
                      variant="secondary"
                      className={deliveryStatusStyles[delivery.status]}
                    >
                      {delivery.status}
                    </Badge>
                    {delivery.done && (
                      <CheckCircle2Icon className="size-4 text-success" />
                    )}
                  </div>
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TruckIcon className="size-3.5" />
                      {delivery.carrier}
                    </span>
                    <span>·</span>
                    <span>{delivery.items} items</span>
                    <span>·</span>
                    <Link
                      to={`/procurement/suppliers/${delivery.supplierId}`}
                      className="hover:underline"
                    >
                      {supplierName(delivery.supplierId)}
                    </Link>
                    {delivery.orderId && (
                      <>
                        <span>·</span>
                        <Link
                          to={`/procurement/orders/${delivery.orderId}`}
                          className="hover:underline"
                        >
                          {delivery.orderId}
                        </Link>
                      </>
                    )}
                  </span>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {format(parseISO(delivery.date), "dd MMM")} · {delivery.time}
                </span>
              </div>
            ))}

            {visible.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nothing scheduled for this view.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
