import * as React from "react"

import { notifyError, type NotifyErrorOptions } from "@/lib/error-toast"
import { isAbortError, toAppError, type AppError } from "@/lib/errors"

type Options<TArgs extends unknown[], TResult> = NotifyErrorOptions & {
  onSuccess?: (result: TResult, ...args: TArgs) => void
  /** Set false to handle the failure yourself via the returned `error`. */
  toastOnError?: boolean
}

/**
 * Runs an async operation with the three states every screen needs — pending,
 * error and settled — and routes any failure through the shared reporter.
 * Returns `null` when the call fails, so callers never need a try/catch.
 */
export function useAsyncAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
  options: Options<TArgs, TResult> = {}
) {
  const { onSuccess, toastOnError = true, ...errorOptions } = options
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<AppError | null>(null)
  const mounted = React.useRef(true)
  const latest = React.useRef({ action, onSuccess, toastOnError, errorOptions })

  React.useEffect(() => {
    latest.current = { action, onSuccess, toastOnError, errorOptions }
  })

  React.useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const run = React.useCallback(async (...args: TArgs): Promise<TResult | null> => {
    setPending(true)
    setError(null)
    try {
      const result = await latest.current.action(...args)
      latest.current.onSuccess?.(result, ...args)
      return result
    } catch (thrown) {
      if (isAbortError(thrown)) return null
      const failure = latest.current.toastOnError
        ? (notifyError(thrown, latest.current.errorOptions) ?? toAppError(thrown))
        : toAppError(thrown, latest.current.errorOptions)
      if (mounted.current) setError(failure)
      return null
    } finally {
      if (mounted.current) setPending(false)
    }
  }, [])

  const reset = React.useCallback(() => setError(null), [])

  return { run, pending, error, reset }
}
