import * as React from "react"
import { format, parseISO } from "date-fns"
import { CheckCircle2Icon, PencilIcon, PlusIcon } from "lucide-react"
import { Link } from "react-router"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { ActivityFormSheet } from "./components/activity-form"
import { getContact, type Activity } from "./data"
import { activityTypeStyles } from "./status"
import { saveActivity, useActivities, useCompanyName } from "./store"

const scopes = ["Day", "Open", "All"] as const

function toKey(date: Date) {
  return format(date, "yyyy-MM-dd")
}

export default function CrmActivitiesPage() {
  const items = useActivities()
  const companyName = useCompanyName()
  const [date, setDate] = React.useState<Date | undefined>(
    parseISO("2026-09-02")
  )
  const [scope, setScope] = React.useState<(typeof scopes)[number]>("Day")
  const [editing, setEditing] = React.useState<Activity | undefined>(undefined)
  const [formOpen, setFormOpen] = React.useState(false)

  const selectedKey = date ? toKey(date) : ""
  const scheduled = items
    .filter((activity) => {
      if (scope === "Day") return activity.date === selectedKey
      if (scope === "Open") return !activity.done
      return true
    })
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))

  const busyDays = items.map((activity) => parseISO(activity.date))
  const openCount = items.filter((activity) => !activity.done).length

  function toggle(activity: Activity) {
    saveActivity({ ...activity, done: !activity.done })
    if (!activity.done) toast.success(`Completed: ${activity.subject}`)
  }

  function openCreate() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function openEdit(activity: Activity) {
    setEditing(activity)
    setFormOpen(true)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Activities</h2>
          <p className="text-sm text-muted-foreground">
            {openCount} open of {items.length} scheduled
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <PlusIcon />
          New Activity
        </Button>
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardContent className="flex flex-col gap-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(value) => {
                setDate(value)
                setScope("Day")
              }}
              modifiers={{ busy: busyDays }}
              modifiersClassNames={{
                busy: "font-semibold underline decoration-primary decoration-2 underline-offset-4",
              }}
              captionLayout="dropdown"
              className="w-full p-0 [--cell-size:--spacing(8)]"
            />
            <Separator />
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Selected day</span>
                <span className="font-medium">
                  {date ? format(date, "dd MMM yyyy") : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Scheduled</span>
                <span className="font-medium tabular-nums">
                  {items.filter((a) => a.date === selectedKey).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agenda</CardTitle>
            <CardDescription>
              {scope === "Day"
                ? date
                  ? format(date, "EEEE, dd MMMM yyyy")
                  : "Pick a day"
                : scope === "Open"
                  ? "Everything still outstanding"
                  : "Every logged and planned activity"}
            </CardDescription>
            <Tabs
              value={scope}
              onValueChange={(value) =>
                setScope(value as (typeof scopes)[number])
              }
              className="mt-2"
            >
              <TabsList>
                {scopes.map((item) => (
                  <TabsTrigger key={item} value={item}>
                    {item}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {scheduled.map((activity) => {
              const contact = getContact(activity.contactId)

              return (
                <div
                  key={activity.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                    activity.done && "bg-muted/40"
                  )}
                >
                  <Checkbox
                    checked={activity.done}
                    onCheckedChange={() => toggle(activity)}
                    aria-label={`Complete ${activity.subject}`}
                    className="mt-0.5"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={activityTypeStyles[activity.type]}
                      >
                        {activity.type}
                      </Badge>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          activity.done && "text-muted-foreground line-through"
                        )}
                      >
                        {activity.subject}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                      <span>
                        {format(parseISO(activity.date), "dd MMM")} ·{" "}
                        {activity.time} · {activity.owner}
                      </span>
                      {contact && (
                        <>
                          <span>·</span>
                          <Link
                            to={`/crm/contacts/${contact.id}`}
                            className="hover:underline"
                          >
                            {contact.name}
                          </Link>
                        </>
                      )}
                      {activity.companyId && (
                        <>
                          <span>·</span>
                          <Link
                            to={`/crm/companies/${activity.companyId}`}
                            className="hover:underline"
                          >
                            {companyName(activity.companyId)}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                  {activity.done && (
                    <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-success" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="-mt-1 -mr-1 shrink-0"
                    aria-label={`Edit ${activity.subject}`}
                    onClick={() => openEdit(activity)}
                  >
                    <PencilIcon />
                  </Button>
                </div>
              )
            })}

            {scheduled.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nothing scheduled here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <ActivityFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        activity={editing}
        onSaved={(activity) => setDate(parseISO(activity.date))}
      />
    </div>
  )
}
