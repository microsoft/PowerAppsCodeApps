import * as React from "react"
import { ArrowLeftIcon, PaperclipIcon, PencilIcon, SendIcon } from "lucide-react"
import { Link, useParams } from "react-router"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

import { columnStyles, initials, priorityStyles } from "./status"
import { useTask, useTasks } from "./store"
import { TaskFormDrawer } from "./components/task-form"

export default function TaskDetailsPage() {
  const { taskId } = useParams()
  const tasks = useTasks()
  const task = useTask(taskId) ?? tasks[0]
  const [formOpen, setFormOpen] = React.useState(false)

  if (!task) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground">That task could not be found.</p>
        <Button asChild variant="outline">
          <Link to="/tasks/kanban">Back to board</Link>
        </Button>
      </div>
    )
  }

  const doneCount = task.checklist.filter((item) => item.done).length

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
          <Link to="/tasks/list">
            <ArrowLeftIcon />
            Back to tasks
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
          <PencilIcon />
          Edit task
        </Button>
      </div>

      <div className="grid items-start gap-4 md:gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 md:gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{task.id}</span>
                <span>·</span>
                <span>{task.project}</span>
              </div>
              <CardTitle className="text-2xl">{task.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge
                  variant="secondary"
                  className={priorityStyles[task.priority]}
                >
                  {task.priority} priority
                </Badge>
                <Badge variant="outline" className="gap-1.5">
                  <span
                    className={`size-2 rounded-full ${columnStyles[task.column]}`}
                  />
                  {task.column}
                </Badge>
                {task.labels.map((label) => (
                  <Badge key={label} variant="outline">
                    {label}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {task.description}
              </p>
              <Separator />
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progress</span>
                  <span className="text-muted-foreground tabular-nums">
                    {task.progress}%
                  </span>
                </div>
                <Progress value={task.progress} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Checklist{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {doneCount}/{task.checklist.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {task.checklist.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <Checkbox
                    id={`${task.id}-${item.label}`}
                    defaultChecked={item.done}
                  />
                  <Label
                    htmlFor={`${task.id}-${item.label}`}
                    className="font-normal"
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments ({task.comments.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {task.comments.map((comment) => (
                <div key={comment.timestamp} className="flex gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">
                      {initials(comment.author)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {comment.body}
                    </p>
                  </div>
                </div>
              ))}

              {task.comments.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No comments yet.
                </p>
              )}

              <Separator />
              <Textarea placeholder="Write a comment…" rows={3} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  <PaperclipIcon />
                  Attach
                </Button>
                <Button size="sm">
                  <SendIcon />
                  Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <PersonRow label="Assignee" name={task.assignee} />
            <PersonRow label="Reporter" name={task.reporter} />
            <Separator />
            <DetailRow label="Project" value={task.project} />
            <DetailRow label="Due date" value={task.dueDate} />
            <DetailRow label="Created" value={task.createdAt} />
            <Separator />
            <DetailRow label="Estimate" value={task.estimate} />
            <DetailRow label="Logged" value={task.logged} />
          </CardContent>
        </Card>
      </div>

      <TaskFormDrawer open={formOpen} onOpenChange={setFormOpen} task={task} />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function PersonRow({ label, name }: { label: string; name: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <Avatar className="size-6">
          <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{name}</span>
      </span>
    </div>
  )
}
