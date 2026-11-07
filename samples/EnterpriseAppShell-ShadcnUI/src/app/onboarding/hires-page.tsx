import * as React from "react"
import { Link } from "react-router"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { DataPagination } from "@/components/common/data-pagination"
import { SearchInput } from "@/components/common/search-input"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

import {
  dayNumber,
  formatDate,
  hires,
  hireStatuses,
  initials,
  progressFor,
  requiredOutstanding,
} from "./data"
import { hireStatusStyles } from "./status"

const pageSize = 8

const departments = [...new Set(hires.map((hire) => hire.department))].sort()

export default function OnboardingHiresPage() {
  const [query, setQuery] = React.useState("")
  const { value: search, pending: searching } = useDebouncedValue(query)
  const [status, setStatus] = React.useState("All")
  const [department, setDepartment] = React.useState("All")
  const [page, setPage] = React.useState(1)

  const filtered = hires.filter((hire) => {
    const haystack =
      `${hire.name} ${hire.role} ${hire.department} ${hire.manager} ${hire.location}`.toLowerCase()
    if (search && !haystack.includes(search.toLowerCase())) return false
    if (status !== "All" && hire.status !== status) return false
    if (department !== "All" && hire.department !== department) return false
    return true
  })

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * pageSize
  const visible = filtered.slice(start, start + pageSize)

  function reset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value)
      setPage(1)
    }
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">New hires</h2>
          <p className="text-sm text-muted-foreground">
            {hires.filter((hire) => hire.status !== "Complete").length} active
            journeys of {hires.length} in the last quarter
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Cohort</CardTitle>
          <div className="flex flex-wrap gap-2">
            <SearchInput
              value={query}
              onValueChange={reset(setQuery)}
              busy={searching}
              placeholder="Search hires"
              className="w-56"
            />
            <Select value={status} onValueChange={reset(setStatus)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All statuses</SelectItem>
                {hireStatuses.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={department} onValueChange={reset(setDepartment)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All departments</SelectItem>
                {departments.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hire</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start date</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Required left</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((hire) => {
                const progress = progressFor(hire)
                const outstanding = requiredOutstanding(hire).length
                const day = dayNumber(hire.startDate)
                return (
                  <TableRow key={hire.id}>
                    <TableCell className="max-w-[280px]">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-[10px]">
                            {initials(hire.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <Link
                            to={`/onboarding/hires/${hire.id}`}
                            className="font-medium hover:underline"
                          >
                            {hire.name}
                          </Link>
                          <p className="truncate text-xs text-muted-foreground">
                            {hire.role} · {hire.location}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={hireStatusStyles[hire.status]}
                      >
                        {hire.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{formatDate(hire.startDate)}</div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {day < 0 ? `in ${Math.abs(day)} days` : `day ${day + 1}`}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{hire.manager}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={progress.percent}
                          className="h-1.5 w-20"
                        />
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {progress.done}/{progress.total}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {outstanding === 0 ? (
                        <span className="text-success">Clear</span>
                      ) : (
                        <span
                          className={
                            hire.status === "At risk"
                              ? "font-medium text-destructive"
                              : undefined
                          }
                        >
                          {outstanding}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Nothing matches those filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex-col gap-3 border-t sm:flex-row sm:items-center sm:justify-between">
          <span
            className="text-sm text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {filtered.length === 0
              ? "No results"
              : `Showing ${start + 1}–${Math.min(start + pageSize, filtered.length)} of ${filtered.length}`}
          </span>
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
