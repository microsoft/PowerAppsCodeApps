import * as React from "react"

import { DatePicker } from "@/components/common/date-picker"
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
import { Field, FormSection, FormSheet, FormShell } from "@/components/common/form-sheet"

import { allProjects, type Project, type ProjectStatus } from "../data"
import { saveProject } from "../store"

const statuses: ProjectStatus[] = ["Pending", "In Progress", "Completed"]

/** Existing values plus whatever the draft already holds, so nothing is lost on edit. */
function options(values: (string | undefined)[], current: string | undefined) {
  return [...new Set([...values, current].filter(Boolean) as string[])].sort()
}

const seedClients = allProjects.map((project) => project.client)
const seedLeads = allProjects.map((project) => project.lead)

export function ProjectFormSheet({
  open,
  onOpenChange,
  project,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
  onSaved?: (project: Project) => void
}) {
  return (
    <FormSheet open={open} onOpenChange={onOpenChange}>
      <ProjectFormBody
        key={project.id}
        project={project}
        onClose={() => onOpenChange(false)}
        onSaved={onSaved}
      />
    </FormSheet>
  )
}

function ProjectFormBody({
  project,
  onClose,
  onSaved,
}: {
  project: Project
  onClose: () => void
  onSaved?: (project: Project) => void
}) {
  const [draft, setDraft] = React.useState<Project>(() => ({ ...project }))
  const [progress, setProgress] = React.useState(String(project.progress))

  const progressValue = Number(progress)

  const { errorFor, fieldProps, handleSubmit, visibleErrors } =
    useFormValidation(
    { name: draft.name, lead: draft.lead, progress, dueDate: draft.dueDate },
    {
      name: (values) =>
        !values.name.trim() ? "Give the project a name." : undefined,
      lead: (values) =>
        !values.lead.trim() ? "Every project needs a lead." : undefined,
      progress: (values) => {
        const parsed = Number(values.progress)
        return !Number.isFinite(parsed) || parsed < 0 || parsed > 100
          ? "Enter a number between 0 and 100."
          : undefined
      },
      dueDate: (values) =>
        !values.dueDate.trim() ? "Set a due date." : undefined,
    },
  )

  function set<K extends keyof Project>(key: K, value: Project[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const submit = handleSubmit(() => {
    const saved: Project = {
      ...draft,
      name: draft.name.trim(),
      lead: draft.lead.trim(),
      progress: Math.round(progressValue),
      budget: draft.budget?.trim() || undefined,
      description: draft.description?.trim() || undefined,
    }

    saveProject(saved)
    onClose()
    onSaved?.(saved)
  })

  return (
    <FormShell
      title="Edit project"
      description={`${project.name} · changes apply everywhere this project appears`}
      submitLabel="Save changes"
      onSubmit={submit}
      onCancel={onClose}
      errors={visibleErrors}
    >
      <FormSection title="The project">
        <Field label="Name" htmlFor="project-name" wide error={errorFor("name")}>
          <Input
            id="project-name"
            value={draft.name}
            onChange={(event) => set("name", event.target.value)}
            {...fieldProps("name")}
          />
        </Field>

        <Field label="Description" htmlFor="project-description" wide>
          <Textarea
            id="project-description"
            rows={3}
            value={draft.description ?? ""}
            onChange={(event) => set("description", event.target.value)}
            placeholder="What is this project delivering?"
          />
        </Field>
      </FormSection>

      <FormSection title="Delivery">
        <Field label="Project lead" htmlFor="project-lead" error={errorFor("lead")}>
          <Select
            value={draft.lead}
            onValueChange={(value) => set("lead", value)}
          >
            <SelectTrigger
              id="project-lead"
              className="w-full"
              {...fieldProps("lead")}
            >
              <SelectValue placeholder="Select a lead" />
            </SelectTrigger>
            <SelectContent>
              {options(seedLeads, draft.lead).map((lead) => (
                <SelectItem key={lead} value={lead}>
                  {lead}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Client" htmlFor="project-client">
          <Select
            value={draft.client ?? ""}
            onValueChange={(value) => set("client", value)}
          >
            <SelectTrigger id="project-client" className="w-full">
              <SelectValue placeholder="Internal" />
            </SelectTrigger>
            <SelectContent>
              {options(seedClients, draft.client).map((client) => (
                <SelectItem key={client} value={client}>
                  {client}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Status" htmlFor="project-status">
          <Select
            value={draft.status}
            onValueChange={(value) => set("status", value as ProjectStatus)}
          >
            <SelectTrigger id="project-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Progress"
          htmlFor="project-progress"
          hint="Percent complete"
          error={errorFor("progress")}
        >
          <Input
            id="project-progress"
            type="number"
            min={0}
            max={100}
            value={progress}
            onChange={(event) => setProgress(event.target.value)}
            {...fieldProps("progress")}
          />
        </Field>
      </FormSection>

      <FormSection title="Schedule and budget">
        <Field label="Start date" htmlFor="project-start">
          <DatePicker
            id="project-start"
            value={draft.startDate ?? ""}
            onChange={(value) => set("startDate", value)}
            valueFormat="dd MMM yyyy"
            placeholder="Select a start date"
          />
        </Field>

        <Field label="Due date" htmlFor="project-due" error={errorFor("dueDate")}>
          <DatePicker
            id="project-due"
            value={draft.dueDate}
            onChange={(value) => set("dueDate", value)}
            valueFormat="dd MMM yyyy"
            placeholder="Select a due date"
            clearable={false}
            invalid={fieldProps("dueDate")["aria-invalid"]}
          />
        </Field>

        <Field label="Budget" htmlFor="project-budget" hint="e.g. $8,400" wide>
          <Input
            id="project-budget"
            value={draft.budget ?? ""}
            onChange={(event) => set("budget", event.target.value)}
          />
        </Field>
      </FormSection>
    </FormShell>
  )
}
