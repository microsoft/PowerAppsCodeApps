import * as React from "react"
import { GraduationCapIcon } from "lucide-react"

import type { AppModule } from "@/lib/module"

export const onboardingModule: AppModule = {
  id: "onboarding",
  title: "Onboarding",
  group: "apps",
  icon: <GraduationCapIcon />,
  routes: [
    {
      path: "onboarding",
      title: "Overview",
      nav: "Overview",
      element: React.lazy(() => import("./page")),
    },
    {
      path: "onboarding/journey",
      title: "My Journey",
      nav: "My Journey",
      element: React.lazy(() => import("./journey-page")),
    },
    {
      path: "onboarding/hires",
      title: "New Hires",
      nav: "New Hires",
      nested: true,
      element: React.lazy(() => import("./hires-page")),
    },
    {
      path: "onboarding/hires/:hireId",
      title: "Hire Details",
      element: React.lazy(() => import("./hire-details-page")),
    },
    {
      path: "onboarding/learning",
      title: "Learning Library",
      nav: "Learning Library",
      element: React.lazy(() => import("./learning-page")),
    },
  ],
}
