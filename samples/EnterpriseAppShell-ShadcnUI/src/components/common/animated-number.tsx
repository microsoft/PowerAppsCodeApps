import * as React from "react"

type AnimatedNumberProps = {
  value: number
  /** Receives the interpolated value; return the string to paint. */
  format?: (value: number) => string
  durationMs?: number
  className?: string
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Counts a metric up to its value on mount and on every change, so a figure
 * that moves reads as *having moved* rather than silently swapping.
 *
 * Falls back to the plain value whenever animating would be wrong or unsafe:
 * reduced-motion users, and hidden tabs where requestAnimationFrame never
 * fires and the number would otherwise be stranded at zero.
 */
export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString(),
  durationMs = 700,
  className,
}: AnimatedNumberProps) {
  const animatable =
    typeof window !== "undefined" &&
    document.visibilityState === "visible" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const [display, setDisplay] = React.useState(animatable ? 0 : value)
  const from = React.useRef(animatable ? 0 : value)

  React.useEffect(() => {
    if (!animatable) {
      return
    }
    const start = performance.now()
    const origin = from.current
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / durationMs)
      setDisplay(origin + (value - origin) * easeOut(t))
      if (t < 1) frame = requestAnimationFrame(tick)
      else from.current = value
    })
    return () => {
      cancelAnimationFrame(frame)
      from.current = value
    }
  }, [value, durationMs, animatable])

  return (
    <span className={className} aria-label={format(value)}>
      <span aria-hidden>{format(display)}</span>
    </span>
  )
}
