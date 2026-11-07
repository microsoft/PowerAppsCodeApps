import * as React from "react"
import { SparklesIcon } from "lucide-react"
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

import {
  campaigns,
  comms,
  commStatuses,
  commTypes,
  formatCompact,
  initials,
} from "./data"
import { commStatusStyles, commTypeStyles } from "./status"

const pageSize = 8

export default function CommsListPage() {
  const [query, setQuery] = React.useState("")
  const { value: search, pending: searching } = useDebouncedValue(query)
  const [type, setType] = React.useState("All")
  const [status, setStatus] = React.useState("All")
  const [campaign, setCampaign] = React.useState("All")
  const [page, setPage] = React.useState(1)

  const filtered = comms.filter((comm) => {
    const haystack =
      `${comm.title} ${comm.id} ${comm.subject} ${comm.owner} ${comm.campaign}`.toLowerCase()
    if (search && !haystack.includes(search.toLowerCase())) return false
    if (type !== "All" && comm.type !== type) return false
    if (status !== "All" && comm.status !== status) return false
    if (campaign !== "All" && comm.campaign !== campaign) return false
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
          <h2 className="text-xl font-semibold">All communications</h2>
          <p className="text-sm text-muted-foreground">
            {comms.filter((comm) => comm.status !== "Archived").length} active of{" "}
            {comms.length} in the library
          </p>
        </div>
        <Button size="sm" asChild>
          <Link to="/comms/compose">
            <SparklesIcon />
            Compose with agent
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Library</CardTitle>
          <div className="flex flex-wrap gap-2">
            <SearchInput
              value={query}
              onValueChange={reset(setQuery)}
              busy={searching}
              placeholder="Search communications"
              className="w-56"
            />
            <Select value={type} onValueChange={reset(setType)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All types</SelectItem>
                {commTypes.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={reset(setStatus)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All statuses</SelectItem>
                {commStatuses.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={campaign} onValueChange={reset(setCampaign)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All campaigns</SelectItem>
                {campaigns.map((option) => (
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
                <TableHead>Communication</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Reach</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((comm) => (
                <TableRow key={comm.id}>
                  <TableCell className="max-w-[320px]">
                    <Link
                      to={`/comms/list/${comm.id}`}
                      className="font-medium hover:underline"
                    >
                      {comm.title}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{comm.id}</span>
                      <span>·</span>
                      <span className="truncate">{comm.campaign}</span>
                      {comm.aiGenerated && (
                        <SparklesIcon className="size-3 shrink-0 text-primary" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={commTypeStyles[comm.type]}
                    >
                      {comm.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={commStatusStyles[comm.status]}
                    >
                      {comm.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[10px]">
                          {initials(comm.owner)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{comm.owner}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {formatCompact(comm.reach)}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                    {comm.updatedOn}
                  </TableCell>
                </TableRow>
              ))}
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
