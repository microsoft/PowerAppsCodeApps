import * as React from "react"
import {
  ArrowLeftIcon,
  CheckIcon,
  MinusIcon,
  RouteIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import { Link, useParams } from "react-router"
import { toast } from "sonner"

import { FieldMessage } from "@/components/common/form-validation"
import { useFormValidation } from "@/hooks/use-form-validation"
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
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import {
  getWalk,
  initials,
  type CheckItem,
  type CheckResult,
  type Finding,
  type Photo,
} from "./data"
import { PhotoUpload } from "./components/photo-upload"
import { checkResultStyles, severityStyles, walkScoreStyle, walkStatusStyles } from "./status"

const resultIcons: Record<CheckResult, React.ReactNode> = {
  Pass: <CheckIcon />,
  Fail: <XIcon />,
  "N/A": <MinusIcon />,
}

export default function SafetyWalkDetailsPage() {
  const { walkId } = useParams()
  const walk = getWalk(walkId)

  const [checklist, setChecklist] = React.useState<CheckItem[]>(
    walk?.checklist ?? []
  )
  const [findings, setFindings] = React.useState<Finding[]>(walk?.findings ?? [])
  const [newFinding, setNewFinding] = React.useState("")
  const [pendingPhotos, setPendingPhotos] = React.useState<Photo[]>([])

  const findingForm = useFormValidation(
    { summary: newFinding },
    {
      summary: (values) =>
        values.summary.trim().length < 3
          ? "Describe the finding in a few words."
          : undefined,
    },
  )

  if (!walk) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-sm text-muted-foreground">
          Safety walk {walkId} was not found.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link to="/safety/walks">
            <ArrowLeftIcon />
            Back to walks
          </Link>
        </Button>
      </div>
    )
  }

  const scored = checklist.filter((item) => item.result !== "N/A")
  const passed = scored.filter((item) => item.result === "Pass").length
  const score = scored.length ? Math.round((passed / scored.length) * 100) : 0
  const failures = checklist.filter((item) => item.result === "Fail")

  function setResult(id: string, result: CheckResult) {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, result } : item))
    )
  }

  const addFinding = findingForm.handleSubmit(() => {
    const summary = newFinding.trim()
    setFindings((prev) => [
      ...prev,
      {
        id: `F-${Date.now()}`,
        summary,
        severity: "Medium",
        area: walk!.site,
        photos: pendingPhotos,
      },
    ])
    setNewFinding("")
    setPendingPhotos([])
    toast.success("Finding logged", { description: summary })
  })

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/safety/walks">
          <ArrowLeftIcon />
          Safety Walks
        </Link>
      </Button>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardDescription>
                {walk.id} · {walk.site} · {walk.scheduledFor}
              </CardDescription>
              <CardTitle className="text-2xl">{walk.title}</CardTitle>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge
                  variant="secondary"
                  className={walkStatusStyles[walk.status]}
                >
                  {walk.status}
                </Badge>
                <Badge variant="secondary" className={walkScoreStyle(score)}>
                  {score}% compliant
                </Badge>
                <Badge variant="outline">
                  {failures.length} failed{" "}
                  {failures.length === 1 ? "check" : "checks"}
                </Badge>
              </div>
              <CardAction className="row-span-3 self-center">
                <Button
                  size="sm"
                  onClick={() =>
                    toast.success(`${walk.title} signed off`, {
                      description: `${score}% compliance · ${findings.length} findings`,
                    })
                  }
                >
                  Complete walk
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <RouteIcon className="mt-0.5 size-4 shrink-0" />
                {walk.route}
              </p>
              <Progress value={score} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {passed} of {scored.length} scored checks passed ·{" "}
                {checklist.length - scored.length} marked not applicable
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Checklist</CardTitle>
              <CardDescription>
                Score each item as you walk the route
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-xl border p-3 @xl/main:flex-row @xl/main:items-center"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium">{item.prompt}</span>
                    {item.note && (
                      <span className="text-xs text-muted-foreground">
                        {item.note}
                      </span>
                    )}
                  </div>
                  <ToggleGroup
                    type="single"
                    value={item.result}
                    onValueChange={(value) =>
                      value && setResult(item.id, value as CheckResult)
                    }
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                  >
                    {(["Pass", "Fail", "N/A"] as CheckResult[]).map((option) => (
                      <ToggleGroupItem
                        key={option}
                        value={option}
                        aria-label={`${item.prompt}: ${option}`}
                      >
                        {resultIcons[option]}
                        {option}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Findings</CardTitle>
              <CardDescription>
                {findings.length} logged on this walk
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {findings.map((finding) => (
                <div
                  key={finding.id}
                  className="flex flex-col gap-2 rounded-xl border p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <TriangleAlertIcon className="size-4 text-muted-foreground" />
                    <span className="flex-1 text-sm font-medium">
                      {finding.summary}
                    </span>
                    <Badge
                      variant="secondary"
                      className={severityStyles[finding.severity]}
                    >
                      {finding.severity}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {finding.area} ·{" "}
                    {finding.photos.length === 0
                      ? "No photos"
                      : `${finding.photos.length} photo(s)`}
                  </span>
                  {finding.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {finding.photos.map((photo) => (
                        <Badge key={photo.id} variant="outline">
                          {photo.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {findings.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Nothing logged yet.
                </p>
              )}

              <Separator />

              <form
                noValidate
                onSubmit={addFinding}
                className="flex flex-col gap-3"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-2">
                    <Input
                      value={newFinding}
                      onChange={(event) => setNewFinding(event.target.value)}
                      placeholder="Describe what you observed"
                      aria-label="New finding"
                      {...findingForm.fieldProps("summary")}
                    />
                    <Button type="submit">Log finding</Button>
                  </div>
                  <FieldMessage error={findingForm.errorFor("summary")} />
                </div>
                <PhotoUpload
                  photos={pendingPhotos}
                  onChange={setPendingPhotos}
                  label="Photograph the finding"
                  hint="Attached to the finding when you log it"
                />
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Walk party</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback className="text-xs">
                    {initials(walk.leader)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{walk.leader}</p>
                  <p className="text-xs text-muted-foreground">Walk leader</p>
                </div>
              </div>
              <Separator />
              {walk.observers.map((observer) => (
                <div key={observer} className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-[10px]">
                      {initials(observer)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">{observer}</p>
                    <p className="text-xs text-muted-foreground">Observer</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Failed checks</CardTitle>
              <CardDescription>Convert these into actions</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {failures.map((item) => (
                <div key={item.id} className="rounded-xl border p-3">
                  <p className="text-sm font-medium">{item.prompt}</p>
                  {item.note && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.note}
                    </p>
                  )}
                  <Badge
                    variant="secondary"
                    className={`mt-2 ${checkResultStyles.Fail}`}
                  >
                    Fail
                  </Badge>
                </div>
              ))}
              {failures.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Every scored check passed.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/safety/actions">Open action board</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
