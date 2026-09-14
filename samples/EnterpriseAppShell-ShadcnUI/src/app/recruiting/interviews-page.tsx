import * as React from "react"
import {
  CalendarPlusIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  ClockIcon,
  Loader2Icon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  TriangleAlertIcon,
  UsersIcon,
  VideoIcon,
} from "lucide-react"
import { Link } from "react-router"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { notifyError } from "@/lib/error-toast"
import { cn } from "@/lib/utils"

import {
  SCHEDULING_FLOW,
  SCHEDULING_STEPS,
  findSlots,
  type SlotProposal,
} from "./agent"
import {
  TODAY,
  formatDay,
  formatTime,
  initials,
  type Interview,
} from "./data"
import { InterviewFormSheet } from "./components/interview-form"
import { kindStyles } from "./status"
import { useCandidates, useInterviews, useRoles } from "./store"

function dayLabel(date: string) {
  const today = new Date(TODAY)
  const target = new Date(date)
  const diff = Math.round(
    (target.getTime() - today.getTime()) / 86_400_000
  )
  if (diff === 0) return "Today"
  if (diff === 1) return "Tomorrow"
  return formatDay(date)
}

export default function RecruitingInterviewsPage() {
  const interviews = useInterviews()
  const candidates = useCandidates()
  const roles = useRoles()

  const [open, setOpen] = React.useState(false)
  const [stepIndex, setStepIndex] = React.useState(-1)
  const [running, setRunning] = React.useState(false)
  const [slots, setSlots] = React.useState<SlotProposal[] | null>(null)
  const [chosen, setChosen] = React.useState<string | null>(null)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Interview | null>(null)

  const candidateById = (id?: string) =>
    candidates.find((item) => item.id === id)
  const roleById = (id?: string) => roles.find((item) => item.id === id)

  const upcoming = interviews
    .filter((interview) => interview.status === "Scheduled")
    .sort((a, b) => a.start.localeCompare(b.start))

  const completed = interviews
    .filter((interview) => interview.status === "Completed")
    .sort((a, b) => b.start.localeCompare(a.start))

  const days = [
    ...new Set(upcoming.map((interview) => interview.start.slice(0, 10))),
  ]

  function openNew() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(interview: Interview) {
    setEditing(interview)
    setFormOpen(true)
  }

  const panel = ["Priya Raman", "Marcus Webb", "Sofia Almeida"]

  function openScheduler() {
    setOpen(true)
    setSlots(null)
    setChosen(null)
    setStepIndex(-1)
  }

  async function proposeSlots() {
    setRunning(true)
    setStepIndex(-1)
    try {
      const result = await findSlots(panel, (index) => setStepIndex(index))
      setSlots(result.slots)
      setChosen(result.slots[0].id)
    } catch (error) {
      notifyError(error, {
        code: "recruiting.find-slots",
        title: "We could not read the panel's calendars",
        hint: "No invites were sent. Try again, or book the time manually.",
        onRetry: () => void proposeSlots(),
      })
    } finally {
      setRunning(false)
      setStepIndex(-1)
    }
  }

  function confirm() {
    const slot = slots?.find((entry) => entry.id === chosen)
    if (!slot) return
    setOpen(false)
    toast.success("Interview booked", {
      description: `${formatDay(slot.start)} at ${formatTime(slot.start)} · ${slot.room} · invites sent to ${slot.panel.length} panellists.`,
    })
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Interviews</h2>
          <p className="text-sm text-muted-foreground">
            {upcoming.length} scheduled · {completed.length} completed and
            awaiting a decision
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={openNew}>
            <PlusIcon />
            New interview
          </Button>
          <Button size="sm" onClick={openScheduler}>
            <CalendarPlusIcon />
            Schedule with agent
          </Button>
        </div>
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-[minmax(0,1fr)_320px] @4xl/main:items-start">
        <div className="flex flex-col gap-4">
          {days.map((day) => (
            <div key={day} className="flex flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <h3 className="text-sm font-medium">{dayLabel(day)}</h3>
                {dayLabel(day) !== formatDay(day) && (
                  <span className="text-xs text-muted-foreground">
                    {formatDay(day)}
                  </span>
                )}
              </div>
              <Card>
                <CardContent className="flex flex-col divide-y p-0">
                  {upcoming
                    .filter((interview) => interview.start.startsWith(day))
                    .map((interview) => {
                      const candidate = candidateById(interview.candidateId)!
                      const role = roleById(interview.roleId)!
                      const remote = interview.room.startsWith("Remote")
                      return (
                        <div
                          key={interview.id}
                          className="flex flex-col gap-3 p-4 @2xl/main:flex-row @2xl/main:items-center"
                        >
                          <div className="flex w-24 shrink-0 flex-col">
                            <span className="text-sm font-semibold tabular-nums">
                              {formatTime(interview.start)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {interview.durationMins} min
                            </span>
                          </div>
                          <Avatar className="size-9 shrink-0">
                            <AvatarFallback className="text-[10px]">
                              {initials(candidate.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                to={`/recruiting/candidates/${candidate.id}`}
                                className="font-medium hover:underline"
                              >
                                {candidate.name}
                              </Link>
                              <Badge
                                variant="secondary"
                                className={kindStyles[interview.kind]}
                              >
                                {interview.kind}
                              </Badge>
                            </div>
                            <p className="truncate text-sm text-muted-foreground">
                              {role.title}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                {remote ? (
                                  <VideoIcon className="size-3" />
                                ) : (
                                  <MapPinIcon className="size-3" />
                                )}
                                {interview.room}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <UsersIcon className="size-3" />
                                {interview.panel.join(", ")}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0"
                            onClick={() =>
                              toast("Brief sent to the panel", {
                                description: `${candidate.name} · ${role.title} · ${interview.kind}`,
                              })
                            }
                          >
                            Send brief
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="shrink-0"
                            onClick={() => openEdit(interview)}
                          >
                            <PencilIcon />
                            <span className="sr-only">
                              Edit interview with {candidate.name}
                            </span>
                          </Button>
                        </div>
                      )
                    })}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <Card className="@4xl/main:sticky @4xl/main:top-4">
          <CardHeader>
            <CardTitle className="text-base">Awaiting a decision</CardTitle>
            <CardDescription>
              Completed interviews with a transcript ready
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {completed.map((interview) => {
              const candidate = candidateById(interview.candidateId)!
              return (
                <div key={interview.id} className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-[10px]">
                      {initials(candidate.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {candidate.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {interview.kind} · {formatDay(interview.start)}
                    </p>
                  </div>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => openEdit(interview)}
                  >
                    <PencilIcon />
                    <span className="sr-only">
                      Add notes for {candidate.name}
                    </span>
                  </Button>
                </div>
              )
            })}
            <Separator />
            <Button size="sm" variant="outline" asChild>
              <Link to="/recruiting/transcripts">
                <SparklesIcon />
                Open transcripts
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Find a slot for the design panel</DialogTitle>
            <DialogDescription>
              {SCHEDULING_FLOW} reads the panel's calendars and the candidate's
              stated availability, then ranks the options. You choose.
            </DialogDescription>
          </DialogHeader>

          {!slots && (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium">Panel</p>
                <p className="text-sm text-muted-foreground">
                  {panel.join(", ")} · 60 minutes
                </p>
              </div>
              <div className="divide-y">
                {SCHEDULING_STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-3 py-2">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
                      {running && index < stepIndex && (
                        <CheckCircle2Icon className="size-4 text-success" />
                      )}
                      {running && index === stepIndex && (
                        <Loader2Icon className="size-4 animate-spin text-primary" />
                      )}
                      {(!running || index > stepIndex) && (
                        <CircleDashedIcon className="size-4 text-muted-foreground/50" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm",
                          running && index <= stepIndex
                            ? "font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {slots && (
            <div className="flex flex-col gap-3">
              {slots.map((slot) => {
                const active = slot.id === chosen
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setChosen(slot.id)}
                    className={cn(
                      "flex flex-col gap-2 rounded-lg border p-4 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent/40"
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {formatDay(slot.start)} at {formatTime(slot.start)}
                        </span>
                        <Badge variant="secondary">{slot.room}</Badge>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">
                        {slot.score}
                      </span>
                    </div>
                    {slot.rationale.map((reason) => (
                      <p
                        key={reason}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2Icon className="mt-0.5 size-3.5 shrink-0 text-success" />
                        {reason}
                      </p>
                    ))}
                    {slot.conflicts.map((conflict) => (
                      <p
                        key={conflict}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0 text-warning" />
                        {conflict}
                      </p>
                    ))}
                  </button>
                )
              })}
              <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <ClockIcon className="mt-0.5 size-3 shrink-0" />
                Nothing is in anyone's diary until you confirm.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {slots ? (
              <Button onClick={confirm} disabled={!chosen}>
                Book this slot
              </Button>
            ) : (
              <Button onClick={proposeSlots} disabled={running}>
                {running ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
                {running ? "Searching…" : "Find slots"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InterviewFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        interview={editing}
      />
    </div>
  )
}
