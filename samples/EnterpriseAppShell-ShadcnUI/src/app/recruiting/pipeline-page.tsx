import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { PlusIcon, StarIcon } from "lucide-react"
import { Link } from "react-router"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { initials, stages, type Candidate, type Stage } from "./data"
import { CandidateFormSheet } from "./components/candidate-form"
import { accentRings, stageDots } from "./status"
import { moveCandidate, useCandidates, useRoles } from "./store"

export default function RecruitingPipelinePage() {
  const candidates = useCandidates()
  const roles = useRoles()

  const [roleFilter, setRoleFilter] = React.useState("all")
  const [dragging, setDragging] = React.useState<Candidate | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)

  // A short drag threshold keeps a plain click on the card working as a link.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  )

  const visible = candidates.filter(
    (candidate) =>
      candidate.stage !== "Rejected" &&
      (roleFilter === "all" || candidate.roleId === roleFilter)
  )

  function handleDragStart(event: DragStartEvent) {
    setDragging(candidates.find((item) => item.id === event.active.id) ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const candidate = dragging
    setDragging(null)
    if (!candidate || !event.over) return

    const target = event.over.id as Stage
    if (target === candidate.stage) return

    const from = candidate.stage
    moveCandidate(candidate.id, target)
    toast.success(`${candidate.name} moved to ${target}`, {
      description: `From ${from}`,
      action: {
        label: "Undo",
        onClick: () => moveCandidate(candidate.id, from),
      },
    })
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Pipeline</h2>
          <p
            className="text-sm text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {visible.length} live candidates across {stages.length} stages · drag
            a card to move someone on
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[220px]" size="sm">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" asChild>
            <Link to="/recruiting/candidates">List view</Link>
          </Button>
          <Button size="sm" onClick={() => setSheetOpen(true)}>
            <PlusIcon />
            Add candidate
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDragging(null)}
      >
        <div className="flex gap-4 overflow-x-auto pb-2">
          {stages.map((stage) => (
            <Column
              key={stage}
              stage={stage}
              candidates={visible.filter((item) => item.stage === stage)}
              isDragging={dragging !== null}
              roles={roles}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {dragging && (
            <div className="w-72 rotate-2 cursor-grabbing">
              <CardBody
                candidate={dragging}
                roleTitle={
                  roles.find((role) => role.id === dragging.roleId)?.title
                }
                className="border-primary/40 shadow-lg"
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <CandidateFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        candidate={null}
      />
    </div>
  )
}

function Column({
  stage,
  candidates,
  isDragging,
  roles,
}: {
  stage: Stage
  candidates: Candidate[]
  isDragging: boolean
  roles: { id: string; title: string }[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <span className={cn("size-2 rounded-full", stageDots[stage])} />
        <span className="text-sm font-medium">{stage}</span>
        <span className="text-sm text-muted-foreground tabular-nums">
          {candidates.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-col gap-2 rounded-xl bg-muted/40 p-2 transition-colors",
          isDragging && "ring-1 ring-border ring-inset",
          isOver && "bg-primary/5 ring-2 ring-primary/40"
        )}
      >
        {candidates.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            {isOver ? `Drop to move to ${stage}` : "Nobody here"}
          </p>
        )}
        {candidates.map((candidate) => (
          <DraggableCard
            key={candidate.id}
            candidate={candidate}
            roleTitle={roles.find((role) => role.id === candidate.roleId)?.title}
          />
        ))}
      </div>
    </div>
  )
}

function DraggableCard({
  candidate,
  roleTitle,
}: {
  candidate: Candidate
  roleTitle?: string
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: candidate.id,
  })
  const pointerStart = React.useRef<{ x: number; y: number } | null>(null)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "touch-none rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        isDragging ? "cursor-grabbing opacity-40" : "cursor-grab"
      )}
      onPointerDownCapture={(event) => {
        pointerStart.current = { x: event.clientX, y: event.clientY }
      }}
      // A drag ends with a click; swallow it so the card does not navigate.
      onClickCapture={(event) => {
        const start = pointerStart.current
        if (!start) return
        const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y)
        if (moved > 4) {
          event.preventDefault()
          event.stopPropagation()
        }
      }}
      {...listeners}
      {...attributes}
      aria-label={`${candidate.name} — press space to move to another stage`}
    >
      <Link
        to={`/recruiting/candidates/${candidate.id}`}
        tabIndex={-1}
        className="block rounded-lg outline-none"
      >
        <CardBody candidate={candidate} roleTitle={roleTitle} />
      </Link>
    </div>
  )
}

function CardBody({
  candidate,
  roleTitle,
  className,
}: {
  candidate: Candidate
  roleTitle?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-lg border bg-card p-3 shadow-xs transition-shadow hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-2.5">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback
            className={cn("text-[10px]", accentRings[candidate.accent])}
          >
            {initials(candidate.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{candidate.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {candidate.currentEmployer} · {candidate.years}y
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground tabular-nums">
          <StarIcon className="size-3 fill-warning text-warning" />
          {candidate.rating.toFixed(1)}
        </span>
      </div>

      <Badge variant="outline" className="w-fit font-normal">
        {roleTitle}
      </Badge>

      <p className="line-clamp-2 text-xs text-muted-foreground">
        {candidate.nextStep}
      </p>
    </div>
  )
}
