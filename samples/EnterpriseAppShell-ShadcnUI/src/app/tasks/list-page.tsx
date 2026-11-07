import * as React from "react"
import { ListChecksIcon, PencilIcon, PlusIcon } from "lucide-react"
import { Link } from "react-router"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { DataPagination } from "@/components/common/data-pagination"
import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { taskColumns, type Task, type TaskColumn } from "./data"
import { columnStyles, initials, priorityStyles } from "./status"
import { useTasks } from "./store"
import { TaskFormDrawer } from "./components/task-form"

const pageSize = 10

export default function TasksListPage() {
  const tasks = useTasks()
  const [query, setQuery] = React.useState("")
  const { value: search, pending: searching } = useDebouncedValue(query)
  const [column, setColumn] = React.useState<TaskColumn | "All">("All")
  const [page, setPage] = React.useState(1)
  const [editing, setEditing] = React.useState<Task | undefined>()
  const [formOpen, setFormOpen] = React.useState(false)

  function openForm(task?: Task) {
    setEditing(task)
    setFormOpen(true)
  }

  function resetFilters() {
    setQuery("")
    setColumn("All")
    setPage(1)
  }

  const filtered = tasks.filter((task) => {
    const matchesColumn = column === "All" || task.column === column
    const haystack = `${task.id} ${task.title} ${task.project} ${task.assignee}`
    return matchesColumn && haystack.toLowerCase().includes(search.toLowerCase())
  })

  // Clamp during render so shrinking the result set can never strand an empty page.
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Tasks</h2>
          <p
            className="text-sm text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {filtered.length} of {tasks.length} tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            value={query}
            onValueChange={(value) => {
              setQuery(value)
              setPage(1)
            }}
            busy={searching}
            placeholder="Search tasks"
            className="w-56"
          />
          <Select
            value={column}
            onValueChange={(value) => {
              setColumn(value as TaskColumn | "All")
              setPage(1)
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All statuses</SelectItem>
              {taskColumns.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => openForm()}>
            <PlusIcon />
            New Task
          </Button>
        </div>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={ListChecksIcon}
              title="No tasks match your filters"
              description="Try a different search term, or widen the status filter."
              action={{ label: "Clear filters", onClick: resetFilters }}
            />
          </CardContent>
        ) : (
          <>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Task</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="pr-6">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((task) => (
                    <TableRow key={task.id} className="group">
                      <TableCell className="pl-6">
                        <Link
                          to={`/tasks/details/${task.id}`}
                          className="flex flex-col hover:underline"
                        >
                          <span className="font-medium">{task.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {task.id}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {task.project}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="text-xs">
                              {initials(task.assignee)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="whitespace-nowrap">
                            {task.assignee}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={priorityStyles[task.priority]}
                        >
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2 whitespace-nowrap">
                          <span
                            className={`size-2 rounded-full ${columnStyles[task.column]}`}
                          />
                          {task.column}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="w-9 shrink-0 text-xs tabular-nums">
                            {task.progress}%
                          </span>
                          <Progress value={task.progress} className="w-20" />
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {task.dueDate}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                          aria-label={`Edit ${task.title}`}
                          onClick={() => openForm(task)}
                        >
                          <PencilIcon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {start + 1}–{start + paged.length} of {filtered.length}
              </p>
              <DataPagination
                page={currentPage}
                pageCount={pageCount}
                onPageChange={setPage}
              />
            </CardFooter>
          </>
        )}
      </Card>

      <TaskFormDrawer
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
      />
    </div>
  )
}
