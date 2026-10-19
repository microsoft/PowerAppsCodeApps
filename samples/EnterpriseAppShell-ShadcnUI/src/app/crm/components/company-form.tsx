import * as React from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { useFormValidation } from "@/hooks/use-form-validation"

import {
  companies as seedCompanies,
  type Company,
  type CompanyStatus,
} from "../data"
import { newCompanyId, saveCompany } from "../store"

const statuses: CompanyStatus[] = ["Customer", "Prospect", "Churned"]

const dateFormat = "MMM yyyy"

/** Seeds use an em dash for accounts that never became customers. */
const NO_DATE = "—"

/** Existing values plus whatever the draft already holds, so nothing is lost on edit. */
function options(values: (string | undefined)[], current: string | undefined) {
  return [...new Set([...values, current].filter(Boolean) as string[])].sort()
}

const seedOwners = seedCompanies.map((company) => company.owner)
const seedIndustries = seedCompanies.map((company) => company.industry)

function blankCompany(): Company {
  return {
    id: "",
    name: "",
    industry: seedIndustries[0] ?? "",
    employees: "",
    location: "",
    website: "",
    owner: seedOwners[0] ?? "",
    status: "Prospect",
    annualValue: 0,
    customerSince: NO_DATE,
    description: "",
  }
}

export function CompanyFormSheet({
  open,
  onOpenChange,
  company,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: Company
  onSaved?: (company: Company) => void
}) {
  return (
    <FormSheet open={open} onOpenChange={onOpenChange}>
      <CompanyFormBody
        key={company?.id ?? "new"}
        company={company}
        onClose={() => onOpenChange(false)}
        onSaved={onSaved}
      />
    </FormSheet>
  )
}

function CompanyFormBody({
  company,
  onClose,
  onSaved,
}: {
  company?: Company
  onClose: () => void
  onSaved?: (company: Company) => void
}) {
  const [draft, setDraft] = React.useState<Company>(() =>
    company ? { ...company } : blankCompany()
  )
  const [annualValue, setAnnualValue] = React.useState(String(draft.annualValue))
  const editing = Boolean(company)

  const { errorFor, fieldProps, handleSubmit, visibleErrors } =
    useFormValidation(
      {
        name: draft.name,
        website: draft.website,
        annualValue,
        industry: draft.industry,
        owner: draft.owner,
        status: draft.status as string,
      },
      {
        name: (values) =>
          !values.name.trim() ? "Give the account a name." : undefined,
        website: (values) =>
          values.website.trim() &&
          !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+([/?#]\S*)?$/.test(
            values.website.trim()
          )
            ? "That does not look like a web address."
            : undefined,
        annualValue: (values) => {
          const parsed = Number(values.annualValue)
          return !Number.isFinite(parsed) || parsed < 0
            ? "Enter an amount of 0 or more."
            : undefined
        },
      }
    )

  function set<K extends keyof Company>(key: K, value: Company[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const submit = handleSubmit(() => {
    const saved: Company = {
      ...draft,
      id: draft.id || newCompanyId(),
      name: draft.name.trim(),
      industry: draft.industry.trim(),
      employees: draft.employees.trim(),
      location: draft.location.trim(),
      website: draft.website.trim(),
      owner: draft.owner.trim(),
      description: draft.description.trim(),
      annualValue: Math.round(Number(annualValue)),
      customerSince: draft.customerSince.trim() || NO_DATE,
    }

    saveCompany(saved)
    onClose()
    onSaved?.(saved)
    toast.success(editing ? "Company updated" : "Company created", {
      description: `${saved.name} · ${saved.status} · owned by ${saved.owner}`,
    })
  })

  return (
    <FormShell
      title={editing ? "Edit company" : "New company"}
      description={
        company
          ? `${company.id} · changes apply everywhere this record appears`
          : "New accounts appear straight away in the companies list."
      }
      submitLabel={editing ? "Save changes" : "Create company"}
      onSubmit={submit}
      onCancel={onClose}
      errors={visibleErrors}
    >
      <FormSection title="The company">
        <Field label="Name" htmlFor="company-name" error={errorFor("name")}>
          <Input
            id="company-name"
            value={draft.name}
            onChange={(event) => set("name", event.target.value)}
            {...fieldProps("name")}
          />
        </Field>

        <Field
          label="Industry"
          htmlFor="company-industry"
          error={errorFor("industry")}
        >
          <Select
            value={draft.industry}
            onValueChange={(value) => set("industry", value)}
          >
            <SelectTrigger
              id="company-industry"
              className="w-full"
              {...fieldProps("industry")}
            >
              <SelectValue placeholder="Select an industry" />
            </SelectTrigger>
            <SelectContent>
              {options(seedIndustries, draft.industry).map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Description" htmlFor="company-description" wide>
          <Textarea
            id="company-description"
            rows={3}
            value={draft.description}
            onChange={(event) => set("description", event.target.value)}
            placeholder="What does this account do, and what are they trying to solve?"
          />
        </Field>
      </FormSection>

      <FormSection title="Profile">
        <Field label="Employees" htmlFor="company-employees" hint="e.g. 1,200">
          <Input
            id="company-employees"
            value={draft.employees}
            onChange={(event) => set("employees", event.target.value)}
          />
        </Field>

        <Field label="Location" htmlFor="company-location" hint="City, state">
          <Input
            id="company-location"
            value={draft.location}
            onChange={(event) => set("location", event.target.value)}
          />
        </Field>

        <Field
          label="Website"
          htmlFor="company-website"
          hint="e.g. northwind.example.com"
          wide
          error={errorFor("website")}
        >
          <Input
            id="company-website"
            value={draft.website}
            onChange={(event) => set("website", event.target.value)}
            {...fieldProps("website")}
          />
        </Field>
      </FormSection>

      <FormSection title="Relationship">
        <Field label="Owner" htmlFor="company-owner" error={errorFor("owner")}>
          <Select
            value={draft.owner}
            onValueChange={(value) => set("owner", value)}
          >
            <SelectTrigger
              id="company-owner"
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
          htmlFor="company-status"
          error={errorFor("status")}
        >
          <Select
            value={draft.status}
            onValueChange={(value) => set("status", value as CompanyStatus)}
          >
            <SelectTrigger
              id="company-status"
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
          label="Annual value"
          htmlFor="company-annual-value"
          hint="US dollars, 0 for prospects"
          error={errorFor("annualValue")}
        >
          <Input
            id="company-annual-value"
            type="number"
            min={0}
            value={annualValue}
            onChange={(event) => setAnnualValue(event.target.value)}
            {...fieldProps("annualValue")}
          />
        </Field>

        <Field label="Customer since" htmlFor="company-customer-since">
          <DatePicker
            id="company-customer-since"
            value={draft.customerSince === NO_DATE ? "" : draft.customerSince}
            onChange={(value) => set("customerSince", value || NO_DATE)}
            valueFormat={dateFormat}
            displayFormat={dateFormat}
            placeholder="Not a customer yet"
          />
        </Field>
      </FormSection>
    </FormShell>
  )
}
