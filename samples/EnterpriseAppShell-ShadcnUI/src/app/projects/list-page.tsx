import * as React from "react"
import { FolderKanbanIcon, PlusIcon } from "lucide-react"
import { Link } from "react-router"

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
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

import { projectSlug, type ProjectStatus } from "./data"
import { initials, projectStatusStyles } from "./status"
import { useProjects } from "./store"

const statusFilters = ["All", "In Progress", "Pending", "Completed"] as const
const pageSize = 8

export default function ProjectsListPage() {
  const allProjects = useProjects()
  const [query, setQuery] = React.useState("")
  const { value: search, pending: searching } = useDebouncedValue(query)
  const [status, setStatus] =
    React.useState<(typeof statusFilters)[number]>("All")
  const [page, setPage] = React.useState(1)

  const filtered = allProjects.filter((project) => {
    const matchesStatus = status === "All" || project.status === status
    const haystack = `${project.name} ${project.lead} ${project.client ?? ""}`
    return matchesStatus && haystack.toLowerCase().includes(search.toLowerCase())
  })

  // Clamp during render so shrinking the result set can never strand an empty page.
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  function resetFilters() {
    setQuery("")
    setStatus("All")
    setPage(1)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">All Projects</h2>
          <p
            className="text-sm text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {filtered.length} of {allProjects.length} projects
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
            placeholder="Search projects"
            className="w-56"
          />
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as (typeof statusFilters)[number])
              setPage(1)
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusFilters.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild size="sm">
            <Link to="/projects/create">
              <PlusIcon />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={FolderKanbanIcon}
              title="No projects found"
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
                    <TableHead className="pl-6">Project Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Project Lead</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6">Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="pl-6 font-medium">
                        <Link
                          to={`/projects/details/${projectSlug(project)}`}
                          className="hover:underline"
                        >
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {project.client ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="text-xs">
                              {initials(project.lead)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="whitespace-nowrap">{project.lead}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="w-9 shrink-0 text-xs tabular-nums">
                            {project.progress}%
                          </span>
                          <Progress value={project.progress} className="w-20" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <AvatarGroup>
                          {project.assignees.map((assignee) => (
                            <Avatar key={assignee} className="size-6">
                              <AvatarFallback className="text-xs">
                                {initials(assignee)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </AvatarGroup>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {project.budget ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={projectStatusStyles[project.status]}
                        >
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 whitespace-nowrap text-muted-foreground">
                        {project.dueDate}
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

      <div className="flex flex-wrap gap-2">
        {(["In Progress", "Pending", "Completed"] as ProjectStatus[]).map(
          (item) => (
            <Badge
              key={item}
              variant="secondary"
              className={projectStatusStyles[item]}
            >
              {item}: {allProjects.filter((p) => p.status === item).length}
            </Badge>
          )
        )}
      </div>
    </div>
  )
}
