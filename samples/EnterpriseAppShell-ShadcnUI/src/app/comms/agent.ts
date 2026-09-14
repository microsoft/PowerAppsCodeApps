import type { Channel, CommType, Tone } from "./data"

// Stand-in for a Power Automate flow that calls a comms agent. Swap runCommsAgent
// for the real flow invocation; the brief and draft shapes are the contract.
export const FLOW_NAME = "Generate-Comms-Draft"
export const AGENT_NAME = "Corporate Comms Agent"

export type AgentBrief = {
  type: CommType
  tone: Tone
  audiences: string[]
  channels: Channel[]
  headline: string
  keyPoints: string
  spokesperson: string
  length: "Short" | "Standard" | "Detailed"
  includeQuote: boolean
  includeBoilerplate: boolean
}

export type AgentDraft = {
  subject: string
  body: string
  keyMessages: string[]
  suggestedChannels: Channel[]
  readingMinutes: number
  wordCount: number
  toneMatch: number
  readability: string
  warnings: string[]
  runId: string
  durationMs: number
}

export type AgentStep = {
  id: string
  label: string
  detail: string
  ms: number
}

export const AGENT_STEPS: AgentStep[] = [
  {
    id: "flow",
    label: `Calling flow ${FLOW_NAME}`,
    detail: "Power Automate · Comms environment",
    ms: 700,
  },
  {
    id: "context",
    label: "Loading brand voice and boilerplate",
    detail: "Messaging house, tone guide, legal boilerplate",
    ms: 650,
  },
  {
    id: "retrieve",
    label: "Retrieving related communications",
    detail: "Matching campaign history and prior statements",
    ms: 800,
  },
  {
    id: "draft",
    label: `Drafting with the ${AGENT_NAME}`,
    detail: "Composing subject, body and key messages",
    ms: 1400,
  },
  {
    id: "review",
    label: "Checking tone, reading level and compliance",
    detail: "Flagging unverified claims and forward-looking language",
    ms: 750,
  },
]

const BOILERPLATE =
  "About Acme Inc.\nAcme Inc. builds predictive operations software for industrial plants. Founded in 2009 and headquartered in Cleveland, Acme serves more than 400 manufacturing sites across North America, EMEA and APAC."

const openers: Record<CommType, (headline: string) => string> = {
  "Internal Email": (h) => `Hi everyone,\n\n${h}`,
  "External Email": (h) => `Hello,\n\n${h}`,
  "Press Release": (h) => `CLEVELAND — Acme Inc. today announced ${lower(h)}`,
  "Press Note": (h) => `Acme Inc. confirms that ${lower(h)}`,
  "Executive Memo": (h) => `Leadership team,\n\n${h}`,
  Newsletter: (h) => `In this edition: ${lower(h)}`,
  "Social Post": (h) => h,
  "Crisis Statement": (h) => `Acme Inc. is aware of ${lower(h)}`,
}

const closers: Record<CommType, string> = {
  "Internal Email":
    "If anything here is unclear, reply to this note or bring it to the next team meeting. We would rather answer twice than have you guess.",
  "External Email":
    "If you have questions, your account team is the fastest route and we will come back to you the same day.",
  "Press Release": "Media enquiries: press@acme.example.com",
  "Press Note":
    "Acme will share further detail once the review concludes.\n\nMedia enquiries: press@acme.example.com",
  "Executive Memo":
    "Please come to planning week with your submission complete. We will work through the gaps together rather than over email.",
  Newsletter:
    "That is everything for this month. Reply with anything you would like us to cover next time.",
  "Social Post": "Link in comments.",
  "Crisis Statement":
    "A further update will follow within 24 hours, or sooner if the position changes materially.",
}

const toneLines: Record<Tone, string> = {
  Formal:
    "The company will provide additional detail through its usual channels.",
  Neutral: "No action is required at this stage.",
  Warm: "Thank you for the work that got us here — it was not a small lift.",
  Urgent: "Please treat this as the priority for the next 48 hours.",
  Celebratory: "This one is worth stopping to enjoy.",
}

function lower(text: string) {
  if (!text) return "an update to its operations."
  const trimmed = text.trim()
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1)
}

function toPoints(keyPoints: string) {
  return keyPoints
    .split(/\n|(?<=\.)\s+(?=[A-Z])/)
    .map((line) => line.replace(/^[-•*\d.)\s]+/, "").trim())
    .filter((line) => line.length > 3)
}

function subjectFor(type: CommType, headline: string, tone: Tone) {
  const base = headline.trim().replace(/\.$/, "") || "Company update"
  switch (type) {
    case "Press Release":
      return `Acme Inc. announces ${lower(base)}`
    case "Press Note":
      return `Statement regarding ${lower(base)}`
    case "Crisis Statement":
      return `Holding statement: ${lower(base)}`
    case "Executive Memo":
      return base
    case "Newsletter":
      return `The Loop — ${base}`
    case "Social Post":
      return base
    default:
      return tone === "Urgent" ? `Action needed: ${base}` : base
  }
}

export function runCommsAgent(
  brief: AgentBrief,
  onStep?: (index: number, step: AgentStep) => void
): Promise<AgentDraft> {
  const started = Date.now()

  return new Promise((resolve) => {
    let elapsed = 0
    AGENT_STEPS.forEach((step, index) => {
      elapsed += step.ms
      window.setTimeout(() => onStep?.(index, step), elapsed - step.ms + 40)
    })
    window.setTimeout(
      () => resolve({ ...compose(brief), durationMs: Date.now() - started }),
      elapsed + 150
    )
  })
}

function compose(brief: AgentBrief): Omit<AgentDraft, "durationMs"> {
  const points = toPoints(brief.keyPoints)
  const headline = brief.headline.trim() || "an update to its operations"
  const paragraphs: string[] = [openers[brief.type](headline)]

  if (points[0]) {
    paragraphs.push(
      brief.type === "Social Post"
        ? points[0]
        : `${points[0]}${points[0].endsWith(".") ? "" : "."}`
    )
  }

  if (brief.length !== "Short" && points.length > 1) {
    paragraphs.push(
      points
        .slice(1, brief.length === "Detailed" ? points.length : 3)
        .map((point) => `${point}${point.endsWith(".") ? "" : "."}`)
        .join(" ")
    )
  }

  if (brief.includeQuote && brief.spokesperson) {
    paragraphs.push(
      `"${points[0] ?? headline}${
        (points[0] ?? headline).endsWith(".") ? "" : "."
      } This is the outcome we set out to reach, and the team got there by being honest about what was not working," said ${
        brief.spokesperson
      }.`
    )
  }

  if (brief.length === "Detailed") {
    paragraphs.push(toneLines[brief.tone])
  }

  paragraphs.push(closers[brief.type])

  if (brief.includeBoilerplate) paragraphs.push(BOILERPLATE)

  const body = paragraphs.filter(Boolean).join("\n\n")
  const words = body.trim().split(/\s+/).filter(Boolean).length

  const keyMessages = (points.length ? points : [headline])
    .slice(0, 3)
    .map((point) => `${point}${point.endsWith(".") ? "" : "."}`)

  const suggested = suggestChannels(brief.type)
  const warnings = validate(brief, body, words)

  return {
    subject: subjectFor(brief.type, headline, brief.tone),
    body,
    keyMessages,
    suggestedChannels: suggested.filter(
      (channel) => !brief.channels.includes(channel)
    ),
    readingMinutes: Math.max(1, Math.round(words / 200)),
    wordCount: words,
    toneMatch: Math.min(98, 78 + Math.min(points.length, 4) * 4),
    readability: words > 320 ? "Grade 11 — dense" : "Grade 8 — plain",
    runId: `RUN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    warnings,
  }
}

function suggestChannels(type: CommType): Channel[] {
  switch (type) {
    case "Press Release":
      return ["Newsroom", "Press wire", "LinkedIn"]
    case "Press Note":
    case "Crisis Statement":
      return ["Newsroom"]
    case "Internal Email":
      return ["Email", "Intranet", "Teams"]
    case "Newsletter":
      return ["Email", "Intranet"]
    case "Social Post":
      return ["LinkedIn"]
    default:
      return ["Email"]
  }
}

function validate(brief: AgentBrief, body: string, words: number) {
  const warnings: string[] = []
  if (brief.type === "Social Post" && body.length > 900) {
    warnings.push("Over 900 characters — LinkedIn will truncate the post.")
  }
  if (
    (brief.type === "Press Release" || brief.type === "External Email") &&
    /\b(guarantee|will definitely|record[- ]breaking)\b/i.test(body)
  ) {
    warnings.push("Contains an absolute claim that legal usually asks us to soften.")
  }
  if (brief.type === "Crisis Statement" && brief.includeQuote) {
    warnings.push("Quotes in holding statements need legal sign-off before release.")
  }
  if (brief.audiences.includes("Investors")) {
    warnings.push("Investor audience selected — forward-looking statements need a disclaimer.")
  }
  if (words < 60) {
    warnings.push("Short draft. Add another key point if you want it to stand alone.")
  }
  return warnings
}

export const REFINEMENTS = [
  { id: "shorten", label: "Make it shorter" },
  { id: "formal", label: "More formal" },
  { id: "warmer", label: "Warmer tone" },
  { id: "quote", label: "Add an executive quote" },
  { id: "simplify", label: "Simplify the language" },
] as const

export type RefinementId = (typeof REFINEMENTS)[number]["id"]
