import * as React from "react"
import { Link } from "react-router"
import {
  BriefcaseBusinessIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  SquareCheckBigIcon,
  UsersIcon,
} from "lucide-react"

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

import { teamMembers } from "./data"
import { initials, memberBadgeStyles, memberStatusStyles } from "./status"

const departments = [
  "All departments",
  ...new Set(teamMembers.map((member) => member.department)),
]

export default function TeamPage() {
  const [query, setQuery] = React.useState("")
  const { value: search, pending: searching } = useDebouncedValue(query)
  const [department, setDepartment] = React.useState("All departments")

  const filtered = teamMembers.filter((member) => {
    const matchesDepartment =
      department === "All departments" || member.department === department
    const haystack = `${member.name} ${member.role} ${member.skills.join(" ")}`
    return matchesDepartment && haystack.toLowerCase().includes(search.toLowerCase())
  })

  function resetFilters() {
    setQuery("")
    setDepartment("All departments")
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Team</h2>
          <p
            className="text-sm text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {filtered.length} of {teamMembers.length} people
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            value={query}
            onValueChange={setQuery}
            busy={searching}
            placeholder="Search people"
            className="w-56"
          />
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3 @6xl/main:grid-cols-4">
        {filtered.map((member, index) => (
          <Link
            key={member.id}
            to={`/team/${member.id}`}
            style={{ "--i": index } as React.CSSProperties}
            className="group rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Card className="h-full gap-4 transition-colors group-hover:border-primary/40">
              <CardContent className="flex flex-col items-center gap-3 text-center">
                <Avatar className="size-16">
                  <AvatarFallback className="text-lg">
                    {initials(member.name)}
                  </AvatarFallback>
                  <AvatarBadge
                    className={`size-4! ${memberStatusStyles[member.status]}`}
                    aria-label={member.status}
                  />
                </Avatar>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{member.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {member.role}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className={memberBadgeStyles[member.status]}
                >
                  {member.status}
                </Badge>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span className="flex items-center justify-center gap-2">
                    <MailIcon className="size-3.5" />
                    {member.email}
                  </span>
                  <span className="flex items-center justify-center gap-2">
                    <MapPinIcon className="size-3.5" />
                    {member.location}
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-1">
                  {member.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <Separator />
              <CardFooter className="grid grid-cols-3 gap-2 text-center">
                <Stat
                  icon={<BriefcaseBusinessIcon />}
                  value={member.stats.projects}
                  label="Projects"
                />
                <Stat
                  icon={<SquareCheckBigIcon />}
                  value={member.stats.tasks}
                  label="Tasks"
                />
                <Stat
                  icon={<ClockIcon />}
                  value={member.stats.hours.split("h")[0] + "h"}
                  label="Logged"
                />
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState
              icon={UsersIcon}
              title="No team members found"
              description="Try a different search term, or switch back to all departments."
              action={{ label: "Clear filters", onClick: resetFilters }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: React.ReactNode
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="flex items-center gap-1 text-sm font-medium tabular-nums [&_svg]:size-3.5 [&_svg]:text-muted-foreground">
        {icon}
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
