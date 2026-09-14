import * as React from "react"
import { toast } from "sonner"

import { DatePicker } from "@/components/common/date-picker"
import { DrawerFormShell, FormDrawer } from "@/components/common/form-drawer"
import { Field, FormSection } from "@/components/common/form-sheet"
import { useFormValidation } from "@/hooks/use-form-validation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import {
  taskColumns,
  taskPriorities,
  tasks as seedTasks,
  type Task,
  type TaskColumn,
  type TaskPriority,
} from "../data"
import { newTaskId, saveTask, toLines } from "../store"

const TODAY = "02 Sep 2026"

/** Existing values plus whatever the draft already holds, so nothing is lost on edit. */
function options(values: (string | undefined)[], current: string | undefined) {
  return [...new Set([...values, current].filter(Boolean) as string[])].sort()
}

const seedProjects = seedTasks.map((task) => task.project)
const seedAssignees = seedTasks.map((task) => task.assignee)
const seedReporters = seedTasks.map((task) => task.reporter)

function blankTask(): Task {
  return {
    id: "",
    title: "",
    description: "",
    column: "Backlog",
    priority: "Medium",
    project: "",
    assignee: "",
    reporter: "",
    dueDate: "",
    createdAt: TODAY,
    labels: [],
    estimate: "",
    logged: "0h",
    progress: 0,
    checklist: [],
    comments: [],
  }
}

export function TaskFormDrawer({
  open,
  onOpenChange,
  task,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  onSaved?: (task: Task) => void
}) {
  return (
    <FormDrawer open={open} onOpenChange={onOpenChange}>
      <TaskFormBody
        key={task?.id ?? "new"}
        task={task}
        onClose={() => onOpenChange(false)}
        onSaved={onSaved}
      />
    </FormDrawer>
  )
}

function TaskFormBody({
  task,
  onClose,
  onSaved,
}: {
  task?: Task
  onClose: () => void
  onSaved?: (task: Task) => void
}) {
  const [draft, setDraft] = React.useState<Task>(() =>
    task ? { ...task } : blankTask()
  )
  const [progress, setProgress] = React.useState(String(task?.progress ?? 0))
  const [labels, setLabels] = React.useState(task?.labels.join("\n") ?? "")
  const editing = Boolean(task)

  const { errorFor, fieldProps, handleSubmit, visibleErrors } =
    useFormValidation(
      {
        title: draft.title,
        project: draft.project,
        assignee: draft.assignee,
        dueDate: draft.dueDate,
        progress,
      },
      {
        title: (values) =>
          values.title.trim().length < 3
            ? "Give the task a title of at least 3 characters."
            : undefined,
        project: (values) =>
          !values.project.trim() ? "Pick the project this belongs to." : undefined,
        assignee: (values) =>
          !values.assignee.trim() ? "Every task needs an assignee." : undefined,
        dueDate: (values) =>
          !values.dueDate.trim() ? "Set a due date." : undefined,
        progress: (values) => {
          const parsed = Number(values.progress)
          return !Number.isFinite(parsed) || parsed < 0 || parsed > 100
            ? "Enter a number between 0 and 100."
            : undefined
        },
      },
    )

  function set<K extends keyof Task>(key: K, value: Task[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const submit = handleSubmit(() => {
    const saved: Task = {
      ...draft,
      id: draft.id || newTaskId(),
      title: draft.title.trim(),
      description: draft.description.trim(),
      project: draft.project.trim(),
      assignee: draft.assignee.trim(),
      reporter: draft.reporter.trim(),
      estimate: draft.estimate.trim(),
      labels: toLines(labels),
      progress: Math.round(Number(progress)),
    }

    saveTask(saved)
    onClose()
    onSaved?.(saved)
    toast.success(editing ? "Task updated" : "Task created", {
      description: `${saved.id} · ${saved.column} · ${saved.assignee}`,
    })
  })

  return (
    <DrawerFormShell
      title={editing ? "Edit task" : "New task"}
      description={
        task
          ? `${task.id} · changes apply everywhere this task appears`
          : "Tasks show up on the board and the list as soon as they are saved."
      }
      submitLabel={editing ? "Save changes" : "Create task"}
      onSubmit={submit}
      onCancel={onClose}
      errors={visibleErrors}
    >
      <FormSection title="The task">
        <Field label="Title" htmlFor="task-title" wide error={errorFor("title")}>
          <Input
            id="task-title"
            value={draft.title}
            onChange={(event) => set("title", event.target.value)}
            placeholder="Harden the audit log pipeline"
            {...fieldProps("title")}
          />
        </Field>

        <Field label="Description" htmlFor="task-description" wide>
          <Textarea
            id="task-description"
            rows={3}
            value={draft.description}
            onChange={(event) => set("description", event.target.value)}
            placeholder="What needs to happen, and what does done look like?"
          />
        </Field>
      </FormSection>

      <FormSection title="Assignment">
        <Field label="Project" htmlFor="task-project" error={errorFor("project")}>
          <Select
            value={draft.project}
            onValueChange={(value) => set("project", value)}
          >
            <SelectTrigger
              id="task-project"
              className="w-full"
              {...fieldProps("project")}
            >
              <SelectValue placeholder="Pick a project" />
            </SelectTrigger>
            <SelectContent>
              {options(seedProjects, draft.project).map((project) => (
                <SelectItem key={project} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Assignee" htmlFor="task-assignee" error={errorFor("assignee")}>
          <Select
            value={draft.assignee}
            onValueChange={(value) => set("assignee", value)}
          >
            <SelectTrigger
              id="task-assignee"
              className="w-full"
              {...fieldProps("assignee")}
            >
              <SelectValue placeholder="Pick an assignee" />
            </SelectTrigger>
            <SelectContent>
              {options(seedAssignees, draft.assignee).map((person) => (
                <SelectItem key={person} value={person}>
                  {person}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Reporter" htmlFor="task-reporter">
          <Select
            value={draft.reporter}
            onValueChange={(value) => set("reporter", value)}
          >
            <SelectTrigger id="task-reporter" className="w-full">
              <SelectValue placeholder="Pick a reporter" />
            </SelectTrigger>
            <SelectContent>
              {options(seedReporters, draft.reporter).map((person) => (
                <SelectItem key={person} value={person}>
                  {person}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Status" htmlFor="task-column">
          <Select
            value={draft.column}
            onValueChange={(value) => set("column", value as TaskColumn)}
          >
            <SelectTrigger id="task-column" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {taskColumns.map((column) => (
                <SelectItem key={column} value={column}>
                  {column}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Priority" htmlFor="task-priority">
          <Select
            value={draft.priority}
            onValueChange={(value) => set("priority", value as TaskPriority)}
          >
            <SelectTrigger id="task-priority" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {taskPriorities.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FormSection>

      <FormSection title="Schedule">
        <Field label="Due date" htmlFor="task-due" error={errorFor("dueDate")}>
          <DatePicker
            id="task-due"
            value={draft.dueDate}
            onChange={(value) => set("dueDate", value)}
            valueFormat="dd MMM yyyy"
            placeholder="Select a date"
            clearable={false}
            invalid={fieldProps("dueDate")["aria-invalid"]}
          />
        </Field>

        <Field label="Estimate" htmlFor="task-estimate" hint="e.g. 16h">
          <Input
            id="task-estimate"
            value={draft.estimate}
            onChange={(event) => set("estimate", event.target.value)}
            placeholder="16h"
          />
        </Field>

        <Field
          label="Progress"
          htmlFor="task-progress"
          hint="Percent complete"
          error={errorFor("progress")}
        >
          <Input
            id="task-progress"
            type="number"
            min={0}
            max={100}
            value={progress}
            onChange={(event) => setProgress(event.target.value)}
            {...fieldProps("progress")}
          />
        </Field>
      </FormSection>

      <FormSection title="Labels" hint="One per line.">
        <Field label="Labels" htmlFor="task-labels" wide>
          <Textarea
            id="task-labels"
            rows={3}
            value={labels}
            onChange={(event) => setLabels(event.target.value)}
            placeholder={"platform\nsecurity"}
          />
        </Field>
      </FormSection>
    </DrawerFormShell>
  )
}
