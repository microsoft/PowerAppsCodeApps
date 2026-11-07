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

import {
  TODAY,
  sources,
  stages,
  type Candidate,
  type Stage,
} from "../data"
import { Field, FormSection, FormSheet, FormShell } from "@/components/common/form-sheet"
import { newCandidateId, saveCandidate, toLines, useRoles } from "../store"

const allStages: Stage[] = [...stages, "Rejected"]

function blankCandidate(roleId: string): Candidate {
  return {
    id: "",
    name: "",
    headline: "",
    roleId,
    stage: "Applied",
    source: sources[0] ?? "Referral",
    appliedOn: TODAY,
    location: "",
    email: "",
    phone: "",
    years: 0,
    currentEmployer: "",
    rating: 3,
    skills: [],
    accent: 1,
    summary: "",
    nextStep: "",
    timeline: [],
  }
}

export function CandidateFormSheet({
  open,
  onOpenChange,
  candidate,
  defaultRoleId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidate: Candidate | null
  defaultRoleId?: string
}) {
  return (
    <FormSheet open={open} onOpenChange={onOpenChange}>
      <CandidateFormBody
        key={candidate?.id ?? `new-${defaultRoleId ?? ""}`}
        candidate={candidate}
        defaultRoleId={defaultRoleId}
        onClose={() => onOpenChange(false)}
      />
    </FormSheet>
  )
}

function CandidateFormBody({
  candidate,
  defaultRoleId,
  onClose,
}: {
  candidate: Candidate | null
  defaultRoleId?: string
  onClose: () => void
}) {
  const roles = useRoles()
  const [draft, setDraft] = React.useState<Candidate>(() =>
    candidate
      ? { ...candidate }
      : blankCandidate(defaultRoleId ?? roles[0]?.id ?? "")
  )
  const [skills, setSkills] = React.useState(
    candidate?.skills.join(", ") ?? ""
  )
  const editing = Boolean(candidate)

  const { errorFor, fieldProps, handleSubmit, visibleErrors } =
    useFormValidation(
      { name: draft.name, email: draft.email, roleId: draft.roleId },
      {
        name: (values) =>
          !values.name.trim() ? "A name is required." : undefined,
        email: (values) =>
          values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
            ? "That does not look like an email address."
            : undefined,
        roleId: (values) =>
          !values.roleId ? "Pick the role they applied for." : undefined,
      },
    )

  function set<K extends keyof Candidate>(key: K, value: Candidate[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const submit = handleSubmit(() => {
    const isNew = !draft.id
    const saved: Candidate = {
      ...draft,
      id: draft.id || newCandidateId(),
      skills: toLines(skills.replace(/,/g, "\n")),
      accent: ((((draft.name.length + draft.roleId.length) % 5) + 1) as
        | 1
        | 2
        | 3
        | 4
        | 5),
      timeline: isNew
        ? [
            {
              at: draft.appliedOn,
              label: "Applied",
              detail: `${draft.source} · added by hand`,
            },
          ]
        : draft.timeline,
    }
    saveCandidate(saved)
    onClose()
    const role = roles.find((item) => item.id === saved.roleId)
    toast.success(editing ? "Candidate updated" : "Candidate added", {
      description: `${saved.name} · ${role?.title ?? "Unassigned"} · ${saved.stage}`,
    })
  })

  return (
    <FormShell
      onCancel={onClose}
      title={editing ? "Edit candidate" : "Add a candidate"}
      description={
        editing
          ? "Edits show on the board straight away."
          : "Enough to start a conversation. The rest can follow."
      }
      submitLabel={editing ? "Save changes" : "Add candidate"}
      onSubmit={submit}
      errors={visibleErrors}
    >
      <FormSection title="Person">
        <Field label="Full name" htmlFor="cand-name" error={errorFor("name")}>
          <Input
            id="cand-name"
            value={draft.name}
            onChange={(event) => set("name", event.target.value)}
            placeholder="Rowan Blake"
            {...fieldProps("name")}
          />
        </Field>

        <Field label="Headline" htmlFor="cand-headline">
          <Input
            id="cand-headline"
            value={draft.headline}
            onChange={(event) => set("headline", event.target.value)}
            placeholder="Platform engineer, ex-Caldera"
          />
        </Field>

        <Field label="Email" htmlFor="cand-email" error={errorFor("email")}>
          <Input
            id="cand-email"
            type="email"
            value={draft.email}
            onChange={(event) => set("email", event.target.value)}
            placeholder="rowan@example.com"
            {...fieldProps("email")}
          />
        </Field>

        <Field label="Phone" htmlFor="cand-phone">
          <Input
            id="cand-phone"
            value={draft.phone}
            onChange={(event) => set("phone", event.target.value)}
            placeholder="+44 7700 900123"
          />
        </Field>

        <Field label="Location" htmlFor="cand-location">
          <Input
            id="cand-location"
            value={draft.location}
            onChange={(event) => set("location", event.target.value)}
            placeholder="Manchester"
          />
        </Field>

        <Field label="Current employer" htmlFor="cand-employer">
          <Input
            id="cand-employer"
            value={draft.currentEmployer}
            onChange={(event) => set("currentEmployer", event.target.value)}
            placeholder="Caldera Systems"
          />
        </Field>
      </FormSection>

      <FormSection title="Application">
        <Field label="Role" htmlFor="cand-role" error={errorFor("roleId")}>
          <Select
            value={draft.roleId}
            onValueChange={(value) => set("roleId", value)}
          >
            <SelectTrigger id="cand-role" className="w-full" {...fieldProps("roleId")}>
              <SelectValue placeholder="Pick a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Stage" htmlFor="cand-stage">
          <Select
            value={draft.stage}
            onValueChange={(value) => set("stage", value as Stage)}
          >
            <SelectTrigger id="cand-stage" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allStages.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Source" htmlFor="cand-source">
          <Select
            value={draft.source}
            onValueChange={(value) => set("source", value)}
          >
            <SelectTrigger id="cand-source" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Applied on" htmlFor="cand-applied">
          <DatePicker
            id="cand-applied"
            value={draft.appliedOn}
            onChange={(value) => set("appliedOn", value)}
            placeholder="Select a date"
            clearable={false}
          />
        </Field>

        <Field label="Years of experience" htmlFor="cand-years">
          <Input
            id="cand-years"
            type="number"
            min={0}
            max={50}
            value={draft.years}
            onChange={(event) =>
              set("years", Math.max(0, Number(event.target.value) || 0))
            }
          />
        </Field>

        <Field label="Rating" htmlFor="cand-rating" hint="0 to 5.">
          <Input
            id="cand-rating"
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={draft.rating}
            onChange={(event) =>
              set(
                "rating",
                Math.min(5, Math.max(0, Number(event.target.value) || 0))
              )
            }
          />
        </Field>
      </FormSection>

      <FormSection title="Notes">
        <Field
          label="Skills"
          htmlFor="cand-skills"
          wide
          hint="Comma or line separated."
        >
          <Textarea
            id="cand-skills"
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
            rows={2}
            placeholder="Kubernetes, Terraform, Go"
          />
        </Field>

        <Field label="Summary" htmlFor="cand-summary" wide>
          <Textarea
            id="cand-summary"
            value={draft.summary}
            onChange={(event) => set("summary", event.target.value)}
            rows={3}
            placeholder="What stood out, and what you still need to test."
          />
        </Field>

        <Field
          label="Next step"
          htmlFor="cand-next"
          wide
          hint="Shown on the pipeline card so the board reads as a to-do list."
        >
          <Input
            id="cand-next"
            value={draft.nextStep}
            onChange={(event) => set("nextStep", event.target.value)}
            placeholder="Book the panel with Marcus"
          />
        </Field>
      </FormSection>
    </FormShell>
  )
}
