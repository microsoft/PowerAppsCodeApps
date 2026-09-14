import * as React from "react"
import {
  ArrowRightIcon,
  ClipboardCheckIcon,
  MapPinIcon,
  PlusIcon,
  RouteIcon,
  ShieldIcon,
} from "lucide-react"
import { Link } from "react-router"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
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
import { DataPagination } from "@/components/common/data-pagination"
import { EmptyState } from "@/components/common/empty-state"

import { initials, safetyWalks, sites, walkScore } from "./data"
import { severityStyles, walkScoreStyle, walkStatusStyles } from "./status"

const statusFilters = ["All", "Scheduled", "In progress", "Completed"] as const

const pageSize = 6

export default function SafetyWalksPage() {
  const [status, setStatus] = React.useState<(typeof statusFilters)[number]>("All")
  const [site, setSite] = React.useState("All")
  const [page, setPage] = React.useState(1)

  const filtered = safetyWalks.filter((walk) => {
    if (status !== "All" && walk.status !== status) return false
    if (site !== "All" && walk.site !== site) return false
    return true
  })

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * pageSize
  const visible = filtered.slice(start, start + pageSize)

  function resetFilters() {
    setStatus("All")
    setSite("All")
    setPage(1)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Safety Walks</h2>
          <p className="text-sm text-muted-foreground">
            {safetyWalks.filter((walk) => walk.status !== "Completed").length}{" "}
            upcoming ·{" "}
            {safetyWalks.reduce((sum, walk) => sum + walk.findings.length, 0)}{" "}
            findings logged
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={site}
            onValueChange={(value) => {
              setSite(value)
              setPage(1)
            }}
          >
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
              {statusFilters.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === "All" ? "All statuses" : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm">
            <PlusIcon />
            Schedule Walk
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={ShieldIcon}
              title="No safety walks scheduled here"
              description="Try another site, or widen the status filter to see every walk."
              action={{ label: "Clear filters", onClick: resetFilters }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 @2xl/main:grid-cols-2 @5xl/main:grid-cols-3">
          {visible.map((walk) => {
            const score = walkScore(walk)
            const scored = walk.checklist.filter((item) => item.result !== "N/A")
            const worst = walk.findings.reduce<string | null>((acc, finding) => {
              const order = ["Low", "Medium", "High", "Critical"]
              if (!acc) return finding.severity
              return order.indexOf(finding.severity) > order.indexOf(acc)
                ? finding.severity
                : acc
            }, null)

            return (
              <Card key={walk.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-base">
                    <Link
                      to={`/safety/walks/${walk.id}`}
                      className="hover:underline"
                    >
                      {walk.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPinIcon className="size-3.5" />
                    {walk.site}
                  </CardDescription>
                  <CardAction>
                    <Badge
                      variant="secondary"
                      className={walkStatusStyles[walk.status]}
                    >
                      {walk.status}
                    </Badge>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <RouteIcon className="mt-0.5 size-3.5 shrink-0" />
                    <span className="line-clamp-2">{walk.route}</span>
                  </p>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Checklist compliance
                      </span>
                      <span className="tabular-nums">
                        {scored.length ? `${score}%` : "Not started"}
                      </span>
                    </div>
                    <Progress value={score} className="h-1.5" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t pt-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Scheduled</p>
                      <p className="text-sm font-medium tabular-nums">
                        {walk.scheduledFor}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Findings</p>
                      <p className="flex items-center gap-2 text-sm font-medium">
                        {walk.findings.length}
                        {worst && (
                          <Badge
                            variant="secondary"
                            className={
                              severityStyles[worst as keyof typeof severityStyles]
                            }
                          >
                            {worst}
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[10px]">
                        {initials(walk.leader)}
                      </AvatarFallback>
                    </Avatar>
                    {scored.length > 0 && (
                      <Badge variant="secondary" className={walkScoreStyle(score)}>
                        {score}%
                      </Badge>
                    )}
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/safety/walks/${walk.id}`}>
                      <ClipboardCheckIcon />
                      Open walk
                      <ArrowRightIcon />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span
            className="text-sm text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            Showing {start + 1}–{Math.min(start + pageSize, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <DataPagination
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
