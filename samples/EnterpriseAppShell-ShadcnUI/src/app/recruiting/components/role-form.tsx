import * as React from "react"
import { toast } from "sonner"

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

import { TODAY, type Priority, type Role } from "../data"
import { Field, FormSection, FormSheet, FormShell } from "@/components/common/form-sheet"
import { newRoleId, saveRole, toLines } from "../store"

const departments = [
  "Design",
  "Engineering",
  "Commercial",
  "Operations",
  "Finance",
  "People",
]
const levels = ["Junior", "Mid", "Senior", "Staff", "Principal", "Lead"]
const employmentTypes = ["Full-time", "Part-time", "Contract", "Fixed term"]
const statuses: Role["status"][] = ["Open", "On hold", "Closed"]
const priorities: Priority[] = ["High", "Medium", "Low"]

function blankRole(): Role {
  return {
    id: "",
    title: "",
    department: "Engineering",
    location: "",
    level: "Mid",
    employmentType: "Full-time",
    hiringManager: "",
    recruiter: "",
    openings: 1,
    opened: TODAY,
    targetStart: "",
    status: "Open",
    priority: "Medium",
    salaryRange: "",
    summary: "",
    mustHaves: [],
    niceToHaves: [],
  }
}

export function RoleFormSheet({
  open,
  onOpenChange,
  role,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
}) {
  return (
    <FormSheet open={open} onOpenChange={onOpenChange}>
      <RoleFormBody
        key={role?.id ?? "new"}
        role={role}
        onClose={() => onOpenChange(false)}
      />
    </FormSheet>
  )
}

function RoleFormBody({
  role,
  onClose,
}: {
  role: Role | null
  onClose: () => void
}) {
  const [draft, setDraft] = React.useState<Role>(() =>
    role ? { ...role } : blankRole()
  )
  const [mustHaves, setMustHaves] = React.useState(
    role?.mustHaves.join("\n") ?? ""
  )
  const [niceToHaves, setNiceToHaves] = React.useState(
    role?.niceToHaves.join("\n") ?? ""
  )
  const editing = Boolean(role)

  const { errorFor, fieldProps, handleSubmit, visibleErrors } =
    useFormValidation(
      {
        title: draft.title,
        hiringManager: draft.hiringManager,
        targetStart: draft.targetStart,
      },
      {
        title: (values) =>
          !values.title.trim() ? "Give the role a title." : undefined,
        hiringManager: (values) =>
          !values.hiringManager.trim()
            ? "Every role needs a hiring manager."
            : undefined,
        targetStart: (values) =>
          values.targetStart && draft.opened && values.targetStart < draft.opened
            ? "The target start cannot fall before the role opened."
            : undefined,
      },
    )

  function set<K extends keyof Role>(key: K, value: Role[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const submit = handleSubmit(() => {
    const saved: Role = {
      ...draft,
      id: draft.id || newRoleId(),
      mustHaves: toLines(mustHaves),
      niceToHaves: toLines(niceToHaves),
    }
    saveRole(saved)
    onClose()
    toast.success(editing ? "Role updated" : "Role opened", {
      description: `${saved.title} · ${saved.openings} ${
        saved.openings === 1 ? "opening" : "openings"
      } · ${saved.hiringManager}`,
    })
  })

  return (
    <FormShell
      onCancel={onClose}
      title={editing ? "Edit role" : "Open a role"}
      description={
        editing
          ? `${role?.id} · changes apply to everyone in this pipeline`
          : "Roles appear on the board as soon as they are saved."
      }
      submitLabel={editing ? "Save changes" : "Open role"}
      onSubmit={submit}
      errors={visibleErrors}
    >
      <FormSection title="The role">
        <Field label="Title" htmlFor="role-title" wide error={errorFor("title")}>
          <Input
            id="role-title"
            value={draft.title}
            onChange={(event) => set("title", event.target.value)}
            placeholder="Senior Product Designer"
            {...fieldProps("title")}
          />
        </Field>

        <Field label="Department" htmlFor="role-department">
          <Select
            value={draft.department}
            onValueChange={(value) => set("department", value)}
          >
            <SelectTrigger id="role-department" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Location" htmlFor="role-location">
          <Input
            id="role-location"
            value={draft.location}
            onChange={(event) => set("location", event.target.value)}
            placeholder="London or Remote (UK)"
          />
        </Field>

        <Field label="Level" htmlFor="role-level">
          <Select
            value={draft.level}
            onValueChange={(value) => set("level", value)}
          >
            <SelectTrigger id="role-level" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {levels.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Employment type" htmlFor="role-employment">
          <Select
            value={draft.employmentType}
            onValueChange={(value) => set("employmentType", value)}
          >
            <SelectTrigger id="role-employment" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {employmentTypes.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Summary"
          htmlFor="role-summary"
          wide
          hint="Two or three sentences. This is what candidates read first."
        >
          <Textarea
            id="role-summary"
            value={draft.summary}
            onChange={(event) => set("summary", event.target.value)}
            rows={3}
          />
        </Field>
      </FormSection>

      <FormSection title="Hiring plan">
        <Field label="Openings" htmlFor="role-openings">
          <Input
            id="role-openings"
            type="number"
            min={1}
            value={draft.openings}
            onChange={(event) =>
              set("openings", Math.max(1, Number(event.target.value) || 1))
            }
          />
        </Field>

        <Field label="Salary range" htmlFor="role-salary">
          <Input
            id="role-salary"
            value={draft.salaryRange}
            onChange={(event) => set("salaryRange", event.target.value)}
            placeholder="£78,000 – £94,000"
          />
        </Field>

        <Field label="Opened" htmlFor="role-opened">
          <DatePicker
            id="role-opened"
            value={draft.opened}
            onChange={(value) => set("opened", value)}
            placeholder="Select a date"
            clearable={false}
          />
        </Field>

        <Field
          label="Target start"
          htmlFor="role-target"
          error={errorFor("targetStart")}
        >
          <DatePicker
            id="role-target"
            value={draft.targetStart}
            onChange={(value) => set("targetStart", value)}
            placeholder="Select a date"
            invalid={fieldProps("targetStart")["aria-invalid"]}
          />
        </Field>

        <Field label="Status" htmlFor="role-status">
          <Select
            value={draft.status}
            onValueChange={(value) => set("status", value as Role["status"])}
          >
            <SelectTrigger id="role-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Priority" htmlFor="role-priority">
          <Select
            value={draft.priority}
            onValueChange={(value) => set("priority", value as Priority)}
          >
            <SelectTrigger id="role-priority" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Hiring manager"
          htmlFor="role-manager"
          error={errorFor("hiringManager")}
        >
          <Input
            id="role-manager"
            value={draft.hiringManager}
            onChange={(event) => set("hiringManager", event.target.value)}
            placeholder="Priya Raman"
            {...fieldProps("hiringManager")}
          />
        </Field>

        <Field label="Recruiter" htmlFor="role-recruiter">
          <Input
            id="role-recruiter"
            value={draft.recruiter}
            onChange={(event) => set("recruiter", event.target.value)}
            placeholder="Tom Aldridge"
          />
        </Field>
      </FormSection>

      <FormSection title="Requirements" hint="One per line.">
        <Field label="Must haves" htmlFor="role-must" wide>
          <Textarea
            id="role-must"
            value={mustHaves}
            onChange={(event) => setMustHaves(event.target.value)}
            rows={4}
            placeholder={"Shipped complex B2B tooling\nFluent with design systems"}
          />
        </Field>

        <Field label="Nice to haves" htmlFor="role-nice" wide>
          <Textarea
            id="role-nice"
            value={niceToHaves}
            onChange={(event) => setNiceToHaves(event.target.value)}
            rows={3}
            placeholder={"Prototyping in code\nLogistics experience"}
          />
        </Field>
      </FormSection>
    </FormShell>
  )
}
