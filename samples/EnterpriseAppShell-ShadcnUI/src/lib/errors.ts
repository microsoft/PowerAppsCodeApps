/**
 * Portable error handling primitives. No React, no UI library, no framework —
 * copy this file into any TypeScript app as-is.
 *
 * The goal is that every failure in the app arrives at the UI as an `AppError`
 * with a title a person can read, an optional hint telling them what to do, and
 * enough structure to decide whether retrying is worth it.
 */

export type ErrorSeverity = "warning" | "error"

export type AppErrorOptions = {
  /** Stable machine-readable code, e.g. "dataverse.forbidden". */
  code?: string
  /** Short sentence for the toast or panel heading. */
  title?: string
  /** What the person should do next. */
  hint?: string
  severity?: ErrorSeverity
  /** HTTP-ish status, when the failure came from a service. */
  status?: number
  retryable?: boolean
  /** Anything worth attaching to a log entry — ids, table names, run ids. */
  context?: Record<string, unknown>
  cause?: unknown
}

export class AppError extends Error {
  readonly code: string
  readonly title: string
  readonly hint?: string
  readonly severity: ErrorSeverity
  readonly status?: number
  readonly retryable: boolean
  readonly context: Record<string, unknown>

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause })
    this.name = "AppError"
    this.code = options.code ?? "unknown"
    this.title = options.title ?? "Something went wrong"
    this.hint = options.hint
    this.severity = options.severity ?? "error"
    this.status = options.status
    this.retryable = options.retryable ?? isRetryableStatus(options.status)
    this.context = options.context ?? {}
  }

  withContext(context: Record<string, unknown>) {
    return new AppError(this.message, {
      code: this.code,
      title: this.title,
      hint: this.hint,
      severity: this.severity,
      status: this.status,
      retryable: this.retryable,
      context: { ...this.context, ...context },
      cause: this.cause,
    })
  }
}

function isRetryableStatus(status?: number) {
  if (status === undefined) return false
  return status === 408 || status === 429 || status >= 500
}

/** A cancelled request is not a failure — never show it to the user. */
export function isAbortError(value: unknown) {
  return (
    value instanceof DOMException && value.name === "AbortError"
  ) ||
    (value instanceof Error && value.name === "AbortError")
}

export function getErrorMessage(value: unknown): string {
  if (value instanceof Error) return value.message
  if (typeof value === "string") return value
  if (value && typeof value === "object" && "message" in value) {
    const message = (value as { message?: unknown }).message
    if (typeof message === "string") return message
  }
  return "Unexpected error"
}

type ODataErrorBody = { error?: { code?: string; message?: string } }

function readODataError(value: unknown): AppErrorOptions | null {
  if (!value || typeof value !== "object") return null
  const body = (value as ODataErrorBody).error
  if (!body || typeof body !== "object") return null
  if (typeof body.message !== "string") return null
  return { code: body.code ?? "service.error", title: "The service rejected the request" }
}

const STATUS_COPY: Record<number, { title: string; hint: string }> = {
  400: { title: "That request was not valid", hint: "Check the values you entered and try again." },
  401: { title: "Your session has expired", hint: "Sign in again to continue." },
  403: { title: "You do not have access to this", hint: "Ask an administrator for the right security role." },
  404: { title: "We could not find that record", hint: "It may have been deleted or renamed." },
  409: { title: "Someone else changed this first", hint: "Reload the record and reapply your change." },
  429: { title: "Too many requests", hint: "Wait a few seconds and try again." },
  500: { title: "The service failed", hint: "Try again — if it keeps happening, contact your administrator." },
  503: { title: "The service is unavailable", hint: "Try again in a moment." },
}

/**
 * Turn anything thrown or returned into an `AppError`. Recognises plain
 * `Error`s, strings, HTTP `Response`s, OData/Dataverse error bodies and the
 * `{ error }` shape returned by generated Power Platform services.
 */
export function toAppError(value: unknown, fallback: AppErrorOptions = {}): AppError {
  if (value instanceof AppError) {
    return Object.keys(fallback.context ?? {}).length
      ? value.withContext(fallback.context!)
      : value
  }

  if (typeof Response !== "undefined" && value instanceof Response) {
    const copy = STATUS_COPY[value.status]
    return new AppError(`${value.status} ${value.statusText}`.trim(), {
      status: value.status,
      code: `http.${value.status}`,
      title: copy?.title,
      hint: copy?.hint,
      ...fallback,
    })
  }

  const odata = readODataError(value)
  if (odata) {
    return new AppError(getErrorMessage((value as ODataErrorBody).error), {
      ...odata,
      ...fallback,
      cause: value,
    })
  }

  // fetch() rejects with a bare TypeError when the network is unreachable.
  if (value instanceof TypeError) {
    return new AppError(value.message, {
      code: "network.offline",
      title: "We could not reach the service",
      hint: "Check your connection and try again.",
      retryable: true,
      ...fallback,
      cause: value,
    })
  }

  const status = (value as { status?: unknown })?.status
  const numericStatus = typeof status === "number" ? status : undefined
  const copy = numericStatus ? STATUS_COPY[numericStatus] : undefined

  return new AppError(getErrorMessage(value), {
    status: numericStatus,
    code: numericStatus ? `http.${numericStatus}` : "unknown",
    title: copy?.title,
    hint: copy?.hint,
    ...fallback,
    cause: value,
  })
}

export type ErrorReporter = (error: AppError) => void

let reporter: ErrorReporter = (error) => {
  console.error(`[${error.code}] ${error.title}: ${error.message}`, {
    ...error.context,
    cause: error.cause,
  })
}

/** Point this at Application Insights, Sentry or your own sink at startup. */
export function setErrorReporter(next: ErrorReporter) {
  reporter = next
}

/** Normalise, log and return — safe to call from anywhere, never throws. */
export function reportError(value: unknown, options: AppErrorOptions = {}): AppError {
  const error = toAppError(value, options)
  try {
    reporter(error)
  } catch {
    // A broken reporter must never take the app down with it.
  }
  return error
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: AppError }

/** `const result = await attempt(service.getAll())` — no try/catch at call sites. */
export async function attempt<T>(
  work: Promise<T> | (() => Promise<T>),
  options: AppErrorOptions = {}
): Promise<Result<T>> {
  try {
    const data = await (typeof work === "function" ? work() : work)
    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: reportError(error, options) }
  }
}

/**
 * Generated Power Platform services resolve with `{ success, data, error }`
 * rather than throwing. This folds that shape into the same `Result`.
 */
export function fromServiceResult<T>(
  result: { success?: boolean; data?: T; error?: unknown },
  options: AppErrorOptions = {}
): Result<T> {
  if (result.success === false || result.error) {
    return { ok: false, error: reportError(result.error, options) }
  }
  return { ok: true, data: result.data as T }
}

export type RetryOptions = {
  attempts?: number
  /** Base delay; each attempt backs off exponentially. */
  delayMs?: number
  signal?: AbortSignal
}

export async function withRetry<T>(
  work: () => Promise<T>,
  { attempts = 3, delayMs = 400, signal }: RetryOptions = {}
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await work()
    } catch (error) {
      lastError = error
      if (isAbortError(error) || signal?.aborted) throw error
      if (!toAppError(error).retryable || attempt === attempts - 1) throw error
      await new Promise((resolve) => setTimeout(resolve, delayMs * 2 ** attempt))
    }
  }
  throw lastError
}
