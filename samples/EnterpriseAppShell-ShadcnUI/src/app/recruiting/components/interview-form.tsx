import * as React from "react"
import { toast } from "sonner"

import { DatePicker } from "@/components/common/date-picker"
import { useFormValidation } from "@/hooks/use-form-validation"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import {
  TODAY,
  type Interview,
  type InterviewKind,
  type InterviewStatus,
} from "../data"
import { Field, FormSection, FormSheet, FormShell } from "@/components/common/form-sheet"
import {
  newInterviewId,
  parseTranscript,
  saveInterview,
  toLines,
  useCandidates,
  useRoles,
} from "../store"

const kinds: InterviewKind[] = ["Screen", "Technical", "Panel", "Values", "Final"]
const statuses: InterviewStatus[] = ["Scheduled", "Completed", "Cancelled"]
const durations = [30, 45, 60, 75, 90, 120]

function splitStart(start: string) {
  const [date, time = "09:00"] = start.split("T")
  return { date: date || TODAY, time: time.slice(0, 5) }
}

function blankInterview(candidateId: string, roleId: string): Interview {
  return {
    id: "",
    candidateId,
    roleId,
    kind: "Screen",
    start: `${TODAY}T09:00:00`,
    durationMins: 45,
    panel: [],
    room: "",
    status: "Scheduled",
  }
}

function toTranscriptText(interview: Interview | null) {
  return (
    interview?.transcript
      ?.map((line) =>
        line.at
          ? `[${line.at}] ${line.speaker}: ${line.text}`
          : `${line.speaker}: ${line.text}`
      )
      .join("\n") ?? ""
  )
}

export function InterviewFormSheet({
  open,
  onOpenChange,
  interview,
  defaultCandidateId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  interview: Interview | null
  defaultCandidateId?: string
}) {
  return (
    <FormSheet open={open} onOpenChange={onOpenChange}>
      <InterviewFormBody
        key={interview?.id ?? `new-${defaultCandidateId ?? ""}`}
        interview={interview}
        defaultCandidateId={defaultCandidateId}
        onClose={() => onOpenChange(false)}
      />
    </FormSheet>
  )
}

function InterviewFormBody({
  interview,
  defaultCandidateId,
  onClose,
}: {
  interview: Interview | null
  defaultCandidateId?: string
  onClose: () => void
}) {
  const candidates = useCandidates()
  const roles = useRoles()

  const [draft, setDraft] = React.useState<Interview>(() =>
    interview
      ? { ...interview }
      : blankInterview(defaultCandidateId ?? candidates[0]?.id ?? "", "")
  )
  const seedStart = splitStart(draft.start)
  const [date, setDate] = React.useState(seedStart.date)
  const [time, setTime] = React.useState(seedStart.time)
  const [panel, setPanel] = React.useState(interview?.panel.join("\n") ?? "")
  const [notes, setNotes] = React.useState(interview?.notes ?? "")
  const [transcript, setTranscript] = React.useState(() =>
    toTranscriptText(interview)
  )

  const editing = Boolean(interview)
  const candidate = candidates.find((item) => item.id === draft.candidateId)
  const role = roles.find((item) => item.id === (candidate?.roleId ?? draft.roleId))

  const { errorFor, fieldProps, handleSubmit, visibleErrors } =
    useFormValidation(
      { candidateId: draft.candidateId, date },
      {
        candidateId: (values) =>
          !values.candidateId ? "Choose who you are meeting." : undefined,
        date: (values) => (!values.date ? "Pick a date for the slot." : undefined),
      },
    )

  const parsed = React.useMemo(
    () => (transcript.trim() ? parseTranscript(transcript, candidate?.name ?? "") : []),
    [transcript, candidate?.name]
  )

  function set<K extends keyof Interview>(key: K, value: Interview[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const submit = handleSubmit(() => {
    const saved: Interview = {
      ...draft,
      id: draft.id || newInterviewId(),
      roleId: candidate?.roleId ?? draft.roleId,
      start: `${date}T${time}:00`,
      panel: toLines(panel),
      notes: notes.trim() || undefined,
      transcript: parsed.length ? parsed : undefined,
    }
    saveInterview(saved)
    onClose()
    toast.success(editing ? "Interview updated" : "Interview scheduled", {
      description: `${candidate?.name ?? "Candidate"} · ${saved.kind} · ${new Date(
        saved.start
      ).toLocaleString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
    })
  })

  return (
    <FormShell
      onCancel={onClose}
      title={editing ? "Edit interview" : "Schedule an interview"}
      description={
        editing
          ? `${interview?.id} · panellists are re-notified when you save`
          : "Book the slot now, add notes and the transcript afterwards."
      }
      submitLabel={editing ? "Save interview" : "Schedule"}
      onSubmit={submit}
      errors={visibleErrors}
    >
      <FormSection title="Who">
        <Field
          label="Candidate"
          htmlFor="int-candidate"
          wide
          error={errorFor("candidateId")}
          hint={role ? `Interviewing for ${role.title}` : undefined}
        >
          <Select
            value={draft.candidateId}
            onValueChange={(value) => set("candidateId", value)}
          >
            <SelectTrigger
              id="int-candidate"
              className="w-full"
              {...fieldProps("candidateId")}
            >
              <SelectValue placeholder="Pick a candidate" />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name} — {item.stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Panel"
          htmlFor="int-panel"
          wide
          hint="One name per line. Each gets a calendar invite."
        >
          <Textarea
            id="int-panel"
            value={panel}
            onChange={(event) => setPanel(event.target.value)}
            rows={3}
            placeholder={"Priya Raman\nMarcus Webb"}
          />
        </Field>
      </FormSection>

      <FormSection title="When">
        <Field label="Type" htmlFor="int-type">
          <Select
            value={draft.kind}
            onValueChange={(value) => set("kind", value as InterviewKind)}
          >
            <SelectTrigger id="int-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {kinds.map((kind) => (
                <SelectItem key={kind} value={kind}>
                  {kind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Status" htmlFor="int-status">
          <Select
            value={draft.status}
            onValueChange={(value) => set("status", value as InterviewStatus)}
          >
            <SelectTrigger id="int-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Date" htmlFor="int-date" error={errorFor("date")}>
          <DatePicker
            id="int-date"
            value={date}
            onChange={setDate}
            placeholder="Select a date"
            clearable={false}
            invalid={fieldProps("date")["aria-invalid"]}
          />
        </Field>

        <Field label="Start time" htmlFor="int-time">
          <Input
            id="int-time"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
        </Field>

        <Field label="Duration" htmlFor="int-duration">
          <Select
            value={String(draft.durationMins)}
            onValueChange={(value) => set("durationMins", Number(value))}
          >
            <SelectTrigger id="int-duration" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {durations.map((mins) => (
                <SelectItem key={mins} value={String(mins)}>
                  {mins} minutes
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Room or link" htmlFor="int-room">
          <Input
            id="int-room"
            value={draft.room}
            onChange={(event) => set("room", event.target.value)}
            placeholder="Teams or Studio 2"
          />
        </Field>
      </FormSection>

      <FormSection
        title="After the interview"
        hint="Notes stay private to the hiring team. The transcript feeds Interview Insights."
      >
        <Field label="Your notes" htmlFor="int-notes" wide>
          <Textarea
            id="int-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            placeholder="What you probed, what convinced you, what is still open."
          />
        </Field>

        <Field
          label="Transcript"
          htmlFor="int-transcript"
          wide
          hint={'Paste "Name: what they said" per line. Timestamps in brackets are kept.'}
        >
          <Textarea
            id="int-transcript"
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            rows={8}
            className="font-mono text-xs"
            placeholder={
              "[00:12] Priya Raman: Talk me through the migration you led.\n[00:31] Rowan Blake: We moved forty services in eleven weeks."
            }
          />
        </Field>

        {parsed.length > 0 && (
          <div className="sm:col-span-2">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary" className="bg-success/10 text-success">
                {parsed.length} lines parsed
              </Badge>
              <span className="text-xs text-muted-foreground">
                {parsed.filter((line) => line.role === "Candidate").length} from{" "}
                {candidate?.name?.split(" ")[0] ?? "the candidate"}
              </span>
            </div>
            <div className="max-h-40 overflow-y-auto rounded-lg border bg-muted/30 p-3">
              <ul className="flex flex-col gap-1.5">
                {parsed.slice(0, 8).map((line, index) => (
                  <li key={index} className="flex gap-2 text-xs">
                    <span
                      className={cn(
                        "shrink-0 font-medium",
                        line.role === "Candidate"
                          ? "text-chart-2"
                          : "text-muted-foreground"
                      )}
                    >
                      {line.speaker}
                    </span>
                    <span className="truncate text-muted-foreground">
                      {line.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </FormSection>
    </FormShell>
  )
}
