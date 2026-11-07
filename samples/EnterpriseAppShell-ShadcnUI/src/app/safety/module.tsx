import * as React from "react"
import { HardHatIcon } from "lucide-react"

import type { AppModule } from "@/lib/module"

export const safetyModule: AppModule = {
  id: "safety",
  title: "Health & Safety",
  group: "apps",
  icon: <HardHatIcon />,
  routes: [
    {
      path: "safety",
      title: "Overview",
      nav: "Overview",
      element: React.lazy(() => import("./page")),
    },
    {
      path: "safety/incidents",
      title: "Incidents",
      nav: "Incidents",
      nested: true,
      element: React.lazy(() => import("./incidents-page")),
    },
    {
      path: "safety/incidents/new",
      title: "Report Incident",
      element: React.lazy(() => import("./report-incident-page")),
    },
    {
      path: "safety/incidents/:incidentId",
      title: "Incident Details",
      element: React.lazy(() => import("./incident-details-page")),
    },
    {
      path: "safety/walks",
      title: "Safety Walks",
      nav: "Safety Walks",
      nested: true,
      element: React.lazy(() => import("./walks-page")),
    },
    {
      path: "safety/walks/:walkId",
      title: "Walk Details",
      element: React.lazy(() => import("./walk-details-page")),
    },
    {
      path: "safety/risks",
      title: "Risk Analysis",
      nav: "Risk Analysis",
      element: React.lazy(() => import("./risks-page")),
    },
    {
      path: "safety/actions",
      title: "Corrective Actions",
      nav: "Corrective Actions",
      element: React.lazy(() => import("./actions-page")),
    },
  ],
}
