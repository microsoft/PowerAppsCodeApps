import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CalendarIcon, PlusIcon } from "lucide-react"
import { Link } from "react-router"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import {
  actionStages,
  correctiveActions as initialActions,
  initials,
  type ActionStage,
  type CorrectiveAction,
} from "./data"
import { actionStageDots, severityStyles } from "./status"

const today = "2026-09-02"

function isStageId(id: string): id is ActionStage {
  return (actionStages as string[]).includes(id)
}

function ActionCard({
  item,
  overlay,
}: {
  item: CorrectiveAction
  overlay?: boolean
}) {
  const overdue = item.stage !== "Done" && item.dueOn < today

  return (
    <Card
      className={cn(
        "gap-3 py-4 transition-colors hover:border-primary/40",
        overlay && "border-primary/50 shadow-lg"
      )}
    >
      <CardContent className="flex flex-col gap-3 px-4">
        <span className="text-sm font-medium">{item.title}</span>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className={severityStyles[item.severity]}>
            {item.severity}
          </Badge>
          <Badge variant="outline">{item.site}</Badge>
        </div>

        {(item.sourceIncidentId || item.sourceRiskId) && (
          <div className="flex flex-wrap gap-2 text-xs">
            {item.sourceIncidentId && (
              <Link
                to={`/safety/incidents/${item.sourceIncidentId}`}
                className="text-muted-foreground hover:underline"
              >
                {item.sourceIncidentId}
              </Link>
            )}
            {item.sourceRiskId && (
              <Link
                to={`/safety/risks?risk=${item.sourceRiskId}`}
                className="text-muted-foreground hover:underline"
              >
                {item.sourceRiskId}
              </Link>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span
            className={cn(
              "flex items-center gap-1",
              overdue && "font-medium text-destructive"
            )}
          >
            <CalendarIcon className="size-3.5" />
            {item.dueOn}
          </span>
          <span className="flex items-center gap-2">
            {item.owner}
            <Avatar className="size-6">
              <AvatarFallback className="text-[10px]">
                {initials(item.owner)}
              </AvatarFallback>
            </Avatar>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function SortableActionCard({ item }: { item: CorrectiveAction }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })
  const pointerStart = React.useRef<{ x: number; y: number } | null>(null)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "touch-none rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        isDragging ? "cursor-grabbing opacity-40" : "cursor-grab"
      )}
      onPointerDownCapture={(event) => {
        pointerStart.current = { x: event.clientX, y: event.clientY }
      }}
      // A drag ends with a click; swallow it so the inner links do not navigate.
      onClickCapture={(event) => {
        const start = pointerStart.current
        if (!start) return
        const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y)
        if (moved > 4) {
          event.preventDefault()
          event.stopPropagation()
        }
      }}
      {...attributes}
      {...listeners}
    >
      <ActionCard item={item} />
    </div>
  )
}

function StageColumn({
  stage,
  stageItems,
}: {
  stage: ActionStage
  stageItems: CorrectiveAction[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const overdue = stageItems.filter(
    (item) => stage !== "Done" && item.dueOn < today
  ).length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className={`size-2 rounded-full ${actionStageDots[stage]}`} />
        <span className="text-sm font-medium">{stage}</span>
        <Badge variant="secondary">{stageItems.length}</Badge>
        {overdue > 0 && (
          <span className="ml-auto text-xs font-medium text-destructive tabular-nums">
            {overdue} overdue
          </span>
        )}
      </div>

      <SortableContext
        items={stageItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            "flex min-h-28 flex-1 flex-col gap-3 rounded-xl bg-muted/50 p-3 transition-colors",
            isOver && "bg-primary/5 ring-2 ring-primary/30"
          )}
        >
          {stageItems.map((item) => (
            <SortableActionCard key={item.id} item={item} />
          ))}

          {stageItems.length === 0 && (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Drop an action here.
            </p>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export default function SafetyActionsPage() {
  const [items, setItems] = React.useState<CorrectiveAction[]>(initialActions)
  const [active, setActive] = React.useState<CorrectiveAction | null>(null)
  const originStage = React.useRef<ActionStage | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const open = items.filter((item) => item.stage !== "Done")
  const overdue = open.filter((item) => item.dueOn < today)

  function handleDragStart({ active: dragged }: DragStartEvent) {
    const item = items.find((entry) => entry.id === String(dragged.id)) ?? null
    setActive(item)
    originStage.current = item?.stage ?? null
  }

  // Moving between stages happens on hover so the board reflows under the cursor.
  function handleDragOver({ active: dragged, over }: DragOverEvent) {
    if (!over) return
    const activeId = String(dragged.id)
    const overId = String(over.id)

    setItems((prev) => {
      const item = prev.find((entry) => entry.id === activeId)
      if (!item) return prev

      const overStage = isStageId(overId)
        ? overId
        : prev.find((entry) => entry.id === overId)?.stage
      if (!overStage || overStage === item.stage) return prev

      const without = prev.filter((entry) => entry.id !== activeId)
      const overIndex = without.findIndex((entry) => entry.id === overId)
      const insertAt = overIndex === -1 ? without.length : overIndex

      return [
        ...without.slice(0, insertAt),
        { ...item, stage: overStage },
        ...without.slice(insertAt),
      ]
    })
  }

  function handleDragEnd({ active: dragged, over }: DragEndEvent) {
    const from = originStage.current
    originStage.current = null
    setActive(null)
    if (!over) return

    const activeId = String(dragged.id)
    const overId = String(over.id)

    setItems((prev) => {
      const oldIndex = prev.findIndex((entry) => entry.id === activeId)
      const newIndex = prev.findIndex((entry) => entry.id === overId)
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev
      if (prev[oldIndex].stage !== prev[newIndex].stage) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })

    const moved = items.find((entry) => entry.id === activeId)
    if (from && moved && moved.stage !== from) {
      toast.success(`${moved.title} moved to ${moved.stage}`)
    }
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Corrective Actions</h2>
          <p className="text-sm text-muted-foreground">
            {open.length} open · {overdue.length} overdue · drag a card to change
            stage
          </p>
        </div>
        <Button size="sm">
          <PlusIcon />
          New Action
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActive(null)}
      >
        <div className="grid items-start gap-4 @2xl/main:grid-cols-2 @4xl/main:grid-cols-3 @6xl/main:grid-cols-5">
          {actionStages.map((stage) => (
            <StageColumn
              key={stage}
              stage={stage}
              stageItems={items.filter((item) => item.stage === stage)}
            />
          ))}
        </div>

        <DragOverlay>
          {active ? <ActionCard item={active} overlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
