import * as React from "react"
import { toast } from "sonner"

import { DatePicker } from "@/components/common/date-picker"
import { Field, FormSection, FormSheet, FormShell } from "@/components/common/form-sheet"
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
  suppliers as seedSuppliers,
  type Category,
  type Supplier,
  type SupplierStatus,
} from "../data"
import { newSupplierId, saveSupplier } from "../store"

const DATE_FORMAT = "dd MMM yyyy"
const MONTH_FORMAT = "MMM yyyy"
/** The seeds use an em dash rather than an empty string for "no contract end". */
const NO_DATE = "—"

const categories: Category[] = [
  "IT Hardware",
  "Software",
  "Facilities",
  "Logistics",
  "Professional Services",
  "Raw Materials",
]

const statuses: SupplierStatus[] = [
  "Preferred",
  "Approved",
  "Under review",
  "Suspended",
]

const seedBuyers = [...new Set(seedSuppliers.map((s) => s.buyer))].sort()

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const websitePattern = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/

function percentRule(label: string) {
  return (value: string) => {
    const parsed = Number(value)
    return !value.trim() || !Number.isFinite(parsed) || parsed < 0 || parsed > 100
      ? `${label} is a number between 0 and 100.`
      : undefined
  }
}

export function SupplierFormSheet({
  open,
  onOpenChange,
  supplier,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Supplier
  onSaved?: (supplier: Supplier) => void
}) {
  return (
    <FormSheet open={open} onOpenChange={onOpenChange}>
      <SupplierFormBody
        key={supplier?.id ?? "new"}
        supplier={supplier}
        onClose={() => onOpenChange(false)}
        onSaved={onSaved}
      />
    </FormSheet>
  )
}

function SupplierFormBody({
  supplier,
  onClose,
  onSaved,
}: {
  supplier?: Supplier
  onClose: () => void
  onSaved?: (supplier: Supplier) => void
}) {
  const editing = Boolean(supplier)

  const [draft, setDraft] = React.useState(() => ({
    name: supplier?.name ?? "",
    category: supplier?.category ?? categories[0],
    location: supplier?.location ?? "",
    contactName: supplier?.contactName ?? "",
    contactEmail: supplier?.contactEmail ?? "",
    phone: supplier?.phone ?? "",
    website: supplier?.website ?? "",
    status: supplier?.status ?? ("Approved" as SupplierStatus),
    paymentTerms: supplier?.paymentTerms ?? "Net 30",
    contractEnds:
      !supplier?.contractEnds || supplier.contractEnds === NO_DATE
        ? ""
        : supplier.contractEnds,
    since: supplier?.since ?? "",
    buyer: supplier?.buyer ?? "",
    description: supplier?.description ?? "",
  }))

  const [rating, setRating] = React.useState(String(supplier?.rating ?? 80))
  const [onTimeRate, setOnTimeRate] = React.useState(
    String(supplier?.onTimeRate ?? 95)
  )
  const [annualSpend, setAnnualSpend] = React.useState(
    String(supplier?.annualSpend ?? 0)
  )

  const { errorFor, fieldProps, handleSubmit, visibleErrors } =
    useFormValidation(
      { ...draft, rating, onTimeRate, annualSpend },
      {
        name: (values) =>
          !values.name.trim() ? "Give the supplier a name." : undefined,
        category: (values) =>
          !values.category ? "Pick a category." : undefined,
        contactEmail: (values) =>
          values.contactEmail && !emailPattern.test(values.contactEmail.trim())
            ? "That does not look like an email address."
            : undefined,
        website: (values) =>
          values.website && !websitePattern.test(values.website.trim())
            ? "Enter a domain like acme.example.com."
            : undefined,
        rating: (values) => percentRule("Score")(values.rating),
        onTimeRate: (values) => percentRule("On-time rate")(values.onTimeRate),
        annualSpend: (values) => {
          const parsed = Number(values.annualSpend)
          return !values.annualSpend.trim() ||
            !Number.isFinite(parsed) ||
            parsed < 0
            ? "Annual spend cannot be negative."
            : undefined
        },
      }
    )

  function set<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const submit = handleSubmit(() => {
    const saved: Supplier = {
      id: supplier?.id ?? newSupplierId(),
      name: draft.name.trim(),
      category: draft.category,
      location: draft.location.trim(),
      contactName: draft.contactName.trim(),
      contactEmail: draft.contactEmail.trim(),
      phone: draft.phone.trim(),
      website: draft.website.trim(),
      status: draft.status,
      rating: Math.round(Number(rating)),
      onTimeRate: Math.round(Number(onTimeRate)),
      annualSpend: Number(annualSpend),
      paymentTerms: draft.paymentTerms.trim(),
      contractEnds: draft.contractEnds || NO_DATE,
      since: draft.since,
      buyer: draft.buyer,
      description: draft.description.trim(),
    }

    saveSupplier(saved)
    onClose()
    onSaved?.(saved)
    toast.success(editing ? "Supplier updated" : "Supplier added", {
      description: `${saved.name} · ${saved.category} · ${saved.status}`,
    })
  })

  return (
    <FormShell
      title={editing ? "Edit supplier" : "New supplier"}
      description={
        supplier
          ? `${supplier.name} · changes apply everywhere this supplier appears`
          : "It joins the supplier directory and becomes selectable on orders."
      }
      submitLabel={editing ? "Save changes" : "Create supplier"}
      onSubmit={submit}
      onCancel={onClose}
      errors={visibleErrors}
    >
      <FormSection title="The supplier">
        <Field
          label="Name"
          htmlFor="supplier-name"
          wide
          error={errorFor("name")}
        >
          <Input
            id="supplier-name"
            value={draft.name}
            onChange={(event) => set("name", event.target.value)}
            {...fieldProps("name")}
          />
        </Field>

        <Field
          label="Category"
          htmlFor="supplier-category"
          error={errorFor("category")}
        >
          <Select
            value={draft.category}
            onValueChange={(value) => set("category", value as Category)}
          >
            <SelectTrigger
              id="supplier-category"
              className="w-full"
              {...fieldProps("category")}
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Status" htmlFor="supplier-status">
          <Select
            value={draft.status}
            onValueChange={(value) => set("status", value as SupplierStatus)}
          >
            <SelectTrigger id="supplier-status" className="w-full">
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

        <Field label="Location" htmlFor="supplier-location" hint="City, state">
          <Input
            id="supplier-location"
            value={draft.location}
            onChange={(event) => set("location", event.target.value)}
          />
        </Field>

        <Field label="Website" htmlFor="supplier-website" error={errorFor("website")}>
          <Input
            id="supplier-website"
            value={draft.website}
            onChange={(event) => set("website", event.target.value)}
            placeholder="acme.example.com"
            {...fieldProps("website")}
          />
        </Field>

        <Field label="Description" htmlFor="supplier-description" wide>
          <Textarea
            id="supplier-description"
            rows={3}
            value={draft.description}
            onChange={(event) => set("description", event.target.value)}
            placeholder="What do we buy from them?"
          />
        </Field>
      </FormSection>

      <FormSection title="Contact">
        <Field label="Contact name" htmlFor="supplier-contact">
          <Input
            id="supplier-contact"
            value={draft.contactName}
            onChange={(event) => set("contactName", event.target.value)}
          />
        </Field>

        <Field
          label="Contact email"
          htmlFor="supplier-email"
          error={errorFor("contactEmail")}
        >
          <Input
            id="supplier-email"
            value={draft.contactEmail}
            onChange={(event) => set("contactEmail", event.target.value)}
            {...fieldProps("contactEmail")}
          />
        </Field>

        <Field label="Phone" htmlFor="supplier-phone">
          <Input
            id="supplier-phone"
            value={draft.phone}
            onChange={(event) => set("phone", event.target.value)}
          />
        </Field>

        <Field label="Buyer" htmlFor="supplier-buyer" hint="Who owns the relationship">
          <Select
            value={draft.buyer}
            onValueChange={(value) => set("buyer", value)}
          >
            <SelectTrigger id="supplier-buyer" className="w-full">
              <SelectValue placeholder="Select a buyer" />
            </SelectTrigger>
            <SelectContent>
              {[...new Set([...seedBuyers, draft.buyer].filter(Boolean))]
                .sort()
                .map((buyer) => (
                  <SelectItem key={buyer} value={buyer}>
                    {buyer}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </Field>
      </FormSection>

      <FormSection title="Commercials">
        <Field label="Payment terms" htmlFor="supplier-terms" hint="e.g. Net 30">
          <Input
            id="supplier-terms"
            value={draft.paymentTerms}
            onChange={(event) => set("paymentTerms", event.target.value)}
          />
        </Field>

        <Field
          label="Annual spend"
          htmlFor="supplier-spend"
          hint="USD"
          error={errorFor("annualSpend")}
        >
          <Input
            id="supplier-spend"
            type="number"
            min={0}
            step="1000"
            value={annualSpend}
            onChange={(event) => setAnnualSpend(event.target.value)}
            {...fieldProps("annualSpend")}
          />
        </Field>

        <Field
          label="Score"
          htmlFor="supplier-rating"
          hint="0–100"
          error={errorFor("rating")}
        >
          <Input
            id="supplier-rating"
            type="number"
            min={0}
            max={100}
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            {...fieldProps("rating")}
          />
        </Field>

        <Field
          label="On-time rate"
          htmlFor="supplier-ontime"
          hint="Percent of deliveries on time"
          error={errorFor("onTimeRate")}
        >
          <Input
            id="supplier-ontime"
            type="number"
            min={0}
            max={100}
            value={onTimeRate}
            onChange={(event) => setOnTimeRate(event.target.value)}
            {...fieldProps("onTimeRate")}
          />
        </Field>

        <Field label="Supplier since" htmlFor="supplier-since">
          <DatePicker
            id="supplier-since"
            value={draft.since}
            onChange={(value) => set("since", value)}
            valueFormat={MONTH_FORMAT}
            displayFormat={MONTH_FORMAT}
            placeholder="Select a month"
          />
        </Field>

        <Field
          label="Contract ends"
          htmlFor="supplier-contract"
          hint="Leave empty when open-ended"
        >
          <DatePicker
            id="supplier-contract"
            value={draft.contractEnds}
            onChange={(value) => set("contractEnds", value)}
            valueFormat={DATE_FORMAT}
            placeholder="Select an end date"
          />
        </Field>
      </FormSection>
    </FormShell>
  )
}
