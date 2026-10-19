import { Link, useParams } from "react-router"
import {
  ArrowLeftIcon,
  BadgeCheckIcon,
  BuildingIcon,
  MailIcon,
  MapPinIcon,
  MessageSquareIcon,
  UserPlusIcon,
} from "lucide-react"

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { getTeamMember } from "./data"
import {
  dealStatusStyles,
  initials,
  memberBadgeStyles,
  memberStatusStyles,
} from "./status"

export default function TeamMemberPage() {
  const { memberId } = useParams()
  const member = getTeamMember(memberId)

  if (!member) {
    return (
      <div className="@container/main flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div>
          <h2 className="text-xl font-semibold">Team member not found</h2>
          <p className="text-sm text-muted-foreground">
            The profile you are looking for does not exist.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/team">
            <ArrowLeftIcon />
            Back to team
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Button asChild variant="ghost" size="sm" className="w-fit -ml-2">
        <Link to="/team">
          <ArrowLeftIcon />
          Team
        </Link>
      </Button>

      <Card className="overflow-hidden pt-0">
        <div className="h-28 bg-linear-to-r from-primary/25 via-primary/10 to-transparent" />
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Avatar className="-mt-14 size-24 ring-4 ring-background">
              <AvatarFallback className="text-2xl">
                {initials(member.name)}
              </AvatarFallback>
              <AvatarBadge
                className={`size-5! ${memberStatusStyles[member.status]}`}
                aria-label={member.status}
              />
            </Avatar>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{member.name}</h2>
                <BadgeCheckIcon className="size-4 text-primary" />
                <Badge
                  variant="secondary"
                  className={memberBadgeStyles[member.status]}
                >
                  {member.status}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {member.role}
              </span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <BuildingIcon className="size-3.5" />
                  {member.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPinIcon className="size-3.5" />
                  {member.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <MailIcon className="size-3.5" />
                  {member.email}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm">
              <UserPlusIcon />
              Connect
            </Button>
            <Button variant="outline" size="icon" className="size-8">
              <MessageSquareIcon />
              <span className="sr-only">Message {member.name}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="gap-4 md:gap-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">
            Projects
            <Badge variant="secondary">{member.projects.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className="grid items-start gap-4 md:gap-6 lg:grid-cols-3"
        >
          <div className="flex flex-col gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>General Info</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <InfoRow label="Phone" value={member.phone} />
                <InfoRow label="Email" value={member.email} />
                <InfoRow label="Department" value={member.department} />
                <InfoRow label="Type" value={member.employmentType} />
                <InfoRow label="Joined" value={member.joinedAt} />
                <InfoRow label="Last active" value={member.lastActive} />
                <Separator />
                <p className="text-muted-foreground">{member.bio}</p>
                <div className="flex flex-wrap gap-1">
                  {member.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attributes</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                {member.attributes.map((attribute) => (
                  <InfoRow
                    key={attribute.label}
                    label={attribute.label}
                    value={attribute.value}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Deals</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Deal Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {member.deals.map((deal) => (
                    <TableRow key={deal.name}>
                      <TableCell className="pl-6 font-medium">
                        {deal.name}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {deal.amount}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={dealStatusStyles[deal.status]}
                        >
                          {deal.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-muted-foreground">
                        {deal.duration}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Projects</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {member.projects.map((project) => (
                <div key={project.name} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-muted-foreground tabular-nums">
                      Due {project.dueDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={project.progress} className="flex-1" />
                    <span className="w-10 text-right text-xs tabular-nums">
                      {project.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {member.activity.map((entry) => (
                <div key={entry.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                    <span className="w-px flex-1 bg-border" />
                  </div>
                  <div className="flex flex-col gap-0.5 pb-1">
                    <span className="text-sm font-medium">{entry.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {entry.detail}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {entry.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
