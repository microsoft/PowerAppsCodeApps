import * as React from "react"
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  PartyPopperIcon,
  SparklesIcon,
} from "lucide-react"
import { Link } from "react-router"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

import {
  contentItems,
  currentHireId,
  dayNumber,
  formatDate,
  hireById,
  initials,
  itemsForTrack,
  stages,
  type ContentItem,
  type StageId,
} from "./data"
import { contentTypeIcons, contentTypeStyles, stageAccents } from "./status"

function ProgressRing({
  value,
  size = 96,
  stroke = 8,
}: {
  value: number
  size?: number
  stroke?: number
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        className="stroke-primary/15"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - (value / 100) * circumference}
        className="stroke-primary transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
  )
}

function QuizPlayer({
  item,
  onPass,
}: {
  item: ContentItem
  onPass: () => void
}) {
  const questions = item.quiz ?? []
  const [index, setIndex] = React.useState(0)
  const [picked, setPicked] = React.useState<number | null>(null)
  const [correct, setCorrect] = React.useState(0)

  const question = questions[index]
  const answered = picked !== null
  const isLast = index === questions.length - 1
  const finished = index >= questions.length

  if (finished) {
    const passed = correct >= Math.ceil(questions.length * 0.75)
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div
          className={cn(
            "flex size-14 items-center justify-center rounded-full",
            passed
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {passed ? (
            <PartyPopperIcon className="size-6" />
          ) : (
            <ClockIcon className="size-6" />
          )}
        </div>
        <div>
          <p className="text-lg font-semibold">
            {correct} of {questions.length} correct
          </p>
          <p className="text-sm text-muted-foreground">
            {passed
              ? "That is a pass. Nicely done."
              : "Not quite. Have another go when you are ready."}
          </p>
        </div>
        {passed ? (
          <Button onClick={onPass}>Mark complete</Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              setIndex(0)
              setPicked(null)
              setCorrect(0)
            }}
          >
            Retake
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Progress
          value={(index / questions.length) * 100}
          className="h-1.5 flex-1"
        />
        <span className="text-xs text-muted-foreground tabular-nums">
          {index + 1} / {questions.length}
        </span>
      </div>

      <p className="font-medium text-balance">{question.prompt}</p>

      <div className="flex flex-col gap-2">
        {question.options.map((option, optionIndex) => {
          const isAnswer = optionIndex === question.answer
          const isPicked = optionIndex === picked
          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => {
                setPicked(optionIndex)
                if (isAnswer) setCorrect((value) => value + 1)
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                !answered && "hover:bg-accent",
                answered && isAnswer && "border-success/40 bg-success/10",
                answered &&
                  isPicked &&
                  !isAnswer &&
                  "border-destructive/40 bg-destructive/10",
                answered && !isAnswer && !isPicked && "opacity-50"
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                  answered && isAnswer && "border-success bg-success/20"
                )}
              >
                {answered && isAnswer ? (
                  <CheckIcon className="size-3" />
                ) : (
                  String.fromCharCode(65 + optionIndex)
                )}
              </span>
              <span className="flex-1">{option}</span>
            </button>
          )
        })}
      </div>

      {answered && (
        <p className="rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
          {question.because}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          disabled={!answered}
          onClick={() => {
            setIndex((value) => value + 1)
            setPicked(null)
          }}
        >
          {isLast ? "See result" : "Next question"}
          <ArrowRightIcon />
        </Button>
      </div>
    </div>
  )
}

function ItemPlayer({
  item,
  hireNames,
  onComplete,
  onClose,
}: {
  item: ContentItem
  hireNames: { manager: string; buddy: string; lead: string }
  onComplete: () => void
  onClose: () => void
}) {
  const [acked, setAcked] = React.useState(false)
  const [ticked, setTicked] = React.useState<string[]>([])

  const bullets = item.bullets ?? []
  const allTicked = bullets.length > 0 && ticked.length === bullets.length

  if (item.type === "Quiz" && item.quiz) {
    return <QuizPlayer item={item} onPass={onComplete} />
  }

  return (
    <div className="flex flex-col gap-4">
      {item.meetingWith && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
          <Avatar className="size-9">
            <AvatarFallback className="text-xs">
              {initials(hireNames[item.meetingWith as keyof typeof hireNames])}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {hireNames[item.meetingWith as keyof typeof hireNames]}
            </p>
            <p className="text-xs text-muted-foreground">
              {item.minutes} minutes · calendar hold already placed
            </p>
          </div>
        </div>
      )}

      {item.body?.map((paragraph) => (
        <p
          key={paragraph.slice(0, 24)}
          className="max-w-prose text-sm/relaxed text-muted-foreground"
        >
          {paragraph}
        </p>
      ))}

      {bullets.length > 0 && (
        <div className="flex flex-col gap-1">
          {bullets.map((bullet) => {
            const isTicked = ticked.includes(bullet)
            return (
              <button
                key={bullet}
                type="button"
                onClick={() =>
                  setTicked((current) =>
                    isTicked
                      ? current.filter((value) => value !== bullet)
                      : [...current, bullet]
                  )
                }
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-accent"
              >
                <span
                  className={cn(
                    "flex size-4.5 shrink-0 items-center justify-center rounded border transition-colors",
                    isTicked && "border-primary bg-primary text-primary-foreground"
                  )}
                >
                  {isTicked && <CheckIcon className="size-3" />}
                </span>
                <span className={cn(isTicked && "text-muted-foreground line-through")}>
                  {bullet}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {item.ack && (
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-dashed p-3 text-sm">
          <Checkbox
            checked={acked}
            onCheckedChange={(value) => setAcked(value === true)}
            className="mt-0.5"
          />
          <span className="text-muted-foreground">{item.ack}</span>
        </label>
      )}

      <DialogFooter className="gap-2 sm:justify-between">
        <Button variant="ghost" onClick={onClose}>
          Not now
        </Button>
        <Button
          disabled={
            (item.ack !== undefined && !acked) ||
            (bullets.length > 0 && item.ack === undefined && !allTicked)
          }
          onClick={onComplete}
        >
          <CheckIcon />
          {item.ack ? "Acknowledge and continue" : "Mark complete"}
        </Button>
      </DialogFooter>
    </div>
  )
}

export default function OnboardingJourneyPage() {
  const hire = hireById(currentHireId)!
  const items = itemsForTrack(hire.track)

  const [completed, setCompleted] = React.useState<string[]>(hire.completed)
  const [openId, setOpenId] = React.useState<string | null>(null)

  const isDone = React.useCallback(
    (id: string) => completed.includes(id),
    [completed]
  )

  const stageRows = stages.map((stage) => {
    const stageItems = items.filter((item) => item.stage === stage.id)
    const done = stageItems.filter((item) => isDone(item.id)).length
    return {
      ...stage,
      items: stageItems,
      done,
      total: stageItems.length,
      complete: done === stageItems.length,
    }
  })

  const currentStageId: StageId =
    stageRows.find((row) => !row.complete)?.id ?? stages[stages.length - 1].id

  const [activeStage, setActiveStage] = React.useState<StageId>(currentStageId)
  const active = stageRows.find((row) => row.id === activeStage) ?? stageRows[0]

  const totalDone = completed.filter((id) =>
    items.some((item) => item.id === id)
  ).length
  const percent = Math.round((totalDone / items.length) * 100)
  const day = dayNumber(hire.startDate)
  const openItem = contentItems.find((item) => item.id === openId) ?? null

  const nextUp = items.find((item) => !isDone(item.id)) ?? null

  const hireNames = {
    manager: hire.manager,
    buddy: hire.buddy,
    lead: "Marta Vieira",
  }

  function complete(item: ContentItem) {
    setCompleted((current) =>
      current.includes(item.id) ? current : [...current, item.id]
    )
    setOpenId(null)

    const stageItems = items.filter((entry) => entry.stage === item.stage)
    const stageDone = stageItems.every(
      (entry) => entry.id === item.id || completed.includes(entry.id)
    )

    toast.success(stageDone ? "Stage complete" : "Marked complete", {
      description: stageDone
        ? `You have finished ${stages.find((stage) => stage.id === item.stage)?.name.toLowerCase()}.`
        : item.title,
      action: {
        label: "Undo",
        onClick: () =>
          setCompleted((current) => current.filter((id) => id !== item.id)),
      },
    })
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="relative overflow-hidden rounded-xl border bg-card">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/12 via-chart-2/8 to-transparent" />
        <div className="relative flex flex-col gap-6 p-6 @3xl/main:flex-row @3xl/main:items-center @3xl/main:justify-between">
          <div className="flex flex-col gap-3">
            <Badge variant="secondary" className="w-fit bg-primary/10 text-primary">
              <SparklesIcon />
              Day {day + 1} of your first 90
            </Badge>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Welcome, {hire.name.split(" ")[0]}.
              </h2>
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                {hire.role} · started {formatDate(hire.startDate)}. Everything
                below was picked for the {hire.track.toLowerCase()} track, so
                there is nothing here you can safely skip.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5 pt-1">
              {[
                { label: "Your manager", name: hire.manager },
                { label: "Your buddy", name: hire.buddy },
              ].map((person) => (
                <div key={person.label} className="flex items-center gap-2.5">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-[11px]">
                      {initials(person.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="leading-tight">
                    <p className="text-xs text-muted-foreground">
                      {person.label}
                    </p>
                    <p className="text-sm font-medium">{person.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <ProgressRing value={percent} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-semibold tabular-nums">
                  {percent}%
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {totalDone} of {items.length} steps done
              </p>
              {nextUp ? (
                <>
                  <p className="mt-1 text-xs text-muted-foreground">Next up</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStage(nextUp.stage)
                      setOpenId(nextUp.id)
                    }}
                    className="mt-0.5 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    {nextUp.title}
                    <ChevronRightIcon className="size-3.5" />
                  </button>
                </>
              ) : (
                <p className="mt-1 text-sm text-success">
                  You are fully onboarded.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-[320px_minmax(0,1fr)] @4xl/main:items-start">
        <div className="overflow-hidden rounded-xl border bg-card @4xl/main:sticky @4xl/main:top-4">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-medium">Your journey</p>
            <p className="text-xs text-muted-foreground">
              Five stages over your first three months
            </p>
          </div>
          <div className="p-2">
            {stageRows.map((stage, index) => {
              const isActive = stage.id === activeStage
              const isCurrent = stage.id === currentStageId
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveStage(stage.id)}
                  className={cn(
                    "relative flex w-full gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                    isActive ? "bg-accent" : "hover:bg-accent/50"
                  )}
                >
                  {index < stageRows.length - 1 && (
                    <span className="absolute top-11 left-[1.4rem] h-[calc(100%-1.25rem)] w-px bg-border" />
                  )}
                  <span
                    className={cn(
                      "relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-card text-[10px] font-semibold",
                      stage.complete
                        ? "bg-success text-success-foreground"
                        : isCurrent
                          ? cn(stageAccents[stage.id], "text-background")
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {stage.complete ? (
                      <CheckIcon className="size-3.5" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {stage.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {stage.done}/{stage.total}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {stage.window}
                    </span>
                    <Progress
                      value={(stage.done / stage.total) * 100}
                      className="mt-2 h-1"
                    />
                  </span>
                </button>
              )
            })}
          </div>
          <div className="border-t px-4 py-3">
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link to="/onboarding/learning">
                Browse the full library
                <ArrowRightIcon />
              </Link>
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="flex flex-col gap-1 border-b px-5 py-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{active.name}</h3>
              {active.complete && (
                <Badge variant="secondary" className="bg-success/10 text-success">
                  Complete
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{active.blurb}</p>
          </div>

          <div className="divide-y">
            {active.items.map((item) => {
              const Icon = contentTypeIcons[item.type]
              const done = isDone(item.id)
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                      done ? "bg-success/10 text-success" : contentTypeStyles[item.type]
                    )}
                  >
                    {done ? (
                      <CheckIcon className="size-4.5" />
                    ) : (
                      <Icon className="size-4.5" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={cn(
                          "font-medium",
                          done && "text-muted-foreground"
                        )}
                      >
                        {item.title}
                      </p>
                      {item.required ? (
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                          Required
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px] text-muted-foreground">
                          Optional
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.summary}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{item.type}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <ClockIcon className="size-3" />
                        {item.minutes} min
                      </span>
                      <span>·</span>
                      <span>{item.owner}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={done ? "ghost" : "outline"}
                    className="shrink-0"
                    onClick={() => setOpenId(item.id)}
                  >
                    {done ? "Review" : "Open"}
                  </Button>
                </div>
              )
            })}
          </div>

          {active.complete && (
            <div className="flex items-center gap-3 border-t bg-success/5 px-5 py-4">
              <PartyPopperIcon className="size-4 shrink-0 text-success" />
              <p className="flex-1 text-sm text-muted-foreground">
                {active.name} is done. Nothing else is expected of you in this
                stage.
              </p>
              {activeStage !== stages[stages.length - 1].id && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const index = stages.findIndex((s) => s.id === activeStage)
                    setActiveStage(stages[index + 1].id)
                  }}
                >
                  Next stage
                  <ArrowRightIcon />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={openItem !== null}
        onOpenChange={(value) => !value && setOpenId(null)}
      >
        <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-2xl">
          {openItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={contentTypeStyles[openItem.type]}
                  >
                    {openItem.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {openItem.minutes} min · {openItem.owner}
                  </span>
                  {isDone(openItem.id) && (
                    <Badge
                      variant="secondary"
                      className="bg-success/10 text-success"
                    >
                      <CheckIcon />
                      Done
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-left">{openItem.title}</DialogTitle>
                <DialogDescription className="text-left">
                  {openItem.summary}
                </DialogDescription>
              </DialogHeader>

              <ItemPlayer
                key={openItem.id}
                item={openItem}
                hireNames={hireNames}
                onComplete={() => complete(openItem)}
                onClose={() => setOpenId(null)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
