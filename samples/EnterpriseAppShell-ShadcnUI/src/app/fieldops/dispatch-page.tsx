import * as React from "react"
import { CheckCircle2Icon, RouteIcon, SparklesIcon } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FitBounds,
  MapCanvas,
  MapMarker,
  MapRoutes,
  type LngLat,
  type MapRoute,
} from "./components/map-canvas"
import { cn } from "@/lib/utils"

import {
  assignments,
  getTechnician,
  initials,
  technicians,
  formatSla,
} from "./data"
import { priorityMarker, priorityStyles, routeColor } from "./status"
import { assignTechnician, commitAssignments, useDispatchState } from "./store"

const DUBLIN: LngLat = [-6.26, 53.34]

export default function FieldOpsDispatchPage() {
  const { entries, committedCount } = useDispatchState()
  const [focusedId, setFocusedId] = React.useState<string | null>(null)

  const routes: MapRoute[] = React.useMemo(
    () =>
      entries.flatMap((entry, index) => {
        const assignment = assignments.find(
          (item) => item.id === entry.assignmentId
        )
        const technician = getTechnician(entry.technicianId)
        if (!assignment || !technician) return []
        return [
          {
            id: entry.assignmentId,
            color: routeColor(index),
            from: [technician.lng, technician.lat] as LngLat,
            to: [assignment.lng, assignment.lat] as LngLat,
          },
        ]
      }),
    [entries]
  )

  const bounds = React.useMemo<LngLat[]>(
    () => routes.flatMap((route) => [route.from, route.to]),
    [routes]
  )

  const activeTechnicians = React.useMemo(() => {
    const ids = new Set(entries.map((entry) => entry.technicianId))
    return technicians.filter((technician) => ids.has(technician.id))
  }, [entries])

  function confirm() {
    commitAssignments()
    toast.success(`Committed ${entries.length} assignments`, {
      description: "Technicians have been notified with their route for today.",
    })
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Assignment → Technician Mapping
          </h2>
          <p className="text-sm text-muted-foreground">
            Recommended matches based on trade, proximity and SLA risk
          </p>
        </div>
        <Button size="sm" onClick={confirm}>
          <CheckCircle2Icon />
          Confirm Assignments
        </Button>
      </div>

      {/* The rail holds one tall card per assignment. Without a definite height
          here the grid row grows to that content and the map stretches metres
          off-screen, so its fitted view lands nowhere near the pins. */}
      <div className="grid min-h-[36rem] flex-1 gap-4 @4xl/main:h-[calc(100svh-11.5rem)] @4xl/main:flex-none @4xl/main:grid-cols-[minmax(0,1fr)_minmax(0,380px)] @4xl/main:items-stretch">
        <div className="min-h-[24rem] overflow-hidden rounded-xl border bg-card shadow-sm">
          <MapCanvas center={DUBLIN} zoom={10.2} className="size-full">
            <FitBounds points={bounds} padding={72} maxZoom={11.5} />
            <MapRoutes routes={routes} />

            {assignments.map((assignment) => (
              <MapMarker
                key={assignment.id}
                lng={assignment.lng}
                lat={assignment.lat}
                onClick={() => setFocusedId(assignment.id)}
                className="cursor-pointer"
              >
                <span
                  className={cn(
                    "block rounded-full ring-2 ring-white",
                    priorityMarker[assignment.priority],
                    assignment.id === focusedId ? "size-4" : "size-2.5"
                  )}
                />
              </MapMarker>
            ))}

            {activeTechnicians.map((technician) => (
              <MapMarker
                key={technician.id}
                lng={technician.lng}
                lat={technician.lat}
              >
                <Avatar className="size-8 border-2 border-white shadow-md">
                  <AvatarFallback className="bg-foreground text-[10px] text-background">
                    {initials(technician.name)}
                  </AvatarFallback>
                </Avatar>
              </MapMarker>
            ))}
          </MapCanvas>
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RouteIcon className="size-4" />
            Routes rendered {routes.length}/{entries.length}
          </div>

          {committedCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
              <CheckCircle2Icon className="size-4" />
              Successfully committed {committedCount} assignments
            </div>
          )}

          <div className="flex max-h-[32rem] flex-col gap-3 overflow-y-auto pr-1 @4xl/main:max-h-none @4xl/main:flex-1">
            {entries.map((entry) => {
              const assignment = assignments.find(
                (item) => item.id === entry.assignmentId
              )
              if (!assignment) return null
              const technician = getTechnician(entry.technicianId)
              const focused = focusedId === assignment.id

              return (
                <div
                  key={entry.assignmentId}
                  onMouseEnter={() => setFocusedId(assignment.id)}
                  className={cn(
                    "rounded-xl border bg-card p-3 shadow-sm transition-colors",
                    focused && "border-primary ring-1 ring-primary/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {assignment.site}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        SLA {formatSla(assignment.slaDue)}
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={priorityStyles[assignment.priority]}
                    >
                      {assignment.priority}
                    </Badge>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[10px]">
                        {technician ? initials(technician.name) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-muted-foreground">Assigned to</span>
                    <span className="font-medium">{technician?.name}</span>
                  </div>

                  <p className="mt-2 flex gap-1.5 text-xs text-muted-foreground">
                    <SparklesIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span>
                      <span className="font-medium text-foreground">
                        Why this assignment:{" "}
                      </span>
                      {entry.rationale}
                    </span>
                  </p>

                  <div className="mt-3 grid gap-1.5">
                    <Label
                      htmlFor={`tech-${entry.assignmentId}`}
                      className="text-xs text-muted-foreground"
                    >
                      Change technician
                    </Label>
                    <Select
                      value={entry.technicianId}
                      onValueChange={(value) =>
                        assignTechnician(entry.assignmentId, value)
                      }
                    >
                      <SelectTrigger
                        id={`tech-${entry.assignmentId}`}
                        className="w-full"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians.map((technician) => (
                          <SelectItem key={technician.id} value={technician.id}>
                            {technician.name} · {technician.base}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
