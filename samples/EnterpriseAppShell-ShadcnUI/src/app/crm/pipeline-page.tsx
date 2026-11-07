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
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

import {
  dealStages,
  deals as initialDeals,
  formatCurrency,
  getContact,
  type Deal,
  type DealStage,
} from "./data"
import { dealStageDots, initials } from "./status"
import { useCompanyName } from "./store"

// Probability follows the stage, so a dragged deal forecasts correctly on drop.
const stageProbability: Record<DealStage, number> = {
  Qualified: 25,
  Proposal: 45,
  Negotiation: 70,
  "Closed Won": 100,
  "Closed Lost": 0,
}

function isStageId(id: string): id is DealStage {
  return (dealStages as string[]).includes(id)
}

function DealCard({ deal, overlay }: { deal: Deal; overlay?: boolean }) {
  const contact = getContact(deal.contactId)
  const companyName = useCompanyName()

  return (
    <Card
      className={cn(
        "gap-3 py-4 transition-colors hover:border-primary/40",
        overlay && "border-primary/50 shadow-lg"
      )}
    >
      <CardContent className="flex flex-col gap-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium">{deal.name}</span>
          <span className="shrink-0 text-sm font-semibold tabular-nums">
            {formatCurrency(deal.value, true)}
          </span>
        </div>
        <Link
          to={`/crm/companies/${deal.companyId}`}
          className="w-fit text-xs text-muted-foreground hover:underline"
        >
          {companyName(deal.companyId)}
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-9 shrink-0 text-xs tabular-nums text-muted-foreground">
            {deal.probability}%
          </span>
          <Progress value={deal.probability} />
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarIcon className="size-3.5" />
            {deal.closeDate}
          </span>
          <span className="flex items-center gap-2">
            {contact && (
              <Link
                to={`/crm/contacts/${contact.id}`}
                className="hover:underline"
              >
                {contact.name}
              </Link>
            )}
            <Avatar className="size-6">
              <AvatarFallback className="text-[10px]">
                {initials(deal.owner)}
              </AvatarFallback>
            </Avatar>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function SortableDealCard({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: deal.id })
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
      <DealCard deal={deal} />
    </div>
  )
}

function StageColumn({
  stage,
  stageDeals,
}: {
  stage: DealStage
  stageDeals: Deal[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const value = stageDeals.reduce((sum, deal) => sum + deal.value, 0)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className={`size-2 rounded-full ${dealStageDots[stage]}`} />
        <span className="text-sm font-medium">{stage}</span>
        <Badge variant="secondary">{stageDeals.length}</Badge>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          {formatCurrency(value, true)}
        </span>
      </div>

      <SortableContext
        items={stageDeals.map((deal) => deal.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            "flex min-h-28 flex-1 flex-col gap-3 rounded-xl bg-muted/50 p-3 transition-colors",
            isOver && "bg-primary/5 ring-2 ring-primary/30"
          )}
        >
          {stageDeals.map((deal) => (
            <SortableDealCard key={deal.id} deal={deal} />
          ))}

          {stageDeals.length === 0 && (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Drop a deal here.
            </p>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export default function CrmPipelinePage() {
  const [items, setItems] = React.useState<Deal[]>(initialDeals)
  const [activeDeal, setActiveDeal] = React.useState<Deal | null>(null)
  const originStage = React.useRef<DealStage | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const weighted = items.reduce(
    (sum, deal) => sum + (deal.value * deal.probability) / 100,
    0
  )

  function handleDragStart({ active }: DragStartEvent) {
    const deal = items.find((item) => item.id === String(active.id)) ?? null
    setActiveDeal(deal)
    originStage.current = deal?.stage ?? null
  }

  // Moving between stages happens on hover so the board reflows under the cursor.
  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)

    setItems((prev) => {
      const dragged = prev.find((item) => item.id === activeId)
      if (!dragged) return prev

      const overStage = isStageId(overId)
        ? overId
        : prev.find((item) => item.id === overId)?.stage
      if (!overStage || overStage === dragged.stage) return prev

      const without = prev.filter((item) => item.id !== activeId)
      const overIndex = without.findIndex((item) => item.id === overId)
      const insertAt = overIndex === -1 ? without.length : overIndex

      return [
        ...without.slice(0, insertAt),
        {
          ...dragged,
          stage: overStage,
          probability: stageProbability[overStage],
        },
        ...without.slice(insertAt),
      ]
    })
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    const from = originStage.current
    originStage.current = null
    setActiveDeal(null)
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    setItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === activeId)
      const newIndex = prev.findIndex((item) => item.id === overId)
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev
      if (prev[oldIndex].stage !== prev[newIndex].stage) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })

    const moved = items.find((item) => item.id === activeId)
    if (from && moved && moved.stage !== from) {
      toast.success(`${moved.name} moved to ${moved.stage}`)
    }
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Pipeline</h2>
          <p className="text-sm text-muted-foreground">
            {items.length} deals · {formatCurrency(weighted, true)} weighted ·
            drag a card to change stage
          </p>
        </div>
        <Button size="sm">
          <PlusIcon />
          New Deal
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveDeal(null)}
      >
        <div className="grid items-start gap-4 @2xl/main:grid-cols-2 @4xl/main:grid-cols-3 @6xl/main:grid-cols-5">
          {dealStages.map((stage) => (
            <StageColumn
              key={stage}
              stage={stage}
              stageDeals={items.filter((item) => item.stage === stage)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal ? <DealCard deal={activeDeal} overlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
