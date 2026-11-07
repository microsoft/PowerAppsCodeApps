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
import { Switch } from "@/components/ui/switch"
import { useFormValidation } from "@/hooks/use-form-validation"

import {
  activities as seedActivities,
  deals,
  type Activity,
  type ActivityType,
} from "../data"
import {
  newActivityId,
  saveActivity,
  useCompanies,
  useContacts,
} from "../store"

const types: ActivityType[] = ["Call", "Meeting", "Email", "Task"]

const dateFormat = "yyyy-MM-dd"

/** A shadcn SelectItem cannot hold an empty value, so "none" stands in for "not linked". */
const NONE = "none"

/** Existing values plus whatever the draft already holds, so nothing is lost on edit. */
function options(values: (string | undefined)[], current: string | undefined) {
  return [...new Set([...values, current].filter(Boolean) as string[])].sort()
}

const seedOwners = seedActivities.map((activity) => activity.owner)

function blankActivity(): Activity {
  return {
    id: "",
    type: "Call",
    subject: "",
    owner: seedOwners[0] ?? "",
    date: format(new Date(), dateFormat),
    time: "09:00",
    done: false,
  }
}

export function ActivityFormSheet({
  open,
  onOpenChange,
  activity,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity?: Activity
  onSaved?: (activity: Activity) => void
}) {
  return (
    <FormSheet open={open} onOpenChange={onOpenChange}>
      <ActivityFormBody
        key={activity?.id ?? "new"}
        activity={activity}
        onClose={() => onOpenChange(false)}
        onSaved={onSaved}
      />
    </FormSheet>
  )
}

function ActivityFormBody({
  activity,
  onClose,
  onSaved,
}: {
  activity?: Activity
  onClose: () => void
  onSaved?: (activity: Activity) => void
}) {
  const contacts = useContacts()
  const companies = useCompanies()
  const [draft, setDraft] = React.useState<Activity>(() =>
    activity ? { ...activity } : blankActivity()
  )
  const editing = Boolean(activity)

  const { errorFor, fieldProps, handleSubmit, visibleErrors } =
    useFormValidation(
      {
        type: draft.type as string,
        subject: draft.subject,
        date: draft.date,
        time: draft.time,
        owner: draft.owner,
      },
      {
        subject: (values) =>
          !values.subject.trim()
            ? "Say what this activity is about."
            : undefined,
        date: (values) => (!values.date.trim() ? "Pick a date." : undefined),
        time: (values) => (!values.time.trim() ? "Set a time." : undefined),
        owner: (values) =>
          !values.owner.trim() ? "Every activity needs an owner." : undefined,
      }
    )

  function set<K extends keyof Activity>(key: K, value: Activity[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const submit = handleSubmit(() => {
    const saved: Activity = {
      ...draft,
      id: draft.id || newActivityId(),
      subject: draft.subject.trim(),
      owner: draft.owner.trim(),
    }

    saveActivity(saved)
    onClose()
    onSaved?.(saved)
    toast.success(editing ? "Activity updated" : "Activity created", {
      description: `${saved.type} · ${saved.date} at ${saved.time} · ${saved.owner}`,
    })
  })

  return (
    <FormShell
      title={editing ? "Edit activity" : "New activity"}
      description={
        activity
          ? `${activity.id} · changes apply everywhere this record appears`
          : "New activities show up in the agenda for the day you choose."
      }
      submitLabel={editing ? "Save changes" : "Create activity"}
      onSubmit={submit}
      onCancel={onClose}
      errors={visibleErrors}
    >
      <FormSection title="The activity">
        <Field label="Type" htmlFor="activity-type" error={errorFor("type")}>
          <Select
            value={draft.type}
            onValueChange={(value) => set("type", value as ActivityType)}
          >
            <SelectTrigger
              id="activity-type"
              className="w-full"
              {...fieldProps("type")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Owner" htmlFor="activity-owner" error={errorFor("owner")}>
          <Select
            value={draft.owner}
            onValueChange={(value) => set("owner", value)}
          >
            <SelectTrigger
              id="activity-owner"
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

        <Field
          label="Subject"
          htmlFor="activity-subject"
          wide
          error={errorFor("subject")}
        >
          <Input
            id="activity-subject"
            value={draft.subject}
            onChange={(event) => set("subject", event.target.value)}
            {...fieldProps("subject")}
          />
        </Field>
      </FormSection>

      <FormSection title="When">
        <Field label="Date" htmlFor="activity-date" error={errorFor("date")}>
          <DatePicker
            id="activity-date"
            value={draft.date}
            onChange={(value) => set("date", value)}
            valueFormat={dateFormat}
            placeholder="Select a date"
            clearable={false}
            invalid={fieldProps("date")["aria-invalid"]}
          />
        </Field>

        <Field label="Time" htmlFor="activity-time" error={errorFor("time")}>
          <Input
            id="activity-time"
            type="time"
            value={draft.time}
            onChange={(event) => set("time", event.target.value)}
            {...fieldProps("time")}
          />
        </Field>

        <Field label="Mark as done" htmlFor="activity-done" wide>
          <div className="flex h-9 items-center">
            <Switch
              id="activity-done"
              checked={draft.done}
              onCheckedChange={(checked) => set("done", checked)}
            />
          </div>
        </Field>
      </FormSection>

      <FormSection
        title="Linked records"
        hint="Optional — connects the activity to the rest of the account."
      >
        <Field label="Contact" htmlFor="activity-contact">
          <Select
            value={draft.contactId ?? NONE}
            onValueChange={(value) =>
              set("contactId", value === NONE ? undefined : value)
            }
          >
            <SelectTrigger id="activity-contact" className="w-full">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>None</SelectItem>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Company" htmlFor="activity-company">
          <Select
            value={draft.companyId ?? NONE}
            onValueChange={(value) =>
              set("companyId", value === NONE ? undefined : value)
            }
          >
            <SelectTrigger id="activity-company" className="w-full">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>None</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Deal" htmlFor="activity-deal" wide>
          <Select
            value={draft.dealId ?? NONE}
            onValueChange={(value) =>
              set("dealId", value === NONE ? undefined : value)
            }
          >
            <SelectTrigger id="activity-deal" className="w-full">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>None</SelectItem>
              {deals.map((deal) => (
                <SelectItem key={deal.id} value={deal.id}>
                  {deal.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FormSection>
    </FormShell>
  )
}
