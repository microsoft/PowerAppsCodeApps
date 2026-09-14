import { MODULES } from "@/app/modules"

export type Route = {
  path: string
  title: string
  section: string
}

// Derived from the module registry, so a page only declares its title once.
// `:params` are stripped so /crm/contacts/:id and /crm/contacts share an entry;
// when two routes collapse to the same path the first one declared wins.
export const ROUTES: Route[] = (() => {
  const seen = new Set<string>()
  const routes: Route[] = []

  for (const module of MODULES) {
    for (const route of module.routes) {
      const path =
        "/" +
        route.path
          .split("/")
          .filter((segment) => !segment.startsWith(":"))
          .join("/")

      if (seen.has(path)) continue
      seen.add(path)
      routes.push({ path, title: route.title, section: module.title })
    }
  }

  return routes
})()


export const NOT_FOUND_ROUTE: Route = {
  path: "*",
  title: "Page Not Found",
  section: "Error",
}

// Nested paths (e.g. /team/jenny-klabber) resolve to their closest parent route.
// Anything that matches nothing is a 404 rather than a silent fallback to the
// dashboard, so a typo in the hash is visible instead of misleading.
export function resolveRoute(pathname: string): Route {
  if (pathname === "/") return ROUTES[0]

  const matches = ROUTES.filter(
    (route) => route.path !== "/" && pathname.startsWith(route.path)
  )
  return matches.sort((a, b) => b.path.length - a.path.length)[0] ?? NOT_FOUND_ROUTE
}
