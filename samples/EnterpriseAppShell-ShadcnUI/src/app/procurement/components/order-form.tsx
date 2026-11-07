import * as React from "react"
import { isValid, parse } from "date-fns"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { DatePicker } from "@/components/common/date-picker"
import { Field, FormSection, FormSheet, FormShell } from "@/components/common/form-sheet"
import { FieldMessage } from "@/components/common/form-validation"
import { useFormValidation } from "@/hooks/use-form-validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  formatCurrency,
  purchaseOrders,
  type Category,
  type OrderStatus,
  type PurchaseOrder,
} from "../data"
import { newOrderId, saveOrder, useSuppliers } from "../store"

const DATE_FORMAT = "dd MMM yyyy"
/** The app's mock today, matching the seed data. */
const TODAY = "02 Sep 2026"

const categories: Category[] = [
  "IT Hardware",
  "Software",
  "Facilities",
  "Logistics",
  "Professional Services",
  "Raw Materials",
]

const orderStatuses: OrderStatus[] = [
  "Draft",
  "Pending approval",
  "Approved",
  "Shipped",
  "Received",
  "Cancelled",
]

const seedRequesters = [
  ...new Set(purchaseOrders.map((order) => order.requester)),
].sort()

type LineDraft = {
  key: string
  description: string
  quantity: string
  unitPrice: string
}

let lineKey = 0
function blankLine(): LineDraft {
  lineKey += 1
  return { key: `line-${lineKey}`, description: "", quantity: "1", unitPrice: "0" }
}

function toDate(value: string) {
  const parsed = parse(value, DATE_FORMAT, new Date())
  return isValid(parsed) ? parsed : undefined
}

function lineTotal(line: LineDraft) {
  const quantity = Number(line.quantity)
  const unitPrice = Number(line.unitPrice)
  return Number.isFinite(quantity) && Number.isFinite(unitPrice)
    ? quantity * unitPrice
    : 0
}

function lineIsValid(line: LineDraft) {
  const quantity = Number(line.quantity)
  const unitPrice = Number(line.unitPrice)
  return (
    Boolean(line.description.trim()) &&
    Number.isFinite(quantity) &&
    quantity >= 1 &&
    Number.isFinite(unitPrice) &&
    unitPrice >= 0
  )
}

export function OrderFormSheet({
  open,
  onOpenChange,
  order,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  order?: PurchaseOrder
  onSaved?: (order: PurchaseOrder) => void
}) {
  return (
    <FormSheet open={open} onOpenChange={onOpenChange}>
      <OrderFormBody
        key={order?.id ?? "new"}
        order={order}
        onClose={() => onOpenChange(false)}
        onSaved={onSaved}
      />
    </FormSheet>
  )
}

function OrderFormBody({
  order,
  onClose,
  onSaved,
}: {
  order?: PurchaseOrder
  onClose: () => void
  onSaved?: (order: PurchaseOrder) => void
}) {
  const suppliers = useSuppliers()
  const editing = Boolean(order)

  const [draft, setDraft] = React.useState(() => ({
    title: order?.title ?? "",
    supplierId: order?.supplierId ?? "",
    category: order?.category ?? categories[0],
    status: order?.status ?? ("Draft" as OrderStatus),
    requester: order?.requester ?? "",
    orderedOn: order?.orderedOn ?? TODAY,
    expectedDate: order?.expectedDate ?? "",
  }))

  const [lines, setLines] = React.useState<LineDraft[]>(() =>
    order && order.lines.length > 0
      ? order.lines.map((line) => ({
          ...blankLine(),
          description: line.description,
          quantity: String(line.quantity),
          unitPrice: String(line.unitPrice),
        }))
      : [blankLine()]
  )

  const total = lines.reduce((sum, line) => sum + lineTotal(line), 0)

  const { errorFor, fieldProps, handleSubmit, submitted, visibleErrors } =
    useFormValidation(
      { ...draft, lines },
      {
        title: (values) =>
          !values.title.trim() ? "Give the order a title." : undefined,
        supplierId: (values) =>
          !values.supplierId ? "Pick the supplier fulfilling this." : undefined,
        requester: (values) =>
          !values.requester ? "Every order needs a requester." : undefined,
        orderedOn: (values) =>
          !values.orderedOn ? "Set the order date." : undefined,
        expectedDate: (values) => {
          if (!values.expectedDate) return "Set the expected date."
          const ordered = toDate(values.orderedOn)
          const expected = toDate(values.expectedDate)
          return ordered && expected && expected < ordered
            ? "The expected date cannot be before the order date."
            : undefined
        },
        lines: (values) => {
          if (values.lines.length === 0) return "Add at least one line item."
          return values.lines.every(lineIsValid)
            ? undefined
            : "Every line needs a description, a quantity and a unit price."
        },
      }
    )

  const lineError = errorFor("lines")

  function set<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function setLine<K extends keyof LineDraft>(
    index: number,
    key: K,
    value: LineDraft[K]
  ) {
    setLines((current) =>
      current.map((line, i) => (i === index ? { ...line, [key]: value } : line))
    )
  }

  const submit = handleSubmit(() => {
    const saved: PurchaseOrder = {
      id: order?.id ?? newOrderId(),
      title: draft.title.trim(),
      supplierId: draft.supplierId,
      category: draft.category,
      status: draft.status,
      requester: draft.requester,
      orderedOn: draft.orderedOn,
      expectedDate: draft.expectedDate,
      lines: lines.map((line) => ({
        description: line.description.trim(),
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice),
      })),
    }

    saveOrder(saved)
    onClose()
    onSaved?.(saved)

    const supplier = suppliers.find((item) => item.id === saved.supplierId)
    toast.success(editing ? "Purchase order updated" : "Purchase order created", {
      description: `${saved.id} · ${supplier?.name ?? "Unassigned"} · ${formatCurrency(
        saved.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
      )}`,
    })
  })

  return (
    <FormShell
      title={editing ? "Edit purchase order" : "New purchase order"}
      description={
        order
          ? `${order.id} · changes apply everywhere this order appears`
          : "It lands on the orders list and the supplier's record straight away."
      }
      submitLabel={editing ? "Save changes" : "Create order"}
      onSubmit={submit}
      onCancel={onClose}
      errors={visibleErrors}
    >
      <FormSection title="The order">
        <Field label="Title" htmlFor="order-title" wide error={errorFor("title")}>
          <Input
            id="order-title"
            value={draft.title}
            onChange={(event) => set("title", event.target.value)}
            placeholder="What is being bought?"
            {...fieldProps("title")}
          />
        </Field>

        <Field
          label="Supplier"
          htmlFor="order-supplier"
          error={errorFor("supplierId")}
        >
          <Select
            value={draft.supplierId}
            onValueChange={(value) => set("supplierId", value)}
          >
            <SelectTrigger
              id="order-supplier"
              className="w-full"
              {...fieldProps("supplierId")}
            >
              <SelectValue placeholder="Select a supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Category" htmlFor="order-category">
          <Select
            value={draft.category}
            onValueChange={(value) => set("category", value as Category)}
          >
            <SelectTrigger id="order-category" className="w-full">
              <SelectValue />
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

        <Field label="Status" htmlFor="order-status">
          <Select
            value={draft.status}
            onValueChange={(value) => set("status", value as OrderStatus)}
          >
            <SelectTrigger id="order-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {orderStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Requester"
          htmlFor="order-requester"
          error={errorFor("requester")}
        >
          <Select
            value={draft.requester}
            onValueChange={(value) => set("requester", value)}
          >
            <SelectTrigger
              id="order-requester"
              className="w-full"
              {...fieldProps("requester")}
            >
              <SelectValue placeholder="Select a requester" />
            </SelectTrigger>
            <SelectContent>
              {[...new Set([...seedRequesters, draft.requester].filter(Boolean))]
                .sort()
                .map((requester) => (
                  <SelectItem key={requester} value={requester}>
                    {requester}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </Field>
      </FormSection>

      <FormSection title="Schedule">
        <Field
          label="Ordered on"
          htmlFor="order-ordered"
          error={errorFor("orderedOn")}
        >
          <DatePicker
            id="order-ordered"
            value={draft.orderedOn}
            onChange={(value) => set("orderedOn", value)}
            valueFormat={DATE_FORMAT}
            placeholder="Select the order date"
            clearable={false}
            invalid={fieldProps("orderedOn")["aria-invalid"]}
          />
        </Field>

        <Field
          label="Expected"
          htmlFor="order-expected"
          error={errorFor("expectedDate")}
        >
          <DatePicker
            id="order-expected"
            value={draft.expectedDate}
            onChange={(value) => set("expectedDate", value)}
            valueFormat={DATE_FORMAT}
            placeholder="Select the expected date"
            clearable={false}
            invalid={fieldProps("expectedDate")["aria-invalid"]}
          />
        </Field>
      </FormSection>

      <section className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-medium">Line items</h3>
          <p className="text-xs text-muted-foreground">
            What the order is made up of.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex-1">Description</span>
            <span className="w-20">Qty</span>
            <span className="w-28">Unit price</span>
            <span className="w-24 text-right">Total</span>
            <span className="w-9" aria-hidden />
          </div>

          {lines.map((line, index) => {
            const invalid = submitted && !lineIsValid(line)
            const quantity = Number(line.quantity)
            const unitPrice = Number(line.unitPrice)
            return (
              <div key={line.key} className="flex items-center gap-2">
                <Input
                  aria-label={`Line ${index + 1} description`}
                  value={line.description}
                  onChange={(event) =>
                    setLine(index, "description", event.target.value)
                  }
                  placeholder="What is this line for?"
                  className="flex-1"
                  aria-invalid={invalid && !line.description.trim()}
                />
                <Input
                  aria-label={`Line ${index + 1} quantity`}
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(event) =>
                    setLine(index, "quantity", event.target.value)
                  }
                  className="w-20"
                  aria-invalid={
                    invalid && (!Number.isFinite(quantity) || quantity < 1)
                  }
                />
                <Input
                  aria-label={`Line ${index + 1} unit price`}
                  type="number"
                  min={0}
                  step="0.01"
                  value={line.unitPrice}
                  onChange={(event) =>
                    setLine(index, "unitPrice", event.target.value)
                  }
                  className="w-28"
                  aria-invalid={
                    invalid && (!Number.isFinite(unitPrice) || unitPrice < 0)
                  }
                />
                <span className="w-24 text-right text-sm tabular-nums">
                  {formatCurrency(lineTotal(line))}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove line ${index + 1}`}
                  onClick={() =>
                    setLines((current) => current.filter((_, i) => i !== index))
                  }
                >
                  <Trash2Icon />
                </Button>
              </div>
            )
          })}

          <FieldMessage error={lineError} />

          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLines((current) => [...current, blankLine()])}
            >
              <PlusIcon />
              Add line
            </Button>
          </div>

          <div className="flex items-center justify-between border-t pt-3 text-sm">
            <span className="text-muted-foreground">Order total</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </section>
    </FormShell>
  )
}
