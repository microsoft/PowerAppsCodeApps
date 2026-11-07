import * as React from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ArrowRightIcon,
  ClockIcon,
  MegaphoneIcon,
  SendIcon,
  SparklesIcon,
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
  comms,
  commTypes,
  formatCompact,
  initials,
  isAwaitingApproval,
  monthlyVolume,
} from "./data"
import { commStatusStyles, commTypeStyles } from "./status"

const volumeConfig = {
  published: { label: "Published", color: "var(--chart-1)" },
  drafted: { label: "Drafted", color: "var(--chart-2)" },
} satisfies ChartConfig

const reachConfig = {
  reach: { label: "Reach", color: "var(--chart-3)" },
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

export default function CommsDashboardPage() {
  const published = comms.filter((comm) => comm.status === "Published")
  const scheduled = comms.filter((comm) => comm.status === "Scheduled")
  const awaiting = comms.filter(isAwaitingApproval)
  const aiShare = Math.round(
    (comms.filter((comm) => comm.aiGenerated).length / comms.length) * 100
  )
  const totalReach = published.reduce((sum, comm) => sum + comm.reach, 0)

  const byType = commTypes
    .map((type) => ({
      type,
      count: comms.filter((comm) => comm.type === type).length,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count)
  const maxType = Math.max(...byType.map((row) => row.count))

  const upcoming = [...scheduled, ...awaiting].sort((a, b) =>
    (a.scheduledFor ?? a.updatedOn).localeCompare(b.scheduledFor ?? b.updatedOn)
  )

  const recent = [...comms]
    .sort((a, b) => b.updatedOn.localeCompare(a.updatedOn))
    .slice(0, 6)

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Communications Overview</h2>
          <p className="text-sm text-muted-foreground">
            {comms.length} communications across {byType.length} formats · today
            is 2 September 2026
          </p>
        </div>
        <Button size="sm" asChild>
          <Link to="/comms/compose">
            <SparklesIcon />
            Compose with agent
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          icon={<SendIcon />}
          label="Published"
          value={String(published.length)}
          caption="Live across all channels"
        />
        <StatCard
          icon={<ClockIcon />}
          label="Awaiting approval"
          value={String(awaiting.length)}
          caption={`${scheduled.length} more scheduled to send`}
        />
        <StatCard
          icon={<UsersIcon />}
          label="Total reach"
          value={formatCompact(totalReach)}
          caption="Recipients and impressions"
        />
        <StatCard
          icon={<SparklesIcon />}
          label="Agent drafted"
          value={`${aiShare}%`}
          caption="Of everything in the library"
        />
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Volume by month</CardTitle>
            <CardDescription>Drafted versus published</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={volumeConfig} className="h-[220px] w-full">
              <BarChart data={monthlyVolume}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="drafted" fill="var(--color-drafted)" radius={4} />
                <Bar dataKey="published" fill="var(--color-published)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reach</CardTitle>
            <CardDescription>Recipients and impressions per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={reachConfig} className="h-[220px] w-full">
              <LineChart data={monthlyVolume}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tickFormatter={(value: number) => formatCompact(value)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="reach"
                  stroke="var(--color-reach)"
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
            <CardTitle>Recently updated</CardTitle>
            <CardDescription>The last six items anyone touched</CardDescription>
            <CardAction>
              <Button size="sm" variant="ghost" asChild>
                <Link to="/comms/list">
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
                  <TableHead>Communication</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((comm) => (
                  <TableRow key={comm.id}>
                    <TableCell>
                      <Link
                        to={`/comms/list/${comm.id}`}
                        className="font-medium hover:underline"
                      >
                        {comm.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {comm.id} · {comm.owner}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={commTypeStyles[comm.type]}
                      >
                        {comm.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={commStatusStyles[comm.status]}
                      >
                        {comm.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                      {comm.updatedOn}
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
              <CardTitle className="text-base">Mix by format</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {byType.map((row) => (
                <div key={row.type} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{row.type}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {row.count}
                    </span>
                  </div>
                  <Progress value={(row.count / maxType) * 100} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MegaphoneIcon className="size-4" />
                Coming up
              </CardTitle>
              <CardDescription>Scheduled and awaiting sign-off</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {upcoming.map((comm) => (
                <Link
                  key={comm.id}
                  to={`/comms/list/${comm.id}`}
                  className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/50"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">
                      {initials(comm.owner)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {comm.title}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {comm.scheduledFor
                        ? `Sends ${comm.scheduledFor}`
                        : `With ${comm.approver}`}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={commStatusStyles[comm.status]}
                  >
                    {comm.status}
                  </Badge>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
