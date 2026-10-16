import * as React from "react"
import { ListTodoIcon } from "lucide-react"

import type { AppModule } from "@/lib/module"

export const tasksModule: AppModule = {
  id: "tasks",
  title: "Tasks",
  group: "apps",
  icon: <ListTodoIcon />,
  routes: [
    {
      path: "tasks/kanban",
      title: "Task Board",
      nav: "Kanban",
      element: React.lazy(() => import("./kanban-page")),
    },
    {
      path: "tasks/list",
      title: "Tasks",
      nav: "List View",
      element: React.lazy(() => import("./list-page")),
    },
    {
      path: "tasks/details",
      title: "Task Details",
      nav: "Task Details",
      nested: true,
      element: React.lazy(() => import("./details-page")),
    },
    {
      path: "tasks/details/:taskId",
      title: "Task Details",
      element: React.lazy(() => import("./details-page")),
    },
  ],
}
