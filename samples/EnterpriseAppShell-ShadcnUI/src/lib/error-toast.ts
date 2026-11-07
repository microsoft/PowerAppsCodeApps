import { toast } from "sonner"

import { reportError, isAbortError, type AppErrorOptions } from "@/lib/errors"

export type NotifyErrorOptions = AppErrorOptions & {
  /** Adds a retry button to the toast. */
  onRetry?: () => void
  retryLabel?: string
}

/**
 * The single place a failure becomes visible. Logs through `reportError`, then
 * shows one toast with a readable title, the hint and an optional retry.
 * Swap `sonner` for your own toast library and the rest of the app is unchanged.
 */
export function notifyError(value: unknown, options: NotifyErrorOptions = {}) {
  const { onRetry, retryLabel = "Try again", ...errorOptions } = options
  if (isAbortError(value)) return null

  const error = reportError(value, errorOptions)
  const description = error.hint ?? error.message

  const show = error.severity === "warning" ? toast.warning : toast.error
  show(error.title, {
    description: description === error.title ? undefined : description,
    action: onRetry ? { label: retryLabel, onClick: onRetry } : undefined,
  })

  return error
}
