import { AlertCircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Summary of everything blocking a submit. Rendered next to the submit action
 * so the reason is never off-screen.
 */
export function FormErrorSummary({
  errors,
  className,
}: {
  errors: (string | undefined)[]
  className?: string
}) {
  const messages = errors.filter(Boolean) as string[]
  if (messages.length === 0) return null

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive",
        className,
      )}
    >
      <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
      <div className="flex flex-col gap-1">
        <p className="font-medium">
          {messages.length === 1
            ? "One field needs attention"
            : `${messages.length} fields need attention`}
        </p>
        <ul className="flex list-disc flex-col gap-0.5 pl-4 text-destructive/90">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Inline message under a control. Falls back to the hint when valid. */
export function FieldMessage({
  error,
  hint,
}: {
  error?: string
  hint?: string
}) {
  if (error) return <p className="text-xs text-destructive">{error}</p>
  if (hint) return <p className="text-xs text-muted-foreground">{hint}</p>
  return null
}
