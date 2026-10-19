import * as React from "react"
import {
  CheckIcon,
  CircleDashedIcon,
  CopyIcon,
  Loader2Icon,
  SaveIcon,
  SendIcon,
  SparklesIcon,
  TriangleAlertIcon,
  WorkflowIcon,
} from "lucide-react"
import { useNavigate } from "react-router"
import { toast } from "sonner"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { notifyError } from "@/lib/error-toast"
import { cn } from "@/lib/utils"

import {
  AGENT_NAME,
  AGENT_STEPS,
  FLOW_NAME,
  REFINEMENTS,
  runCommsAgent,
  type AgentBrief,
  type AgentDraft,
  type RefinementId,
} from "./agent"
import {
  audiences,
  channels,
  commTypes,
  templates,
  tones,
  type Channel,
  type CommType,
  type Tone,
} from "./data"
import { commTypeStyles, toneStyles } from "./status"

const lengths = ["Short", "Standard", "Detailed"] as const

const typeHints: Record<CommType, string> = {
  "Internal Email": "Goes to employees. Say what changes and what they should do.",
  "External Email": "Goes to customers or partners. Lead with impact, not context.",
  "Press Release": "Dateline, announcement, proof point, quote, availability.",
  "Press Note": "Factual only. No speculation, no adjectives, no blame.",
  "Executive Memo": "State the decision first, then the reasoning.",
  Newsletter: "One lead story, then the numbers that moved.",
  "Social Post": "Under 900 characters. Hook in the first line.",
  "Crisis Statement": "What we know, what we are doing, when we update next.",
}

export default function CommsComposePage() {
  const navigate = useNavigate()

  const [type, setType] = React.useState<CommType>("Press Release")
  const [tone, setTone] = React.useState<Tone>("Formal")
  const [headline, setHeadline] = React.useState(
    "the expansion of its Memphis plant, adding 120 roles"
  )
  const [keyPoints, setKeyPoints] = React.useState(
    "A 9,000 m² expansion breaks ground in November.\n120 roles are created, 80 of them on the production floor.\nThe site will be the first in the network to run fully on renewable supply.\nRecruitment for the first 40 positions opens in October."
  )
  const [selectedAudiences, setSelectedAudiences] = React.useState<string[]>([
    "Media",
    "Candidates",
  ])
  const [selectedChannels, setSelectedChannels] = React.useState<Channel[]>([
    "Newsroom",
  ])
  const [spokesperson, setSpokesperson] = React.useState("Dana Whitfield, COO")
  const [length, setLength] = React.useState<(typeof lengths)[number]>("Standard")
  const [includeQuote, setIncludeQuote] = React.useState(true)
  const [includeBoilerplate, setIncludeBoilerplate] = React.useState(true)

  const [running, setRunning] = React.useState(false)
  const [stepIndex, setStepIndex] = React.useState(-1)
  const [draft, setDraft] = React.useState<AgentDraft | null>(null)
  const [body, setBody] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [refinement, setRefinement] = React.useState<RefinementId | null>(null)

  const brief: AgentBrief = {
    type,
    tone,
    audiences: selectedAudiences,
    channels: selectedChannels,
    headline,
    keyPoints,
    spokesperson,
    length,
    includeQuote,
    includeBoilerplate,
  }

  const canRun = headline.trim().length > 8 && keyPoints.trim().length > 12

  async function generate(label = "Draft ready") {
    setRunning(true)
    setStepIndex(-1)
    setRefinement(null)
    try {
      const result = await runCommsAgent(brief, (index) => setStepIndex(index))
      setDraft(result)
      setSubject(result.subject)
      setBody(result.body)
      setStepIndex(AGENT_STEPS.length)
      toast.success(label, {
        description: `${FLOW_NAME} · ${result.runId} · ${(result.durationMs / 1000).toFixed(1)}s`,
      })
    } catch (error) {
      setStepIndex(-1)
      notifyError(error, {
        code: "comms.generate-draft",
        title: "The draft could not be generated",
        hint: "Your brief is still here. Run it again when you are ready.",
        onRetry: () => void generate(label),
      })
    } finally {
      setRunning(false)
    }
  }

  async function refine(id: RefinementId, label: string) {
    setRefinement(id)
    const next: AgentBrief = {
      ...brief,
      length: id === "shorten" ? "Short" : length,
      tone: id === "formal" ? "Formal" : id === "warmer" ? "Warm" : tone,
      includeQuote: id === "quote" ? true : includeQuote,
    }
    setRunning(true)
    setStepIndex(2)
    try {
      const result = await runCommsAgent(next, (index) => setStepIndex(index))
      setDraft(result)
      setSubject(result.subject)
      setBody(result.body)
      setStepIndex(AGENT_STEPS.length)
      toast.success(`Rewritten: ${label.toLowerCase()}`, {
        description: `${AGENT_NAME} · ${result.runId}`,
      })
    } catch (error) {
      setStepIndex(-1)
      notifyError(error, {
        code: "comms.refine-draft",
        title: "The rewrite did not go through",
        hint: "Your current draft is untouched.",
        context: { refinement: id },
        onRetry: () => void refine(id, label),
      })
    } finally {
      setRunning(false)
    }
  }

  const matchingTemplate = templates.find((template) => template.type === type)
  const progress = running
    ? Math.round(((stepIndex + 1) / AGENT_STEPS.length) * 100)
    : draft
      ? 100
      : 0

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Compose with the agent</h2>
          <p className="text-sm text-muted-foreground">
            Give the agent a brief. It calls{" "}
            <span className="font-mono text-xs">{FLOW_NAME}</span> and returns a
            draft you can edit.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit gap-1.5">
          <WorkflowIcon className="size-3.5" />
          {AGENT_NAME}
        </Badge>
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-[minmax(0,420px)_minmax(0,1fr)] @4xl/main:items-start">
        <div className="flex flex-col gap-4 @4xl/main:sticky @4xl/main:top-4">
          <Card>
            <CardHeader>
              <CardTitle>Brief</CardTitle>
              <CardDescription>{typeHints[type]}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 @md/main:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="comm-type">Type</Label>
                  <Select
                    value={type}
                    onValueChange={(value) => setType(value as CommType)}
                  >
                    <SelectTrigger id="comm-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {commTypes.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="comm-tone">Tone</Label>
                  <Select
                    value={tone}
                    onValueChange={(value) => setTone(value as Tone)}
                  >
                    <SelectTrigger id="comm-tone" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="comm-headline">What is this about?</Label>
                <Input
                  id="comm-headline"
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value)}
                  placeholder="the expansion of its Memphis plant"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="comm-points">Key points</Label>
                <Textarea
                  id="comm-points"
                  rows={6}
                  value={keyPoints}
                  onChange={(event) => setKeyPoints(event.target.value)}
                  placeholder="One fact per line. The agent turns these into the key messages."
                />
                <p className="text-xs text-muted-foreground">
                  One per line. These become the key messages verbatim.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Audiences</Label>
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  size="sm"
                  className="flex flex-wrap justify-start gap-1.5"
                  value={selectedAudiences}
                  onValueChange={setSelectedAudiences}
                >
                  {audiences.map((option) => (
                    <ToggleGroupItem
                      key={option}
                      value={option}
                      className="rounded-md! border! px-2.5"
                    >
                      {option}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Channels</Label>
                <ToggleGroup
                  type="multiple"
                  variant="outline"
                  size="sm"
                  className="flex flex-wrap justify-start gap-1.5"
                  value={selectedChannels}
                  onValueChange={(value) =>
                    setSelectedChannels(value as Channel[])
                  }
                >
                  {channels.map((option) => (
                    <ToggleGroupItem
                      key={option}
                      value={option}
                      className="rounded-md! border! px-2.5"
                    >
                      {option}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <Separator />

              <div className="grid gap-4 @md/main:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="comm-spokesperson">Spokesperson</Label>
                  <Input
                    id="comm-spokesperson"
                    value={spokesperson}
                    onChange={(event) => setSpokesperson(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="comm-length">Length</Label>
                  <Select
                    value={length}
                    onValueChange={(value) =>
                      setLength(value as (typeof lengths)[number])
                    }
                  >
                    <SelectTrigger id="comm-length" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {lengths.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Include a quote</span>
                  <span className="text-xs text-muted-foreground">
                    Attributed to the spokesperson above
                  </span>
                </div>
                <Switch checked={includeQuote} onCheckedChange={setIncludeQuote} />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Append boilerplate</span>
                  <span className="text-xs text-muted-foreground">
                    Standard "About Acme Inc." block
                  </span>
                </div>
                <Switch
                  checked={includeBoilerplate}
                  onCheckedChange={setIncludeBoilerplate}
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-2 border-t">
              <Button
                className="w-full"
                disabled={!canRun || running}
                onClick={() => generate()}
              >
                {running ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <SparklesIcon />
                )}
                {running
                  ? "Agent is working…"
                  : draft
                    ? "Regenerate draft"
                    : "Generate with agent"}
              </Button>
              {!canRun && (
                <p className="text-center text-xs text-muted-foreground">
                  Add a subject line and at least one key point.
                </p>
              )}
            </CardFooter>
          </Card>

          {matchingTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Template: {matchingTemplate.name}
                </CardTitle>
                <CardDescription>{matchingTemplate.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {matchingTemplate.sections.map((section) => (
                  <Badge key={section} variant="outline" className="font-normal">
                    {section}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Agent run</CardTitle>
              <CardDescription>
                {running
                  ? "Streaming from the flow…"
                  : draft
                    ? `${draft.runId} · completed in ${(draft.durationMs / 1000).toFixed(1)}s`
                    : "Idle — waiting for a brief"}
              </CardDescription>
              <CardAction>
                <Badge
                  variant="secondary"
                  className={cn(
                    running && "bg-warning/10 text-warning",
                    !running && draft && "bg-success/10 text-success"
                  )}
                >
                  {running ? "Running" : draft ? "Succeeded" : "Not started"}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Progress value={progress} />
              <ol className="flex flex-col gap-2">
                {AGENT_STEPS.map((step, index) => {
                  const done = index < stepIndex || (!running && Boolean(draft))
                  const active = running && index === stepIndex
                  return (
                    <li key={step.id} className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
                        {done ? (
                          <CheckIcon className="size-4 text-success" />
                        ) : active ? (
                          <Loader2Icon className="size-4 animate-spin text-primary" />
                        ) : (
                          <CircleDashedIcon className="size-4 text-muted-foreground/50" />
                        )}
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span
                          className={cn(
                            "text-sm",
                            !done && !active && "text-muted-foreground"
                          )}
                        >
                          {step.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {step.detail}
                        </span>
                      </span>
                    </li>
                  )
                })}
              </ol>
            </CardContent>
          </Card>

          {running && !draft ? (
            <Card>
              <CardContent className="flex flex-col gap-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/5" />
              </CardContent>
            </Card>
          ) : draft ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Generated draft</CardTitle>
                  <CardDescription>
                    {draft.wordCount} words · {draft.readingMinutes} min read ·{" "}
                    {draft.readability}
                  </CardDescription>
                  <CardAction>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        void navigator.clipboard?.writeText(
                          `${subject}\n\n${body}`
                        )
                        toast.success("Copied to clipboard")
                      }}
                    >
                      <CopyIcon />
                      Copy
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      variant="secondary"
                      className={commTypeStyles[type]}
                    >
                      {type}
                    </Badge>
                    <Badge variant="secondary" className={toneStyles[tone]}>
                      {tone}
                    </Badge>
                    <Badge variant="outline" className="font-normal">
                      Tone match {draft.toneMatch}%
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="draft-subject">Subject</Label>
                    <Input
                      id="draft-subject"
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="draft-body">Body</Label>
                    <Textarea
                      id="draft-body"
                      rows={16}
                      value={body}
                      onChange={(event) => setBody(event.target.value)}
                      className="font-normal leading-relaxed"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Key messages</span>
                    <ul className="flex flex-col gap-1.5">
                      {draft.keyMessages.map((message) => (
                        <li
                          key={message}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" />
                          {message}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Ask for a rewrite</span>
                    <div className="flex flex-wrap gap-2">
                      {REFINEMENTS.map((option) => (
                        <Button
                          key={option.id}
                          size="sm"
                          variant="outline"
                          disabled={running}
                          onClick={() => void refine(option.id, option.label)}
                        >
                          {running && refinement === option.id ? (
                            <Loader2Icon className="animate-spin" />
                          ) : (
                            <SparklesIcon />
                          )}
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end gap-2 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.success("Saved as draft", {
                        description: `${type} · owner Priya Raman`,
                      })
                      navigate("/comms/list")
                    }}
                  >
                    <SaveIcon />
                    Save as draft
                  </Button>
                  <Button
                    onClick={() =>
                      toast.success("Sent for approval", {
                        description: "Dana Whitfield has been notified.",
                      })
                    }
                  >
                    <SendIcon />
                    Send for approval
                  </Button>
                </CardFooter>
              </Card>

              {(draft.warnings.length > 0 ||
                draft.suggestedChannels.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Agent review</CardTitle>
                    <CardDescription>
                      Checks the agent ran before handing the draft back.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {draft.warnings.map((warning) => (
                      <div
                        key={warning}
                        className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm"
                      >
                        <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-warning" />
                        {warning}
                      </div>
                    ))}
                    {draft.suggestedChannels.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          Also suggested for
                        </span>
                        {draft.suggestedChannels.map((channel) => (
                          <Button
                            key={channel}
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setSelectedChannels((prev) => [...prev, channel])
                            }
                          >
                            Add {channel}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <SparklesIcon className="size-6" />
                </span>
                <p className="text-sm font-medium">No draft yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Fill in the brief on the left and press Generate. The flow runs
                  the comms agent against our brand voice and returns an editable
                  draft.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
