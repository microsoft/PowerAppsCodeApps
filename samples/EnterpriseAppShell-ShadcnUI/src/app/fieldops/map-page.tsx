import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ListIcon,
  RouteIcon,
  XIcon,
} from "lucide-react"
import { Link } from "react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FlyTo, MapCanvas, MapMarker } from "./components/map-canvas"
import { cn } from "@/lib/utils"

import { assignments, formatSlaShort, type Assignment } from "./data"
import { priorityMarker, priorityStyles, tradeIcons } from "./status"

const DUBLIN: [number, number] = [-6.26, 53.34]

export default function FieldOpsMapPage() {
  const [selectedId, setSelectedId] = React.useState<string | null>(
    assignments[0].id
  )
  const [popupId, setPopupId] = React.useState<string | null>(null)
  const strip = React.useRef<HTMLDivElement>(null)

  const selected = assignments.find((item) => item.id === selectedId)

  function scrollStrip(direction: -1 | 1) {
    strip.current?.scrollBy({ left: direction * 320, behavior: "smooth" })
  }

  function focus(assignment: Assignment) {
    setSelectedId(assignment.id)
    setPopupId(assignment.id)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Assignment Map</h2>
          <p className="text-sm text-muted-foreground">
            Every open work order plotted across Dublin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/fieldops">
              <ListIcon />
              List view
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/fieldops/dispatch">
              <RouteIcon />
              Dispatch
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex min-h-[36rem] flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="relative border-b bg-card">
          <div
            ref={strip}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth p-3 px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {assignments.map((assignment) => {
              const Icon = tradeIcons[assignment.trade]
              const active = assignment.id === selectedId
              return (
                <button
                  key={assignment.id}
                  type="button"
                  onClick={() => focus(assignment)}
                  className={cn(
                    "flex w-56 shrink-0 snap-start items-center gap-3 rounded-lg border p-2 text-left transition-colors",
                    active
                      ? "border-primary bg-primary/5"
                      : "hover:border-muted-foreground/30 hover:bg-accent"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-md text-white",
                      priorityMarker[assignment.priority]
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {assignment.site}
                    </div>
                    <div className="text-[10px] font-semibold tracking-wide text-primary uppercase">
                      {assignment.trade}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {formatSlaShort(assignment.slaDue)}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Previous assignments"
            onClick={() => scrollStrip(-1)}
            className="absolute top-1/2 left-2 size-8 -translate-y-1/2 rounded-full shadow-sm"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="More assignments"
            onClick={() => scrollStrip(1)}
            className="absolute top-1/2 right-2 size-8 -translate-y-1/2 rounded-full shadow-sm"
          >
            <ChevronRightIcon />
          </Button>
        </div>

        <MapCanvas center={DUBLIN} zoom={10.4} className="flex-1">
          {selected && <FlyTo center={[selected.lng, selected.lat]} zoom={12.5} />}

          {assignments.map((assignment) => (
            <MapMarker
              key={assignment.id}
              lng={assignment.lng}
              lat={assignment.lat}
              onClick={() => focus(assignment)}
              className="cursor-pointer"
            >
              <span
                className={cn(
                  "block rounded-full ring-2 ring-white transition-all",
                  priorityMarker[assignment.priority],
                  assignment.id === selectedId
                    ? "size-5 shadow-lg"
                    : "size-3.5 opacity-90"
                )}
              />
            </MapMarker>
          ))}

          {assignments
            .filter((assignment) => assignment.id === popupId)
            .map((assignment) => (
              <MapMarker
                key={`popup-${assignment.id}`}
                lng={assignment.lng}
                lat={assignment.lat}
                anchor="bottom"
                offsetY={-14}
              >
                <div className="w-60 rounded-lg border bg-popover p-3 text-popover-foreground shadow-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold">{assignment.site}</div>
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={() => setPopupId(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {assignment.priority} · SLA {formatSlaShort(assignment.slaDue)}
                  </div>
                  <div className="mt-1 text-xs">{assignment.system}</div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {assignment.description}
                  </p>
                </div>
              </MapMarker>
            ))}
        </MapCanvas>

        <div className="flex flex-wrap items-center gap-4 border-t px-4 py-2.5 text-xs text-muted-foreground">
          <span>{assignments.length} assignments plotted</span>
          <span className="flex items-center gap-3">
            {(["High", "Medium", "Low"] as const).map((priority) => (
              <Badge
                key={priority}
                variant="secondary"
                className={priorityStyles[priority]}
              >
                {priority}
              </Badge>
            ))}
          </span>
        </div>
      </div>
    </div>
  )
}
