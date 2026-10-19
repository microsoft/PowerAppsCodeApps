import * as React from "react"
import { ArrowLeftIcon, PencilIcon } from "lucide-react"
import { Link, useParams } from "react-router"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import {
  actionsForIncident,
  getIncident,
  initials,
  type Photo,
} from "./data"
import { PhotoUpload } from "./components/photo-upload"
import {
  actionStageStyles,
  incidentStatusStyles,
  incidentTypeStyles,
  severityStyles,
} from "./status"

export default function SafetyIncidentDetailsPage() {
  const { incidentId } = useParams()
  const incident = getIncident(incidentId)
  const [photos, setPhotos] = React.useState<Photo[]>(incident?.photos ?? [])

  if (!incident) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-sm text-muted-foreground">
          Incident {incidentId} was not found.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link to="/safety/incidents">
            <ArrowLeftIcon />
            Back to incidents
          </Link>
        </Button>
      </div>
    )
  }

  const actions = actionsForIncident(incident.id)

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/safety/incidents">
          <ArrowLeftIcon />
          Incidents
        </Link>
      </Button>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardDescription>
                {incident.id} · {incident.site} · {incident.area}
              </CardDescription>
              <CardTitle className="text-2xl">{incident.title}</CardTitle>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge
                  variant="secondary"
                  className={incidentTypeStyles[incident.type]}
                >
                  {incident.type}
                </Badge>
                <Badge
                  variant="secondary"
                  className={severityStyles[incident.severity]}
                >
                  {incident.severity}
                </Badge>
                <Badge
                  variant="secondary"
                  className={incidentStatusStyles[incident.status]}
                >
                  {incident.status}
                </Badge>
                {incident.lostTimeDays > 0 && (
                  <Badge variant="outline">
                    {incident.lostTimeDays} lost-time{" "}
                    {incident.lostTimeDays === 1 ? "day" : "days"}
                  </Badge>
                )}
              </div>
              <CardAction className="row-span-3 self-center">
                <Button size="sm" variant="outline">
                  <PencilIcon />
                  Edit
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-3 @xl/main:grid-cols-3">
              <div className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">Occurred</p>
                <p className="text-sm font-medium tabular-nums">
                  {incident.occurredOn}
                </p>
              </div>
              <div className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">Reported</p>
                <p className="text-sm font-medium tabular-nums">
                  {incident.reportedOn}
                </p>
              </div>
              <div className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">Reported by</p>
                <p className="text-sm font-medium">{incident.reportedBy}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  What happened
                </p>
                <p className="mt-1 text-sm">{incident.description}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Immediate action taken
                </p>
                <p className="mt-1 text-sm">{incident.immediateAction}</p>
              </div>
              {incident.rootCause && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Root cause
                    </p>
                    <p className="mt-1 text-sm">{incident.rootCause}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
              <CardDescription>
                {photos.length} {photos.length === 1 ? "photo" : "photos"}{" "}
                attached to this report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUpload
                photos={photos}
                onChange={setPhotos}
                label="Add site photos"
                hint="Drag files here, choose from disk, or take a photo on a mobile device"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Ownership</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback className="text-xs">
                    {initials(incident.owner)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{incident.owner}</p>
                  <p className="text-xs text-muted-foreground">
                    Investigation owner
                  </p>
                </div>
              </div>
              <Separator />
              <DetailRow label="Site" value={incident.site} />
              <DetailRow label="Area" value={incident.area} />
              <DetailRow label="Category" value={incident.type} />
              <DetailRow
                label="Lost-time days"
                value={String(incident.lostTimeDays)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Corrective actions</CardTitle>
              <CardDescription>
                {actions.length} raised from this incident
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {actions.map((action) => (
                <Link
                  key={action.id}
                  to="/safety/actions"
                  className="flex flex-col gap-1 rounded-xl border p-3 transition-colors hover:bg-muted/50"
                >
                  <span className="text-sm font-medium">{action.title}</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge
                      variant="secondary"
                      className={actionStageStyles[action.stage]}
                    >
                      {action.stage}
                    </Badge>
                    {action.owner} · due {action.dueOn}
                  </span>
                </Link>
              ))}
              {actions.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No actions raised yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
