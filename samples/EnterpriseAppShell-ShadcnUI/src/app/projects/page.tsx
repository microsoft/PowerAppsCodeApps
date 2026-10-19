import * as React from "react"
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  BriefcaseBusinessIcon,
  ClockIcon,
  LightbulbIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react"
import { Link } from "react-router"

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DataPagination } from "@/components/common/data-pagination"

import { events, monthlyPerformance, projectSlug, tasks } from "./data"
import { initials, projectStatusStyles as statusStyles } from "./status"
import { useProjects } from "./store"

const chartConfig = {
  projects: { label: "Number of Projects", color: "var(--chart-3)" },
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  active: { label: "Active Projects", color: "var(--chart-2)" },
} satisfies ChartConfig

const rangeToMonths = { ALL: 12, "3M": 3, "6M": 6, "1Y": 12 }

/** Small enough that the dashboard card keeps its shape next to the right rail. */
const projectsPageSize = 5

function StatCard({
  icon,
  label,
  value,
  caption,
  delta,
}: {
  icon: React.ReactNode
  label: string
  value: string
  caption: string
  delta: number
}) {
  const isPositive = delta > 0

  return (
    <Card>
      <CardContent className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-5">
          {icon}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {label}
            </span>
            <Badge
              variant="secondary"
              className={
                isPositive
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }
            >
              {isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {Math.abs(delta).toFixed(2)}%
            </Badge>
          </div>
          <span className="text-2xl font-semibold tabular-nums">{value}</span>
          <span className="text-sm text-muted-foreground">{caption}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function ProjectsOverview() {
  const [range, setRange] = React.useState<keyof typeof rangeToMonths>("ALL")
  const data = monthlyPerformance.slice(-rangeToMonths[range])

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Projects Overview</CardTitle>
        <CardAction>
          <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            value={range}
            onValueChange={(value) =>
              value && setRange(value as keyof typeof rangeToMonths)
            }
          >
            {Object.keys(rangeToMonths).map((key) => (
              <ToggleGroupItem key={key} value={key}>
                {key}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 @2xl/main:grid-cols-4">
          {[
            { label: "Number of Projects", value: "9,851" },
            { label: "Active Projects", value: "1,026" },
            { label: "Revenue", value: "$228.89k" },
            { label: "Working Hours", value: "10,589h" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={
                index > 0 ? "@2xl/main:border-l @2xl/main:pl-4" : undefined
              }
            >
              <div className="text-lg font-semibold tabular-nums">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto min-h-[200px] w-full flex-1"
        >
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="var(--color-revenue)"
              strokeDasharray="4 4"
            />
            <Bar dataKey="projects" fill="var(--color-projects)" radius={4} barSize={12} />
            <Bar dataKey="active" fill="var(--color-active)" radius={4} barSize={12} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function UpcomingSchedules() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Schedules</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm">
            View all
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          captionLayout="dropdown"
          className="mx-auto w-full max-w-[16rem] p-0 [--cell-size:--spacing(8)]"
        />
        <Separator />
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Events
          </span>
          {events.map((event) => (
            <div key={event.title} className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {event.day}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {event.title}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {event.company}
                </span>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {event.time}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ActiveProjectsTable() {
  const projects = useProjects()
  const [page, setPage] = React.useState(1)

  // Clamp during render so the page can never strand itself past the last row.
  const pageCount = Math.max(1, Math.ceil(projects.length / projectsPageSize))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * projectsPageSize
  const paged = projects.slice(start, start + projectsPageSize)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Projects</CardTitle>
        <CardAction>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Project Name</TableHead>
              <TableHead>Project Lead</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-6">Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="pl-6 font-medium">
                  <Link
                    to={`/projects/details/${projectSlug(project)}`}
                    className="hover:underline"
                  >
                    {project.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarFallback>{initials(project.lead)}</AvatarFallback>
                    </Avatar>
                    <span className="whitespace-nowrap">{project.lead}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="w-9 shrink-0 text-xs tabular-nums">
                      {project.progress}%
                    </span>
                    <Progress value={project.progress} className="w-20" />
                  </div>
                </TableCell>
                <TableCell>
                  <AvatarGroup>
                    {project.assignees.map((assignee) => (
                      <Avatar key={assignee} size="sm">
                        <AvatarFallback>{initials(assignee)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusStyles[project.status]}
                  >
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell className="pr-6 whitespace-nowrap text-muted-foreground">
                  {project.dueDate}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">
          Showing{" "}
          <strong className="text-foreground">
            {start + 1}–{start + paged.length}
          </strong>{" "}
          of {projects.length} projects
        </span>
        <DataPagination
          page={currentPage}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      </CardFooter>
    </Card>
  )
}

function MyTasks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Tasks</CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm">
            All Tasks
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3">
            <Checkbox id={`task-${task.id}`} defaultChecked={task.done} />
            <Label
              htmlFor={`task-${task.id}`}
              className="min-w-0 flex-1 truncate font-normal"
            >
              {task.name}
            </Label>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {task.deadline}
            </span>
            <Badge variant="secondary" className={statusStyles[task.status]}>
              {task.status}
            </Badge>
            <Avatar size="sm">
              <AvatarFallback>{initials(task.assignee)}</AvatarFallback>
            </Avatar>
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="link" size="sm">
          Load More
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function ProjectsPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="grid gap-4 md:gap-6 @4xl/main:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="grid gap-4 @xl/main:grid-cols-3 md:gap-6">
            <StatCard
              icon={<BriefcaseBusinessIcon />}
              label="Active Projects"
              value="825"
              caption="Projects this month"
              delta={-5.02}
            />
            <StatCard
              icon={<LightbulbIcon />}
              label="New Leads"
              value="7,522"
              caption="Leads this month"
              delta={3.58}
            />
            <StatCard
              icon={<ClockIcon />}
              label="Total Hours"
              value="168h 40m"
              caption="Work this month"
              delta={-10.35}
            />
          </div>
          <ProjectsOverview />
        </div>
        <UpcomingSchedules />
      </div>
      <div className="grid gap-4 md:gap-6 @4xl/main:grid-cols-[minmax(0,1fr)_20rem]">
        <ActiveProjectsTable />
        <MyTasks />
      </div>
    </div>
  )
}
