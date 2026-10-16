import * as React from "react"
import {
  CheckIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { cn } from "@/lib/utils"

import type { Lead, LeadStatus } from "./data"
import { LeadFormSheet } from "./components/lead-form"
import { initials, leadStatusStyles, scoreStyle } from "./status"
import { saveLead, useLeads } from "./store"

const tabs = ["All", "New", "Contacted", "Qualified", "Unqualified"] as const

export default function CrmLeadsPage() {
  const items = useLeads()
  const [tab, setTab] = React.useState<(typeof tabs)[number]>("All")
  const [query, setQuery] = React.useState("")
  const { value: search, pending: searching } = useDebouncedValue(query)
  const [selectedId, setSelectedId] = React.useState(items[0]?.id ?? "")
  const [editing, setEditing] = React.useState<Lead | undefined>(undefined)
  const [formOpen, setFormOpen] = React.useState(false)

  const filtered = items.filter((lead) => {
    const matchesTab = tab === "All" || lead.status === tab
    const haystack = `${lead.name} ${lead.company} ${lead.email} ${lead.owner}`
    return matchesTab && haystack.toLowerCase().includes(search.toLowerCase())
  })

  const selected = items.find((lead) => lead.id === selectedId) ?? filtered[0]

  function openCreate() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function openEdit(lead: Lead) {
    setEditing(lead)
    setFormOpen(true)
  }

  function resetFilters() {
    setQuery("")
    setTab("All")
  }

  function setStatus(lead: Lead, status: LeadStatus, message: string) {
    saveLead({ ...lead, status })
    toast.success(message)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Leads</h2>
          <p className="text-sm text-muted-foreground">
            {items.filter((lead) => lead.status === "New").length} new leads
            waiting to be worked
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            value={query}
            onValueChange={setQuery}
            busy={searching}
            placeholder="Search leads"
            className="w-56"
          />
          <Button size="sm" onClick={openCreate}>
            <PlusIcon />
            New Lead
          </Button>
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as (typeof tabs)[number])}
      >
        <TabsList>
          {tabs.map((item) => (
            <TabsTrigger key={item} value={item}>
              {item}
              <Badge variant="secondary">
                {item === "All"
                  ? items.length
                  : items.filter((lead) => lead.status === item).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-4 @4xl/main:grid-cols-[minmax(0,1fr)_320px]">
        <div
          className={cn("flex flex-col gap-3", filtered.length > 0 && "stagger")}
        >
          {filtered.map((lead, index) => (
            <button
              key={lead.id}
              type="button"
              onClick={() => setSelectedId(lead.id)}
              style={{ "--i": index } as React.CSSProperties}
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:border-primary/40",
                selected?.id === lead.id && "border-primary ring-2 ring-primary/20"
              )}
            >
              <Avatar className="size-9">
                <AvatarFallback className="text-xs">
                  {initials(lead.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{lead.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {lead.company} · {lead.source} · {lead.createdAt}
                </span>
              </div>
              <Badge variant="secondary" className={scoreStyle(lead.score)}>
                {lead.score}
              </Badge>
              <Badge variant="secondary" className={leadStatusStyles[lead.status]}>
                {lead.status}
              </Badge>
            </button>
          ))}

          {filtered.length === 0 && (
            <Card>
              <CardContent>
                <EmptyState
                  icon={UserPlusIcon}
                  title="No leads match your filters"
                  description="Try a different search term, or switch back to the All tab."
                  action={{ label: "Clear filters", onClick: resetFilters }}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {selected && (
          <Card className="h-fit @4xl/main:sticky @4xl/main:top-4">
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarFallback>{initials(selected.name)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold">{selected.name}</span>
                  <span className="truncate text-sm text-muted-foreground">
                    {selected.company}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Lead score</span>
                  <span className="font-medium tabular-nums">
                    {selected.score}/100
                  </span>
                </div>
                <Progress value={selected.score} />
              </div>

              <Separator />

              <div className="flex flex-col gap-2 text-sm">
                <Row label="Status">
                  <Badge
                    variant="secondary"
                    className={leadStatusStyles[selected.status]}
                  >
                    {selected.status}
                  </Badge>
                </Row>
                <Row label="Source">{selected.source}</Row>
                <Row label="Owner">{selected.owner}</Row>
                <Row label="Created">{selected.createdAt}</Row>
                <Row label="Email">
                  <span className="truncate">{selected.email}</span>
                </Row>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="col-span-2"
                  onClick={() => openEdit(selected)}
                >
                  <PencilIcon />
                  Edit lead
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setStatus(
                      selected,
                      "Contacted",
                      `Call logged for ${selected.name}`
                    )
                  }
                >
                  <PhoneIcon />
                  Log call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setStatus(
                      selected,
                      "Contacted",
                      `Email sent to ${selected.name}`
                    )
                  }
                >
                  <MailIcon />
                  Email
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    setStatus(
                      selected,
                      "Qualified",
                      `${selected.name} qualified`
                    )
                  }
                >
                  <CheckIcon />
                  Qualify
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setStatus(
                      selected,
                      "Unqualified",
                      `${selected.name} marked unqualified`
                    )
                  }
                >
                  <XIcon />
                  Disqualify
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <LeadFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        lead={editing}
        onSaved={(lead) => setSelectedId(lead.id)}
      />
    </div>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right font-medium">{children}</span>
    </div>
  )
}
