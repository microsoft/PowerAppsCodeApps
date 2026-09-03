import * as React from "react"
import { FileTextIcon, SparklesIcon } from "lucide-react"
import { Link } from "react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

import { commTypes, templates } from "./data"
import { commTypeStyles, toneStyles } from "./status"

export default function CommsTemplatesPage() {
  const [query, setQuery] = React.useState("")
  const { value: search, pending: searching } = useDebouncedValue(query)
  const [type, setType] = React.useState("All")

  const filtered = templates.filter((template) => {
    const haystack = `${template.name} ${template.description} ${template.type}`.toLowerCase()
    if (search && !haystack.includes(search.toLowerCase())) return false
    if (type !== "All" && template.type !== type) return false
    return true
  })

  const usedTypes = commTypes.filter((option) =>
    templates.some((template) => template.type === option)
  )

  function resetFilters() {
    setQuery("")
    setType("All")
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Templates</h2>
          <p className="text-sm text-muted-foreground">
            The structures the agent drafts against. Editing one changes every
            future draft of that type.
          </p>
        </div>
        <SearchInput
          value={query}
          onValueChange={setQuery}
          busy={searching}
          placeholder="Search templates"
          className="w-full sm:w-64"
        />
      </div>

      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={type}
        onValueChange={(value) => setType(value || "All")}
        className="flex flex-wrap justify-start gap-1.5"
      >
        <ToggleGroupItem value="All" className="rounded-md! border! px-3">
          All
        </ToggleGroupItem>
        {usedTypes.map((option) => (
          <ToggleGroupItem
            key={option}
            value={option}
            className="rounded-md! border! px-3"
          >
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="grid gap-4 @2xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        {filtered.map((template) => (
          <Card key={template.id} className="gap-4">
            <CardHeader>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant="secondary"
                  className={commTypeStyles[template.type]}
                >
                  {template.type}
                </Badge>
                <Badge variant="secondary" className={toneStyles[template.tone]}>
                  {template.tone}
                </Badge>
              </div>
              <div className="flex flex-col gap-1.5">
                {template.sections.map((section, index) => (
                  <div
                    key={section}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                      {index + 1}
                    </span>
                    {section}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-between gap-2 border-t">
              <span className="text-xs text-muted-foreground">
                {template.uses} uses · updated {template.updatedOn}
              </span>
              <Button size="sm" variant="outline" asChild>
                <Link to="/comms/compose">
                  <SparklesIcon />
                  Use
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState
              icon={FileTextIcon}
              title="No templates match that filter"
              description="Try a different search term, or switch back to all types."
              action={{ label: "Clear filters", onClick: resetFilters }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
