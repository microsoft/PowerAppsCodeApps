import * as React from "react"
import { Area, Bar, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts"
import {
  ArrowRightIcon,
  CalendarCheckIcon,
  ClipboardCheckIcon,
  PlusIcon,
  ShieldAlertIcon,
  TriangleAlertIcon,
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
  actionStages,
  correctiveActions,
  incidents,
  initials,
  isOpenIncident,
  monthlyTrend,
  residualScore,
  riskBand,
  risks,
  safetyWalks,
  sites,
  walkScore,
} from "./data"
import {
  actionStageDots,
  incidentStatusStyles,
  severityStyles,
  walkStatusStyles,
} from "./status"

const chartConfig = {
  nearMisses: { label: "Near misses", color: "var(--chart-2)" },
  incidents: { label: "Incidents", color: "var(--chart-1)" },
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

export default function SafetyDashboardPage() {
  const [range, setRange] = React.useState<keyof typeof ranges>("ALL")

  const openIncidents = incidents.filter(isOpenIncident)
  const lostTimeDays = incidents.reduce(
    (sum, incident) => sum + incident.lostTimeDays,
    0
  )
  const openActions = correctiveActions.filter(
    (action) => action.stage !== "Done"
  )
  const overdue = openActions.filter((action) => action.dueOn < "2026-09-02")
  const highResidual = risks.filter((risk) => residualScore(risk) >= 10)
  const upcomingWalks = safetyWalks.filter((walk) => walk.status !== "Completed")
  const completedWalks = safetyWalks.filter((walk) => walk.status === "Completed")
  const avgWalkScore = completedWalks.length
    ? Math.round(
        completedWalks.reduce((sum, walk) => sum + walkScore(walk), 0) /
          completedWalks.length
      )
    : 0

  const chartData = monthlyTrend.slice(-ranges[range])
  const recentIncidents = [...openIncidents]
    .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn))
    .slice(0, 5)
  const topRisks = [...risks]
    .sort((a, b) => residualScore(b) - residualScore(a))
    .slice(0, 5)

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Health &amp; Safety Overview</h2>
          <p className="text-sm text-muted-foreground">
            {sites.length} sites · {openIncidents.length} open incidents ·{" "}
            {overdue.length} overdue actions
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/safety/walks">
              <ClipboardCheckIcon />
              Safety Walks
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/safety/incidents/new">
              <PlusIcon />
              Report Incident
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          icon={<TriangleAlertIcon />}
          label="Open incidents"
          value={String(openIncidents.length)}
          caption={`${incidents.length} reported in the last 12 months`}
        />
        <StatCard
          icon={<CalendarCheckIcon />}
          label="Days lost"
          value={String(lostTimeDays)}
          caption="Lost-time days across all sites"
        />
        <StatCard
          icon={<ClipboardCheckIcon />}
          label="Open actions"
          value={String(openActions.length)}
          caption={`${overdue.length} past their due date`}
        />
        <StatCard
          icon={<ShieldAlertIcon />}
          label="Walk compliance"
          value={`${avgWalkScore}%`}
          caption={`${completedWalks.length} walks completed`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incident &amp; near-miss trend</CardTitle>
          <CardDescription>
            A rising near-miss count against falling incidents is a healthy
            reporting culture
          </CardDescription>
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
              {Object.keys(ranges).map((key) => (
                <ToggleGroupItem key={key} value={key}>
                  {key}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="fillNearMisses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-nearMisses)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--color-nearMisses)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} width={32} />
              <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                yAxisId="left"
                dataKey="nearMisses"
                type="monotone"
                fill="url(#fillNearMisses)"
                stroke="var(--color-nearMisses)"
                strokeWidth={2}
              />
              <Bar
                yAxisId="right"
                dataKey="incidents"
                fill="var(--color-incidents)"
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 @4xl/main:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Open incidents</CardTitle>
            <CardDescription>Most recent first</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/safety/incidents">
                  View all
                  <ArrowRightIcon />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incident</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Occurred</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>
                      <Link
                        to={`/safety/incidents/${incident.id}`}
                        className="font-medium hover:underline"
                      >
                        {incident.title}
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Avatar className="size-4">
                          <AvatarFallback className="text-[9px]">
                            {initials(incident.owner)}
                          </AvatarFallback>
                        </Avatar>
                        {incident.site}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={severityStyles[incident.severity]}
                      >
                        {incident.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={incidentStatusStyles[incident.status]}
                      >
                        {incident.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                      {incident.occurredOn}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Corrective actions</CardTitle>
            <CardDescription>By stage</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {actionStages.map((stage) => {
              const count = correctiveActions.filter(
                (action) => action.stage === stage
              ).length
              return (
                <div key={stage} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className={`size-2 rounded-full ${actionStageDots[stage]}`}
                    />
                    <span className="flex-1">{stage}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  </div>
                  <Progress
                    value={(count / correctiveActions.length) * 100}
                    className="h-1.5"
                  />
                </div>
              )
            })}
            <Button variant="outline" size="sm" className="mt-1" asChild>
              <Link to="/safety/actions">
                Open action board
                <ArrowRightIcon />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Highest residual risks</CardTitle>
            <CardDescription>
              {highResidual.length} risks scoring 10 or above after controls
            </CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/safety/risks">
                  View register
                  <ArrowRightIcon />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {topRisks.map((risk) => {
              const score = residualScore(risk)
              return (
                <Link
                  key={risk.id}
                  to={`/safety/risks?risk=${risk.id}`}
                  className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {risk.hazard}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {risk.site} · {risk.category}
                    </span>
                  </span>
                  <Badge
                    variant="secondary"
                    className={severityStyles[riskBand(score)]}
                  >
                    {score}
                  </Badge>
                </Link>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming safety walks</CardTitle>
            <CardDescription>{upcomingWalks.length} scheduled or in progress</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/safety/walks">
                  View all
                  <ArrowRightIcon />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {upcomingWalks.map((walk) => (
              <Link
                key={walk.id}
                to={`/safety/walks/${walk.id}`}
                className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">
                    {initials(walk.leader)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {walk.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {walk.site} · {walk.scheduledFor}
                  </span>
                </span>
                <Badge
                  variant="secondary"
                  className={walkStatusStyles[walk.status]}
                >
                  {walk.status}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
