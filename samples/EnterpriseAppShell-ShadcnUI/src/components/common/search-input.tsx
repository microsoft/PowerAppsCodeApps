import * as React from "react"
import { Loader2Icon, SearchIcon, XIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SearchInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "type"
> & {
  value: string
  onValueChange: (value: string) => void
  /** Show the spinner while a debounced query is still settling. */
  busy?: boolean
  /** Focus this field when the user presses "/" anywhere on the page. */
  shortcut?: boolean
}

/**
 * The one search field for the whole app: a clear button, Escape to reset and
 * an optional "/" shortcut, so filtering never becomes a trap the user has to
 * back out of one character at a time.
 */
export function SearchInput({
  value,
  onValueChange,
  busy = false,
  shortcut = true,
  className,
  placeholder = "Search",
  ...props
}: SearchInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!shortcut) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      // Never steal the key from someone who is already typing.
      if (
        target?.isContentEditable ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        return
      }
      event.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [shortcut])

  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
        {busy ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <SearchIcon className="size-4" />
        )}
      </span>
      <Input
        ref={inputRef}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            event.preventDefault()
            onValueChange("")
          }
        }}
        className={cn(
          "pr-9 pl-9",
          // Chrome's own clear affordance would sit on top of ours.
          "[&::-webkit-search-cancel-button]:appearance-none"
        )}
        {...props}
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            onValueChange("")
            inputRef.current?.focus()
          }}
          className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <XIcon className="size-3.5" />
        </button>
      ) : shortcut ? (
        <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 font-sans text-[10px] leading-4 font-medium text-muted-foreground sm:block">
          /
        </kbd>
      ) : null}
    </div>
  )
}
