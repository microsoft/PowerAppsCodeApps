import * as React from "react"
import { PencilIcon, PlusIcon, StarIcon } from "lucide-react"
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
import { SearchInput } from "@/components/common/search-input"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { cn } from "@/lib/utils"

import {
  formatDate,
  initials,
  sources,
  stages,
  type Candidate,
} from "./data"
import { CandidateFormSheet } from "./components/candidate-form"
import { accentRings, stageStyles } from "./status"
import { useCandidates, useRoles } from "./store"

const pageSize = 8

export default function RecruitingCandidatesPage() {
  const candidates = useCandidates()
  const roles = useRoles()

  const [query, setQuery] = React.useState("")
  const { value: search, pending: searching } = useDebouncedValue(query)
  const [stage, setStage] = React.useState("All")
  const [role, setRole] = React.useState("All")
  const [source, setSource] = React.useState("All")
  const [page, setPage] = React.useState(1)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Candidate | null>(null)

  const roleById = React.useCallback(
    (id?: string) => roles.find((item) => item.id === id),
    [roles]
  )

  function openNew() {
    setEditing(null)
    setSheetOpen(true)
  }

  function openEdit(candidate: Candidate) {
    setEditing(candidate)
    setSheetOpen(true)
  }

  const filtered = candidates.filter((candidate) => {
    const roleTitle = roleById(candidate.roleId)?.title ?? ""
    const haystack =
      `${candidate.name} ${candidate.headline} ${candidate.currentEmployer} ${candidate.location} ${roleTitle} ${candidate.skills.join(" ")}`.toLowerCase()
    if (search && !haystack.includes(search.toLowerCase())) return false
    if (stage !== "All" && candidate.stage !== stage) return false
    if (role !== "All" && candidate.roleId !== role) return false
    if (source !== "All" && candidate.source !== source) return false
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
          <h2 className="text-xl font-semibold">Candidates</h2>
          <p className="text-sm text-muted-foreground">
            Everyone we are speaking to, including the people we said no to
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/recruiting/pipeline">Board view</Link>
          </Button>
          <Button size="sm" onClick={openNew}>
            <PlusIcon />
            Add candidate
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle className="text-base" aria-live="polite" aria-atomic="true">
            {filtered.length} candidates
          </CardTitle>
          <div className="flex flex-col gap-2 @2xl/main:flex-row @2xl/main:items-center">
            <SearchInput
              value={query}
              onValueChange={reset(setQuery)}
              busy={searching}
              placeholder="Search name, employer or skill"
              className="@2xl/main:max-w-xs @2xl/main:flex-1"
            />
            <div className="flex flex-wrap gap-2">
              <Select value={stage} onValueChange={reset(setStage)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All stages</SelectItem>
                  {[...stages, "Rejected"].map((entry) => (
                    <SelectItem key={entry} value={entry}>
                      {entry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={role} onValueChange={reset(setRole)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All roles</SelectItem>
                  {roles.map((entry) => (
                    <SelectItem key={entry.id} value={entry.id}>
                      {entry.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={source} onValueChange={reset(setSource)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All sources</SelectItem>
                  {sources.map((entry) => (
                    <SelectItem key={entry} value={entry}>
                      {entry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <Link
                      to={`/recruiting/candidates/${candidate.id}`}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="size-8">
                        <AvatarFallback
                          className={cn(
                            "text-[10px]",
                            accentRings[candidate.accent]
                          )}
                        >
                          {initials(candidate.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium hover:underline">
                          {candidate.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {candidate.headline}
                        </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">
                    {roleById(candidate.roleId)?.title}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={stageStyles[candidate.stage]}
                    >
                      {candidate.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {candidate.source}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(candidate.appliedOn)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1 text-sm tabular-nums">
                      <StarIcon className="size-3.5 fill-warning text-warning" />
                      {candidate.rating.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(candidate)}
                    >
                      <PencilIcon />
                      <span className="sr-only">Edit {candidate.name}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
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
          <span className="text-sm text-muted-foreground">
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

      <CandidateFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        candidate={editing}
      />
    </div>
  )
}
