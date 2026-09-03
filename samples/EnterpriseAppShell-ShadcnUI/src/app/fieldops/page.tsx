import * as React from "react"
import { ClipboardListIcon, MapIcon } from "lucide-react"
import { Link } from "react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { DataPagination } from "@/components/common/data-pagination"
import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

import { assignments, formatSla } from "./data"
import { priorityStyles } from "./status"

const pageSize = 8

export default function FieldOpsAssignmentsPage() {
  const [query, setQuery] = React.useState("")
  const { value: search, pending: searching } = useDebouncedValue(query)
  const [priority, setPriority] = React.useState("All")
  const [page, setPage] = React.useState(1)

  const filtered = assignments.filter((assignment) => {
    if (priority !== "All" && assignment.priority !== priority) return false
    if (!search) return true
    const haystack =
      `${assignment.id} ${assignment.site} ${assignment.description} ${assignment.trade} ${assignment.location}`.toLowerCase()
    return haystack.includes(search.toLowerCase())
  })

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * pageSize
  const visible = filtered.slice(start, start + pageSize)

  function resetFilters() {
    setQuery("")
    setPriority("All")
    setPage(1)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardListIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">New Assignments</h2>
            <p className="text-sm text-muted-foreground">
              {assignments.length} work orders waiting on dispatch today
            </p>
          </div>
        </div>
        <Button size="sm" asChild>
          <Link to="/fieldops/map">
            <MapIcon />
            View on map
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle className="text-base" aria-live="polite" aria-atomic="true">
            {filtered.length} {filtered.length === 1 ? "assignment" : "assignments"}
          </CardTitle>
          <div className="flex flex-col gap-2 @2xl/main:flex-row @2xl/main:items-center">
            <SearchInput
              value={query}
              onValueChange={(value) => {
                setQuery(value)
                setPage(1)
              }}
              busy={searching}
              placeholder="Search site, fault or locality"
              className="@2xl/main:max-w-xs @2xl/main:flex-1"
            />
            <Select
              value={priority}
              onValueChange={(value) => {
                setPriority(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {visible.length === 0 ? (
            <EmptyState
              icon={ClipboardListIcon}
              title="No assignments match those filters"
              description="Try a different search term, or widen the priority filter."
              action={{ label: "Clear filters", onClick: resetFilters }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>SLA Due</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="align-top">
                      <div className="font-medium">{assignment.site}</div>
                      <div className="text-xs text-muted-foreground">
                        {assignment.id}
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge
                        variant="secondary"
                        className={priorityStyles[assignment.priority]}
                      >
                        {assignment.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-top text-sm whitespace-nowrap text-muted-foreground">
                      {formatSla(assignment.slaDue)}
                    </TableCell>
                    <TableCell className="max-w-[20rem] align-top">
                      <div className="text-sm">{assignment.description}</div>
                      <div className="mt-1 text-[10px] font-semibold tracking-wide text-primary uppercase">
                        {assignment.trade}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[14rem] align-top text-sm whitespace-normal text-muted-foreground">
                      {assignment.location}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 @2xl/main:flex-row @2xl/main:items-center @2xl/main:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filtered.length === 0 ? 0 : start + 1}–
            {start + visible.length} of {filtered.length} assignments
          </p>
          <DataPagination
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </CardFooter>
      </Card>
    </div>
  )
}
