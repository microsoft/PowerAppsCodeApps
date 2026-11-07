export type CommType =
  | "Internal Email"
  | "External Email"
  | "Press Release"
  | "Press Note"
  | "Executive Memo"
  | "Newsletter"
  | "Social Post"
  | "Crisis Statement"

export type CommStatus =
  | "Draft"
  | "In Review"
  | "Approved"
  | "Scheduled"
  | "Published"
  | "Archived"

export type Tone = "Formal" | "Neutral" | "Warm" | "Urgent" | "Celebratory"

export type Channel =
  | "Email"
  | "Intranet"
  | "Newsroom"
  | "LinkedIn"
  | "Teams"
  | "Press wire"

export type Comm = {
  id: string
  title: string
  subject: string
  type: CommType
  status: CommStatus
  tone: Tone
  audiences: string[]
  channels: Channel[]
  owner: string
  approver: string
  campaign: string
  createdOn: string
  updatedOn: string
  scheduledFor?: string
  publishedOn?: string
  embargoUntil?: string
  aiGenerated: boolean
  keyMessages: string[]
  body: string
  reach: number
  opens?: number
  clicks?: number
}

export type CommEvent = {
  at: string
  actor: string
  action: string
  detail?: string
}

export type Template = {
  id: string
  name: string
  type: CommType
  tone: Tone
  description: string
  sections: string[]
  uses: number
  updatedOn: string
}

export const commTypes: CommType[] = [
  "Internal Email",
  "External Email",
  "Press Release",
  "Press Note",
  "Executive Memo",
  "Newsletter",
  "Social Post",
  "Crisis Statement",
]

export const commStatuses: CommStatus[] = [
  "Draft",
  "In Review",
  "Approved",
  "Scheduled",
  "Published",
  "Archived",
]

export const tones: Tone[] = [
  "Formal",
  "Neutral",
  "Warm",
  "Urgent",
  "Celebratory",
]

export const channels: Channel[] = [
  "Email",
  "Intranet",
  "Newsroom",
  "LinkedIn",
  "Teams",
  "Press wire",
]

export const audiences = [
  "All employees",
  "Leadership",
  "Plant operations",
  "Field engineers",
  "Customers",
  "Investors",
  "Media",
  "Partners",
  "Candidates",
]

export const campaigns = [
  "Q3 Business Update",
  "Safety First 2026",
  "Product Launch — Helio",
  "Talent Brand",
  "Sustainability Report",
  "Operations Excellence",
  "Always-on",
]

export const comms: Comm[] = [
  {
    id: "CM-4102",
    title: "Helio platform general availability",
    subject: "Acme launches Helio, cutting plant downtime by 22%",
    type: "Press Release",
    status: "Published",
    tone: "Formal",
    audiences: ["Media", "Customers", "Investors"],
    channels: ["Newsroom", "Press wire", "LinkedIn"],
    owner: "Priya Raman",
    approver: "Dana Whitfield",
    campaign: "Product Launch — Helio",
    createdOn: "2026-08-11",
    updatedOn: "2026-08-24",
    publishedOn: "2026-08-25",
    aiGenerated: true,
    keyMessages: [
      "Helio is generally available across North America and EMEA today.",
      "Early adopters cut unplanned downtime by an average of 22%.",
      "Pricing stays usage based with no per-seat licence.",
    ],
    body: "CLEVELAND — Acme Inc. today announced the general availability of Helio, its predictive operations platform for industrial plants.\n\nAcross an eighteen-month pilot with eleven manufacturers, Helio reduced unplanned downtime by an average of 22% and shortened root-cause investigations from days to hours.\n\n\"Our customers do not need more dashboards, they need fewer surprises,\" said Dana Whitfield, Chief Operating Officer at Acme Inc. \"Helio turns the signals a plant already produces into a decision someone can act on before the line stops.\"\n\nHelio is available immediately in North America and EMEA, with APAC availability scheduled for the first quarter of 2027.",
    reach: 48200,
    opens: 12400,
    clicks: 3180,
  },
  {
    id: "CM-4103",
    title: "September all-hands invitation",
    subject: "All-hands on 12 September — the Q3 numbers and what changes",
    type: "Internal Email",
    status: "Scheduled",
    tone: "Warm",
    audiences: ["All employees"],
    channels: ["Email", "Intranet", "Teams"],
    owner: "Lena Ortiz",
    approver: "Dana Whitfield",
    campaign: "Q3 Business Update",
    createdOn: "2026-08-27",
    updatedOn: "2026-09-01",
    scheduledFor: "2026-09-04",
    aiGenerated: true,
    keyMessages: [
      "All-hands is Friday 12 September, 15:00 UTC, hybrid.",
      "We will walk through Q3 results and the 2027 operating plan.",
      "Questions can be submitted anonymously until 10 September.",
    ],
    body: "Hi everyone,\n\nOur next all-hands is on Friday 12 September at 15:00 UTC, in the Cleveland auditorium and on Teams.\n\nDana will walk through the Q3 numbers, Priya will cover what the Helio launch means for the roadmap, and we will close with the shape of the 2027 operating plan.\n\nYou can submit questions anonymously through the intranet form until 10 September. We will answer the most-voted ones live and publish written answers to the rest the following week.\n\nSee you there.",
    reach: 3120,
  },
  {
    id: "CM-4104",
    title: "Press note — Cleveland line 4 stoppage",
    subject: "Statement regarding the temporary stoppage at Cleveland line 4",
    type: "Press Note",
    status: "Approved",
    tone: "Formal",
    audiences: ["Media"],
    channels: ["Newsroom"],
    owner: "Priya Raman",
    approver: "Marcus Feld",
    campaign: "Operations Excellence",
    createdOn: "2026-08-29",
    updatedOn: "2026-09-01",
    embargoUntil: "2026-09-03",
    aiGenerated: true,
    keyMessages: [
      "Production on line 4 was paused voluntarily on 29 August.",
      "No injuries were reported and no customer order is at risk.",
      "An independent review is under way and findings will be shared.",
    ],
    body: "Acme Inc. confirms that production on line 4 at its Cleveland plant was voluntarily paused on 29 August after a guard interlock fault was identified during a routine safety walk.\n\nNo injuries were reported. Affected volume has been redistributed to the Memphis plant and no customer order is currently at risk.\n\nAn independent review is under way. Acme will share the findings and any corrective actions once the review concludes.\n\nMedia enquiries: press@acme.example.com",
    reach: 2400,
  },
  {
    id: "CM-4105",
    title: "Q3 employee newsletter",
    subject: "The Loop — September",
    type: "Newsletter",
    status: "In Review",
    tone: "Warm",
    audiences: ["All employees"],
    channels: ["Email", "Intranet"],
    owner: "Grace Liu",
    approver: "Lena Ortiz",
    campaign: "Q3 Business Update",
    createdOn: "2026-08-26",
    updatedOn: "2026-09-01",
    aiGenerated: true,
    keyMessages: [
      "Helio shipped and the first ten customers are live.",
      "Safety walk compliance moved from 51% to 63%.",
      "Two new sites join the sustainability pilot in October.",
    ],
    body: "Welcome to the September issue of The Loop.\n\nIn this edition: what the Helio launch changed for our customers, a look at how safety walk compliance climbed twelve points in a quarter, and an introduction to the two sites joining the sustainability pilot in October.\n\nWe also asked five people across operations what one process they would delete tomorrow. Their answers are on page four, and three of them are already on the roadmap.",
    reach: 3120,
  },
  {
    id: "CM-4106",
    title: "Customer maintenance window notice",
    subject: "Planned maintenance: 6 September, 02:00–05:00 UTC",
    type: "External Email",
    status: "Approved",
    tone: "Neutral",
    audiences: ["Customers"],
    channels: ["Email"],
    owner: "Tomás Bernardes",
    approver: "Priya Raman",
    campaign: "Always-on",
    createdOn: "2026-08-30",
    updatedOn: "2026-09-01",
    scheduledFor: "2026-09-03",
    aiGenerated: false,
    keyMessages: [
      "Maintenance runs 6 September, 02:00–05:00 UTC.",
      "Dashboards may be briefly unavailable; data collection continues.",
      "No action is required from customers.",
    ],
    body: "Hello,\n\nWe will perform planned maintenance on the Helio platform on Saturday 6 September between 02:00 and 05:00 UTC.\n\nDuring the window, dashboards and the reporting API may be intermittently unavailable. Data collection from your sites continues throughout and nothing will be lost.\n\nNo action is required from you. We will post progress on status.acme.example.com.",
    reach: 8600,
    opens: 5210,
    clicks: 740,
  },
  {
    id: "CM-4107",
    title: "Executive memo — 2027 operating plan",
    subject: "How we are setting up 2027",
    type: "Executive Memo",
    status: "Draft",
    tone: "Formal",
    audiences: ["Leadership"],
    channels: ["Email"],
    owner: "Dana Whitfield",
    approver: "Dana Whitfield",
    campaign: "Q3 Business Update",
    createdOn: "2026-09-01",
    updatedOn: "2026-09-02",
    aiGenerated: true,
    keyMessages: [
      "Three priorities for 2027: reliability, Helio expansion, cost discipline.",
      "Headcount grows in field engineering only.",
      "Planning submissions are due 26 September.",
    ],
    body: "Leadership team,\n\nAhead of planning week I want to set out the three priorities we will fund in 2027.\n\nFirst, reliability. The Cleveland stoppage cost us four days of volume and a great deal of goodwill. Second, Helio expansion into APAC. Third, cost discipline everywhere that does not touch the first two.\n\nHeadcount grows in field engineering and nowhere else. Please have submissions in by 26 September so we can review them together on the 30th.",
    reach: 42,
  },
  {
    id: "CM-4108",
    title: "Safety week kickoff",
    subject: "Safety week starts Monday — here is what to expect",
    type: "Internal Email",
    status: "Published",
    tone: "Urgent",
    audiences: ["Plant operations", "Field engineers"],
    channels: ["Email", "Teams"],
    owner: "Owen Cassidy",
    approver: "Marcus Feld",
    campaign: "Safety First 2026",
    createdOn: "2026-08-14",
    updatedOn: "2026-08-16",
    publishedOn: "2026-08-17",
    aiGenerated: false,
    keyMessages: [
      "Every shift runs one safety walk per day next week.",
      "Reporting a near miss will never be held against you.",
      "Line supervisors have thirty minutes protected for briefings.",
    ],
    body: "Team,\n\nSafety week starts Monday. Every shift runs one safety walk per day, and supervisors have thirty protected minutes for the morning briefing.\n\nOne thing I want to be blunt about: reporting a near miss has never been held against anyone here and it never will be. The twelve near misses logged last month are the reason we caught the interlock fault before someone was hurt.\n\nIf something looks wrong, stop the line. We will sort out the schedule afterwards.",
    reach: 1450,
    opens: 1210,
    clicks: 402,
  },
  {
    id: "CM-4109",
    title: "Sustainability report announcement",
    subject: "Acme publishes its 2026 sustainability report",
    type: "Press Release",
    status: "In Review",
    tone: "Formal",
    audiences: ["Media", "Investors"],
    channels: ["Newsroom", "Press wire"],
    owner: "Grace Liu",
    approver: "Dana Whitfield",
    campaign: "Sustainability Report",
    createdOn: "2026-08-28",
    updatedOn: "2026-09-02",
    aiGenerated: true,
    keyMessages: [
      "Scope 1 and 2 emissions fell 14% year over year.",
      "Six of nine plants now run on contracted renewable supply.",
      "The 2030 target is unchanged and remains externally assured.",
    ],
    body: "CLEVELAND — Acme Inc. today published its 2026 sustainability report, reporting a 14% year-over-year reduction in Scope 1 and 2 emissions.\n\nSix of the company's nine plants now operate on contracted renewable supply, up from four a year ago. The company's 2030 reduction target is unchanged and continues to be externally assured.\n\nThe full report is available at acme.example.com/sustainability.",
    reach: 26500,
  },
  {
    id: "CM-4110",
    title: "Helio launch social post",
    subject: "Helio is live",
    type: "Social Post",
    status: "Published",
    tone: "Celebratory",
    audiences: ["Customers", "Partners", "Candidates"],
    channels: ["LinkedIn"],
    owner: "Grace Liu",
    approver: "Priya Raman",
    campaign: "Product Launch — Helio",
    createdOn: "2026-08-22",
    updatedOn: "2026-08-25",
    publishedOn: "2026-08-25",
    aiGenerated: true,
    keyMessages: [
      "Helio is generally available today.",
      "22% average reduction in unplanned downtime.",
      "Built with eleven manufacturing partners.",
    ],
    body: "Eighteen months, eleven manufacturing partners, one stubborn question: why does a plant only find out about a failure after the line stops?\n\nHelio is live today. Early adopters cut unplanned downtime by an average of 22%.\n\nThank you to every operator who told us what was actually broken. Link in comments.",
    reach: 91400,
    opens: 91400,
    clicks: 6120,
  },
  {
    id: "CM-4111",
    title: "Partner programme update",
    subject: "Changes to the Acme partner programme from 1 October",
    type: "External Email",
    status: "Draft",
    tone: "Neutral",
    audiences: ["Partners"],
    channels: ["Email"],
    owner: "Tomás Bernardes",
    approver: "Priya Raman",
    campaign: "Always-on",
    createdOn: "2026-08-31",
    updatedOn: "2026-09-02",
    aiGenerated: true,
    keyMessages: [
      "Tiering moves from revenue only to revenue plus certification.",
      "Existing tiers are protected until 31 March 2027.",
      "Certification is free for the first two engineers per partner.",
    ],
    body: "Hello,\n\nFrom 1 October the Acme partner programme moves from revenue-only tiering to a blend of revenue and certified capacity.\n\nYour current tier is protected until 31 March 2027, so there is no cliff. Certification is free for your first two engineers and the curriculum is already open.\n\nWe will run two office-hours sessions in September to walk through the detail.",
    reach: 640,
  },
  {
    id: "CM-4112",
    title: "Crisis holding statement — supply disruption",
    subject: "Holding statement: component supply disruption",
    type: "Crisis Statement",
    status: "Approved",
    tone: "Urgent",
    audiences: ["Media", "Customers"],
    channels: ["Newsroom"],
    owner: "Priya Raman",
    approver: "Dana Whitfield",
    campaign: "Operations Excellence",
    createdOn: "2026-08-25",
    updatedOn: "2026-08-27",
    aiGenerated: true,
    keyMessages: [
      "We are aware of the supplier disruption and are assessing impact.",
      "Customer commitments for September are currently unaffected.",
      "We will update within 24 hours or sooner if the position changes.",
    ],
    body: "Acme Inc. is aware of the disruption affecting one of its component suppliers and is assessing the impact on its production schedule.\n\nCustomer commitments for September are currently unaffected. Alternative supply has been secured for the two highest-volume lines.\n\nWe will provide a further update within 24 hours, or sooner if the position changes materially.",
    reach: 2400,
  },
  {
    id: "CM-4113",
    title: "New joiner welcome sequence",
    subject: "Welcome to Acme — your first two weeks",
    type: "Internal Email",
    status: "Published",
    tone: "Warm",
    audiences: ["Candidates", "All employees"],
    channels: ["Email"],
    owner: "Lena Ortiz",
    approver: "Lena Ortiz",
    campaign: "Talent Brand",
    createdOn: "2026-07-18",
    updatedOn: "2026-08-04",
    publishedOn: "2026-08-05",
    aiGenerated: false,
    keyMessages: [
      "Week one is orientation, week two is your first shipped change.",
      "Everyone gets a buddy on day one.",
      "Nothing you break in your first month is your fault.",
    ],
    body: "Welcome aboard.\n\nWeek one is orientation: the tools, the safety induction, and time with your buddy. Week two you ship something small and real.\n\nWe mean the last part. If something breaks in your first month, that is our onboarding failing, not you.",
    reach: 86,
    opens: 84,
    clicks: 61,
  },
  {
    id: "CM-4114",
    title: "Investor update — Q3 trading",
    subject: "Q3 trading update",
    type: "External Email",
    status: "Scheduled",
    tone: "Formal",
    audiences: ["Investors"],
    channels: ["Email", "Newsroom"],
    owner: "Dana Whitfield",
    approver: "Dana Whitfield",
    campaign: "Q3 Business Update",
    createdOn: "2026-08-30",
    updatedOn: "2026-09-02",
    scheduledFor: "2026-09-15",
    embargoUntil: "2026-09-15",
    aiGenerated: true,
    keyMessages: [
      "Revenue is expected in the upper half of the guided range.",
      "Helio contributed its first full quarter of recurring revenue.",
      "Full results will be published on 22 October.",
    ],
    body: "Acme Inc. expects Q3 revenue to land in the upper half of its previously guided range.\n\nThe quarter includes the first full period of recurring revenue from Helio, which reached general availability in August. Gross margin is expected to be broadly stable.\n\nFull results will be published on 22 October, with a call for analysts at 14:00 UTC the same day.",
    reach: 310,
  },
  {
    id: "CM-4115",
    title: "Memphis plant expansion",
    subject: "Acme expands Memphis plant, adding 120 roles",
    type: "Press Release",
    status: "Draft",
    tone: "Celebratory",
    audiences: ["Media", "Candidates"],
    channels: ["Newsroom", "LinkedIn"],
    owner: "Grace Liu",
    approver: "Priya Raman",
    campaign: "Talent Brand",
    createdOn: "2026-09-01",
    updatedOn: "2026-09-02",
    aiGenerated: true,
    keyMessages: [
      "A 9,000 m² expansion breaks ground in November.",
      "120 roles are created, 80 of them on the production floor.",
      "The site will be the first to run fully on renewable supply.",
    ],
    body: "MEMPHIS — Acme Inc. today announced a 9,000 square metre expansion of its Memphis plant, creating 120 roles of which 80 are on the production floor.\n\nGround breaks in November with first output expected in the third quarter of 2027. The expanded site will be the first in the Acme network to run entirely on contracted renewable supply.\n\nRecruitment for the first 40 positions opens in October.",
    reach: 18700,
  },
  {
    id: "CM-4116",
    title: "Legacy portal retirement notice",
    subject: "The legacy portal retires on 30 November",
    type: "External Email",
    status: "Archived",
    tone: "Neutral",
    audiences: ["Customers"],
    channels: ["Email"],
    owner: "Tomás Bernardes",
    approver: "Priya Raman",
    campaign: "Always-on",
    createdOn: "2026-05-12",
    updatedOn: "2026-06-02",
    publishedOn: "2026-06-03",
    aiGenerated: false,
    keyMessages: [
      "The legacy portal retires on 30 November 2026.",
      "All accounts have been migrated automatically.",
      "Exports remain available for twelve months.",
    ],
    body: "The legacy Acme portal will be retired on 30 November 2026.\n\nAll accounts have already been migrated to the new experience and no action is required. Historical exports remain available for twelve months after retirement.",
    reach: 8600,
    opens: 4980,
    clicks: 1120,
  },
]

export const commTimelines: Record<string, CommEvent[]> = {
  "CM-4102": [
    { at: "2026-08-11", actor: "Priya Raman", action: "Draft generated by agent", detail: "Press Release · Formal" },
    { at: "2026-08-14", actor: "Priya Raman", action: "Edited body", detail: "Tightened the quote" },
    { at: "2026-08-19", actor: "Dana Whitfield", action: "Approved" },
    { at: "2026-08-25", actor: "System", action: "Published", detail: "Newsroom, Press wire, LinkedIn" },
  ],
  "CM-4105": [
    { at: "2026-08-26", actor: "Grace Liu", action: "Draft generated by agent" },
    { at: "2026-08-29", actor: "Grace Liu", action: "Added Q3 safety numbers" },
    { at: "2026-09-01", actor: "Lena Ortiz", action: "Requested changes", detail: "Shorten the opening" },
  ],
  "CM-4109": [
    { at: "2026-08-28", actor: "Grace Liu", action: "Draft generated by agent" },
    { at: "2026-09-02", actor: "Dana Whitfield", action: "Sent for legal review" },
  ],
}

export const templates: Template[] = [
  {
    id: "TPL-01",
    name: "Product launch press release",
    type: "Press Release",
    tone: "Formal",
    description: "Dateline, announcement, proof point, executive quote, availability, boilerplate.",
    sections: ["Dateline", "Announcement", "Proof point", "Executive quote", "Availability", "Boilerplate"],
    uses: 34,
    updatedOn: "2026-08-20",
  },
  {
    id: "TPL-02",
    name: "Incident press note",
    type: "Press Note",
    tone: "Formal",
    description: "Factual holding note for operational events. Legal-reviewed language only.",
    sections: ["Facts confirmed", "Impact", "Actions taken", "Next update", "Media contact"],
    uses: 12,
    updatedOn: "2026-08-30",
  },
  {
    id: "TPL-03",
    name: "All-hands invitation",
    type: "Internal Email",
    tone: "Warm",
    description: "Date, agenda, how to join, how to ask questions.",
    sections: ["Opening", "Agenda", "Join details", "Questions", "Close"],
    uses: 41,
    updatedOn: "2026-08-27",
  },
  {
    id: "TPL-04",
    name: "Customer maintenance notice",
    type: "External Email",
    tone: "Neutral",
    description: "Window, expected impact, whether action is required, status page link.",
    sections: ["Window", "Impact", "Action required", "Status link"],
    uses: 58,
    updatedOn: "2026-07-30",
  },
  {
    id: "TPL-05",
    name: "Crisis holding statement",
    type: "Crisis Statement",
    tone: "Urgent",
    description: "What we know, what we do not, what we are doing, when we will update.",
    sections: ["Confirmed facts", "Unconfirmed", "Actions", "Next update"],
    uses: 7,
    updatedOn: "2026-08-27",
  },
  {
    id: "TPL-06",
    name: "Monthly employee newsletter",
    type: "Newsletter",
    tone: "Warm",
    description: "Lead story, numbers that moved, people, what is coming.",
    sections: ["Lead story", "Numbers", "People", "What is next"],
    uses: 22,
    updatedOn: "2026-08-26",
  },
  {
    id: "TPL-07",
    name: "Executive memo",
    type: "Executive Memo",
    tone: "Formal",
    description: "Decision, reasoning, implications, what is expected and by when.",
    sections: ["Decision", "Reasoning", "Implications", "Ask"],
    uses: 16,
    updatedOn: "2026-09-01",
  },
  {
    id: "TPL-08",
    name: "Launch social post",
    type: "Social Post",
    tone: "Celebratory",
    description: "Hook, tension, resolution, credit, call to action. Under 900 characters.",
    sections: ["Hook", "Tension", "Resolution", "Credit", "CTA"],
    uses: 63,
    updatedOn: "2026-08-22",
  },
]

export const monthlyVolume = [
  { month: "Mar", published: 9, drafted: 14, reach: 121000 },
  { month: "Apr", published: 12, drafted: 17, reach: 143000 },
  { month: "May", published: 10, drafted: 15, reach: 128000 },
  { month: "Jun", published: 14, drafted: 21, reach: 176000 },
  { month: "Jul", published: 11, drafted: 18, reach: 152000 },
  { month: "Aug", published: 18, drafted: 26, reach: 248000 },
]

export function getComm(id: string | undefined) {
  return comms.find((comm) => comm.id === id)
}

export function timelineFor(id: string): CommEvent[] {
  const comm = getComm(id)
  if (!comm) return []
  return (
    commTimelines[id] ?? [
      {
        at: comm.createdOn,
        actor: comm.owner,
        action: comm.aiGenerated ? "Draft generated by agent" : "Draft created",
      },
      { at: comm.updatedOn, actor: comm.owner, action: "Last edited" },
    ]
  )
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function formatCompact(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
  return String(value)
}

export function wordCount(body: string) {
  return body.trim().split(/\s+/).filter(Boolean).length
}

export function readingMinutes(body: string) {
  return Math.max(1, Math.round(wordCount(body) / 200))
}

export function engagementRate(comm: Comm) {
  if (!comm.opens || !comm.reach) return null
  return Math.round((comm.opens / comm.reach) * 100)
}

export const isAwaitingApproval = (comm: Comm) => comm.status === "In Review"
