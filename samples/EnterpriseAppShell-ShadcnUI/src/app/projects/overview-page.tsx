import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
} from "recharts"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
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
import { Separator } from "@/components/ui/separator"

import { monthlyPerformance, type ProjectStatus } from "./data"
import { initials, projectStatusStyles } from "./status"
import { useProjects } from "./store"

const statusOrder: ProjectStatus[] = ["In Progress", "Pending", "Completed"]

const statusChartColors: Record<ProjectStatus, string> = {
  "In Progress": "var(--chart-1)",
  Pending: "var(--chart-3)",
  Completed: "var(--chart-2)",
}

const chartConfig = {
  value: { label: "Projects" },
  projects: { label: "Projects", color: "var(--chart-1)" },
  active: { label: "Active", color: "var(--chart-2)" },
} satisfies ChartConfig

export default function ProjectsOverviewPage() {
  const allProjects = useProjects()
  const statusBreakdown = statusOrder.map((status) => ({
    status,
    value: allProjects.filter((project) => project.status === status).length,
  }))

  const averageProgress = Math.round(
    allProjects.reduce((total, project) => total + project.progress, 0) /
      allProjects.length
  )

  const leads = [...new Set(allProjects.map((project) => project.lead))].map(
    (lead) => {
      const owned = allProjects.filter((project) => project.lead === lead)
      return {
        lead,
        count: owned.length,
        progress: Math.round(
          owned.reduce((total, project) => total + project.progress, 0) /
            owned.length
        ),
      }
    }
  )

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h2 className="text-xl font-semibold">Projects Overview</h2>
        <p className="text-sm text-muted-foreground">
          Portfolio health across {allProjects.length} projects
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Projects" value={String(allProjects.length)} />
        <SummaryCard
          label="Average Progress"
          value={`${averageProgress}%`}
          progress={averageProgress}
        />
        <SummaryCard
          label="Completed"
          value={String(
            allProjects.filter((project) => project.status === "Completed")
              .length
          )}
        />
        <SummaryCard
          label="Awaiting Kickoff"
          value={String(
            allProjects.filter((project) => project.status === "Pending").length
          )}
        />
      </div>

      <div className="grid items-start gap-4 md:gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Delivery Volume</CardTitle>
            <CardDescription>Projects delivered per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <BarChart data={monthlyPerformance}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="projects" fill="var(--color-projects)" radius={4} />
                <Bar dataKey="active" fill="var(--color-active)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>Distribution by current state</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ChartContainer config={chartConfig} className="mx-auto h-[180px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
                <Pie data={statusBreakdown} dataKey="value" nameKey="status" innerRadius={45}>
                  {statusBreakdown.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={statusChartColors[entry.status]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-col gap-2">
              {statusBreakdown.map((entry) => (
                <div
                  key={entry.status}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: statusChartColors[entry.status] }}
                    />
                    {entry.status}
                  </span>
                  <span className="font-medium tabular-nums">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid items-start gap-4 md:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workload by Lead</CardTitle>
            <CardDescription>Owned projects and average progress</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {leads.map((entry) => (
              <div key={entry.lead} className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">
                    {initials(entry.lead)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{entry.lead}</span>
                    <span className="text-muted-foreground">
                      {entry.count} {entry.count === 1 ? "project" : "projects"}
                    </span>
                  </div>
                  <Progress value={entry.progress} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Projects that are not complete yet</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {allProjects
              .filter((project) => project.status !== "Completed")
              .slice(0, 6)
              .map((project, index, list) => (
                <div key={project.id} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">
                        {project.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {project.lead}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={projectStatusStyles[project.status]}
                      >
                        {project.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {project.dueDate}
                      </span>
                    </div>
                  </div>
                  {index < list.length - 1 && <Separator />}
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  progress,
}: {
  label: string
  value: string
  progress?: number
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {progress !== undefined && <Progress value={progress} />}
      </CardContent>
    </Card>
  )
}
