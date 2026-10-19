import * as React from "react"
import {
  BookmarkIcon,
  ClockIcon,
  LayersIcon,
  PlayIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { SearchInput } from "@/components/common/search-input"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { cn } from "@/lib/utils"

import {
  currentHireId,
  hireById,
  learningCategories,
  learningModules,
  contentItems,
  type LearningModule,
} from "./data"
import { accentGradients, levelStyles } from "./status"

function ModuleCard({
  module,
  done,
  saved,
  onToggleSave,
}: {
  module: LearningModule
  done: boolean
  saved: boolean
  onToggleSave: () => void
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      <div
        className={cn(
          "relative flex h-28 items-end bg-gradient-to-br p-4",
          accentGradients[module.accent]
        )}
      >
        <span className="absolute top-3 right-3 flex gap-1.5">
          {done && (
            <Badge variant="secondary" className="bg-success/15 text-success">
              Completed
            </Badge>
          )}
          <button
            type="button"
            onClick={onToggleSave}
            aria-label={saved ? "Remove from list" : "Save to list"}
            className={cn(
              "flex size-7 items-center justify-center rounded-md border bg-background/70 backdrop-blur transition-colors hover:bg-background",
              saved && "border-primary text-primary"
            )}
          >
            <BookmarkIcon className={cn("size-3.5", saved && "fill-current")} />
          </button>
        </span>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-background/70 backdrop-blur">
            {module.category}
          </Badge>
          <Badge variant="secondary" className={levelStyles[module.level]}>
            {module.level}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-medium text-balance">{module.title}</h3>
        <p className="flex-1 text-sm text-muted-foreground">{module.summary}</p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="size-3" />
            {module.minutes} min
          </span>
          <span className="inline-flex items-center gap-1">
            <LayersIcon className="size-3" />
            {module.lessons} lessons
          </span>
          <span className="inline-flex items-center gap-1">
            <UsersIcon className="size-3" />
            {module.learners}
          </span>
          <span className="inline-flex items-center gap-1">
            <StarIcon className="size-3 fill-warning text-warning" />
            {module.rating.toFixed(1)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          <span className="truncate text-xs text-muted-foreground">
            by {module.owner}
          </span>
          <Button
            size="sm"
            variant={done ? "outline" : "default"}
            onClick={() =>
              toast.success(done ? "Reopened" : "Enrolled", {
                description: `${module.title} · ${module.lessons} lessons`,
              })
            }
          >
            <PlayIcon />
            {done ? "Revisit" : "Start"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingLearningPage() {
  const hire = hireById(currentHireId)!
  const [query, setQuery] = React.useState("")
  const { value: search, pending: searching } = useDebouncedValue(query)
  const [category, setCategory] = React.useState("All")
  const [saved, setSaved] = React.useState<string[]>([])

  const completedModuleIds = contentItems
    .filter(
      (item) => item.moduleId && hire.completed.includes(item.id)
    )
    .map((item) => item.moduleId as string)

  const filtered = learningModules.filter((module) => {
    const haystack =
      `${module.title} ${module.summary} ${module.owner} ${module.tags.join(" ")}`.toLowerCase()
    if (search && !haystack.includes(search.toLowerCase())) return false
    if (category !== "All" && module.category !== category) return false
    return true
  })

  const required = filtered.filter((module) => module.required)
  const optional = filtered.filter((module) => !module.required)

  function toggleSave(module: LearningModule) {
    const isSaved = saved.includes(module.id)
    setSaved((current) =>
      isSaved
        ? current.filter((id) => id !== module.id)
        : [...current, module.id]
    )
    toast(isSaved ? "Removed from your list" : "Saved to your list", {
      description: module.title,
    })
  }

  const renderCard = (module: LearningModule) => (
    <ModuleCard
      key={module.id}
      module={module}
      done={completedModuleIds.includes(module.id)}
      saved={saved.includes(module.id)}
      onToggleSave={() => toggleSave(module)}
    />
  )

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Learning library</h2>
          <p className="text-sm text-muted-foreground">
            {learningModules.length} modules ·{" "}
            {learningModules.filter((module) => module.required).length}{" "}
            mandatory for everyone
          </p>
        </div>
        <SearchInput
          value={query}
          onValueChange={setQuery}
          busy={searching}
          placeholder="Search the library"
          className="w-full sm:w-64"
        />
      </div>

      <ToggleGroup
        type="single"
        value={category}
        onValueChange={(value) => value && setCategory(value)}
        variant="outline"
        size="sm"
        className="w-fit flex-wrap"
      >
        <ToggleGroupItem value="All">All</ToggleGroupItem>
        {learningCategories.map((option) => (
          <ToggleGroupItem key={option} value={option}>
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {filtered.length === 0 && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Nothing matches that</EmptyTitle>
            <EmptyDescription>
              Try a different category or clear the search.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {required.length > 0 && (
        <section className="flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-medium">Required of everyone</h3>
            <p className="text-sm text-muted-foreground">
              Assigned automatically and refreshed every year
            </p>
          </div>
          <div className="grid gap-4 @2xl/main:grid-cols-2 @5xl/main:grid-cols-3">
            {required.map(renderCard)}
          </div>
        </section>
      )}

      {optional.length > 0 && (
        <section className="flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-medium">Recommended for you</h3>
            <p className="text-sm text-muted-foreground">
              Based on the {hire.department.toLowerCase()} track and your first
              90 days
            </p>
          </div>
          <div className="grid gap-4 @2xl/main:grid-cols-2 @5xl/main:grid-cols-3">
            {optional.map(renderCard)}
          </div>
        </section>
      )}
    </div>
  )
}
