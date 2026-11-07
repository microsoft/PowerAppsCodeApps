import * as React from "react"

import { FormErrorSummary, FieldMessage } from "./form-validation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function FormSheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Content unmounts on close, so each open starts from clean state. */}
      {/* The base SheetContent caps width with a data-[side] prefixed class, so the
          override needs the same prefix to win on specificity. */}
      <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-xl">
        {children}
      </SheetContent>
    </Sheet>
  )
}

export function FormShell({
  title,
  description,
  submitLabel,
  onSubmit,
  onCancel,
  errors,
  children,
  Title = SheetTitle,
  Description = SheetDescription,
}: {
  title: string
  description: string
  submitLabel: string
  onSubmit: () => void
  onCancel: () => void
  /** Shown above the footer once the form has been submitted. */
  errors?: (string | undefined)[]
  children: React.ReactNode
  /** Heading primitives of the surrounding surface — swap them to sit in a Drawer. */
  Title?: React.ElementType
  Description?: React.ElementType
}) {
  return (
    <form
      noValidate
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <SheetHeader className="border-b p-5">
        <Title>{title}</Title>
        <Description>{description}</Description>
      </SheetHeader>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="flex flex-col gap-6">{children}</div>
      </div>

      <FormErrorSummary
        errors={errors ?? []}
        className="mx-4 mb-0 mt-4 rounded-lg"
      />

      <SheetFooter className="flex-row justify-end border-t p-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </SheetFooter>
    </form>
  )
}

export function FormSection({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  )
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  wide,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  wide?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", wide && "sm:col-span-2")}>
      <Label htmlFor={htmlFor} className="text-xs font-medium">
        {label}
      </Label>
      {children}
      <FieldMessage error={error} hint={hint} />
    </div>
  )
}
