import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  SparklesIcon,
  TimerIcon,
  UsersIcon,
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
  TODAY,
  daysOpen,
  formatDay,
  formatTime,
  funnel,
  initials,
  sourceMix,
  timeToHire,
} from "./data"
import { priorityStyles, roleStatusStyles } from "./status"
import { useCandidates, useInterviews, useRoles } from "./store"

const funnelConfig = {
  count: { label: "Candidates", color: "var(--chart-1)" },
} satisfies ChartConfig

const hireConfig = {
  days: { label: "Actual days", color: "var(--chart-2)" },
  target: { label: "Target days", color: "var(--chart-3)" },
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

export default function RecruitingDashboardPage() {
  const roles = useRoles()
  const candidates = useCandidates()
  const interviews = useInterviews()

  const candidateById = (id?: string) =>
    candidates.find((item) => item.id === id)
  const roleById = (id?: string) => roles.find((item) => item.id === id)
  const candidatesForRole = (roleId: string) =>
    candidates.filter((candidate) => candidate.roleId === roleId)

  const openRoles = roles.filter((role) => role.status === "Open")
  const openings = openRoles.reduce((sum, role) => sum + role.openings, 0)
  const live = candidates.filter(
    (candidate) => candidate.stage !== "Hired" && candidate.stage !== "Rejected"
  )
  const inOffer = candidates.filter((candidate) => candidate.stage === "Offer")

  const weekEnd = new Date(TODAY)
  weekEnd.setDate(weekEnd.getDate() + 7)
  const thisWeek = interviews
    .filter(
      (interview) =>
        interview.status === "Scheduled" &&
        new Date(interview.start) <= weekEnd
    )
    .sort((a, b) => a.start.localeCompare(b.start))

  const awaiting = interviews.filter(
    (interview) => interview.status === "Completed"
  )

  const attention = [...roles]
    .filter((role) => role.status !== "Closed")
    .map((role) => ({
      role,
      pipeline: candidatesForRole(role.id).filter(
        (candidate) =>
          candidate.stage !== "Rejected" && candidate.stage !== "Hired"
      ).length,
    }))
    .sort((a, b) => daysOpen(b.role.opened) - daysOpen(a.role.opened))
    .slice(0, 5)

  const topOfFunnel = funnel[0].count
  const medianDays = timeToHire[timeToHire.length - 1].days

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Recruiting Overview</h2>
          <p className="text-sm text-muted-foreground">
            {openings} openings across {openRoles.length} roles ·{" "}
            {awaiting.length} interviews waiting on a decision
          </p>
        </div>
        <Button size="sm" asChild>
          <Link to="/recruiting/pipeline">
            View pipeline
            <ArrowRightIcon />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          icon={<BriefcaseIcon />}
          label="Open roles"
          value={String(openRoles.length)}
          caption={`${openings} seats to fill`}
        />
        <StatCard
          icon={<UsersIcon />}
          label="Live candidates"
          value={String(live.length)}
          caption={`${inOffer.length} at offer stage`}
        />
        <StatCard
          icon={<CalendarDaysIcon />}
          label="Interviews this week"
          value={String(thisWeek.length)}
          caption="Across four panels"
        />
        <StatCard
          icon={<TimerIcon />}
          label="Median time to hire"
          value={`${medianDays}d`}
          caption="Five days inside target"
        />
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Funnel</CardTitle>
            <CardDescription>
              {topOfFunnel} applications this quarter, narrowing to five hires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={funnelConfig} className="h-[220px] w-full">
              <BarChart data={funnel}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="stage" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time to hire</CardTitle>
            <CardDescription>
              Days from application to signed offer, against a 42-day target
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={hireConfig} className="h-[220px] w-full">
              <LineChart data={timeToHire}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
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
                  dataKey="days"
                  stroke="var(--color-days)"
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
            <CardTitle>Roles by age</CardTitle>
            <CardDescription>
              The longer a role stays open, the harder the sell becomes
            </CardDescription>
            <CardAction>
              <Button size="sm" variant="ghost" asChild>
                <Link to="/recruiting/pipeline">All roles</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Days open</TableHead>
                  <TableHead className="text-right">Pipeline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attention.map(({ role, pipeline }) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{role.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {role.department} · {role.hiringManager}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className={roleStatusStyles[role.status]}
                        >
                          {role.status}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={priorityStyles[role.priority]}
                        >
                          {role.priority}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {daysOpen(role.opened)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {pipeline}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Next up</CardTitle>
              <CardDescription>Interviews in the next seven days</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {thisWeek.slice(0, 5).map((interview) => {
                const candidate = candidateById(interview.candidateId)!
                return (
                  <Link
                    key={interview.id}
                    to={`/recruiting/candidates/${candidate.id}`}
                    className="flex items-center gap-3 rounded-lg -mx-2 px-2 py-1.5 hover:bg-accent/50"
                  >
                    <Avatar className="size-8">
                      <AvatarFallback className="text-[10px]">
                        {initials(candidate.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {candidate.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {roleById(interview.roleId)?.title}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-medium">
                        {formatDay(interview.start)}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatTime(interview.start)}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Where hires come from</CardTitle>
              <CardDescription>Last twelve months</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {sourceMix.map((entry) => {
                const total = sourceMix.reduce((sum, s) => sum + s.hires, 0)
                return (
                  <div key={entry.source} className="flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between text-sm">
                      <span>{entry.source}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {entry.hires}
                      </span>
                    </div>
                    <Progress value={(entry.hires / total) * 100} />
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transcript analysis</CardTitle>
              <CardDescription>
                {awaiting.length} completed interviews have a recording ready to
                read
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="outline" className="w-full" asChild>
                <Link to="/recruiting/transcripts">
                  <SparklesIcon />
                  Open transcripts
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
