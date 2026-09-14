import * as React from "react"
import { format } from "date-fns"
import { toast } from "sonner"

import { DatePicker } from "@/components/common/date-picker"
import {
  Field,
  FormSection,
  FormSheet,
  FormShell,
} from "@/components/common/form-sheet"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFormValidation } from "@/hooks/use-form-validation"

import {
  companies as seedCompanies,
  leads as seedLeads,
  type Lead,
  type LeadSource,
  type LeadStatus,
} from "../data"
import { newLeadId, saveLead } from "../store"

const sources: LeadSource[] = [
  "Website",
  "Referral",
  "Event",
  "Outbound",
  "Webinar",
]
const statuses: LeadStatus[] = ["New", "Contacted", "Qualified", "Unqualified"]

const dateFormat = "dd MMM yyyy"

/** Existing values plus whatever the draft already holds, so nothing is lost on edit. */
function options(values: (string | undefined)[], current: string | undefined) {
  return [...new Set([...values, current].filter(Boolean) as string[])].sort()
}

const seedOwners = [
  ...seedLeads.map((lead) => lead.owner),
  ...seedCompanies.map((company) => company.owner),
]

function blankLead(): Lead {
  return {
    id: "",
    name: "",
    company: "",
    email: "",
    source: "Website",
    score: 50,
    status: "New",
    owner: seedOwners[0] ?? "",
    createdAt: format(new Date(), dateFormat),
  }
}

export function LeadFormSheet({
  open,
  onOpenChange,
  lead,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead?: Lead
  onSaved?: (lead: Lead) => void
}) {
  return (
    <FormSheet open={open} onOpenChange={onOpenChange}>
      <LeadFormBody
        key={lead?.id ?? "new"}
        lead={lead}
        onClose={() => onOpenChange(false)}
        onSaved={onSaved}
      />
    </FormSheet>
  )
}

function LeadFormBody({
  lead,
  onClose,
  onSaved,
}: {
  lead?: Lead
  onClose: () => void
  onSaved?: (lead: Lead) => void
}) {
  const [draft, setDraft] = React.useState<Lead>(() =>
    lead ? { ...lead } : blankLead()
  )
  const [score, setScore] = React.useState(String(draft.score))
  const editing = Boolean(lead)

  const { errorFor, fieldProps, handleSubmit, visibleErrors } =
    useFormValidation(
      {
        name: draft.name,
        company: draft.company,
        email: draft.email,
        score,
        source: draft.source as string,
        status: draft.status as string,
        owner: draft.owner,
      },
      {
        name: (values) =>
          !values.name.trim() ? "Give the lead a name." : undefined,
        company: (values) =>
          !values.company.trim()
            ? "Which company is this lead from?"
            : undefined,
        email: (values) =>
          !values.email.trim()
            ? "An email address is required."
            : !/\S+@\S+\.\S+/.test(values.email)
              ? "That does not look like an email address."
              : undefined,
        score: (values) => {
          const parsed = Number(values.score)
          return !Number.isFinite(parsed) || parsed < 0 || parsed > 100
            ? "Enter a score between 0 and 100."
            : undefined
        },
      }
    )

  function set<K extends keyof Lead>(key: K, value: Lead[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const submit = handleSubmit(() => {
    const saved: Lead = {
      ...draft,
      id: draft.id || newLeadId(),
      name: draft.name.trim(),
      company: draft.company.trim(),
      email: draft.email.trim(),
      owner: draft.owner.trim(),
      score: Math.round(Number(score)),
    }

    saveLead(saved)
    onClose()
    onSaved?.(saved)
    toast.success(editing ? "Lead updated" : "Lead created", {
      description: `${saved.name} · ${saved.company} · ${saved.status}`,
    })
  })

  return (
    <FormShell
      title={editing ? "Edit lead" : "New lead"}
      description={
        lead
          ? `${lead.id} · changes apply everywhere this record appears`
          : "New leads land at the top of the leads list, ready to be worked."
      }
      submitLabel={editing ? "Save changes" : "Create lead"}
      onSubmit={submit}
      onCancel={onClose}
      errors={visibleErrors}
    >
      <FormSection title="The lead">
        <Field label="Name" htmlFor="lead-name" error={errorFor("name")}>
          <Input
            id="lead-name"
            value={draft.name}
            onChange={(event) => set("name", event.target.value)}
            {...fieldProps("name")}
          />
        </Field>

        <Field
          label="Company"
          htmlFor="lead-company"
          error={errorFor("company")}
        >
          <Input
            id="lead-company"
            value={draft.company}
            onChange={(event) => set("company", event.target.value)}
            {...fieldProps("company")}
          />
        </Field>

        <Field label="Email" htmlFor="lead-email" wide error={errorFor("email")}>
          <Input
            id="lead-email"
            type="email"
            value={draft.email}
            onChange={(event) => set("email", event.target.value)}
            {...fieldProps("email")}
          />
        </Field>
      </FormSection>

      <FormSection title="Qualification">
        <Field label="Source" htmlFor="lead-source" error={errorFor("source")}>
          <Select
            value={draft.source}
            onValueChange={(value) => set("source", value as LeadSource)}
          >
            <SelectTrigger
              id="lead-source"
              className="w-full"
              {...fieldProps("source")}
            >
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

        <Field label="Status" htmlFor="lead-status" error={errorFor("status")}>
          <Select
            value={draft.status}
            onValueChange={(value) => set("status", value as LeadStatus)}
          >
            <SelectTrigger
              id="lead-status"
              className="w-full"
              {...fieldProps("status")}
            >
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
          label="Score"
          htmlFor="lead-score"
          hint="0–100 fit and intent score"
          wide
          error={errorFor("score")}
        >
          <Input
            id="lead-score"
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={(event) => setScore(event.target.value)}
            {...fieldProps("score")}
          />
        </Field>
      </FormSection>

      <FormSection title="Ownership">
        <Field label="Owner" htmlFor="lead-owner" error={errorFor("owner")}>
          <Select
            value={draft.owner}
            onValueChange={(value) => set("owner", value)}
          >
            <SelectTrigger
              id="lead-owner"
              className="w-full"
              {...fieldProps("owner")}
            >
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              {options(seedOwners, draft.owner).map((owner) => (
                <SelectItem key={owner} value={owner}>
                  {owner}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Created" htmlFor="lead-created">
          <DatePicker
            id="lead-created"
            value={draft.createdAt}
            onChange={(value) => set("createdAt", value)}
            valueFormat={dateFormat}
            placeholder="Select a date"
          />
        </Field>
      </FormSection>
    </FormShell>
  )
}
