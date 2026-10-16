import * as React from "react"
import { UserSearchIcon } from "lucide-react"

import type { AppModule } from "@/lib/module"

export const recruitingModule: AppModule = {
  id: "recruiting",
  title: "Recruiting",
  group: "apps",
  icon: <UserSearchIcon />,
  routes: [
    {
      path: "recruiting",
      title: "Overview",
      nav: "Overview",
      element: React.lazy(() => import("./page")),
    },
    {
      path: "recruiting/roles",
      title: "Roles",
      nav: "Roles",
      element: React.lazy(() => import("./roles-page")),
    },
    {
      path: "recruiting/pipeline",
      title: "Pipeline",
      nav: "Pipeline",
      element: React.lazy(() => import("./pipeline-page")),
    },
    {
      path: "recruiting/candidates",
      title: "Candidates",
      nav: "Candidates",
      nested: true,
      element: React.lazy(() => import("./candidates-page")),
    },
    {
      path: "recruiting/candidates/:candidateId",
      title: "Candidate Details",
      element: React.lazy(() => import("./candidate-details-page")),
    },
    {
      path: "recruiting/interviews",
      title: "Interviews",
      nav: "Interviews",
      element: React.lazy(() => import("./interviews-page")),
    },
    {
      path: "recruiting/transcripts",
      title: "Interview Insights",
      nav: "Interview Insights",
      element: React.lazy(() => import("./transcripts-page")),
    },
  ],
}
