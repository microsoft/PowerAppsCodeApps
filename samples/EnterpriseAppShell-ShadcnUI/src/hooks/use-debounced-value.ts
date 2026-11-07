import * as React from "react"

/**
 * Trails `value` by `delay` so keystroke-driven work (filtering, and later the
 * Dataverse round trip) runs once the user pauses instead of on every letter.
 * `pending` is true while the two are out of step, which is the cue a screen
 * needs to show a spinner without inventing its own state.
 */
export function useDebouncedValue<T>(value: T, delay = 200) {
  const [settled, setSettled] = React.useState(value)

  React.useEffect(() => {
    if (Object.is(settled, value)) return
    const timer = window.setTimeout(() => setSettled(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay, settled])

  return { value: settled, pending: !Object.is(settled, value) }
}
