import type * as React from "react"

/**
 * A single page inside a module.
 *
 * `path` is relative to the app root and has no leading slash — an empty string
 * marks the index route. `title` drives the header + breadcrumb. Add `nav` to
 * surface the route in the sidebar; omit it for detail/child pages.
 */
export type AppRoute = {
  path: string
  title: string
  element: React.ComponentType
  /** Sidebar label. Omit to keep the route out of the sidebar. */
  nav?: string
  /** Keep the sidebar entry highlighted while on child routes. */
  nested?: boolean
}

/**
 * One self-contained app. Everything the shell needs to know about a module —
 * its routes, its sidebar entry, its breadcrumbs — lives in its `module.tsx`,
 * so removing the app is: delete the folder, delete one line in `modules.tsx`.
 */
export type AppModule = {
  id: string
  /** Sidebar group label and breadcrumb section. */
  title: string
  /**
   * `main` renders as flat top-level links, `apps` as a collapsible group,
   * `secondary` as the muted footer group.
   */
  group: "main" | "apps" | "secondary"
  icon?: React.ReactNode
  routes: AppRoute[]
}
