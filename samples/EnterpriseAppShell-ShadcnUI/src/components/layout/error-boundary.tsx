import * as React from "react"
import { RefreshCwIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { reportError, toAppError, type AppError } from "@/lib/errors"

export function ErrorState({
  error,
  onRetry,
  className,
}: {
  error: AppError
  onRetry?: () => void
  className?: string
}) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
          <TriangleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>{error.title}</EmptyTitle>
        <EmptyDescription>{error.hint ?? error.message}</EmptyDescription>
      </EmptyHeader>
      {onRetry && (
        <EmptyContent>
          <Button variant="outline" onClick={onRetry}>
            <RefreshCwIcon />
            Try again
          </Button>
        </EmptyContent>
      )}
      <p className="text-xs text-muted-foreground tabular-nums">{error.code}</p>
    </Empty>
  )
}

type Props = {
  children: React.ReactNode
  /** Rendered instead of the default card. Receives a reset callback. */
  fallback?: (error: AppError, reset: () => void) => React.ReactNode
  /** Changing any value here clears the error — pass the route path to recover on navigation. */
  resetKeys?: unknown[]
  onError?: (error: AppError) => void
}

type State = { error: AppError | null }

/**
 * Catches render-time crashes so one broken page cannot take down the shell.
 * Everything it needs is in `@/lib/errors`, so it ports to another app as-is.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: unknown): State {
    return { error: toAppError(error, { code: "render.crash", title: "This page stopped working" }) }
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    const reported = reportError(error, {
      code: "render.crash",
      title: "This page stopped working",
      hint: "Try again, or move to another page and come back.",
      context: { componentStack: info.componentStack },
    })
    this.props.onError?.(reported)
  }

  componentDidUpdate(previous: Props) {
    if (!this.state.error) return
    const keys = this.props.resetKeys ?? []
    const previousKeys = previous.resetKeys ?? []
    if (keys.length !== previousKeys.length || keys.some((key, i) => key !== previousKeys[i])) {
      this.reset()
    }
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    if (this.props.fallback) return this.props.fallback(error, this.reset)
    return (
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <ErrorState error={error} onRetry={this.reset} />
      </div>
    )
  }
}
