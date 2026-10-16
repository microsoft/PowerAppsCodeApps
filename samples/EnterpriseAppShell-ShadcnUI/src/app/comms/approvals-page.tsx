import * as React from "react"
import {
  ArrowRightIcon,
  CheckIcon,
  CircleIcon,
  InboxIcon,
  MessageSquareIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "lucide-react"
import { Link } from "react-router"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { cn } from "@/lib/utils"

import { comms, formatCompact, readingMinutes, wordCount, type Comm } from "./data"
import { commStatusStyles, commTypeStyles } from "./status"

const TODAY = new Date("2026-09-02T00:00:00")

function daysUntil(date?: string) {
  if (!date) return null
  return Math.round(
    (new Date(`${date}T00:00:00`).getTime() - TODAY.getTime()) / 86_400_000
  )
}

type Level = "hot" | "warn" | "calm"

function urgency(comm: Comm): { label: string; level: Level } {
  const days = daysUntil(comm.scheduledFor ?? comm.embargoUntil)
  if (days === null) {
    const waiting = -(daysUntil(comm.updatedOn) ?? 0)
    if (waiting <= 0) return { label: "Today", level: "calm" }
    return { label: `${waiting}d waiting`, level: waiting >= 3 ? "warn" : "calm" }
  }
  if (days < 0) return { label: "Past due", level: "hot" }
  if (days === 0) return { label: "Sends today", level: "hot" }
  if (days === 1) return { label: "Sends tomorrow", level: "hot" }
  if (days <= 3) return { label: `Sends in ${days}d`, level: "warn" }
  return { label: `Sends in ${days}d`, level: "calm" }
}

const levelText: Record<Level, string> = {
  hot: "text-destructive",
  warn: "text-warning",
  calm: "text-muted-foreground",
}

const levelRank: Record<Level, number> = { hot: 0, warn: 1, calm: 2 }

const gatedTypes = [
  "Press Release",
  "Press Note",
  "Crisis Statement",
  "External Email",
]

/** Short chip labels, with the full requirement in the title attribute. */
function checksFor(comm: Comm) {
  const items = [
    { id: "messages", label: "Messaging", full: "Key messages are accurate and on-brand" },
    {
      id: "distribution",
      label: "Distribution",
      full: `Goes to the right places — ${comm.channels.join(", ")}`,
    },
  ]
  if (comm.aiGenerated) {
    items.push({
      id: "facts",
      label: "Agent figures",
      full: "Agent-drafted figures checked against the source",
    })
  }
  if (gatedTypes.includes(comm.type)) {
    items.push({
      id: "legal",
      label: "Legal sign-off",
      full: "Legal and compliance have signed off",
    })
  }
  if (comm.embargoUntil) {
    items.push({
      id: "embargo",
      label: "Embargo stated",
      full: `Embargo to ${comm.embargoUntil} is stated in the copy`,
    })
  }
  return items
}

type Decision = { outcome: "approved" | "changes"; note?: string }

function detailRows(comm: Comm) {
  const rows = [
    { label: "Audience", value: comm.audiences.join(", ") },
    { label: "Channels", value: comm.channels.join(", ") },
    { label: "Tone", value: comm.tone },
    { label: "Campaign", value: comm.campaign },
  ]
  if (comm.embargoUntil) {
    rows.push({ label: "Embargo", value: `Until ${comm.embargoUntil}` })
  }
  rows.push({
    label: "Drafted",
    value: `${
      comm.aiGenerated
        ? `Agent draft, edited by ${comm.owner}`
        : `Written by ${comm.owner}`
    } · last edited ${comm.updatedOn}`,
  })
  return rows
}

const filters = [
  { id: "decide", label: "To review" },
  { id: "approved", label: "Approved" },
  { id: "scheduled", label: "Scheduled" },
] as const

type FilterId = (typeof filters)[number]["id"]

export default function CommsApprovalsPage() {
  const [decisions, setDecisions] = React.useState<Record<string, Decision>>({})
  const [checks, setChecks] = React.useState<Record<string, string[]>>({})
  const [filter, setFilter] = React.useState<FilterId>("decide")
  const [query, setQuery] = React.useState("")
  const { value: search, pending: searching } = useDebouncedValue(query)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [noteOpen, setNoteOpen] = React.useState(false)
  const [note, setNote] = React.useState("")

  const inReview = comms.filter((comm) => comm.status === "In Review")
  const pools: Record<FilterId, Comm[]> = {
    decide: inReview,
    approved: comms.filter((comm) => comm.status === "Approved"),
    scheduled: comms.filter((comm) => comm.status === "Scheduled"),
  }

  const list = pools[filter]
    .filter((comm) =>
      search
        ? `${comm.title} ${comm.id} ${comm.owner} ${comm.campaign}`
            .toLowerCase()
            .includes(search.toLowerCase())
        : true
    )
    .sort((a, b) => {
      const rank = levelRank[urgency(a).level] - levelRank[urgency(b).level]
      return rank !== 0
        ? rank
        : (a.scheduledFor ?? a.updatedOn).localeCompare(b.scheduledFor ?? b.updatedOn)
    })

  // Derived so filtering or searching can never strand the selection.
  const activeId = list.some((comm) => comm.id === selectedId)
    ? selectedId
    : (list[0]?.id ?? null)
  const active = list.find((comm) => comm.id === activeId) ?? null

  const pending = inReview.filter((comm) => !decisions[comm.id])
  const reviewed = inReview.length - pending.length
  const decision = active ? decisions[active.id] : undefined
  const checkItems = active ? checksFor(active) : []
  const ticked = active ? (checks[active.id] ?? []) : []
  const remaining = checkItems.length - ticked.length
  const canDecide = filter === "decide" && Boolean(active) && !decision

  function resetFilters() {
    setQuery("")
    setFilter("decide")
  }

  function undo(id: string) {
    setDecisions((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function decide(comm: Comm, outcome: Decision["outcome"], text?: string) {
    setDecisions((prev) => ({ ...prev, [comm.id]: { outcome, note: text } }))
    setNoteOpen(false)
    setNote("")
    toast.success(outcome === "approved" ? "Approved" : "Returned for changes", {
      description:
        outcome === "approved" && comm.scheduledFor
          ? `${comm.title} · sends ${comm.scheduledFor}`
          : `${comm.owner} has been notified.`,
      action: { label: "Undo", onClick: () => undo(comm.id) },
    })
    const next = inReview.filter((item) => item.id !== comm.id && !decisions[item.id])
    setSelectedId(next[0]?.id ?? null)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Approvals</h2>
          <p className="text-sm text-muted-foreground">
            {pending.length === 0
              ? "Nothing is waiting on you."
              : pending.length === 1
                ? "1 communication needs your decision."
                : `${pending.length} communications need your decision.`}
          </p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link to="/comms/list">
            Open the full library
            <ArrowRightIcon />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-[320px_minmax(0,1fr)] @4xl/main:items-start">
        <div className="overflow-hidden rounded-xl border bg-card @4xl/main:sticky @4xl/main:top-4">
          <div className="flex flex-col gap-2.5 border-b p-3">
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={filter}
              onValueChange={(value) => value && setFilter(value as FilterId)}
              className="flex justify-start gap-1.5"
            >
              {filters.map((option) => (
                <ToggleGroupItem
                  key={option.id}
                  value={option.id}
                  className="rounded-md! border! px-2.5"
                >
                  {option.label}
                  <span className="ml-1.5 tabular-nums opacity-60">
                    {option.id === "decide" ? pending.length : pools[option.id].length}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <SearchInput
              value={query}
              onValueChange={setQuery}
              busy={searching}
              placeholder="Search"
              className="[&_input]:h-8"
            />
          </div>

          {list.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Nothing here.
            </p>
          ) : (
            <div className="flex flex-col">
              {list.map((comm) => {
                const state = urgency(comm)
                const settled = decisions[comm.id]
                return (
                  <button
                    key={comm.id}
                    type="button"
                    onClick={() => setSelectedId(comm.id)}
                    data-active={comm.id === activeId}
                    className="flex flex-col gap-0.5 border-b border-l-2 border-l-transparent px-4 py-2.5 text-left last:border-b-0 transition-colors hover:bg-muted/40 data-[active=true]:border-l-primary data-[active=true]:bg-muted/60"
                  >
                    <span className="flex w-full items-center gap-1.5">
                      <span
                        className={cn(
                          "truncate text-sm font-medium",
                          settled && "text-muted-foreground line-through"
                        )}
                      >
                        {comm.title}
                      </span>
                      {comm.aiGenerated && (
                        <SparklesIcon className="size-3 shrink-0 text-muted-foreground" />
                      )}
                      <span
                        className={cn(
                          "ml-auto shrink-0 text-[11px]",
                          settled ? "text-success" : levelText[state.level]
                        )}
                      >
                        {settled
                          ? settled.outcome === "approved"
                            ? "Approved"
                            : "Returned"
                          : state.label}
                      </span>
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {comm.owner} · {comm.type}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          <div className="border-t px-4 py-2 text-xs text-muted-foreground">
            {reviewed} of {inReview.length} reviewed
          </div>
        </div>

        {active ? (
          <div className="rounded-xl border bg-card">
            <div className="sticky top-0 z-10 rounded-t-xl border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
              <div className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary" className={commTypeStyles[active.type]}>
                      {active.type}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={commStatusStyles[active.status]}
                    >
                      {active.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{active.id}</span>
                  </div>
                  <h3 className="mt-1.5 text-base font-semibold">{active.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {active.owner} · {wordCount(active.body)} words,{" "}
                    {readingMinutes(active.body)} min read · reaches{" "}
                    {formatCompact(active.reach)}
                    {active.scheduledFor && ` · sends ${active.scheduledFor}`}
                  </p>
                </div>

                {decision ? (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={
                        decision.outcome === "approved"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }
                    >
                      {decision.outcome === "approved" ? "Approved" : "Returned"}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => undo(active.id)}>
                      <RotateCcwIcon />
                      Undo
                    </Button>
                  </div>
                ) : canDecide ? (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setNoteOpen(true)}
                    >
                      <MessageSquareIcon />
                      Request changes
                    </Button>
                    <Button
                      size="sm"
                      disabled={remaining > 0}
                      onClick={() => decide(active, "approved")}
                    >
                      <CheckIcon />
                      Approve
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/comms/list/${active.id}`}>Open full record</Link>
                  </Button>
                )}
              </div>

              {decision?.note && (
                <p className="border-t px-4 py-2.5 text-sm text-muted-foreground">
                  Note sent to {active.owner}: “{decision.note}”
                </p>
              )}

              {canDecide && noteOpen && (
                <div className="flex flex-col gap-2 border-t p-4">
                  <Textarea
                    autoFocus
                    rows={3}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder={`What does ${active.owner.split(" ")[0]} need to change?`}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setNoteOpen(false)
                        setNote("")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={note.trim().length < 5}
                      onClick={() => decide(active, "changes", note.trim())}
                    >
                      Send note
                    </Button>
                  </div>
                </div>
              )}

              {canDecide && !noteOpen && (
                <div className="flex flex-wrap items-center gap-2 border-t px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">
                    {remaining === 0
                      ? "All checks confirmed."
                      : `Confirm ${remaining} to approve:`}
                  </span>
                  {checkItems.map((item) => {
                    const done = ticked.includes(item.id)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        title={item.full}
                        data-done={done}
                        onClick={() =>
                          setChecks((prev) => {
                            const current = prev[active.id] ?? []
                            return {
                              ...prev,
                              [active.id]: done
                                ? current.filter((id) => id !== item.id)
                                : [...current, item.id],
                            }
                          })
                        }
                        className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-muted data-[done=true]:border-success/40 data-[done=true]:bg-success/10 data-[done=true]:text-success"
                      >
                        {done ? (
                          <CheckIcon className="size-3" />
                        ) : (
                          <CircleIcon className="size-3 opacity-40" />
                        )}
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6 p-4 md:p-6">
              <div>
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Subject line
                </span>
                <p className="mt-1 text-lg font-medium">{active.subject}</p>
              </div>

              <div className="flex max-w-prose flex-col gap-3 text-sm leading-relaxed">
                {active.body.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <div className="flex flex-col gap-2 border-t pt-5">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Key messages
                </span>
                {active.keyMessages.map((message, index) => (
                  <div key={message} className="flex gap-3 text-sm">
                    <span className="tabular-nums text-muted-foreground/60">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{message}</span>
                  </div>
                ))}
              </div>

              <dl className="flex flex-col gap-2 border-t pt-5 text-sm">
                {detailRows(active).map((row) => (
                  <div key={row.label} className="flex gap-4">
                    <dt className="w-28 shrink-0 text-muted-foreground">
                      {row.label}
                    </dt>
                    <dd className="min-w-0">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <Link
                to={`/comms/list/${active.id}`}
                className="text-sm font-medium hover:underline"
              >
                Open full record
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-6">
            <EmptyState
              icon={InboxIcon}
              title={
                filter === "decide"
                  ? "You're all caught up"
                  : "No communications match this view"
              }
              description={
                filter === "decide"
                  ? "Every communication waiting on you has a decision. New submissions land here automatically."
                  : "Try a different search term, or switch back to the review queue."
              }
              action={{ label: "Clear filters", onClick: resetFilters }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
