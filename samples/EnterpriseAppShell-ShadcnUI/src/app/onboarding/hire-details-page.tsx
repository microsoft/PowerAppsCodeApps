import * as React from "react"
import {
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  RotateCwIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Link, useParams } from "react-router"
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { notifyError } from "@/lib/error-toast"
import { cn } from "@/lib/utils"

import { runProvisioning } from "./agent"
import {
  dayNumber,
  formatDate,
  hireById,
  initials,
  itemsForTrack,
  progressFor,
  provisionRuns,
  provisionSteps,
  requiredOutstanding,
  stages,
  type ProvisionStepState,
} from "./data"
import {
  contentTypeIcons,
  contentTypeStyles,
  hireStatusStyles,
  provisionStateLabels,
  provisionStateStyles,
} from "./status"

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2 text-sm">
      <span className="w-32 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1">{value}</span>
    </div>
  )
}

export default function OnboardingHireDetailsPage() {
  const { hireId } = useParams()
  const hire = hireById(hireId)

  const [states, setStates] = React.useState<Record<string, ProvisionStepState>>(
    {}
  )
  const [retrying, setRetrying] = React.useState(false)

  if (!hire) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>We could not find that hire</EmptyTitle>
            <EmptyDescription>
              <Link to="/onboarding/hires">Back to the cohort</Link>
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  const items = itemsForTrack(hire.track)
  const progress = progressFor(hire)
  const outstanding = requiredOutstanding(hire)
  const day = dayNumber(hire.startDate)
  const run = provisionRuns.find((entry) => entry.hireId === hire.id)

  const stepState = (id: string): ProvisionStepState =>
    states[id] ?? run?.steps.find((step) => step.id === id)?.state ?? "pending"

  const stepMessage = (id: string) =>
    states[id] === "done"
      ? "Retried and completed"
      : (run?.steps.find((step) => step.id === id)?.message ?? "Not started")

  const failed = provisionSteps.filter((step) => stepState(step.id) === "failed")

  async function retryFailed() {
    const blocked = provisionSteps.filter((step) =>
      ["failed", "skipped"].includes(stepState(step.id))
    )
    setRetrying(true)
    try {
      await runProvisioning(
        blocked,
        (outcome) =>
          setStates((current) => ({ ...current, [outcome.id]: outcome.state })),
        (step) => `${step.system} retried`
      )
      toast.success("Provisioning recovered", {
        description: `${blocked.length} steps completed for ${hire!.name}.`,
      })
    } catch (error) {
      notifyError(error, {
        code: "onboarding.provisioning-retry",
        title: "The retry could not be completed",
        hint: "The steps were left as they were. Try again in a moment.",
        context: { hireId: hire!.id, steps: blocked.map((step) => step.id) },
        onRetry: () => void retryFailed(),
      })
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Button variant="ghost" size="sm" className="w-fit -ml-2" asChild>
        <Link to="/onboarding/hires">
          <ArrowLeftIcon />
          All new hires
        </Link>
      </Button>

      <div className="flex flex-col gap-4 @2xl/main:flex-row @2xl/main:items-start @2xl/main:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback>{initials(hire.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">{hire.name}</h2>
              <Badge
                variant="secondary"
                className={hireStatusStyles[hire.status]}
              >
                {hire.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {hire.role} · {hire.department}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="size-3" />
                {hire.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <MailIcon className="size-3" />
                {hire.email}
              </span>
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="size-3" />
                {day < 0
                  ? `starts in ${Math.abs(day)} days`
                  : `day ${day + 1} of 90`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex min-w-56 flex-col gap-2 rounded-xl border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Journey</span>
            <span className="text-lg font-semibold tabular-nums">
              {progress.percent}%
            </span>
          </div>
          <Progress value={progress.percent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {progress.done} of {progress.total} steps ·{" "}
            {outstanding.length === 0
              ? "nothing required outstanding"
              : `${outstanding.length} required outstanding`}
          </p>
        </div>
      </div>

      {hire.status === "At risk" && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">This journey is off track</p>
            <p className="text-sm text-muted-foreground">{hire.note}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              toast.success("Nudge sent", {
                description: `${hire.manager} was asked to unblock ${hire.name.split(" ")[0]}.`,
              })
            }
          >
            Nudge {hire.manager.split(" ")[0]}
          </Button>
        </div>
      )}

      <Tabs defaultValue="journey" className="gap-4">
        <TabsList>
          <TabsTrigger value="journey">Journey</TabsTrigger>
          <TabsTrigger value="provisioning">Provisioning</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="journey" className="flex flex-col gap-4">
          {stages.map((stage) => {
            const stageItems = items.filter((item) => item.stage === stage.id)
            const done = stageItems.filter((item) =>
              hire.completed.includes(item.id)
            ).length
            return (
              <Card key={stage.id}>
                <CardHeader>
                  <CardTitle className="text-base">{stage.name}</CardTitle>
                  <CardDescription>{stage.window}</CardDescription>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Progress
                      value={(done / stageItems.length) * 100}
                      className="h-1.5 w-24"
                    />
                    <span className="tabular-nums">
                      {done}/{stageItems.length}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  {stageItems.map((item) => {
                    const Icon = contentTypeIcons[item.type]
                    const complete = hire.completed.includes(item.id)
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg px-2 py-2"
                      >
                        <span
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-md",
                            complete
                              ? "bg-success/10 text-success"
                              : contentTypeStyles[item.type]
                          )}
                        >
                          {complete ? (
                            <CheckIcon className="size-3.5" />
                          ) : (
                            <Icon className="size-3.5" />
                          )}
                        </span>
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate text-sm",
                            complete && "text-muted-foreground line-through"
                          )}
                        >
                          {item.title}
                        </span>
                        {item.required && !complete && (
                          <Badge
                            variant="outline"
                            className="h-5 shrink-0 px-1.5 text-[10px]"
                          >
                            Required
                          </Badge>
                        )}
                        <span className="w-16 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                          {item.minutes} min
                        </span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="provisioning" className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {run?.flow ?? "Provision-New-Starter"}
              </CardTitle>
              <CardDescription>
                {run
                  ? `${run.id} · triggered by ${run.triggeredBy} · ${run.startedAt} · ${(run.durationMs / 1000).toFixed(1)}s`
                  : "No run has been recorded for this hire yet."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {provisionSteps.map((step) => {
                const state = stepState(step.id)
                return (
                  <div
                    key={step.id}
                    className="flex items-start gap-3 rounded-lg px-2 py-2.5"
                  >
                    <Badge
                      variant="secondary"
                      className={cn(
                        "mt-0.5 w-16 shrink-0 justify-center",
                        provisionStateStyles[state]
                      )}
                    >
                      {provisionStateLabels[state]}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{step.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {step.system} · {stepMessage(step.id)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {failed.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4">
              <TriangleAlertIcon className="size-4 shrink-0 text-warning" />
              <p className="min-w-0 flex-1 text-sm text-muted-foreground">
                {failed.length} step{failed.length > 1 ? "s" : ""} failed and
                downstream steps were skipped. Re-running only replays the
                blocked steps.
              </p>
              <Button size="sm" disabled={retrying} onClick={retryFailed}>
                <RotateCwIcon className={cn(retrying && "animate-spin")} />
                {retrying ? "Re-running…" : "Re-run blocked steps"}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Employment</CardTitle>
              <CardDescription>
                Everything People Operations holds for this hire
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <Row label="Start date" value={formatDate(hire.startDate)} />
              <Row label="Employment" value={hire.employmentType} />
              <Row label="Department" value={hire.department} />
              <Row label="Location" value={hire.location} />
              <Row label="Manager" value={hire.manager} />
              <Row label="Buddy" value={hire.buddy} />
              <Row label="Content track" value={hire.track} />
              <Row
                label="Note"
                value={<span className="text-muted-foreground">{hire.note}</span>}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
