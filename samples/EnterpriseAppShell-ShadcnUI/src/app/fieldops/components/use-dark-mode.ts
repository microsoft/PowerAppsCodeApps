import * as React from "react"

// The theme provider toggles a `dark` class on <html>, which also covers the
// "system" setting without duplicating the media-query logic here.
function subscribe(listener: () => void) {
  const observer = new MutationObserver(listener)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  })
  return () => observer.disconnect()
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark")
}

export function useDarkMode() {
  return React.useSyncExternalStore(subscribe, getSnapshot, () => false)
}
