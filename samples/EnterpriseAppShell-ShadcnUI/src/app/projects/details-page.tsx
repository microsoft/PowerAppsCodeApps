import * as React from "react"
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircle2Icon,
  CircleIcon,
  PencilIcon,
} from "lucide-react"
import { Link, useNavigate, useParams } from "react-router"
import { toast } from "sonner"

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
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

import {
  projectMilestones,
  projectSlug,
  projectSpend,
  type Project,
} from "./data"
import { ProjectFormSheet } from "./components/project-form"
import { relatedTasks } from "./related-tasks"
import { initials, projectStatusStyles } from "./status"
import { useProject } from "./store"

export default function ProjectDetailsPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const project = useProject(projectId)
  const [editing, setEditing] = React.useState(false)

  function handleSaved(saved: Project) {
    toast.success("Project updated", {
      description: `${saved.name} · ${saved.status} · ${saved.progress}% complete`,
    })
    // The route is keyed off the name, so a rename has to move the URL with it.
    const slug = projectSlug(saved)
    if (slug !== projectId) {
      navigate(`/projects/details/${slug}`, { replace: true })
    }
  }

  if (!project) {
    return (
      <div className="@container/main flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          We couldn't find a project called “{projectId}”.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link to="/projects/list">Back to all projects</Link>
        </Button>
      </div>
    )
  }

  const milestones = projectMilestones(project)
  const spend = projectSpend(project)
  const relatedTaskList = relatedTasks(project.name)

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/projects/list">
          <ArrowLeftIcon />
          Back to projects
        </Link>
      </Button>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 md:gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{project.client ?? "Internal"}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <CalendarIcon className="size-3.5" />
                  {project.startDate ?? "—"} → {project.dueDate}
                </span>
              </div>
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge
                  variant="secondary"
                  className={projectStatusStyles[project.status]}
                >
                  {project.status}
                </Badge>
                <Badge variant="outline">
                  {project.assignees.length + 1} people
                </Badge>
                <Badge variant="outline">{relatedTaskList.length} tasks</Badge>
              </div>
              <CardAction className="row-span-3 self-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(true)}
                >
                  <PencilIcon />
                  Edit
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium tabular-nums">
                    {project.progress}%
                  </span>
                </div>
                <Progress value={project.progress} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
              <CardDescription>
                {milestones.filter((milestone) => milestone.done).length} of{" "}
                {milestones.length} complete
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {milestones.map((milestone) => (
                <div key={milestone.title} className="flex items-start gap-3">
                  {milestone.done ? (
                    <CheckCircle2Icon className="mt-0.5 size-4 text-success" />
                  ) : (
                    <CircleIcon className="mt-0.5 size-4 text-muted-foreground" />
                  )}
                  <div className="flex flex-1 flex-col">
                    <span
                      className={
                        milestone.done
                          ? "text-sm text-muted-foreground line-through"
                          : "text-sm font-medium"
                      }
                    >
                      {milestone.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {milestone.date || (milestone.done ? "Complete" : "Not started")}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                Work items linked to this project.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {relatedTaskList.map((task) => (
                <Link
                  key={task.id}
                  to={task.href}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:border-primary/40"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{task.title}</span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className={`size-2 rounded-full ${task.statusClassName}`}
                      />
                      {task.status} · {task.assignee}
                    </span>
                  </div>
                  <Badge variant="secondary" className={task.priorityClassName}>
                    {task.priority}
                  </Badge>
                </Link>
              ))}

              {relatedTaskList.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No tasks linked to this project yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-semibold tabular-nums">
                  {spend.format(spend.spent)}
                </span>
                <span className="text-sm text-muted-foreground">
                  of {spend.format(spend.budget)}
                </span>
              </div>
              <Progress value={project.progress} />
              <p className="text-sm text-muted-foreground">
                {spend.format(spend.remaining)} remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Project lead</span>
                <span className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-xs">
                      {initials(project.lead)}
                    </AvatarFallback>
                  </Avatar>
                  {project.lead}
                </span>
              </div>
              <Separator />
              <DetailRow label="Client" value={project.client ?? "Internal"} />
              <Separator />
              <DetailRow label="Start date" value={project.startDate ?? "—"} />
              <Separator />
              <DetailRow label="Due date" value={project.dueDate} />
              <Separator />
              <DetailRow label="Status" value={project.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
              <CardDescription>
                {project.assignees.length} contributors
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {project.assignees.map((assignee) => (
                <div key={assignee} className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">
                      {initials(assignee)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{assignee}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <ProjectFormSheet
        open={editing}
        onOpenChange={setEditing}
        project={project}
        onSaved={handleSaved}
      />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}
