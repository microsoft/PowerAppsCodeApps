import * as React from "react"
import {
  ArrowLeftIcon,
  CalendarClockIcon,
  CheckIcon,
  CopyIcon,
  Loader2Icon,
  LockIcon,
  MousePointerClickIcon,
  SendIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react"
import { Link, useParams } from "react-router"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { notifyError } from "@/lib/error-toast"

import {
  AGENT_NAME,
  FLOW_NAME,
  REFINEMENTS,
  runCommsAgent,
  type RefinementId,
} from "./agent"
import {
  engagementRate,
  formatCompact,
  getComm,
  initials,
  readingMinutes,
  timelineFor,
  wordCount,
} from "./data"
import {
  channelStyles,
  commStatusStyles,
  commTypeStyles,
  toneStyles,
} from "./status"

export default function CommsDetailsPage() {
  const { commId } = useParams()
  const comm = getComm(commId)

  const [subject, setSubject] = React.useState(comm?.subject ?? "")
  const [body, setBody] = React.useState(comm?.body ?? "")
  const [running, setRunning] = React.useState<RefinementId | null>(null)

  if (!comm) {
    return (
      <div className="@container/main flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm font-medium">Communication not found</p>
        <Button variant="outline" size="sm" asChild>
          <Link to="/comms/list">
            <ArrowLeftIcon />
            Back to the library
          </Link>
        </Button>
      </div>
    )
  }

  const timeline = timelineFor(comm.id)
  const engagement = engagementRate(comm)

  async function refine(id: RefinementId, label: string) {
    if (!comm) return
    setRunning(id)
    try {
      const result = await runCommsAgent({
        type: comm.type,
        tone: id === "formal" ? "Formal" : id === "warmer" ? "Warm" : comm.tone,
        audiences: comm.audiences,
        channels: comm.channels,
        headline: comm.title,
        keyPoints: comm.keyMessages.join("\n"),
        spokesperson: comm.approver,
        length: id === "shorten" ? "Short" : "Standard",
        includeQuote: id === "quote",
        includeBoilerplate: comm.type === "Press Release",
      })
      setSubject(result.subject)
      setBody(result.body)
      toast.success(`Rewritten: ${label.toLowerCase()}`, {
        description: `${AGENT_NAME} · ${result.runId} · ${(result.durationMs / 1000).toFixed(1)}s`,
      })
    } catch (error) {
      notifyError(error, {
        code: "comms.refine-draft",
        title: "The rewrite did not go through",
        hint: "Your current draft is untouched.",
        context: { commId: comm.id, refinement: id },
        onRetry: () => void refine(id, label),
      })
    } finally {
      setRunning(null)
    }
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="-ml-2 h-7 w-fit px-2 text-muted-foreground"
          >
            <Link to="/comms/list">
              <ArrowLeftIcon />
              All communications
            </Link>
          </Button>
          <h2 className="text-xl font-semibold">{comm.title}</h2>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className={commTypeStyles[comm.type]}>
              {comm.type}
            </Badge>
            <Badge variant="secondary" className={commStatusStyles[comm.status]}>
              {comm.status}
            </Badge>
            <Badge variant="secondary" className={toneStyles[comm.tone]}>
              {comm.tone}
            </Badge>
            {comm.aiGenerated && (
              <Badge variant="outline" className="gap-1 font-normal">
                <SparklesIcon className="size-3" />
                Agent drafted
              </Badge>
            )}
            {comm.embargoUntil && (
              <Badge variant="outline" className="gap-1 font-normal">
                <LockIcon className="size-3" />
                Embargo to {comm.embargoUntil}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void navigator.clipboard?.writeText(`${subject}\n\n${body}`)
              toast.success("Copied to clipboard")
            }}
          >
            <CopyIcon />
            Copy
          </Button>
          <Button
            size="sm"
            onClick={() =>
              toast.success(
                comm.status === "Published"
                  ? "Resend queued"
                  : "Sent for approval",
                { description: `${comm.approver} has been notified.` }
              )
            }
          >
            <SendIcon />
            {comm.status === "Published" ? "Resend" : "Send for approval"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-[minmax(0,1fr)_320px] @4xl/main:items-start">
        <Tabs defaultValue="content" className="gap-4">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="agent">Agent</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Draft</CardTitle>
                <CardDescription>
                  {wordCount(body)} words · {readingMinutes(body)} min read
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="comm-subject">Subject</Label>
                  <Input
                    id="comm-subject"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="comm-body">Body</Label>
                  <Textarea
                    id="comm-body"
                    rows={16}
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    className="leading-relaxed"
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-2 border-t">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSubject(comm.subject)
                    setBody(comm.body)
                    toast.success("Reverted to the saved version")
                  }}
                >
                  Revert
                </Button>
                <Button onClick={() => toast.success("Changes saved")}>
                  Save changes
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key messages</CardTitle>
                <CardDescription>
                  Every channel must carry these three points.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {comm.keyMessages.map((message) => (
                  <div
                    key={message}
                    className="flex items-start gap-2 rounded-lg border p-3 text-sm"
                  >
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" />
                    {message}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agent" className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Ask the agent</CardTitle>
                <CardDescription>
                  Each button calls{" "}
                  <span className="font-mono text-xs">{FLOW_NAME}</span> with the
                  current content and rewrites the draft in place.
                </CardDescription>
                <CardAction>
                  <Badge variant="secondary" className="gap-1.5">
                    <SparklesIcon className="size-3" />
                    {AGENT_NAME}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {REFINEMENTS.map((option) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    size="sm"
                    disabled={running !== null}
                    onClick={() => void refine(option.id, option.label)}
                  >
                    {running === option.id ? (
                      <Loader2Icon className="animate-spin" />
                    ) : (
                      <SparklesIcon />
                    )}
                    {option.label}
                  </Button>
                ))}
              </CardContent>
              <CardFooter className="border-t">
                <p className="text-xs text-muted-foreground">
                  {running
                    ? "The flow is running. The draft on the Content tab updates when it finishes."
                    : "Rewrites replace the working draft only. Nothing is published until you send it for approval."}
                </p>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">How this was made</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <Row label="Source" value={comm.aiGenerated ? `${AGENT_NAME} draft, human edited` : "Written by hand"} />
                <Row label="Flow" value={FLOW_NAME} />
                <Row label="Template" value={`${comm.type} — standard`} />
                <Row label="Brand voice" value={`${comm.tone} · messaging house v4`} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="flex flex-col gap-4">
            <div className="grid gap-4 @2xl/main:grid-cols-3">
              <Metric
                icon={<UsersIcon />}
                label="Reach"
                value={formatCompact(comm.reach)}
              />
              <Metric
                icon={<SendIcon />}
                label="Opens"
                value={comm.opens ? formatCompact(comm.opens) : "—"}
              />
              <Metric
                icon={<MousePointerClickIcon />}
                label="Clicks"
                value={comm.clicks ? formatCompact(comm.clicks) : "—"}
              />
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Engagement</CardTitle>
                <CardDescription>
                  {engagement === null
                    ? "No engagement data yet — this has not been published."
                    : `${engagement}% of recipients opened it.`}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Progress value={engagement ?? 0} />
                <Separator />
                <div className="flex flex-col gap-3 text-sm">
                  <Row
                    label="Click-through"
                    value={
                      comm.clicks && comm.reach
                        ? `${((comm.clicks / comm.reach) * 100).toFixed(1)}%`
                        : "—"
                    }
                  />
                  <Row
                    label="Published"
                    value={comm.publishedOn ?? comm.scheduledFor ?? "Not yet"}
                  />
                  <Row label="Campaign" value={comm.campaign} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-0">
                {timeline.map((event, index) => (
                  <div key={`${event.at}-${index}`} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                      {index < timeline.length - 1 && (
                        <span className="w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col pb-5">
                      <span className="text-sm font-medium">{event.action}</span>
                      <span className="text-xs text-muted-foreground">
                        {event.actor} · {event.at}
                      </span>
                      {event.detail && (
                        <span className="mt-1 text-sm text-muted-foreground">
                          {event.detail}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <Row label="Reference" value={comm.id} />
              <Row label="Campaign" value={comm.campaign} />
              <Row label="Created" value={comm.createdOn} />
              <Row label="Last edited" value={comm.updatedOn} />
              {comm.scheduledFor && (
                <Row label="Scheduled" value={comm.scheduledFor} />
              )}
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Owner</span>
                <span className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[10px]">
                      {initials(comm.owner)}
                    </AvatarFallback>
                  </Avatar>
                  {comm.owner}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Approver</span>
                <span className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[10px]">
                      {initials(comm.approver)}
                    </AvatarFallback>
                  </Avatar>
                  {comm.approver}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Channels
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {comm.channels.map((channel) => (
                    <Badge
                      key={channel}
                      variant="secondary"
                      className={channelStyles[channel]}
                    >
                      {channel}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Audiences
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {comm.audiences.map((audience) => (
                    <Badge key={audience} variant="outline" className="font-normal">
                      {audience}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            {comm.scheduledFor && (
              <CardFooter className="border-t">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarClockIcon className="size-3.5" />
                  Sends automatically on {comm.scheduledFor}
                </p>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4">
          {icon}
        </span>
        <span className="flex flex-col">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xl font-semibold tabular-nums">{value}</span>
        </span>
      </CardContent>
    </Card>
  )
}
