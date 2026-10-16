import * as React from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ArrowRightIcon,
  GraduationCapIcon,
  TriangleAlertIcon,
  UserPlusIcon,
  WorkflowIcon,
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

import {
  completionTrend,
  contentItems,
  dayNumber,
  formatDate,
  hires,
  initials,
  progressFor,
  provisionRuns,
  requiredOutstanding,
  stages,
  stageVelocity,
  itemsForTrack,
} from "./data"
import { hireStatusStyles } from "./status"

const trendConfig = {
  started: { label: "Started", color: "var(--chart-2)" },
  completed: { label: "Completed", color: "var(--chart-1)" },
} satisfies ChartConfig

const velocityConfig = {
  target: { label: "Target days", color: "var(--chart-3)" },
  actual: { label: "Actual days", color: "var(--chart-4)" },
} satisfies ChartConfig

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

export default function OnboardingDashboardPage() {
  const active = hires.filter((hire) => hire.status !== "Complete")
  const atRisk = hires.filter((hire) => hire.status === "At risk")
  const starting = hires.filter((hire) => dayNumber(hire.startDate) < 0)
  const needsAttention = provisionRuns.filter(
    (run) => run.status === "Needs attention"
  )

  const totalRequired = hires.reduce(
    (sum, hire) =>
      sum + itemsForTrack(hire.track).filter((item) => item.required).length,
    0
  )
  const doneRequired = hires.reduce(
    (sum, hire) =>
      sum +
      itemsForTrack(hire.track).filter(
        (item) => item.required && hire.completed.includes(item.id)
      ).length,
    0
  )
  const compliance = Math.round((doneRequired / totalRequired) * 100)

  const stageSpread = stages.map((stage) => {
    const stageItems = contentItems.filter((item) => item.stage === stage.id)
    const reached = active.filter((hire) =>
      stageItems.some((item) => hire.completed.includes(item.id))
    ).length
    return { ...stage, reached }
  })

  const attention = [...hires]
    .filter((hire) => hire.status !== "Complete")
    .map((hire) => ({ hire, outstanding: requiredOutstanding(hire) }))
    .sort((a, b) => b.outstanding.length - a.outstanding.length)
    .slice(0, 6)

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Onboarding Overview</h2>
          <p className="text-sm text-muted-foreground">
            {active.length} people mid-journey · {starting.length} starting in
            the next fortnight
          </p>
        </div>
        <Button size="sm" asChild>
          <Link to="/onboarding/hires">
            <UserPlusIcon />
            Manage new hires
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          icon={<UserPlusIcon />}
          label="In progress"
          value={String(active.length)}
          caption={`${hires.length} hires in the last quarter`}
        />
        <StatCard
          icon={<TriangleAlertIcon />}
          label="At risk"
          value={String(atRisk.length)}
          caption="Required steps overdue"
        />
        <StatCard
          icon={<GraduationCapIcon />}
          label="Mandatory complete"
          value={`${compliance}%`}
          caption="Policies, quizzes and setup"
        />
        <StatCard
          icon={<WorkflowIcon />}
          label="Provisioning issues"
          value={String(needsAttention.length)}
          caption="Runs waiting on a human"
        />
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Starts and completions</CardTitle>
            <CardDescription>
              People beginning versus finishing their 90 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trendConfig} className="h-[220px] w-full">
              <BarChart data={completionTrend}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="started" fill="var(--color-started)" radius={4} />
                <Bar
                  dataKey="completed"
                  fill="var(--color-completed)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stage velocity</CardTitle>
            <CardDescription>
              Days to reach each milestone against the plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={velocityConfig} className="h-[220px] w-full">
              <LineChart data={stageVelocity}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="stage" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="target"
                  stroke="var(--color-target)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  dataKey="actual"
                  stroke="var(--color-actual)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-[minmax(0,1fr)_320px] @4xl/main:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Who needs a nudge</CardTitle>
            <CardDescription>
              Ranked by outstanding required steps
            </CardDescription>
            <CardAction>
              <Button size="sm" variant="ghost" asChild>
                <Link to="/onboarding/hires">
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
                  <TableHead>Hire</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attention.map(({ hire, outstanding }) => {
                  const progress = progressFor(hire)
                  return (
                    <TableRow key={hire.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-7">
                            <AvatarFallback className="text-[10px]">
                              {initials(hire.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <Link
                              to={`/onboarding/hires/${hire.id}`}
                              className="font-medium hover:underline"
                            >
                              {hire.name}
                            </Link>
                            <p className="truncate text-xs text-muted-foreground">
                              {hire.role}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={hireStatusStyles[hire.status]}
                        >
                          {hire.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={progress.percent}
                            className="h-1.5 w-20"
                          />
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {progress.percent}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        {outstanding.length === 0 ? (
                          <span className="text-muted-foreground">None</span>
                        ) : (
                          <span
                            className={
                              outstanding.length > 6
                                ? "font-medium text-destructive"
                                : undefined
                            }
                          >
                            {outstanding.length}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Starting soon</CardTitle>
              <CardDescription>Pre-boarding in flight</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {starting.map((hire) => (
                <div key={hire.id} className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-[10px]">
                      {initials(hire.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/onboarding/hires/${hire.id}`}
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {hire.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {hire.role}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium tabular-nums">
                      in {Math.abs(dayNumber(hire.startDate))}d
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(hire.startDate)}
                    </p>
                  </div>
                </div>
              ))}
              {starting.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nobody joins in the next fortnight.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cohort spread</CardTitle>
              <CardDescription>Where active hires have reached</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {stageSpread.map((stage) => (
                <div key={stage.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{stage.name}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {stage.reached}
                    </span>
                  </div>
                  <Progress
                    value={
                      active.length === 0
                        ? 0
                        : (stage.reached / active.length) * 100
                    }
                    className="h-1.5"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Provisioning</CardTitle>
              <CardDescription>
                {needsAttention.length} of {provisionRuns.length} runs need a
                human
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {needsAttention.map((run) => {
                const hire = hires.find((entry) => entry.id === run.hireId)
                const stuck = run.steps.find((step) => step.state !== "done")
                return (
                  <div key={run.id} className="flex items-start gap-3">
                    <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-warning" />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/onboarding/hires/${run.hireId}`}
                        className="truncate text-sm font-medium hover:underline"
                      >
                        {hire?.name ?? run.hireId}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {stuck?.message ?? run.id}
                      </p>
                    </div>
                  </div>
                )
              })}
              {needsAttention.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Every run finished on its own.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
