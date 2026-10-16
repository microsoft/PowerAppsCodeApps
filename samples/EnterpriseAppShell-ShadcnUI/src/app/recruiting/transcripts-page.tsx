import * as React from "react"
import {
  CheckCircle2Icon,
  CircleDashedIcon,
  ClockIcon,
  FileTextIcon,
  Loader2Icon,
  MessageSquareQuoteIcon,
  SparklesIcon,
  TriangleAlertIcon,
  UsersIcon,
} from "lucide-react"
import { Link } from "react-router"
import { toast } from "sonner"

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
import { Separator } from "@/components/ui/separator"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { notifyError } from "@/lib/error-toast"
import { cn } from "@/lib/utils"

import {
  ANALYSIS_FLOW,
  ANALYSIS_STEPS,
  analyseTranscript,
  type AgentStep,
} from "./agent"
import {
  formatDay,
  formatTime,
  initials,
  type Interview,
  type TranscriptAnalysis,
} from "./data"
import {
  kindStyles,
  quoteTagLabels,
  quoteTagStyles,
  scoreBar,
  scoreColour,
} from "./status"
import { useCandidates, useInterviews, useRoles } from "./store"

function StepRow({
  step,
  state,
}: {
  step: AgentStep
  state: "pending" | "running" | "done"
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
        {state === "done" && (
          <CheckCircle2Icon className="size-4 text-success" />
        )}
        {state === "running" && (
          <Loader2Icon className="size-4 animate-spin text-primary" />
        )}
        {state === "pending" && (
          <CircleDashedIcon className="size-4 text-muted-foreground/50" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm",
            state === "pending" ? "text-muted-foreground" : "font-medium"
          )}
        >
          {step.label}
        </p>
        <p className="text-xs text-muted-foreground">{step.detail}</p>
      </div>
    </div>
  )
}

function CompetencyRow({
  name,
  score,
  evidence,
  onEvidence,
}: {
  name: string
  score: number
  evidence: string
  onEvidence: () => void
}) {
  return (
    <div className="flex flex-col gap-1.5 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{name}</span>
        <span className={cn("text-sm font-semibold tabular-nums", scoreColour(score))}>
          {score}/5
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", scoreBar(score))}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
      <button
        type="button"
        onClick={onEvidence}
        className="text-left text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        {evidence}
      </button>
    </div>
  )
}

export default function RecruitingTranscriptsPage() {
  const interviews = useInterviews()
  const candidates = useCandidates()
  const roles = useRoles()

  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [results, setResults] = React.useState<
    Record<string, TranscriptAnalysis>
  >({})
  const [runIds, setRunIds] = React.useState<Record<string, string>>({})
  const [runningId, setRunningId] = React.useState<string | null>(null)
  const [stepIndex, setStepIndex] = React.useState(-1)
  const [tab, setTab] = React.useState("analysis")
  const [highlight, setHighlight] = React.useState<string | null>(null)

  const candidateById = (id?: string) =>
    candidates.find((item) => item.id === id)
  const roleById = (id?: string) => roles.find((item) => item.id === id)

  const analysable = interviews
    .filter((entry) => entry.transcript?.length)
    .sort((a, b) => b.start.localeCompare(a.start))

  const interview =
    analysable.find((entry) => entry.id === selectedId) ?? analysable[0]
  const candidate = candidateById(interview?.candidateId)
  const role = roleById(interview?.roleId)

  if (!interview || !candidate || !role) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTextIcon />
            </EmptyMedia>
            <EmptyTitle>No transcripts yet</EmptyTitle>
            <EmptyDescription>
              Paste your notes or a recording transcript onto a completed
              interview and it will show up here for analysis.
            </EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" asChild>
            <Link to="/recruiting/interviews">Go to interviews</Link>
          </Button>
        </Empty>
      </div>
    )
  }

  const analysis = results[interview.id]
  const averageScore = analysis
    ? analysis.competencies.reduce((sum, item) => sum + item.score, 0) /
      analysis.competencies.length
    : 0
  const isRunning = runningId === interview.id

  async function run(target: Interview) {
    setRunningId(target.id)
    setStepIndex(-1)
    setTab("analysis")
    try {
      const result = await analyseTranscript(target, (index) =>
        setStepIndex(index)
      )
      setResults((current) => ({ ...current, [target.id]: result.analysis }))
      setRunIds((current) => ({ ...current, [target.id]: result.runId }))
      toast.success("Analysis ready", {
        description: `${result.runId} · ${(result.durationMs / 1000).toFixed(1)}s · the decision is still yours`,
      })
    } catch (error) {
      notifyError(error, {
        code: "recruiting.analyse-transcript",
        title: "The analysis did not finish",
        hint: "Nothing was saved. Run it again when you are ready.",
        context: { interviewId: target.id },
        onRetry: () => void run(target),
      })
    } finally {
      setRunningId(null)
      setStepIndex(-1)
    }
  }

  function jumpTo(at: string) {
    setHighlight(at)
    setTab("transcript")
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Interview transcripts</h2>
          <p className="text-sm text-muted-foreground">
            {ANALYSIS_FLOW} reads the recording and drafts a scorecard. The
            hiring decision stays with the panel.
          </p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link to="/recruiting/interviews">Interview schedule</Link>
        </Button>
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-[320px_minmax(0,1fr)] @4xl/main:items-start">
        <Card className="@4xl/main:sticky @4xl/main:top-4">
          <CardHeader>
            <CardTitle className="text-base">Completed interviews</CardTitle>
            <CardDescription>
              {Object.keys(results).length} of {analysable.length} analysed
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 p-2">
            {analysable.map((entry) => {
              const person = candidateById(entry.candidateId)!
              const active = entry.id === interview.id
              const done = Boolean(results[entry.id])
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(entry.id)
                    setTab("analysis")
                    setHighlight(null)
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    active ? "bg-accent" : "hover:bg-accent/50"
                  )}
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="text-[10px]">
                      {initials(person.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {person.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.kind} · {formatDay(entry.start).split(",")[0]}
                    </p>
                  </div>
                  {done ? (
                    <SparklesIcon className="size-3.5 shrink-0 text-primary" />
                  ) : (
                    <span className="size-2 shrink-0 rounded-full bg-muted-foreground/40" />
                  )}
                </button>
              )
            })}
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 @2xl/main:flex-row @2xl/main:items-start @2xl/main:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="size-11">
                    <AvatarFallback>{initials(candidate.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">
                        <Link
                          to={`/recruiting/candidates/${candidate.id}`}
                          className="hover:underline"
                        >
                          {candidate.name}
                        </Link>
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className={kindStyles[interview.kind]}
                      >
                        {interview.kind}
                      </Badge>
                    </div>
                    <CardDescription>
                      {role.title} · {formatDay(interview.start)} at{" "}
                      {formatTime(interview.start)}
                    </CardDescription>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <UsersIcon className="size-3" />
                        {interview.panel.join(", ")}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ClockIcon className="size-3" />
                        {interview.durationMins} min
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FileTextIcon className="size-3" />
                        {interview.transcript?.length} turns
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => run(interview)}
                  disabled={isRunning}
                  variant={analysis ? "outline" : "default"}
                  className="shrink-0"
                >
                  {isRunning ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <SparklesIcon />
                  )}
                  {isRunning
                    ? "Analysing…"
                    : analysis
                      ? "Re-run analysis"
                      : "Analyse transcript"}
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Tabs value={tab} onValueChange={setTab} className="gap-4">
            <TabsList>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="transcript">
                Transcript
                <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">
                  {interview.transcript?.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="flex flex-col gap-4">
              {!analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {isRunning ? "Running the flow" : "Nothing analysed yet"}
                    </CardTitle>
                    <CardDescription>
                      {isRunning
                        ? `${ANALYSIS_FLOW} is working through the recording.`
                        : `${ANALYSIS_FLOW} will read the transcript and draft a scorecard against this requisition. It takes a few seconds.`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="divide-y">
                    {ANALYSIS_STEPS.map((step, index) => (
                      <StepRow
                        key={step.id}
                        step={step}
                        state={
                          !isRunning
                            ? "pending"
                            : index < stepIndex
                              ? "done"
                              : index === stepIndex
                                ? "running"
                                : "pending"
                        }
                      />
                    ))}
                  </CardContent>
                </Card>
              )}

              {analysis && (
                <>
                  <Card>
                    <CardHeader>
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-base">
                          What the transcript shows
                        </CardTitle>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {runIds[interview.id]}
                        </span>
                      </div>
                      <CardDescription className="text-pretty">
                        {analysis.summary}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      {analysis.flags.length > 0 && (
                        <div className="flex flex-col gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
                          <p className="text-xs font-medium text-muted-foreground">
                            Worth verifying before the panel meets
                          </p>
                          {analysis.flags.map((flag) => (
                            <p
                              key={flag}
                              className="flex items-start gap-2 text-sm"
                            >
                              <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0 text-warning" />
                              {flag}
                            </p>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Evidence and scores only. No advance, hold or reject
                        recommendation is produced — that call belongs to the
                        panel.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4 @3xl/main:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <CardTitle className="text-base">Scorecard</CardTitle>
                          <span
                            className={cn(
                              "text-sm font-semibold tabular-nums",
                              scoreColour(averageScore)
                            )}
                          >
                            {averageScore.toFixed(1)}/5 average
                          </span>
                        </div>
                        <CardDescription>
                          Each line is backed by a moment in the recording
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="divide-y">
                        {analysis.competencies.map((competency) => {
                          const quote = analysis.quotes.find(
                            (entry) => entry.id === competency.quoteId
                          )
                          return (
                            <CompetencyRow
                              key={competency.name}
                              name={competency.name}
                              score={competency.score}
                              evidence={competency.evidence}
                              onEvidence={() => quote && jumpTo(quote.at)}
                            />
                          )
                        })}
                      </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">
                            Strengths and concerns
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                          {analysis.strengths.map((item) => (
                            <p key={item} className="flex items-start gap-2 text-sm">
                              <CheckCircle2Icon className="mt-0.5 size-3.5 shrink-0 text-success" />
                              {item}
                            </p>
                          ))}
                          {analysis.concerns.length > 0 && (
                            <Separator className="my-1" />
                          )}
                          {analysis.concerns.map((item) => (
                            <p key={item} className="flex items-start gap-2 text-sm">
                              <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                              {item}
                            </p>
                          ))}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">
                            Conversation shape
                          </CardTitle>
                          <CardDescription>{analysis.sentiment}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                          <div className="flex h-2 w-full overflow-hidden rounded-full">
                            <div
                              className="bg-chart-2"
                              style={{ width: `${analysis.talkTime.interviewer}%` }}
                            />
                            <div
                              className="bg-chart-1"
                              style={{ width: `${analysis.talkTime.candidate}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              Panel {analysis.talkTime.interviewer}%
                            </span>
                            <span>
                              Candidate {analysis.talkTime.candidate}%
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Moments worth re-reading
                      </CardTitle>
                      <CardDescription>
                        Select a quote to jump to it in the transcript
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      {analysis.quotes.map((quote) => (
                        <button
                          key={quote.id}
                          type="button"
                          onClick={() => jumpTo(quote.at)}
                          className={cn(
                            "flex w-full flex-col gap-1.5 rounded-lg border border-l-4 p-3 text-left transition-colors hover:bg-accent/40",
                            quoteTagStyles[quote.tag]
                          )}
                        >
                          <p className="text-sm text-pretty italic">
                            “{quote.text}”
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MessageSquareQuoteIcon className="size-3" />
                            <span className="tabular-nums">{quote.at}</span>
                            <span>·</span>
                            <span>{quote.speaker}</span>
                            <span>·</span>
                            <span>{quoteTagLabels[quote.tag]}</span>
                          </div>
                        </button>
                      ))}
                    </CardContent>
                  </Card>

                  {analysis.followUps.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Suggested follow-ups
                        </CardTitle>
                        <CardDescription>
                          What the next conversation should close down
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2.5">
                        {analysis.followUps.map((item, index) => (
                          <p key={item} className="flex items-start gap-3 text-sm">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium tabular-nums">
                              {index + 1}
                            </span>
                            {item}
                          </p>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="transcript">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {formatDay(interview.start)}
                  </CardTitle>
                  <CardDescription>
                    Diarised automatically from the recording
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  {interview.transcript?.map((line, index) => (
                    <div
                      key={`${line.at}-${index}`}
                      className={cn(
                        "flex gap-3 rounded-lg p-3 transition-colors",
                        line.role === "Candidate" ? "bg-muted/40" : undefined,
                        highlight === line.at &&
                          "bg-primary/10 ring-1 ring-primary/30"
                      )}
                    >
                      <span className="w-12 shrink-0 pt-0.5 text-xs text-muted-foreground tabular-nums">
                        {line.at}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          {line.speaker}
                        </p>
                        <p className="text-sm text-pretty">{line.text}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
