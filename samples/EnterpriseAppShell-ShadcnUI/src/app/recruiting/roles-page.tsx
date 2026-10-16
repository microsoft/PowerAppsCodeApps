import * as React from "react"
import {
  BriefcaseIcon,
  MoreHorizontalIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react"
import { Link } from "react-router"

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DataPagination } from "@/components/common/data-pagination"
import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { cn } from "@/lib/utils"

import { daysOpen, formatDate, stages, type Role } from "./data"
import { CandidateFormSheet } from "./components/candidate-form"
import { RoleFormSheet } from "./components/role-form"
import { priorityStyles, roleStatusStyles, stageDots } from "./status"
import { useCandidates, useRoles } from "./store"

const pageSize = 8
const filters = ["All", "Open", "On hold", "Closed"] as const
type Filter = (typeof filters)[number]

export default function RecruitingRolesPage() {
  const roles = useRoles()
  const candidates = useCandidates()

  const [filter, setFilter] = React.useState<Filter>("Open")
  const [query, setQuery] = React.useState("")
  const { value: search, pending: searching } = useDebouncedValue(query)
  const [department, setDepartment] = React.useState("All")
  const [page, setPage] = React.useState(1)

  const [roleSheet, setRoleSheet] = React.useState(false)
  const [editing, setEditing] = React.useState<Role | null>(null)
  const [candidateSheet, setCandidateSheet] = React.useState(false)
  const [candidateRoleId, setCandidateRoleId] = React.useState<string>()

  const departments = React.useMemo(
    () => [...new Set(roles.map((role) => role.department))].sort(),
    [roles]
  )

  const stats = React.useCallback(
    (roleId: string) => {
      const mine = candidates.filter((item) => item.roleId === roleId)
      return {
        active: mine.filter(
          (item) => item.stage !== "Rejected" && item.stage !== "Hired"
        ),
        hired: mine.filter((item) => item.stage === "Hired").length,
        offers: mine.filter((item) => item.stage === "Offer").length,
      }
    },
    [candidates]
  )

  const counts = React.useMemo(() => {
    const base: Record<Filter, number> = {
      All: roles.length,
      Open: 0,
      "On hold": 0,
      Closed: 0,
    }
    for (const role of roles) base[role.status] += 1
    return base
  }, [roles])

  const filtered = roles.filter((role) => {
    if (filter !== "All" && role.status !== filter) return false
    if (department !== "All" && role.department !== department) return false
    if (search) {
      const haystack =
        `${role.id} ${role.title} ${role.department} ${role.location} ${role.hiringManager} ${role.recruiter}`.toLowerCase()
      if (!haystack.includes(search.toLowerCase())) return false
    }
    return true
  })

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    (currentPage - 1) * pageSize + pageSize
  )

  const openRoles = roles.filter((role) => role.status === "Open")
  const positions = openRoles.reduce(
    (total, role) => total + Math.max(0, role.openings - stats(role.id).hired),
    0
  )
  const inPlay = candidates.filter(
    (item) => item.stage !== "Rejected" && item.stage !== "Hired"
  ).length
  const oldest = openRoles.reduce(
    (max, role) => Math.max(max, daysOpen(role.opened)),
    0
  )

  function openNew() {
    setEditing(null)
    setRoleSheet(true)
  }

  function openEdit(role: Role) {
    setEditing(role)
    setRoleSheet(true)
  }

  function addCandidate(roleId: string) {
    setCandidateRoleId(roleId)
    setCandidateSheet(true)
  }

  function change<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value)
      setPage(1)
    }
  }

  function resetFilters() {
    setQuery("")
    setFilter("All")
    setDepartment("All")
    setPage(1)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Roles</h2>
          <p className="text-sm text-muted-foreground">
            {openRoles.length} open {openRoles.length === 1 ? "role" : "roles"} ·{" "}
            {positions} {positions === 1 ? "position" : "positions"} still to fill
          </p>
        </div>
        <Button size="sm" onClick={openNew}>
          <PlusIcon />
          New role
        </Button>
      </div>

      <div className="grid gap-4 @2xl/main:grid-cols-4">
        <Stat label="Open roles" value={openRoles.length} hint="Actively hiring" />
        <Stat
          label="Positions to fill"
          value={positions}
          hint="Headcount still unfilled"
        />
        <Stat label="Candidates in play" value={inPlay} hint="Not hired or rejected" />
        <Stat
          label="Longest open"
          value={`${oldest}d`}
          hint="Oldest live requisition"
          warn={oldest > 90}
        />
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 @3xl/main:flex-row @3xl/main:items-center @3xl/main:justify-between">
            <CardTitle
              className="text-base"
              aria-live="polite"
              aria-atomic="true"
            >
              {filtered.length} {filtered.length === 1 ? "role" : "roles"}
            </CardTitle>
            <ToggleGroup
              type="single"
              size="sm"
              variant="outline"
              value={filter}
              onValueChange={(value) => {
                if (value) change(setFilter)(value as Filter)
              }}
            >
              {filters.map((item) => (
                <ToggleGroupItem key={item} value={item} className="px-3">
                  {item}
                  <span className="ml-1.5 text-muted-foreground tabular-nums">
                    {counts[item]}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-2 @2xl/main:flex-row @2xl/main:items-center">
            <SearchInput
              value={query}
              onValueChange={change(setQuery)}
              busy={searching}
              placeholder="Search title, manager or location"
              className="@2xl/main:max-w-xs @2xl/main:flex-1"
            />
            <Select value={department} onValueChange={change(setDepartment)}>
              <SelectTrigger className="@2xl/main:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All departments</SelectItem>
                {departments.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          {visible.length === 0 ? (
            <EmptyState
              icon={BriefcaseIcon}
              title="No roles match your filters"
              description="Try a different search term, or widen the status and department filters."
              action={{ label: "Clear filters", onClick: resetFilters }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[168px]">Openings</TableHead>
                  <TableHead className="w-[160px]">Pipeline</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                  <TableHead>Hiring manager</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((role) => {
                  const { active, hired, offers } = stats(role.id)
                  const filled = Math.min(hired, role.openings)
                  const age = daysOpen(role.opened)
                  return (
                    <TableRow key={role.id}>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => openEdit(role)}
                          className="text-left font-medium hover:underline"
                        >
                          {role.title}
                        </button>
                        <p className="text-xs text-muted-foreground">
                          {role.department} · {role.location} · {role.level}
                        </p>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          <Badge
                            variant="secondary"
                            className={roleStatusStyles[role.status]}
                          >
                            {role.status}
                          </Badge>
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[11px] font-medium",
                              priorityStyles[role.priority]
                            )}
                          >
                            {role.priority}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm tabular-nums">
                            {filled}/{role.openings}
                          </span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-success transition-[width]"
                              style={{
                                width: `${(filled / role.openings) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {offers > 0
                            ? `${offers} at offer`
                            : filled === role.openings
                              ? "Fully staffed"
                              : `${role.openings - filled} to go`}
                        </p>
                      </TableCell>

                      <TableCell>
                        <PipelineBar roleId={role.id} count={active.length} />
                      </TableCell>

                      <TableCell className="text-right">
                        <span
                          className={cn(
                            "text-sm tabular-nums",
                            age > 90 && role.status === "Open"
                              ? "text-destructive"
                              : ""
                          )}
                        >
                          {age}d
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(role.opened)}
                        </p>
                      </TableCell>

                      <TableCell>
                        <p className="text-sm">{role.hiringManager}</p>
                        <p className="text-xs text-muted-foreground">
                          {role.recruiter}
                        </p>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontalIcon />
                              <span className="sr-only">
                                Actions for {role.title}
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => openEdit(role)}>
                              <BriefcaseIcon />
                              Edit role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => addCandidate(role.id)}
                            >
                              <UsersIcon />
                              Add candidate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link to="/recruiting/pipeline">
                                View on the board
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {pageCount > 1 && (
          <CardFooter>
            <DataPagination
              page={currentPage}
              pageCount={pageCount}
              onPageChange={setPage}
            />
          </CardFooter>
        )}
      </Card>

      <RoleFormSheet
        open={roleSheet}
        onOpenChange={setRoleSheet}
        role={editing}
      />
      <CandidateFormSheet
        open={candidateSheet}
        onOpenChange={setCandidateSheet}
        candidate={null}
        defaultRoleId={candidateRoleId}
      />
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
  warn,
}: {
  label: string
  value: React.ReactNode
  hint: string
  warn?: boolean
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          warn && "text-destructive"
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

function PipelineBar({ roleId, count }: { roleId: string; count: number }) {
  const candidates = useCandidates()
  const live = stages.filter((stage) => stage !== "Hired")

  if (count === 0) {
    return <span className="text-xs text-muted-foreground">No candidates</span>
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm tabular-nums">{count} in play</span>
      <div className="flex gap-0.5">
        {live.map((stage) => {
          const n = candidates.filter(
            (item) => item.roleId === roleId && item.stage === stage
          ).length
          return (
            <Tooltip key={stage}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "h-1.5 flex-1 rounded-full",
                    n > 0 ? stageDots[stage] : "bg-muted"
                  )}
                />
              </TooltipTrigger>
              <TooltipContent>
                {n} in {stage}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </div>
  )
}
