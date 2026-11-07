import * as React from "react"
import { BookOpenIcon } from "lucide-react"

import type { AppModule } from "@/lib/module"

export const docsModule: AppModule = {
  id: "docs",
  title: "Documentation",
  group: "secondary",
  icon: <BookOpenIcon />,
  routes: [
    {
      path: "docs",
      title: "Documentation",
      nav: "Documentation",
      element: React.lazy(() => import("./page")),
    },
  ],
}
