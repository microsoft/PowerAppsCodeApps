import * as React from "react"
import { Outlet, useLocation, useNavigationType } from "react-router"

import { PageSkeleton } from "@/components/common/skeletons"
import { AppSidebar } from "./app-sidebar"
import { ErrorBoundary } from "./error-boundary"
import { SiteHeader } from "./site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function AppLayout() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  // A new screen should start at the top; going back should not feel reset.
  React.useEffect(() => {
    if (navigationType === "POP") return
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [pathname, navigationType])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          {/* A crash in one page keeps the sidebar and header alive, and clears on navigation. */}
          <ErrorBoundary resetKeys={[pathname]}>
            <React.Suspense fallback={<PageSkeleton />}>
              {/* Keyed on the route so each screen fades in rather than snapping. */}
              <div key={pathname} className="flex flex-1 flex-col animate-fade">
                <Outlet />
              </div>
            </React.Suspense>
          </ErrorBoundary>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
