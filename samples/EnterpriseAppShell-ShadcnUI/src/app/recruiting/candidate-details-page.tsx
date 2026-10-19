import * as React from "react"
import {
  BriefcaseIcon,
  CalendarPlusIcon,
  MailIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  SparklesIcon,
  StarIcon,
  UserSearchIcon,
} from "lucide-react"
import { Link, useParams } from "react-router"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import {
  formatDate,
  formatDay,
  formatTime,
  initials,
  type TranscriptAnalysis,
} from "./data"
import { CandidateFormSheet } from "./components/candidate-form"
import { InterviewFormSheet } from "./components/interview-form"
import {
  useCandidateById,
  useInterviewsFor,
  useRoleById,
} from "./store"
import {
  accentRings,
  kindStyles,
  priorityStyles,
  scoreColour,
  stageStyles,
} from "./status"

function averageScore(insight: TranscriptAnalysis) {
  return (
    insight.competencies.reduce((sum, item) => sum + item.score, 0) /
    insight.competencies.length
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  )
}

export default function RecruitingCandidateDetailsPage() {
  const { candidateId } = useParams()
  const candidate = useCandidateById(candidateId)
  const role = useRoleById(candidate?.roleId)
  const schedule = useInterviewsFor(candidateId)
  const [editOpen, setEditOpen] = React.useState(false)
  const [scheduleOpen, setScheduleOpen] = React.useState(false)

  if (!candidate || !role) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserSearchIcon />
            </EmptyMedia>
            <EmptyTitle>Candidate not found</EmptyTitle>
            <EmptyDescription>
              That record may have been merged or removed.
            </EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" asChild>
            <Link to="/recruiting/candidates">Back to candidates</Link>
          </Button>
        </Empty>
      </div>
    )
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 @2xl/main:flex-row @2xl/main:items-start @2xl/main:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="size-14">
            <AvatarFallback className={cn(accentRings[candidate.accent])}>
              {initials(candidate.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">{candidate.name}</h2>
              <Badge
                variant="secondary"
                className={stageStyles[candidate.stage]}
              >
                {candidate.stage}
              </Badge>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground tabular-nums">
                <StarIcon className="size-3.5 fill-warning text-warning" />
                {candidate.rating.toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {candidate.headline}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="size-3" />
                {candidate.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <MailIcon className="size-3" />
                {candidate.email}
              </span>
              <span className="inline-flex items-center gap-1">
                <PhoneIcon className="size-3" />
                {candidate.phone}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditOpen(true)}
          >
            <PencilIcon />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setScheduleOpen(true)}
          >
            <CalendarPlusIcon />
            Schedule
          </Button>
          <Button size="sm" asChild>
            <Link to="/recruiting/transcripts">
              <SparklesIcon />
              Transcripts
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-l-4 border-l-primary">
        <CardContent className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Next step
          </span>
          <span className="text-sm">{candidate.nextStep}</span>
        </CardContent>
      </Card>

      <div className="grid gap-4 @4xl/main:grid-cols-[minmax(0,1fr)_320px] @4xl/main:items-start">
        <Tabs defaultValue="profile" className="gap-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="interviews">
              Interviews
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">
                {schedule.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recruiter's read</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-pretty">{candidate.summary}</p>
                <Separator />
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="font-normal">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                <Row label="Current employer" value={candidate.currentEmployer} />
                <Row
                  label="Experience"
                  value={`${candidate.years} years`}
                />
                <Row label="Source" value={candidate.source} />
                <Row
                  label="Applied"
                  value={formatDate(candidate.appliedOn)}
                />
                <Row label="Recruiter" value={role.recruiter} />
                <Row label="Hiring manager" value={role.hiringManager} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interviews" className="flex flex-col gap-4">
            {schedule.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Nothing booked yet.
                </CardContent>
              </Card>
            )}
            {schedule.map((interview) => (
              <Card key={interview.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">
                      {formatDay(interview.start)}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className={kindStyles[interview.kind]}
                    >
                      {interview.kind}
                    </Badge>
                    {interview.insight && (
                      <span
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          scoreColour(averageScore(interview.insight))
                        )}
                      >
                        {averageScore(interview.insight).toFixed(1)}/5
                      </span>
                    )}
                  </div>
                  <CardDescription>
                    {formatTime(interview.start)} · {interview.durationMins} min
                    · {interview.room} · {interview.panel.join(", ")}
                  </CardDescription>
                </CardHeader>
                {interview.insight && (
                  <CardContent className="flex flex-col gap-3">
                    <p className="text-sm text-pretty text-muted-foreground">
                      {interview.insight.summary}
                    </p>
                    <Button size="sm" variant="outline" className="w-fit" asChild>
                      <Link to="/recruiting/transcripts">
                        <SparklesIcon />
                        Open the analysis
                      </Link>
                    </Button>
                  </CardContent>
                )}
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">History</CardTitle>
                <CardDescription>
                  Every touchpoint since the application landed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative flex flex-col gap-5 pl-6">
                  <span className="absolute top-2 bottom-2 left-[7px] w-px bg-border" />
                  {candidate.timeline.map((entry) => (
                    <div key={`${entry.at}-${entry.label}`} className="relative">
                      <span className="absolute top-1.5 -left-6 size-3.5 rounded-full border-2 border-background bg-muted-foreground/40" />
                      <p className="text-sm font-medium">{entry.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.detail}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.at)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="@4xl/main:sticky @4xl/main:top-4">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <BriefcaseIcon className="size-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base">{role.title}</CardTitle>
                <CardDescription>
                  {role.department} · {role.location}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className={priorityStyles[role.priority]}>
                {role.priority} priority
              </Badge>
              <Badge variant="outline" className="font-normal">
                {role.openings}{" "}
                {role.openings === 1 ? "opening" : "openings"}
              </Badge>
            </div>
            <p className="text-sm text-pretty text-muted-foreground">
              {role.summary}
            </p>
            <Separator />
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Must have
              </span>
              {role.mustHaves.map((item) => (
                <p key={item} className="text-sm">
                  {item}
                </p>
              ))}
            </div>
            <Separator />
            <div className="divide-y">
              <Row label="Salary range" value={role.salaryRange} />
              <Row label="Target start" value={formatDate(role.targetStart)} />
            </div>
          </CardContent>
        </Card>
      </div>

      <CandidateFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        candidate={candidate}
      />
      <InterviewFormSheet
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        interview={null}
        defaultCandidateId={candidate.id}
      />
    </div>
  )
}
