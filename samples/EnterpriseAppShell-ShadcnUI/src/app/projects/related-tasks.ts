import { tasks } from "@/app/tasks/data"
import { columnStyles, priorityStyles } from "@/app/tasks/status"

/**
 * The only place Projects knows Tasks exists.
 *
 * If you delete the Tasks app, delete the two imports above and return an empty
 * array from `relatedTasks` — nothing else in Projects needs to change.
 */
export type RelatedTask = {
  id: string
  title: string
  href: string
  status: string
  statusClassName: string
  assignee: string
  priority: string
  priorityClassName: string
}

export function relatedTasks(projectName: string): RelatedTask[] {
  return tasks
    .filter((task) => task.project === projectName)
    .map((task) => ({
      id: task.id,
      title: task.title,
      href: `/tasks/details/${task.id}`,
      status: task.column,
      statusClassName: columnStyles[task.column],
      assignee: task.assignee,
      priority: task.priority,
      priorityClassName: priorityStyles[task.priority],
    }))
}
