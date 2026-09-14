import * as React from "react"
import { BriefcaseBusinessIcon } from "lucide-react"

import type { AppModule } from "@/lib/module"

export const crmModule: AppModule = {
  id: "crm",
  title: "CRM",
  group: "apps",
  icon: <BriefcaseBusinessIcon />,
  routes: [
    {
      path: "crm",
      title: "Overview",
      nav: "Overview",
      element: React.lazy(() => import("./page")),
    },
    {
      path: "crm/contacts",
      title: "Contacts",
      nav: "Contacts",
      nested: true,
      element: React.lazy(() => import("./contacts-page")),
    },
    {
      path: "crm/contacts/:contactId",
      title: "Contact Details",
      element: React.lazy(() => import("./contact-details-page")),
    },
    {
      path: "crm/companies",
      title: "Companies",
      nav: "Companies",
      nested: true,
      element: React.lazy(() => import("./companies-page")),
    },
    {
      path: "crm/companies/:companyId",
      title: "Company Details",
      element: React.lazy(() => import("./company-details-page")),
    },
    {
      path: "crm/pipeline",
      title: "Pipeline",
      nav: "Pipeline",
      element: React.lazy(() => import("./pipeline-page")),
    },
    {
      path: "crm/leads",
      title: "Leads",
      nav: "Leads",
      element: React.lazy(() => import("./leads-page")),
    },
    {
      path: "crm/activities",
      title: "Activities",
      nav: "Activities",
      element: React.lazy(() => import("./activities-page")),
    },
  ],
}
