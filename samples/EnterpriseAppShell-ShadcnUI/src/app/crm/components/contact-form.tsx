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
  contacts as seedContacts,
  type Contact,
  type ContactStatus,
} from "../data"
import { newContactId, saveContact, useCompanies } from "../store"

const statuses: ContactStatus[] = ["Active", "New", "Cold"]

const dateFormat = "dd MMM yyyy"

/** Existing values plus whatever the draft already holds, so nothing is lost on edit. */
function options(values: (string | undefined)[], current: string | undefined) {
  return [...new Set([...values, current].filter(Boolean) as string[])].sort()
}

const seedOwners = seedContacts.map((contact) => contact.owner)

function blankContact(companyId: string): Contact {
  return {
    id: "",
    name: "",
    title: "",
    companyId,
    email: "",
    phone: "",
    owner: seedOwners[0] ?? "",
    status: "New",
    lastContact: format(new Date(), dateFormat),
    tags: [],
  }
}

export function ContactFormSheet({
  open,
  onOpenChange,
  contact,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: Contact
  onSaved?: (contact: Contact) => void
}) {
  return (
    <FormSheet open={open} onOpenChange={onOpenChange}>
      <ContactFormBody
        key={contact?.id ?? "new"}
        contact={contact}
        onClose={() => onOpenChange(false)}
        onSaved={onSaved}
      />
    </FormSheet>
  )
}

function ContactFormBody({
  contact,
  onClose,
  onSaved,
}: {
  contact?: Contact
  onClose: () => void
  onSaved?: (contact: Contact) => void
}) {
  const companies = useCompanies()
  const [draft, setDraft] = React.useState<Contact>(() =>
    contact ? { ...contact } : blankContact(companies[0]?.id ?? "")
  )
  const [tags, setTags] = React.useState(draft.tags.join(", "))
  const editing = Boolean(contact)

  const { errorFor, fieldProps, handleSubmit, visibleErrors } =
    useFormValidation(
      {
        name: draft.name,
        email: draft.email,
        companyId: draft.companyId,
        owner: draft.owner,
        status: draft.status as string,
      },
      {
        name: (values) =>
          !values.name.trim() ? "Give the contact a name." : undefined,
        email: (values) =>
          !values.email.trim()
            ? "An email address is required."
            : !/\S+@\S+\.\S+/.test(values.email)
              ? "That does not look like an email address."
              : undefined,
        companyId: (values) =>
          !values.companyId ? "Pick the company they work for." : undefined,
      }
    )

  function set<K extends keyof Contact>(key: K, value: Contact[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const submit = handleSubmit(() => {
    const saved: Contact = {
      ...draft,
      id: draft.id || newContactId(),
      name: draft.name.trim(),
      title: draft.title.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      owner: draft.owner.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    saveContact(saved)
    onClose()
    onSaved?.(saved)
    const company = companies.find((item) => item.id === saved.companyId)
    toast.success(editing ? "Contact updated" : "Contact created", {
      description: `${saved.name}${company ? ` · ${company.name}` : ""} · ${saved.status}`,
    })
  })

  return (
    <FormShell
      title={editing ? "Edit contact" : "New contact"}
      description={
        contact
          ? `${contact.id} · changes apply everywhere this record appears`
          : "New contacts appear in the contacts table and on their company page."
      }
      submitLabel={editing ? "Save changes" : "Create contact"}
      onSubmit={submit}
      onCancel={onClose}
      errors={visibleErrors}
    >
      <FormSection title="The contact">
        <Field label="Name" htmlFor="contact-name" error={errorFor("name")}>
          <Input
            id="contact-name"
            value={draft.name}
            onChange={(event) => set("name", event.target.value)}
            {...fieldProps("name")}
          />
        </Field>

        <Field label="Title" htmlFor="contact-title" hint="Their role">
          <Input
            id="contact-title"
            value={draft.title}
            onChange={(event) => set("title", event.target.value)}
          />
        </Field>

        <Field label="Email" htmlFor="contact-email" error={errorFor("email")}>
          <Input
            id="contact-email"
            type="email"
            value={draft.email}
            onChange={(event) => set("email", event.target.value)}
            {...fieldProps("email")}
          />
        </Field>

        <Field label="Phone" htmlFor="contact-phone">
          <Input
            id="contact-phone"
            type="tel"
            value={draft.phone}
            onChange={(event) => set("phone", event.target.value)}
          />
        </Field>
      </FormSection>

      <FormSection title="Relationship">
        <Field
          label="Company"
          htmlFor="contact-company"
          error={errorFor("companyId")}
        >
          <Select
            value={draft.companyId}
            onValueChange={(value) => set("companyId", value)}
          >
            <SelectTrigger
              id="contact-company"
              className="w-full"
              {...fieldProps("companyId")}
            >
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Owner" htmlFor="contact-owner" error={errorFor("owner")}>
          <Select
            value={draft.owner}
            onValueChange={(value) => set("owner", value)}
          >
            <SelectTrigger
              id="contact-owner"
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
          label="Status"
          htmlFor="contact-status"
          error={errorFor("status")}
        >
          <Select
            value={draft.status}
            onValueChange={(value) => set("status", value as ContactStatus)}
          >
            <SelectTrigger
              id="contact-status"
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

        <Field label="Last contact" htmlFor="contact-last">
          <DatePicker
            id="contact-last"
            value={draft.lastContact}
            onChange={(value) => set("lastContact", value)}
            valueFormat={dateFormat}
            placeholder="Not contacted yet"
          />
        </Field>

        <Field
          label="Tags"
          htmlFor="contact-tags"
          hint="Comma separated, e.g. champion, renewal"
          wide
        >
          <Input
            id="contact-tags"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
          />
        </Field>
      </FormSection>
    </FormShell>
  )
}
