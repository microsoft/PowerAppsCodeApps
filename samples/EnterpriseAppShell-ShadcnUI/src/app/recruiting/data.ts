export type Stage =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Assessment"
  | "Offer"
  | "Hired"
  | "Rejected"

export type RoleStatus = "Open" | "On hold" | "Closed"
export type Priority = "High" | "Medium" | "Low"
export type InterviewKind =
  | "Screen"
  | "Technical"
  | "Panel"
  | "Values"
  | "Final"
export type InterviewStatus = "Scheduled" | "Completed" | "Cancelled"
export type Decision = "Advance" | "Hold" | "Reject" | null

export type Role = {
  id: string
  title: string
  department: string
  location: string
  level: string
  employmentType: string
  hiringManager: string
  recruiter: string
  openings: number
  opened: string
  targetStart: string
  status: RoleStatus
  priority: Priority
  salaryRange: string
  summary: string
  mustHaves: string[]
  niceToHaves: string[]
}

export type TimelineEntry = {
  at: string
  label: string
  detail: string
}

export type Candidate = {
  id: string
  name: string
  headline: string
  roleId: string
  stage: Stage
  source: string
  appliedOn: string
  location: string
  email: string
  phone: string
  years: number
  currentEmployer: string
  rating: number
  skills: string[]
  accent: 1 | 2 | 3 | 4 | 5
  summary: string
  nextStep: string
  timeline: TimelineEntry[]
}

export type TranscriptLine = {
  at: string
  speaker: string
  role: "Interviewer" | "Candidate"
  text: string
}

export type Quote = {
  id: string
  at: string
  speaker: string
  text: string
  tag: "strength" | "concern" | "signal"
}

export type Competency = {
  name: string
  score: number
  evidence: string
  quoteId: string
}

export type TranscriptAnalysis = {
  summary: string
  competencies: Competency[]
  strengths: string[]
  concerns: string[]
  quotes: Quote[]
  talkTime: { interviewer: number; candidate: number }
  sentiment: string
  followUps: string[]
  flags: string[]
}

export type Interview = {
  id: string
  candidateId: string
  roleId: string
  kind: InterviewKind
  start: string
  durationMins: number
  panel: string[]
  room: string
  status: InterviewStatus
  notes?: string
  transcript?: TranscriptLine[]
  insight?: TranscriptAnalysis
}

export const TODAY = "2026-09-02"

export const stages: Stage[] = [
  "Applied",
  "Screening",
  "Interview",
  "Assessment",
  "Offer",
  "Hired",
]

export const roles: Role[] = [
  {
    id: "ROL-101",
    title: "Senior Product Designer",
    department: "Design",
    location: "London",
    level: "Senior",
    employmentType: "Full-time",
    hiringManager: "Priya Raman",
    recruiter: "Tom Aldridge",
    openings: 2,
    opened: "2026-06-18",
    targetStart: "2026-11-02",
    status: "Open",
    priority: "High",
    salaryRange: "£78,000 – £94,000",
    summary:
      "Owns the end-to-end experience for the operations suite. Pairs closely with research and works in the open — this is a craft role with a strong systems bias, not a wireframe factory.",
    mustHaves: [
      "Shipped complex internal or B2B tooling, not just marketing surfaces",
      "Fluent with design systems and able to contribute components back",
      "Can run their own research and defend a decision with evidence",
    ],
    niceToHaves: [
      "Prototyping in code",
      "Experience in supply chain, logistics or field operations",
    ],
  },
  {
    id: "ROL-102",
    title: "Staff Platform Engineer",
    department: "Engineering",
    location: "Remote (UK)",
    level: "Staff",
    employmentType: "Full-time",
    hiringManager: "Marcus Webb",
    recruiter: "Tom Aldridge",
    openings: 1,
    opened: "2026-05-04",
    targetStart: "2026-10-05",
    status: "Open",
    priority: "High",
    salaryRange: "£105,000 – £128,000",
    summary:
      "Sets the direction for our deployment platform and developer experience. Half the job is technical judgement, half is bringing forty engineers along with you.",
    mustHaves: [
      "Deep Kubernetes and IaC experience at meaningful scale",
      "Track record of platform migrations that did not stall halfway",
      "Writes clearly — RFCs, postmortems, decision records",
    ],
    niceToHaves: ["Go or Rust", "Prior staff or principal scope"],
  },
  {
    id: "ROL-103",
    title: "Enterprise Account Executive",
    department: "Commercial",
    location: "Manchester",
    level: "Mid",
    employmentType: "Full-time",
    hiringManager: "Sofia Almeida",
    recruiter: "Ruth Kelly",
    openings: 3,
    opened: "2026-07-01",
    targetStart: "2026-10-19",
    status: "Open",
    priority: "Medium",
    salaryRange: "£62,000 base + commission",
    summary:
      "Runs six-figure deals into manufacturing and retail accounts across the north. Long cycles, multiple stakeholders, and a genuine need to understand the product.",
    mustHaves: [
      "Closed complex deals with a twelve-month-plus cycle",
      "Comfortable selling to operations and finance in the same room",
      "Disciplined with pipeline hygiene",
    ],
    niceToHaves: ["MEDDPICC", "Existing network in manufacturing"],
  },
  {
    id: "ROL-104",
    title: "Data Analyst, Supply Chain",
    department: "Operations",
    location: "Leeds",
    level: "Mid",
    employmentType: "Full-time",
    hiringManager: "Daniel Rowe",
    recruiter: "Ruth Kelly",
    openings: 1,
    opened: "2026-07-22",
    targetStart: "2026-11-16",
    status: "Open",
    priority: "Medium",
    salaryRange: "£54,000 – £64,000",
    summary:
      "Turns messy warehouse and carrier data into decisions the operations team actually make. Heavy SQL, light modelling, lots of stakeholder conversation.",
    mustHaves: [
      "Strong SQL and a warehouse-native mindset",
      "Has owned a metric end to end, including its definition",
    ],
    niceToHaves: ["dbt", "Python", "Forecasting experience"],
  },
  {
    id: "ROL-105",
    title: "Customer Success Manager",
    department: "Commercial",
    location: "Dublin",
    level: "Mid",
    employmentType: "Full-time",
    hiringManager: "Sofia Almeida",
    recruiter: "Ruth Kelly",
    openings: 1,
    opened: "2026-04-14",
    targetStart: "2026-09-14",
    status: "On hold",
    priority: "Low",
    salaryRange: "€58,000 – €68,000",
    summary:
      "Paused while the Dublin territory plan is reworked. Two candidates are warm and have been told honestly where things stand.",
    mustHaves: ["Owned renewals for enterprise accounts"],
    niceToHaves: ["Second language"],
  },
  {
    id: "ROL-106",
    title: "Security Engineer",
    department: "Engineering",
    location: "London",
    level: "Senior",
    employmentType: "Full-time",
    hiringManager: "Marcus Webb",
    recruiter: "Tom Aldridge",
    openings: 1,
    opened: "2026-08-10",
    targetStart: "2026-12-01",
    status: "Open",
    priority: "High",
    salaryRange: "£92,000 – £110,000",
    summary:
      "Application security with a product mindset. Sits with engineering teams rather than gatekeeping from a distance.",
    mustHaves: [
      "Threat modelling on real products",
      "Can read and review code in at least two languages",
    ],
    niceToHaves: ["Cloud security certifications", "Detection engineering"],
  },
]

export const candidates: Candidate[] = [
  {
    id: "ivy-chen",
    name: "Ivy Chen",
    headline: "Product Designer at Northwind Logistics",
    roleId: "ROL-101",
    stage: "Offer",
    source: "Referral",
    appliedOn: "2026-07-09",
    location: "London",
    email: "ivy.chen@example.com",
    phone: "+44 7700 900118",
    years: 8,
    currentEmployer: "Northwind Logistics",
    rating: 4.6,
    skills: ["Design systems", "Research", "Figma", "Prototyping", "Ops tooling"],
    accent: 1,
    summary:
      "Rebuilt Northwind's dispatch console from a 14-screen mess into four. Brought the research herself, shipped it in stages, and can point at the numbers that moved.",
    nextStep: "Offer approved — verbal going out Thursday",
    timeline: [
      { at: "2026-07-09", label: "Applied", detail: "Referred by Priya Raman" },
      { at: "2026-07-14", label: "Screen", detail: "Tom Aldridge · 30 min" },
      { at: "2026-08-05", label: "Portfolio review", detail: "Scored 4.6 / 5" },
      { at: "2026-08-28", label: "Panel", detail: "Design, Engineering, Ops" },
      { at: "2026-09-01", label: "Offer approved", detail: "£91,000 + equity" },
    ],
  },
  {
    id: "rowan-blake",
    name: "Rowan Blake",
    headline: "Senior Infrastructure Engineer at Caldera",
    roleId: "ROL-102",
    stage: "Interview",
    source: "Outbound",
    appliedOn: "2026-07-28",
    location: "Bristol",
    email: "rowan.blake@example.com",
    phone: "+44 7700 900224",
    years: 11,
    currentEmployer: "Caldera Systems",
    rating: 3.8,
    skills: ["Kubernetes", "Terraform", "Go", "Observability", "CI/CD"],
    accent: 2,
    summary:
      "Technically deep and clearly enjoys the work. The open question is scope: everything described is hands-on, and this role needs someone who can carry other teams with them.",
    nextStep: "Awaiting panel decision on staff-level scope",
    timeline: [
      { at: "2026-07-28", label: "Sourced", detail: "Outbound by Tom Aldridge" },
      { at: "2026-08-04", label: "Screen", detail: "Passed · 4 / 5" },
      { at: "2026-08-31", label: "Technical", detail: "Marcus Webb · 60 min" },
    ],
  },
  {
    id: "jonah-price",
    name: "Jonah Price",
    headline: "Account Executive at Meridian Software",
    roleId: "ROL-103",
    stage: "Screening",
    source: "Job board",
    appliedOn: "2026-08-20",
    location: "Manchester",
    email: "jonah.price@example.com",
    phone: "+44 7700 900331",
    years: 6,
    currentEmployer: "Meridian Software",
    rating: 2.9,
    skills: ["Enterprise sales", "MEDDPICC", "Forecasting"],
    accent: 3,
    summary:
      "Strong numbers on paper, but the screen surfaced a mismatch: the deals described were mostly inherited renewals rather than new logo work.",
    nextStep: "Recruiter to verify quota attainment claims",
    timeline: [
      { at: "2026-08-20", label: "Applied", detail: "LinkedIn" },
      { at: "2026-09-01", label: "Screen", detail: "Ruth Kelly · 30 min" },
    ],
  },
  {
    id: "amara-diallo",
    name: "Amara Diallo",
    headline: "Staff Engineer at Bluefield",
    roleId: "ROL-102",
    stage: "Assessment",
    source: "Referral",
    appliedOn: "2026-07-15",
    location: "Remote (UK)",
    email: "amara.diallo@example.com",
    phone: "+44 7700 900447",
    years: 13,
    currentEmployer: "Bluefield",
    rating: 4.4,
    skills: ["Platform", "Kubernetes", "Rust", "Mentoring", "RFCs"],
    accent: 4,
    summary:
      "Led a two-year platform migration at Bluefield without a freeze. Writes exceptionally well; the RFC she sent unprompted was better than most of ours.",
    nextStep: "System design exercise returned — panel reviewing",
    timeline: [
      { at: "2026-07-15", label: "Applied", detail: "Referred by Marcus Webb" },
      { at: "2026-08-01", label: "Screen", detail: "Passed · 5 / 5" },
      { at: "2026-08-19", label: "Technical", detail: "Passed · 4.5 / 5" },
      { at: "2026-08-29", label: "Exercise sent", detail: "Due 2026-09-05" },
    ],
  },
  {
    id: "sam-okoro",
    name: "Sam Okoro",
    headline: "Senior Designer at Vantage Retail",
    roleId: "ROL-101",
    stage: "Interview",
    source: "Agency",
    appliedOn: "2026-08-02",
    location: "London",
    email: "sam.okoro@example.com",
    phone: "+44 7700 900552",
    years: 7,
    currentEmployer: "Vantage Retail",
    rating: 4.1,
    skills: ["Design systems", "Accessibility", "Figma", "Workshops"],
    accent: 5,
    summary:
      "Best accessibility work we have seen in this pipeline. Portfolio is retail-heavy, so the panel wants to probe how they handle dense operational data.",
    nextStep: "Panel booked for 2026-09-04",
    timeline: [
      { at: "2026-08-02", label: "Applied", detail: "Via Harbour Talent" },
      { at: "2026-08-11", label: "Screen", detail: "Passed · 4 / 5" },
      { at: "2026-08-25", label: "Portfolio review", detail: "Scored 4.1 / 5" },
    ],
  },
  {
    id: "elena-costa",
    name: "Elena Costa",
    headline: "Data Analyst at Portside Freight",
    roleId: "ROL-104",
    stage: "Interview",
    source: "Job board",
    appliedOn: "2026-08-06",
    location: "Leeds",
    email: "elena.costa@example.com",
    phone: "+44 7700 900667",
    years: 5,
    currentEmployer: "Portside Freight",
    rating: 4.2,
    skills: ["SQL", "dbt", "Python", "Warehouse ops"],
    accent: 2,
    summary:
      "Rebuilt on-time-delivery reporting at Portside and had the confidence to change the metric definition when it was measuring the wrong thing.",
    nextStep: "Hiring manager interview 2026-09-03",
    timeline: [
      { at: "2026-08-06", label: "Applied", detail: "Direct" },
      { at: "2026-08-18", label: "Screen", detail: "Passed · 4 / 5" },
      { at: "2026-08-27", label: "SQL exercise", detail: "Scored 4.2 / 5" },
    ],
  },
  {
    id: "harry-mills",
    name: "Harry Mills",
    headline: "Security Engineer at Lattice",
    roleId: "ROL-106",
    stage: "Screening",
    source: "Outbound",
    appliedOn: "2026-08-24",
    location: "London",
    email: "harry.mills@example.com",
    phone: "+44 7700 900771",
    years: 9,
    currentEmployer: "Lattice",
    rating: 3.9,
    skills: ["AppSec", "Threat modelling", "Python", "Detection"],
    accent: 3,
    summary:
      "Comes from a heavily regulated environment. Wants to move somewhere the security team is embedded rather than consulted at the end.",
    nextStep: "Screen scheduled 2026-09-03",
    timeline: [
      { at: "2026-08-24", label: "Sourced", detail: "Outbound by Tom Aldridge" },
    ],
  },
  {
    id: "nina-farrow",
    name: "Nina Farrow",
    headline: "Enterprise AE at Stonebridge",
    roleId: "ROL-103",
    stage: "Interview",
    source: "Referral",
    appliedOn: "2026-07-30",
    location: "Manchester",
    email: "nina.farrow@example.com",
    phone: "+44 7700 900884",
    years: 9,
    currentEmployer: "Stonebridge",
    rating: 4.5,
    skills: ["New logo", "Manufacturing", "MEDDPICC", "Negotiation"],
    accent: 1,
    summary:
      "Two consecutive years above quota on genuinely new business. Referred by an existing customer, which is about as good a signal as we get.",
    nextStep: "Panel with Sofia Almeida 2026-09-04",
    timeline: [
      { at: "2026-07-30", label: "Applied", detail: "Customer referral" },
      { at: "2026-08-12", label: "Screen", detail: "Passed · 5 / 5" },
      { at: "2026-08-26", label: "Deal review", detail: "Scored 4.5 / 5" },
    ],
  },
  {
    id: "tomas-vidal",
    name: "Tomás Vidal",
    headline: "Product Designer at Kelp",
    roleId: "ROL-101",
    stage: "Applied",
    source: "Job board",
    appliedOn: "2026-08-29",
    location: "Lisbon",
    email: "tomas.vidal@example.com",
    phone: "+351 910 000 121",
    years: 6,
    currentEmployer: "Kelp",
    rating: 3.6,
    skills: ["Figma", "Motion", "Design systems"],
    accent: 4,
    summary:
      "Strong visual craft. Portfolio is consumer-led and there is a visa question to work through before we invest interview time.",
    nextStep: "Portfolio triage with Priya Raman",
    timeline: [{ at: "2026-08-29", label: "Applied", detail: "Direct" }],
  },
  {
    id: "grace-liu",
    name: "Grace Liu",
    headline: "Analytics Engineer at Mercia",
    roleId: "ROL-104",
    stage: "Applied",
    source: "Referral",
    appliedOn: "2026-08-31",
    location: "Leeds",
    email: "grace.liu@example.com",
    phone: "+44 7700 900993",
    years: 4,
    currentEmployer: "Mercia Group",
    rating: 3.9,
    skills: ["SQL", "dbt", "Looker"],
    accent: 5,
    summary:
      "Referred by Elena's former colleague. Slightly junior for the brief but the modelling work in her portfolio is tidy.",
    nextStep: "Screen to be booked",
    timeline: [
      { at: "2026-08-31", label: "Applied", detail: "Referred by Daniel Rowe" },
    ],
  },
  {
    id: "victor-marsh",
    name: "Victor Marsh",
    headline: "Platform Engineer at Halden",
    roleId: "ROL-102",
    stage: "Rejected",
    source: "Job board",
    appliedOn: "2026-06-30",
    location: "Glasgow",
    email: "victor.marsh@example.com",
    phone: "+44 7700 900112",
    years: 7,
    currentEmployer: "Halden",
    rating: 2.7,
    skills: ["Kubernetes", "Jenkins"],
    accent: 3,
    summary:
      "Solid mid-level engineer, but the platform work described was operational rather than architectural. Told directly and kept warm for a future mid-level opening.",
    nextStep: "Closed — feedback sent 2026-08-14",
    timeline: [
      { at: "2026-06-30", label: "Applied", detail: "Direct" },
      { at: "2026-07-21", label: "Screen", detail: "3 / 5" },
      { at: "2026-08-14", label: "Rejected", detail: "Scope mismatch" },
    ],
  },
  {
    id: "ade-balogun",
    name: "Ade Balogun",
    headline: "Customer Success Lead at Orbit",
    roleId: "ROL-105",
    stage: "Screening",
    source: "Referral",
    appliedOn: "2026-06-11",
    location: "Dublin",
    email: "ade.balogun@example.com",
    phone: "+353 89 000 0134",
    years: 8,
    currentEmployer: "Orbit",
    rating: 4.0,
    skills: ["Renewals", "Onboarding", "QBRs"],
    accent: 2,
    summary:
      "Kept warm while the role is on hold. Has been told the honest position and is still interested as of last week.",
    nextStep: "Fortnightly check-in — role paused",
    timeline: [
      { at: "2026-06-11", label: "Applied", detail: "Referred by Sofia Almeida" },
      { at: "2026-06-25", label: "Screen", detail: "Passed · 4 / 5" },
      { at: "2026-08-20", label: "Paused", detail: "Role on hold" },
    ],
  },
  {
    id: "mira-hansen",
    name: "Mira Hansen",
    headline: "Senior Designer at Fold",
    roleId: "ROL-101",
    stage: "Hired",
    source: "Agency",
    appliedOn: "2026-05-19",
    location: "London",
    email: "mira.hansen@example.com",
    phone: "+44 7700 900145",
    years: 9,
    currentEmployer: "Fold",
    rating: 4.7,
    skills: ["Design systems", "Research", "Facilitation"],
    accent: 1,
    summary:
      "First of the two design openings. Signed on 2026-08-15 and starts in October — her pre-boarding is already running.",
    nextStep: "Starts 2026-10-05",
    timeline: [
      { at: "2026-05-19", label: "Applied", detail: "Via Harbour Talent" },
      { at: "2026-07-02", label: "Panel", detail: "Scored 4.7 / 5" },
      { at: "2026-08-15", label: "Offer accepted", detail: "Starts October" },
    ],
  },
  {
    id: "leo-mbeki",
    name: "Leo Mbeki",
    headline: "Security Analyst at Fenwick",
    roleId: "ROL-106",
    stage: "Applied",
    source: "Outbound",
    appliedOn: "2026-08-27",
    location: "London",
    email: "leo.mbeki@example.com",
    phone: "+44 7700 900156",
    years: 5,
    currentEmployer: "Fenwick",
    rating: 3.4,
    skills: ["SOC", "Detection", "Python"],
    accent: 4,
    summary:
      "Detection background rather than application security. Worth a conversation but the shape is not an obvious match.",
    nextStep: "Recruiter triage",
    timeline: [
      { at: "2026-08-27", label: "Sourced", detail: "Outbound by Tom Aldridge" },
    ],
  },
]

const ivyTranscript: TranscriptLine[] = [
  {
    at: "00:00",
    speaker: "Priya Raman",
    role: "Interviewer",
    text: "Thanks for making the time, Ivy. I'd like to spend most of this on the dispatch console work — start wherever the story starts for you.",
  },
  {
    at: "00:18",
    speaker: "Ivy Chen",
    role: "Candidate",
    text: "It starts with a complaint, honestly. Dispatchers were printing screens and annotating them by hand. That was the signal. Nobody prints a screen they trust.",
  },
  {
    at: "00:41",
    speaker: "Ivy Chen",
    role: "Candidate",
    text: "So before touching Figma I spent four shifts in the Rotherham depot. Two nights, two days, because the night team works completely differently and everyone forgets that.",
  },
  {
    at: "01:12",
    speaker: "Priya Raman",
    role: "Interviewer",
    text: "What did the night shift change?",
  },
  {
    at: "01:19",
    speaker: "Ivy Chen",
    role: "Candidate",
    text: "Everything about density. Days are interrupt-driven, nights are batch. The original design optimised for one person looking at one job. At night one person holds forty. We ended up with two modes rather than one compromise.",
  },
  {
    at: "01:58",
    speaker: "Marcus Webb",
    role: "Interviewer",
    text: "Two modes is a maintenance cost. How did you justify it?",
  },
  {
    at: "02:07",
    speaker: "Ivy Chen",
    role: "Candidate",
    text: "I didn't at first — I tried hard to avoid it. We prototyped a single adaptive view and tested it with six dispatchers. It failed for both groups, which was actually the useful result. I took that recording to the engineering lead rather than an opinion.",
  },
  {
    at: "02:44",
    speaker: "Ivy Chen",
    role: "Candidate",
    text: "The compromise was that both modes share the same component library. It's one system with two arrangements, not two products. That kept the cost bounded.",
  },
  {
    at: "03:15",
    speaker: "Marcus Webb",
    role: "Interviewer",
    text: "How did you sequence the rollout?",
  },
  {
    at: "03:22",
    speaker: "Ivy Chen",
    role: "Candidate",
    text: "One depot at a time, and we kept the old console one click away for six weeks. That was non-negotiable for me. If you take away the escape hatch you don't get honest feedback, you get compliance.",
  },
  {
    at: "03:58",
    speaker: "Priya Raman",
    role: "Interviewer",
    text: "Did people use the escape hatch?",
  },
  {
    at: "04:03",
    speaker: "Ivy Chen",
    role: "Candidate",
    text: "Heavily in week one, about forty per cent of sessions. By week four it was under three per cent and we switched it off at week seven. That curve was our real success metric.",
  },
  {
    at: "04:35",
    speaker: "Sofia Almeida",
    role: "Interviewer",
    text: "What actually moved as a result?",
  },
  {
    at: "04:41",
    speaker: "Ivy Chen",
    role: "Candidate",
    text: "Time to assign a job went from a median of ninety-four seconds to thirty-one. Mis-assignments dropped by about a fifth. I'm less proud of that number than the fact that we agreed on it before we designed anything.",
  },
  {
    at: "05:20",
    speaker: "Sofia Almeida",
    role: "Interviewer",
    text: "Tell me about something in that project you got wrong.",
  },
  {
    at: "05:27",
    speaker: "Ivy Chen",
    role: "Candidate",
    text: "The keyboard model. I designed for mouse first because that's what I watched people do, but the fastest dispatchers were keyboard-only and I'd made them slower. We shipped, they complained, and we spent a fortnight retrofitting shortcuts that should have been there from the start.",
  },
  {
    at: "06:10",
    speaker: "Ivy Chen",
    role: "Candidate",
    text: "The lesson I took wasn't 'add shortcuts'. It was that I'd sampled the average user and ignored the expert tail, and the expert tail is who defends your product internally.",
  },
  {
    at: "06:44",
    speaker: "Priya Raman",
    role: "Interviewer",
    text: "How do you work with engineers day to day?",
  },
  {
    at: "06:50",
    speaker: "Ivy Chen",
    role: "Candidate",
    text: "In their pull requests, mostly. I can read the component code and I'll open a PR for a spacing token rather than file a ticket about it. It saves an argument and it earns you the right to be pedantic about the things that matter.",
  },
  {
    at: "07:28",
    speaker: "Marcus Webb",
    role: "Interviewer",
    text: "Anything you'd want to know about us?",
  },
  {
    at: "07:33",
    speaker: "Ivy Chen",
    role: "Candidate",
    text: "Who says no. Not who approves — who is allowed to stop a thing shipping when it isn't right. If that person doesn't exist, quality is a preference rather than a standard.",
  },
]

const rowanTranscript: TranscriptLine[] = [
  {
    at: "00:00",
    speaker: "Marcus Webb",
    role: "Interviewer",
    text: "Rowan, walk me through the Caldera platform as it stands today.",
  },
  {
    at: "00:11",
    speaker: "Rowan Blake",
    role: "Candidate",
    text: "Forty-odd services on EKS, Terraform for everything below the cluster, Helm above it. I own the deployment pipeline and most of the observability stack.",
  },
  {
    at: "00:38",
    speaker: "Rowan Blake",
    role: "Candidate",
    text: "I rewrote the pipeline last year — it was Jenkins, it's now Argo with a thin Go controller I wrote to handle our promotion rules. Deploy time went from twenty-two minutes to about four.",
  },
  {
    at: "01:14",
    speaker: "Marcus Webb",
    role: "Interviewer",
    text: "How did you get the other teams onto it?",
  },
  {
    at: "01:20",
    speaker: "Rowan Blake",
    role: "Candidate",
    text: "I migrated them. I wrote a script that translated the old config and I ran it service by service over about three months. Most teams found out when their pipeline got faster.",
  },
  {
    at: "01:52",
    speaker: "Marcus Webb",
    role: "Interviewer",
    text: "Was that the plan from the start, or did you land on it?",
  },
  {
    at: "01:58",
    speaker: "Rowan Blake",
    role: "Candidate",
    text: "Bit of both. I tried a voluntary migration first and got two teams in six weeks. It was going to take two years at that rate, so I stopped asking.",
  },
  {
    at: "02:31",
    speaker: "Ana Petrov",
    role: "Interviewer",
    text: "How did the teams react afterwards?",
  },
  {
    at: "02:36",
    speaker: "Rowan Blake",
    role: "Candidate",
    text: "Two were annoyed. One of them still runs a parallel pipeline out of spite, which I've stopped fighting about. The rest were fine once it was faster.",
  },
  {
    at: "03:09",
    speaker: "Ana Petrov",
    role: "Interviewer",
    text: "Is there anything you'd do differently?",
  },
  {
    at: "03:14",
    speaker: "Rowan Blake",
    role: "Candidate",
    text: "Probably communicate more up front. Though honestly, the outcome was right and I'd rather be judged on that than on how many meetings I held.",
  },
  {
    at: "03:47",
    speaker: "Marcus Webb",
    role: "Interviewer",
    text: "Let's talk failure. Worst incident you've owned.",
  },
  {
    at: "03:53",
    speaker: "Rowan Blake",
    role: "Candidate",
    text: "Certificate rotation took the mesh down for fifty minutes. My change, my mistake — I'd tested the rotation but not the rotation under load, and the sidecars all reconnected at once.",
  },
  {
    at: "04:31",
    speaker: "Rowan Blake",
    role: "Candidate",
    text: "We added jitter, and I wrote the postmortem. What I'd flag is that the same class of thundering-herd bug bit us again nine months later in a different component, so the fix was local rather than systemic.",
  },
  {
    at: "05:08",
    speaker: "Marcus Webb",
    role: "Interviewer",
    text: "How do you decide what the platform should not do?",
  },
  {
    at: "05:15",
    speaker: "Rowan Blake",
    role: "Candidate",
    text: "Gut, mostly. If a request comes from one team I'll usually say no, if it comes from three I'll build it. I haven't written that down anywhere.",
  },
  {
    at: "05:49",
    speaker: "Ana Petrov",
    role: "Interviewer",
    text: "Have you mentored anyone through platform work?",
  },
  {
    at: "05:55",
    speaker: "Rowan Blake",
    role: "Candidate",
    text: "Informally. I pair when people ask. I've not had a formal report and I've not run a design review process, if that's the question.",
  },
  {
    at: "06:29",
    speaker: "Marcus Webb",
    role: "Interviewer",
    text: "It's part of it, yes. This role has forty engineers downstream of it.",
  },
  {
    at: "06:37",
    speaker: "Rowan Blake",
    role: "Candidate",
    text: "Understood. I'd want to be honest that the influence side is the part I've done least of. I'm not going to pretend otherwise — I'd need support on it.",
  },
]

const jonahTranscript: TranscriptLine[] = [
  {
    at: "00:00",
    speaker: "Ruth Kelly",
    role: "Interviewer",
    text: "Jonah, give me a sense of your patch at Meridian and the kind of deals you run.",
  },
  {
    at: "00:12",
    speaker: "Jonah Price",
    role: "Candidate",
    text: "Enterprise north, mostly manufacturing. Quota's one-point-two million, I finished last year at about a hundred and fifteen per cent.",
  },
  {
    at: "00:39",
    speaker: "Ruth Kelly",
    role: "Interviewer",
    text: "How does that split between new business and existing accounts?",
  },
  {
    at: "00:46",
    speaker: "Jonah Price",
    role: "Candidate",
    text: "It's a blend. There's always some renewal in the number. I'd say healthy on both sides.",
  },
  {
    at: "01:11",
    speaker: "Ruth Kelly",
    role: "Interviewer",
    text: "Roughly what proportion was net new logo?",
  },
  {
    at: "01:17",
    speaker: "Jonah Price",
    role: "Candidate",
    text: "I'd have to look. The way we count it, an expansion into a new division counts as new, so the number moves depending who you ask.",
  },
  {
    at: "01:49",
    speaker: "Ruth Kelly",
    role: "Interviewer",
    text: "Take the largest deal you closed last year. Walk me through it.",
  },
  {
    at: "01:56",
    speaker: "Jonah Price",
    role: "Candidate",
    text: "About four hundred thousand, a manufacturer in Sheffield. Long one, took most of the year. Lots of stakeholders, procurement got involved late as usual.",
  },
  {
    at: "02:28",
    speaker: "Ruth Kelly",
    role: "Interviewer",
    text: "Who was the economic buyer and how did you get to them?",
  },
  {
    at: "02:34",
    speaker: "Jonah Price",
    role: "Candidate",
    text: "Operations director, I think. The relationship was already there when I picked the account up — my predecessor had been working it. I carried it over the line.",
  },
  {
    at: "03:06",
    speaker: "Ruth Kelly",
    role: "Interviewer",
    text: "What was the compelling event?",
  },
  {
    at: "03:11",
    speaker: "Jonah Price",
    role: "Candidate",
    text: "Their contract was up. That's usually enough in this market, in fairness.",
  },
  {
    at: "03:38",
    speaker: "Ruth Kelly",
    role: "Interviewer",
    text: "Tell me about a deal you lost and what you learned.",
  },
  {
    at: "03:44",
    speaker: "Jonah Price",
    role: "Candidate",
    text: "Lost one on price to a competitor undercutting us by thirty per cent. Not much you can do there — that's a pricing problem, not a sales problem.",
  },
  {
    at: "04:16",
    speaker: "Ruth Kelly",
    role: "Interviewer",
    text: "How do you keep your pipeline honest?",
  },
  {
    at: "04:22",
    speaker: "Jonah Price",
    role: "Candidate",
    text: "I know my accounts. The CRM is more for management than for me, if I'm honest — I keep the real picture in my head and update it before forecast calls.",
  },
  {
    at: "04:56",
    speaker: "Ruth Kelly",
    role: "Interviewer",
    text: "What's drawing you to us specifically?",
  },
  {
    at: "05:02",
    speaker: "Jonah Price",
    role: "Candidate",
    text: "Good growth story, and the territory's the same one I already know. The commission structure looked strong when the agency talked me through it.",
  },
]

export const interviews: Interview[] = [
  {
    id: "INT-3011",
    candidateId: "ivy-chen",
    roleId: "ROL-101",
    kind: "Panel",
    start: "2026-08-28T10:00",
    durationMins: 60,
    panel: ["Priya Raman", "Marcus Webb", "Sofia Almeida"],
    room: "Kestrel · London",
    status: "Completed",
    transcript: ivyTranscript,
    insight: {
      summary:
        "An unusually evidence-led interview. Ivy narrated a genuine end-to-end product decision — depot research, a prototype that failed, a bounded compromise, a staged rollout with an escape hatch, and a metric agreed before design started. She volunteered a real mistake and drew a structural lesson from it rather than a cosmetic one. Panel questions were answered directly with almost no hedging.",
      competencies: [
        {
          name: "Research rigour",
          score: 5,
          evidence:
            "Spent four shifts on site across days and nights, then used a failed prototype test as the deciding evidence.",
          quoteId: "q2",
        },
        {
          name: "Systems thinking",
          score: 5,
          evidence:
            "Resolved the two-mode problem by binding both arrangements to one shared component library, keeping maintenance cost bounded.",
          quoteId: "q3",
        },
        {
          name: "Delivery judgement",
          score: 4,
          evidence:
            "Staged rollout by depot with a six-week fallback, then used fallback usage decay as the adoption signal.",
          quoteId: "q4",
        },
        {
          name: "Self-awareness",
          score: 5,
          evidence:
            "Named the keyboard-model failure unprompted and generalised it to sampling the average user over the expert tail.",
          quoteId: "q5",
        },
        {
          name: "Engineering collaboration",
          score: 4,
          evidence:
            "Contributes directly to component pull requests rather than filing tickets.",
          quoteId: "q6",
        },
      ],
      strengths: [
        "Every claim was attached to an observation, a number or a recording",
        "Treated a failed prototype as the useful result rather than a setback",
        "Made a maintenance-cost argument unprompted — thinks past the handover",
        "Closing question about who is allowed to stop a release shows she reads organisations, not just briefs",
      ],
      concerns: [
        "All examples came from the same employer and the same problem space",
        "No discussion of working with a design team of peers — the work described was largely solo",
      ],
      quotes: [
        {
          id: "q1",
          at: "00:18",
          speaker: "Ivy Chen",
          text: "Nobody prints a screen they trust.",
          tag: "signal",
        },
        {
          id: "q2",
          at: "02:07",
          speaker: "Ivy Chen",
          text: "It failed for both groups, which was actually the useful result. I took that recording to the engineering lead rather than an opinion.",
          tag: "strength",
        },
        {
          id: "q3",
          at: "02:44",
          speaker: "Ivy Chen",
          text: "It's one system with two arrangements, not two products. That kept the cost bounded.",
          tag: "strength",
        },
        {
          id: "q4",
          at: "03:22",
          speaker: "Ivy Chen",
          text: "If you take away the escape hatch you don't get honest feedback, you get compliance.",
          tag: "strength",
        },
        {
          id: "q5",
          at: "06:10",
          speaker: "Ivy Chen",
          text: "I'd sampled the average user and ignored the expert tail, and the expert tail is who defends your product internally.",
          tag: "strength",
        },
        {
          id: "q6",
          at: "06:50",
          speaker: "Ivy Chen",
          text: "I'll open a PR for a spacing token rather than file a ticket about it.",
          tag: "signal",
        },
        {
          id: "q7",
          at: "04:41",
          speaker: "Ivy Chen",
          text: "I'm less proud of that number than the fact that we agreed on it before we designed anything.",
          tag: "strength",
        },
      ],
      talkTime: { interviewer: 24, candidate: 76 },
      sentiment: "Warm and direct throughout; no defensiveness under challenge",
      followUps: [
        "Ask for one example from a different employer or problem domain",
        "Probe how she operates inside a design team of peers rather than as the sole designer",
        "Reference check with the Northwind engineering lead on the pull-request collaboration",
      ],
      flags: [],
    },
  },
  {
    id: "INT-3014",
    candidateId: "rowan-blake",
    roleId: "ROL-102",
    kind: "Technical",
    start: "2026-08-31T14:00",
    durationMins: 60,
    panel: ["Marcus Webb", "Ana Petrov"],
    room: "Remote · Teams",
    status: "Completed",
    transcript: rowanTranscript,
    insight: {
      summary:
        "Technically credible and honest, but the evidence points at a senior individual contributor rather than a staff engineer. The pipeline rewrite was real and well executed; the adoption strategy was to migrate teams unilaterally after voluntary uptake stalled, and one team still runs a shadow pipeline. Decision-making about platform scope is intuition-led and undocumented. He named the influence gap himself without being cornered into it.",
      competencies: [
        {
          name: "Technical depth",
          score: 5,
          evidence:
            "Replaced Jenkins with Argo plus a bespoke Go promotion controller; deploy time 22 minutes to 4.",
          quoteId: "r1",
        },
        {
          name: "Organisational influence",
          score: 2,
          evidence:
            "Voluntary migration stalled at two teams in six weeks, so he migrated the rest by script without buy-in.",
          quoteId: "r2",
        },
        {
          name: "Incident ownership",
          score: 4,
          evidence:
            "Owned a 50-minute mesh outage and wrote the postmortem, but the fix was local and the same failure class recurred.",
          quoteId: "r4",
        },
        {
          name: "Judgement and rationale",
          score: 3,
          evidence:
            "Platform scope decided by request count with no written principles or design review process.",
          quoteId: "r5",
        },
        {
          name: "Candour",
          score: 5,
          evidence:
            "Volunteered that the influence side is his weakest area and asked for support rather than overselling.",
          quoteId: "r6",
        },
      ],
      strengths: [
        "Genuine hands-on depth — the Go controller and the Argo migration are real, non-trivial work",
        "Honest about the shadow pipeline and the recurring thundering-herd bug",
        "Named his own development gap without prompting, which is rare at this level",
      ],
      concerns: [
        "Adoption strategy was to bypass resistance rather than resolve it, and one team is still opted out",
        "The certificate-rotation fix was local; the same failure class recurred nine months later",
        "No written principles for platform scope; no mentoring, no design review, no formal reports",
        "'I'd rather be judged on the outcome than on how many meetings I held' reads as a values mismatch for a role with forty engineers downstream",
      ],
      quotes: [
        {
          id: "r1",
          at: "00:38",
          speaker: "Rowan Blake",
          text: "I rewrote the pipeline last year… Deploy time went from twenty-two minutes to about four.",
          tag: "strength",
        },
        {
          id: "r2",
          at: "01:58",
          speaker: "Rowan Blake",
          text: "I tried a voluntary migration first and got two teams in six weeks… so I stopped asking.",
          tag: "concern",
        },
        {
          id: "r3",
          at: "03:14",
          speaker: "Rowan Blake",
          text: "I'd rather be judged on that than on how many meetings I held.",
          tag: "concern",
        },
        {
          id: "r4",
          at: "04:31",
          speaker: "Rowan Blake",
          text: "The same class of thundering-herd bug bit us again nine months later in a different component, so the fix was local rather than systemic.",
          tag: "signal",
        },
        {
          id: "r5",
          at: "05:15",
          speaker: "Rowan Blake",
          text: "Gut, mostly… I haven't written that down anywhere.",
          tag: "concern",
        },
        {
          id: "r6",
          at: "06:37",
          speaker: "Rowan Blake",
          text: "I'd want to be honest that the influence side is the part I've done least of… I'd need support on it.",
          tag: "strength",
        },
      ],
      talkTime: { interviewer: 29, candidate: 71 },
      sentiment: "Relaxed and open; slight defensiveness on the migration question",
      followUps: [
        "Ask him to write a short RFC on platform scope — the gap is documentation of judgement, not judgement itself",
        "Reference check with one of the two teams that resisted the migration",
        "Decide explicitly whether this is a staff hire or a strong senior hire before scheduling anything further",
      ],
      flags: [
        "Levelling mismatch: evidence supports Senior, requisition is Staff",
      ],
    },
  },
  {
    id: "INT-3016",
    candidateId: "jonah-price",
    roleId: "ROL-103",
    kind: "Screen",
    start: "2026-09-01T09:30",
    durationMins: 30,
    panel: ["Ruth Kelly"],
    room: "Remote · Teams",
    status: "Completed",
    transcript: jonahTranscript,
    insight: {
      summary:
        "Headline attainment of 115% could not be substantiated during the call. Every attempt to separate new business from renewal was deflected, the flagship deal was inherited from a predecessor with an existing relationship, the compelling event was a contract expiry, and the loss review externalised entirely onto pricing. Stated motivation was territory familiarity and commission rather than the product or the problem.",
      competencies: [
        {
          name: "New business capability",
          score: 2,
          evidence:
            "Largest deal was an inherited account with a pre-existing relationship; carried over the line rather than originated.",
          quoteId: "j3",
        },
        {
          name: "Deal qualification",
          score: 2,
          evidence:
            "Economic buyer identified with 'I think'; compelling event was simply a contract expiry.",
          quoteId: "j4",
        },
        {
          name: "Numerical transparency",
          score: 1,
          evidence:
            "Deflected the new-logo split twice and framed the definition as dependent on who is asking.",
          quoteId: "j2",
        },
        {
          name: "Accountability",
          score: 2,
          evidence:
            "Attributed a competitive loss entirely to pricing with no reflection on qualification or value framing.",
          quoteId: "j5",
        },
        {
          name: "Pipeline discipline",
          score: 2,
          evidence:
            "Keeps the real forecast in his head and updates the CRM before forecast calls.",
          quoteId: "j6",
        },
      ],
      strengths: [
        "Knows the Manchester manufacturing territory and speaks its language",
        "Comfortable and fluent in conversation — no problem with senior stakeholders",
      ],
      concerns: [
        "Quota attainment claim could not be broken down when asked twice",
        "Flagship deal was inherited, and he said so only when pressed",
        "No evidence of originating a deal or creating a compelling event",
        "CRM described as a management artefact rather than a working tool — directly at odds with the pipeline hygiene requirement",
        "Motivation is territory convenience and commission structure",
      ],
      quotes: [
        {
          id: "j1",
          at: "00:12",
          speaker: "Jonah Price",
          text: "Quota's one-point-two million, I finished last year at about a hundred and fifteen per cent.",
          tag: "signal",
        },
        {
          id: "j2",
          at: "01:17",
          speaker: "Jonah Price",
          text: "The way we count it, an expansion into a new division counts as new, so the number moves depending who you ask.",
          tag: "concern",
        },
        {
          id: "j3",
          at: "02:34",
          speaker: "Jonah Price",
          text: "The relationship was already there when I picked the account up — my predecessor had been working it. I carried it over the line.",
          tag: "concern",
        },
        {
          id: "j4",
          at: "03:11",
          speaker: "Jonah Price",
          text: "Their contract was up. That's usually enough in this market, in fairness.",
          tag: "concern",
        },
        {
          id: "j5",
          at: "03:44",
          speaker: "Jonah Price",
          text: "That's a pricing problem, not a sales problem.",
          tag: "concern",
        },
        {
          id: "j6",
          at: "04:22",
          speaker: "Jonah Price",
          text: "The CRM is more for management than for me… I keep the real picture in my head.",
          tag: "concern",
        },
      ],
      talkTime: { interviewer: 33, candidate: 67 },
      sentiment: "Confident but evasive when asked for specifics",
      followUps: [
        "If progressing regardless, require a written deal breakdown with named accounts before any further time is invested",
        "Verify attainment through a back-channel reference rather than the agency",
      ],
      flags: [
        "Unverified attainment claim",
        "Stated CRM practice conflicts with a must-have requirement",
      ],
    },
  },
  {
    id: "INT-3018",
    candidateId: "elena-costa",
    roleId: "ROL-104",
    kind: "Panel",
    start: "2026-09-03T11:00",
    durationMins: 45,
    panel: ["Daniel Rowe", "Ruth Kelly"],
    room: "Remote · Teams",
    status: "Scheduled",
  },
  {
    id: "INT-3019",
    candidateId: "harry-mills",
    roleId: "ROL-106",
    kind: "Screen",
    start: "2026-09-03T15:30",
    durationMins: 30,
    panel: ["Tom Aldridge"],
    room: "Remote · Teams",
    status: "Scheduled",
  },
  {
    id: "INT-3020",
    candidateId: "sam-okoro",
    roleId: "ROL-101",
    kind: "Panel",
    start: "2026-09-04T10:00",
    durationMins: 60,
    panel: ["Priya Raman", "Marcus Webb", "Ivy Chen"],
    room: "Kestrel · London",
    status: "Scheduled",
  },
  {
    id: "INT-3021",
    candidateId: "nina-farrow",
    roleId: "ROL-103",
    kind: "Panel",
    start: "2026-09-04T14:00",
    durationMins: 60,
    panel: ["Sofia Almeida", "Ruth Kelly"],
    room: "Peregrine · Manchester",
    status: "Scheduled",
  },
  {
    id: "INT-3022",
    candidateId: "amara-diallo",
    roleId: "ROL-102",
    kind: "Final",
    start: "2026-09-08T13:00",
    durationMins: 45,
    panel: ["Marcus Webb", "Ana Petrov", "Priya Raman"],
    room: "Remote · Teams",
    status: "Scheduled",
  },
  {
    id: "INT-3023",
    candidateId: "grace-liu",
    roleId: "ROL-104",
    kind: "Screen",
    start: "2026-09-09T09:00",
    durationMins: 30,
    panel: ["Ruth Kelly"],
    room: "Remote · Teams",
    status: "Scheduled",
  },
]

export const funnel = [
  { stage: "Applied", count: 184 },
  { stage: "Screening", count: 71 },
  { stage: "Interview", count: 34 },
  { stage: "Assessment", count: 16 },
  { stage: "Offer", count: 7 },
  { stage: "Hired", count: 5 },
]

export const timeToHire = [
  { month: "Mar", days: 51, target: 42 },
  { month: "Apr", days: 48, target: 42 },
  { month: "May", days: 46, target: 42 },
  { month: "Jun", days: 44, target: 42 },
  { month: "Jul", days: 39, target: 42 },
  { month: "Aug", days: 37, target: 42 },
]

export const sourceMix = [
  { source: "Referral", hires: 9, accent: "var(--chart-1)" },
  { source: "Outbound", hires: 6, accent: "var(--chart-2)" },
  { source: "Job board", hires: 5, accent: "var(--chart-3)" },
  { source: "Agency", hires: 3, accent: "var(--chart-4)" },
]

export const sources = [...new Set(candidates.map((c) => c.source))].sort()

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function roleById(id?: string) {
  return roles.find((role) => role.id === id)
}

export function candidateById(id?: string) {
  return candidates.find((candidate) => candidate.id === id)
}

export function interviewById(id?: string) {
  return interviews.find((interview) => interview.id === id)
}

export function interviewsFor(candidateId: string) {
  return interviews
    .filter((interview) => interview.candidateId === candidateId)
    .sort((a, b) => a.start.localeCompare(b.start))
}

export function candidatesForRole(roleId: string) {
  return candidates.filter((candidate) => candidate.roleId === roleId)
}

export function daysOpen(opened: string, today = TODAY) {
  const ms = new Date(today).getTime() - new Date(opened).getTime()
  return Math.round(ms / 86_400_000)
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })
}
