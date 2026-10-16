import * as React from "react"
import { PlusIcon, ShieldAlertIcon } from "lucide-react"
import { Link } from "react-router"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

import {
  incidents,
  initials,
  severities,
  sites,
  type IncidentStatus,
} from "./data"
import {
  incidentStatusStyles,
  incidentTypeStyles,
  severityStyles,
} from "./status"

const statusFilters = [
  "All",
  "Reported",
  "Investigating",
  "Actions pending",
  "Closed",
] as const

const summaryStatuses: IncidentStatus[] = [
  "Reported",
  "Investigating",
  "Actions pending",
  "Closed",
]

const pageSize = 8

export default function SafetyIncidentsPage() {
  const [query, setQuery] = React.useState("")
  const { value: search, pending: searching } = useDebouncedValue(query)
  const [status, setStatus] = React.useState<(typeof statusFilters)[number]>("All")
  const [severity, setSeverity] = React.useState("All")
  const [site, setSite] = React.useState("All")
  const [page, setPage] = React.useState(1)

  const filtered = incidents.filter((incident) => {
    const haystack =
      `${incident.title} ${incident.id} ${incident.area} ${incident.reportedBy} ${incident.owner}`.toLowerCase()
    if (search && !haystack.includes(search.toLowerCase())) return false
    if (status !== "All" && incident.status !== status) return false
    if (severity !== "All" && incident.severity !== severity) return false
    if (site !== "All" && incident.site !== site) return false
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

  function resetFilters() {
    setQuery("")
    setStatus("All")
    setSeverity("All")
    setSite("All")
    setPage(1)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Incidents</h2>
          <p className="text-sm text-muted-foreground">
            {incidents.filter((incident) => incident.status !== "Closed").length}{" "}
            open of {incidents.length} reported
          </p>
        </div>
        <Button size="sm" asChild>
          <Link to="/safety/incidents/new">
            <PlusIcon />
            Report Incident
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Incident log</CardTitle>
          <div className="flex flex-wrap gap-2">
            <SearchInput
              value={query}
              onValueChange={reset(setQuery)}
              busy={searching}
              placeholder="Search incidents"
              className="w-56"
            />
            <Select value={site} onValueChange={reset(setSite)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All sites</SelectItem>
                {sites.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severity} onValueChange={reset(setSeverity)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All severities</SelectItem>
                {severities.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={reset(
                setStatus as (value: string) => void
              )}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusFilters.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "All" ? "All statuses" : option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        {filtered.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={ShieldAlertIcon}
              title="No incidents match these filters"
              description="Try a different search term, or widen the site, severity and status filters."
              action={{ label: "Clear filters", onClick: resetFilters }}
            />
          </CardContent>
        ) : (
          <>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Occurred</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <Link
                          to={`/safety/incidents/${incident.id}`}
                          className="font-medium hover:underline"
                        >
                          {incident.title}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {incident.id} · {incident.area}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={incidentTypeStyles[incident.type]}
                        >
                          {incident.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {incident.site}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Avatar className="size-6">
                            <AvatarFallback className="text-[10px]">
                              {initials(incident.owner)}
                            </AvatarFallback>
                          </Avatar>
                          {incident.owner}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={severityStyles[incident.severity]}
                        >
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={incidentStatusStyles[incident.status]}
                        >
                          {incident.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                        {incident.occurredOn}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span
                  className="text-sm text-muted-foreground"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  Showing {start + 1}–
                  {Math.min(start + pageSize, filtered.length)} of{" "}
                  {filtered.length}
                </span>
                <DataPagination
                  page={currentPage}
                  pageCount={pageCount}
                  onPageChange={setPage}
                />
              </div>
            </CardFooter>
          </>
        )}
      </Card>

      <div className="flex flex-wrap gap-2">
        {summaryStatuses.map((option) => (
          <Badge
            key={option}
            variant="secondary"
            className={incidentStatusStyles[option]}
          >
            {option}{" "}
            {incidents.filter((incident) => incident.status === option).length}
          </Badge>
        ))}
      </div>
    </div>
  )
}
