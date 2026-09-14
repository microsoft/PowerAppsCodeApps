import * as React from "react"
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts"
import {
  ArrowRightIcon,
  BanknoteIcon,
  HandCoinsIcon,
  PlusIcon,
  TargetIcon,
  TrendingUpIcon,
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
  activities,
  contacts,
  deals,
  formatCurrency,
  isOpen,
  monthlyRevenue,
  openStages,
} from "./data"
import { activityTypeStyles, dealStageDots, dealStageStyles, initials } from "./status"
import { useCompanyName } from "./store"

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  won: { label: "Deals won", color: "var(--chart-2)" },
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

export default function CrmDashboardPage() {
  const companyName = useCompanyName()
  const [range, setRange] = React.useState<keyof typeof ranges>("ALL")

  const openDeals = deals.filter(isOpen)
  const wonDeals = deals.filter((deal) => deal.stage === "Closed Won")
  const lostDeals = deals.filter((deal) => deal.stage === "Closed Lost")

  const pipelineValue = openDeals.reduce((sum, deal) => sum + deal.value, 0)
  const weighted = openDeals.reduce(
    (sum, deal) => sum + (deal.value * deal.probability) / 100,
    0
  )
  const wonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0)
  const winRate = Math.round(
    (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100
  )

  const chartData = monthlyRevenue.slice(-ranges[range])
  const topDeals = [...openDeals].sort((a, b) => b.value - a.value).slice(0, 5)
  const upcoming = activities.filter((activity) => !activity.done).slice(0, 5)

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">CRM Overview</h2>
          <p className="text-sm text-muted-foreground">
            {openDeals.length} open deals · {contacts.length} contacts
          </p>
        </div>
        <Button size="sm">
          <PlusIcon />
          New Deal
        </Button>
      </div>

      <div className="grid gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          icon={<HandCoinsIcon />}
          label="Open pipeline"
          value={formatCurrency(pipelineValue, true)}
          caption={`${openDeals.length} deals in play`}
        />
        <StatCard
          icon={<TargetIcon />}
          label="Weighted forecast"
          value={formatCurrency(weighted, true)}
          caption="Probability adjusted"
        />
        <StatCard
          icon={<BanknoteIcon />}
          label="Closed won"
          value={formatCurrency(wonValue, true)}
          caption={`${wonDeals.length} deals this year`}
        />
        <StatCard
          icon={<TrendingUpIcon />}
          label="Win rate"
          value={`${winRate}%`}
          caption={`${wonDeals.length} won / ${lostDeals.length} lost`}
        />
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-3">
        <Card className="@4xl/main:col-span-2">
          <CardHeader>
            <CardTitle>Revenue &amp; deals won</CardTitle>
            <CardDescription>Closed won revenue by month</CardDescription>
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
                  yAxisId="revenue"
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tickFormatter={(value) => formatCurrency(Number(value), true)}
                />
                <YAxis yAxisId="won" orientation="right" hide />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Bar
                  yAxisId="won"
                  dataKey="won"
                  fill="var(--color-won)"
                  radius={4}
                  barSize={16}
                />
                <Area
                  yAxisId="revenue"
                  dataKey="revenue"
                  type="monotone"
                  stroke="var(--color-revenue)"
                  fill="var(--color-revenue)"
                  fillOpacity={0.2}
                />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline by stage</CardTitle>
            <CardDescription>Open value across the funnel</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {openStages.map((stage) => {
              const stageDeals = openDeals.filter(
                (deal) => deal.stage === stage
              )
              const value = stageDeals.reduce((sum, d) => sum + d.value, 0)
              const share = pipelineValue
                ? Math.round((value / pipelineValue) * 100)
                : 0

              return (
                <div key={stage} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className={`size-2 rounded-full ${dealStageDots[stage]}`}
                    />
                    <span className="font-medium">{stage}</span>
                    <span className="text-muted-foreground">
                      · {stageDeals.length}
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
              <Link to="/crm/pipeline">
                Open pipeline board
                <ArrowRightIcon />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-3">
        <Card className="@4xl/main:col-span-2">
          <CardHeader>
            <CardTitle>Top open deals</CardTitle>
            <CardDescription>Largest opportunities by value</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link to="/crm/pipeline">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Deal</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="pr-6 text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topDeals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="pl-6 font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-xs">
                            {initials(deal.owner)}
                          </AvatarFallback>
                        </Avatar>
                        {deal.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/crm/companies/${deal.companyId}`}
                        className="text-muted-foreground hover:underline"
                      >
                        {companyName(deal.companyId)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={dealStageStyles[deal.stage]}
                      >
                        {deal.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right tabular-nums">
                      {formatCurrency(deal.value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Up next</CardTitle>
            <CardDescription>Activities awaiting you</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link to="/crm/activities">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {upcoming.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <Badge
                  variant="secondary"
                  className={activityTypeStyles[activity.type]}
                >
                  {activity.type}
                </Badge>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {activity.subject}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {activity.date} · {activity.time} · {activity.owner}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
