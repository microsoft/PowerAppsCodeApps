import * as React from "react"
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts"
import {
  ArrowRightIcon,
  ClipboardCheckIcon,
  PlusIcon,
  ShoppingCartIcon,
  TruckIcon,
  WalletIcon,
} from "lucide-react"
import { Link } from "react-router"

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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import {
  deliveries,
  formatCurrency,
  invoices,
  isOpenOrder,
  monthlySpend,
  openRequisitionStages,
  orderTotal,
  purchaseOrders,
  requisitions,
  suppliers,
  supplierName,
} from "./data"
import {
  deliveryStatusStyles,
  initials,
  orderStatusStyles,
  requisitionStageDots,
} from "./status"

const chartConfig = {
  spend: { label: "Spend", color: "var(--chart-1)" },
  orders: { label: "Orders", color: "var(--chart-2)" },
} satisfies ChartConfig

const ranges = { "3M": 3, "6M": 6, ALL: 12 } as const

function StatCard({
  icon,
  label,
  value,
  caption,
}: {
  icon: React.ReactNode
  label: string
  value: string
  caption: string
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-5">
          {icon}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </span>
          <span className="text-2xl font-semibold tabular-nums">{value}</span>
          <span className="text-sm text-muted-foreground">{caption}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProcurementDashboardPage() {
  const [range, setRange] = React.useState<keyof typeof ranges>("ALL")

  const openOrders = purchaseOrders.filter(isOpenOrder)
  const committed = openOrders.reduce((sum, order) => sum + orderTotal(order), 0)
  const spendYtd = monthlySpend.reduce((sum, month) => sum + month.spend, 0)
  const pendingInvoices = invoices.filter(
    (invoice) => invoice.status === "Pending" || invoice.status === "Disputed"
  )
  const payableValue = pendingInvoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0
  )
  const onTime = Math.round(
    suppliers.reduce((sum, supplier) => sum + supplier.onTimeRate, 0) /
      suppliers.length
  )

  const chartData = monthlySpend.slice(-ranges[range])
  const awaiting = requisitions.filter((item) =>
    openRequisitionStages.includes(item.stage)
  )
  const topOrders = [...openOrders]
    .sort((a, b) => orderTotal(b) - orderTotal(a))
    .slice(0, 5)
  const upcoming = deliveries.filter((delivery) => !delivery.done).slice(0, 5)
  const requisitionValue = awaiting.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Procurement Overview</h2>
          <p className="text-sm text-muted-foreground">
            {openOrders.length} open orders · {suppliers.length} active suppliers
          </p>
        </div>
        <Button size="sm">
          <PlusIcon />
          New Order
        </Button>
      </div>

      <div className="grid gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          icon={<ShoppingCartIcon />}
          label="Open commitments"
          value={formatCurrency(committed, true)}
          caption={`${openOrders.length} orders in flight`}
        />
        <StatCard
          icon={<WalletIcon />}
          label="Spend (12 mo)"
          value={formatCurrency(spendYtd, true)}
          caption="Across all categories"
        />
        <StatCard
          icon={<ClipboardCheckIcon />}
          label="Awaiting approval"
          value={formatCurrency(payableValue, true)}
          caption={`${pendingInvoices.length} invoices to clear`}
        />
        <StatCard
          icon={<TruckIcon />}
          label="On-time delivery"
          value={`${onTime}%`}
          caption="Weighted supplier average"
        />
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-3">
        <Card className="@4xl/main:col-span-2">
          <CardHeader>
            <CardTitle>Spend &amp; order volume</CardTitle>
            <CardDescription>Committed spend by month</CardDescription>
            <CardAction>
              <ToggleGroup
                type="single"
                value={range}
                onValueChange={(value) =>
                  value && setRange(value as keyof typeof ranges)
                }
                variant="outline"
                size="sm"
              >
                {(Object.keys(ranges) as (keyof typeof ranges)[]).map((item) => (
                  <ToggleGroupItem key={item} value={item}>
                    {item}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <ComposedChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  yAxisId="spend"
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tickFormatter={(value) => formatCurrency(Number(value), true)}
                />
                <YAxis yAxisId="orders" orientation="right" hide />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Bar
                  yAxisId="orders"
                  dataKey="orders"
                  fill="var(--color-orders)"
                  radius={4}
                  barSize={16}
                />
                <Area
                  yAxisId="spend"
                  dataKey="spend"
                  type="monotone"
                  stroke="var(--color-spend)"
                  fill="var(--color-spend)"
                  fillOpacity={0.2}
                />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requisitions in flight</CardTitle>
            <CardDescription>
              {formatCurrency(requisitionValue, true)} pending conversion
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {openRequisitionStages.map((stage) => {
              const stageItems = awaiting.filter((item) => item.stage === stage)
              const value = stageItems.reduce((sum, i) => sum + i.amount, 0)
              const share = requisitionValue
                ? Math.round((value / requisitionValue) * 100)
                : 0

              return (
                <div key={stage} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className={`size-2 rounded-full ${requisitionStageDots[stage]}`}
                    />
                    <span className="font-medium">{stage}</span>
                    <span className="text-muted-foreground">
                      · {stageItems.length}
                    </span>
                    <span className="ml-auto tabular-nums">
                      {formatCurrency(value, true)}
                    </span>
                  </div>
                  <Progress value={share} />
                </div>
              )
            })}
            <Button asChild variant="outline" size="sm" className="mt-1">
              <Link to="/procurement/requisitions">
                Open approval board
                <ArrowRightIcon />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-3">
        <Card className="@4xl/main:col-span-2">
          <CardHeader>
            <CardTitle>Largest open orders</CardTitle>
            <CardDescription>Highest committed value</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link to="/procurement/orders">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Order</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="pl-6 font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-xs">
                            {initials(order.requester)}
                          </AvatarFallback>
                        </Avatar>
                        <Link
                          to={`/procurement/orders/${order.id}`}
                          className="hover:underline"
                        >
                          {order.title}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/procurement/suppliers/${order.supplierId}`}
                        className="text-muted-foreground hover:underline"
                      >
                        {supplierName(order.supplierId)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={orderStatusStyles[order.status]}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right tabular-nums">
                      {formatCurrency(orderTotal(order))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incoming deliveries</CardTitle>
            <CardDescription>Next scheduled receipts</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link to="/procurement/deliveries">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {upcoming.map((delivery) => (
              <div key={delivery.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={deliveryStatusStyles[delivery.status]}
                  >
                    {delivery.status}
                  </Badge>
                  <span className="truncate text-sm font-medium">
                    {delivery.subject}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {delivery.date} · {delivery.time} ·{" "}
                  {supplierName(delivery.supplierId)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
