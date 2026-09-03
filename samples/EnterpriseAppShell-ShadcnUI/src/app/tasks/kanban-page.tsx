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
import { CalendarIcon, MessageSquareIcon, PencilIcon, PlusIcon } from "lucide-react"
import { Link } from "react-router"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

import { taskColumns, type Task, type TaskColumn } from "./data"
import { columnStyles, initials, priorityStyles } from "./status"
import { saveTask, useTasks } from "./store"
import { TaskFormDrawer } from "./components/task-form"

function isColumnId(id: string): id is TaskColumn {
  return (taskColumns as string[]).includes(id)
}

function TaskCard({
  task,
  overlay,
  onEdit,
}: {
  task: Task
  overlay?: boolean
  onEdit?: () => void
}) {
  return (
    <Card
      className={cn(
        "gap-3 py-4 transition-colors hover:border-primary/40",
        overlay && "border-primary/50 shadow-lg"
      )}
    >
      <CardContent className="flex flex-col gap-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/tasks/details/${task.id}`}
            className="text-sm font-medium hover:underline"
          >
            {task.title}
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Badge variant="secondary" className={priorityStyles[task.priority]}>
              {task.priority}
            </Badge>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label={`Edit ${task.title}`}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={onEdit}
              >
                <PencilIcon />
              </Button>
            )}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{task.project}</span>
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <Badge key={label} variant="outline">
              {label}
            </Badge>
          ))}
        </div>
        <Progress value={task.progress} />
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarIcon className="size-3.5" />
            {task.dueDate}
          </span>
          <span className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <MessageSquareIcon className="size-3.5" />
              {task.comments.length}
            </span>
            <Avatar className="size-6">
              <AvatarFallback className="text-[10px]">
                {initials(task.assignee)}
              </AvatarFallback>
            </Avatar>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function SortableTaskCard({
  task,
  onEdit,
}: {
  task: Task
  onEdit: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })
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
      // A drag ends with a click; swallow it so the title link does not navigate.
      onClickCapture={(event) => {
        const start = pointerStart.current
        if (!start) return
        const moved = Math.hypot(
          event.clientX - start.x,
          event.clientY - start.y
        )
        if (moved > 4) {
          event.preventDefault()
          event.stopPropagation()
        }
      }}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} onEdit={onEdit} />
    </div>
  )
}

function BoardColumn({
  column,
  columnTasks,
  onEdit,
}: {
  column: TaskColumn
  columnTasks: Task[]
  onEdit: (task: Task) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className={`size-2 rounded-full ${columnStyles[column]}`} />
        <span className="text-sm font-medium">{column}</span>
        <Badge variant="secondary">{columnTasks.length}</Badge>
      </div>

      <SortableContext
        items={columnTasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            "flex min-h-28 flex-1 flex-col gap-3 rounded-xl bg-muted/50 p-3 transition-colors",
            isOver && "bg-primary/5 ring-2 ring-primary/30"
          )}
        >
          {columnTasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onEdit={() => onEdit(task)}
            />
          ))}

          {columnTasks.length === 0 && (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Drop a task here.
            </p>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export default function TasksKanbanPage() {
  const stored = useTasks()
  // The store owns the data; this only remembers the manual card order.
  const [order, setOrder] = React.useState<string[]>(() =>
    stored.map((task) => task.id)
  )
  const [activeTask, setActiveTask] = React.useState<Task | null>(null)
  const [editing, setEditing] = React.useState<Task | undefined>()
  const [formOpen, setFormOpen] = React.useState(false)
  const originColumn = React.useRef<TaskColumn | null>(null)

  const items = React.useMemo(() => {
    const byId = new Map(stored.map((task) => [task.id, task]))
    const ranked = order
      .map((id) => byId.get(id))
      .filter((task): task is Task => Boolean(task))
    const seen = new Set(ranked.map((task) => task.id))
    return [...ranked, ...stored.filter((task) => !seen.has(task.id))]
  }, [stored, order])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function openForm(task?: Task) {
    setEditing(task)
    setFormOpen(true)
  }

  function handleDragStart({ active }: DragStartEvent) {
    const task = items.find((item) => item.id === String(active.id)) ?? null
    setActiveTask(task)
    originColumn.current = task?.column ?? null
  }

  // Moving between columns happens on hover so the board reflows under the cursor.
  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)

    const dragged = items.find((item) => item.id === activeId)
    if (!dragged) return

    const overColumn = isColumnId(overId)
      ? overId
      : items.find((item) => item.id === overId)?.column
    if (!overColumn || overColumn === dragged.column) return

    const without = items
      .map((item) => item.id)
      .filter((id) => id !== activeId)
    const overIndex = without.indexOf(overId)
    const insertAt = overIndex === -1 ? without.length : overIndex
    setOrder([
      ...without.slice(0, insertAt),
      activeId,
      ...without.slice(insertAt),
    ])
    saveTask({ ...dragged, column: overColumn })
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    const from = originColumn.current
    originColumn.current = null
    setActiveTask(null)
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    const ids = items.map((item) => item.id)
    const oldIndex = ids.indexOf(activeId)
    const newIndex = ids.indexOf(overId)
    const moved = items.find((item) => item.id === activeId)
    if (
      oldIndex !== -1 &&
      newIndex !== -1 &&
      oldIndex !== newIndex &&
      moved?.column === items[newIndex].column
    ) {
      setOrder(arrayMove(ids, oldIndex, newIndex))
    }

    if (from && moved && moved.column !== from) {
      toast.success(`${moved.id} moved to ${moved.column}`)
    }
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Task Board</h2>
          <p className="text-sm text-muted-foreground">
            {items.length} tasks across {taskColumns.length} columns · drag a
            card to move it
          </p>
        </div>
        <Button size="sm" onClick={() => openForm()}>
          <PlusIcon />
          New Task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveTask(null)}
      >
        <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
          {taskColumns.map((column) => (
            <BoardColumn
              key={column}
              column={column}
              columnTasks={items.filter((item) => item.column === column)}
              onEdit={openForm}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} overlay /> : null}
        </DragOverlay>
      </DndContext>

      <TaskFormDrawer
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
      />
    </div>
  )
}
