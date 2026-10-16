import * as React from "react"

export type FieldErrors<T> = Partial<Record<keyof T, string>>

/** Return a message when the field is invalid, otherwise `undefined`. */
export type Validator<T> = (values: T) => string | undefined

export type ValidationRules<T> = Partial<Record<keyof T, Validator<T>>>

/**
 * Shared validation for the app's forms. Nothing is shown until the first
 * submit attempt, after which errors track the values live so a field clears
 * the moment it is fixed. Pair with `noValidate` on the form so the browser
 * never shows its own bubbles.
 */
export function useFormValidation<T extends object>(
  values: T,
  rules: ValidationRules<T>,
) {
  const [submitted, setSubmitted] = React.useState(false)

  const errors: FieldErrors<T> = {}
  for (const key of Object.keys(rules) as (keyof T)[]) {
    const message = rules[key]?.(values)
    if (message) errors[key] = message
  }

  const isValid = Object.keys(errors).length === 0

  const errorFor = (field: keyof T) => (submitted ? errors[field] : undefined)

  /** Spread onto a control so invalid fields pick up the destructive ring. */
  const fieldProps = (field: keyof T) => ({
    "aria-invalid": submitted && Boolean(errors[field]),
  })

  const handleSubmit = (onValid: () => void) => (event?: React.FormEvent) => {
    event?.preventDefault()
    setSubmitted(true)
    if (!isValid) {
      focusFirstInvalid(event?.currentTarget as HTMLElement | null)
      return
    }
    onValid()
    // Forms that stay mounted usually clear themselves on success; going back
    // to untouched stops the emptied fields lighting up red straight away.
    setSubmitted(false)
  }

  return {
    errors,
    errorFor,
    fieldProps,
    handleSubmit,
    isValid,
    submitted,
    /** Every message worth showing right now, for `FormErrorSummary`. */
    visibleErrors: submitted ? (Object.values(errors) as string[]) : [],
  }
}

function focusFirstInvalid(form: HTMLElement | null | undefined) {
  // Wait for the render that paints `aria-invalid` before hunting for it.
  requestAnimationFrame(() => {
    const scope = form ?? document
    const target = scope.querySelector<HTMLElement>('[aria-invalid="true"]')
    target?.scrollIntoView({ behavior: "smooth", block: "center" })
    target?.focus({ preventScroll: true })
  })
}
